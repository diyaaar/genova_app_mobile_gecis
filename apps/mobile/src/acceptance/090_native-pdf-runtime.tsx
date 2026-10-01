import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { digest, CryptoDigestAlgorithm } from 'expo-crypto';
import { ProtectedFileRequestError, requestProtectedRepertoireFileTicket } from '@shared/repertuvar/protected-file-client';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { getGenovaClient } from '../auth/supabase-client';
import { createSupabaseAnnotationSource } from '../repertoire/annotation-source';
import { createExpoPrivateScoreFileStore } from '../repertoire/expo-private-file-store';
import { nativePdfRenderer } from '../repertoire/pdf-renderer';
import { createNativeScoreReaderGateway } from '../repertoire/reader-gateway';
import { AppRoot } from '../ui/AppRoot';
import { observed090PdfUrl, read090PdfConfig, validate090PdfFixture, type NativePdfFixture } from './090_native-pdf-config';

const config = read090PdfConfig({
  EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_093_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE,
});
const client = getGenovaClient();
type PublicFixture = Omit<NativePdfFixture, 'password' | 'email'>;

function NativeRuntime({ trace }: { trace: (event: string) => void }) {
  const auth = useAuth();
  const started = useRef(false);
  const checkedB = useRef(false);
  const issuedA = useRef<string | null>(null);
  const requests = useRef(0);
  const [fixture, setFixture] = useState<PublicFixture | null>(null);

  useEffect(() => {
    if (auth.phase !== 'signed-out' || started.current) return;
    started.current = true;
    void (async () => {
      const response = await fetch(config.fixtureUrl, { method: 'POST' });
      if (response.status !== 200) throw new Error('One-use fixture unavailable');
      const input = validate090PdfFixture(await response.json());
      if ((await fetch(config.fixtureUrl, { method: 'POST' })).status !== 410) {
        throw new Error('Runtime fixture was reusable');
      }
      // Credentials are runtime-only, not React state, traces or build variables.
      const result = await auth.signIn(input.email, input.password);
      input.password = '';
      input.email = '';
      if (result.error) throw new Error('Synthetic sign-in failed');
      const { choirA, choirB, fileId, pdfSha256, legacyUrl } = input;
      setFixture({ choirA, choirB, fileId, pdfSha256, legacyUrl });
      trace('Auth PASS runtime-only credentials');
    })().catch(() => trace('Auth FAIL local fixture'));
  }, [auth, trace]);

  const reader = useMemo(() => {
    if (!fixture) return null;
    const store = createExpoPrivateScoreFileStore();
    const gateway = createNativeScoreReaderGateway({
      endpoint: config.endpoint,
      session: { async getAccessToken() {
        const { data, error } = await client.auth.getSession();
        if (error) throw new Error('Local session unavailable');
        return data.session?.access_token ?? null;
      } },
      annotations: createSupabaseAnnotationSource(client),
      pdf: nativePdfRenderer,
      async requestTicket(input) {
        const ticket = await requestProtectedRepertoireFileTicket(input);
        requests.current += 1;
        if (input.fileId !== fixture.fileId || requests.current > 2) throw new Error('Unexpected ticket request');
        // Declared first-response fault after a genuine POST authority decision.
        const url = observed090PdfUrl(requests.current === 1 ? fixture.legacyUrl : ticket.url);
        if (requests.current === 2) issuedA.current = url;
        trace(`ticket ${requests.current} PASS ${requests.current === 1 ? 'injected signed v1' : 'actual v2'}`);
        return { ...ticket, url };
      },
      files: {
        ...store,
        async download(input) {
          try {
            const file = await store.download(input);
            const bytes = await new File(file.uri).bytes();
            const checksum = Array.from(new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, bytes)))
              .map(byte => byte.toString(16).padStart(2, '0')).join('');
            if (checksum !== fixture.pdfSha256 || file.size !== 65_905 || requests.current !== 2) {
              throw new Error('Downloaded PDF evidence mismatch');
            }
            trace('PDF download/hash PASS 65905B after one renewal');
            return file;
          } catch (error) {
            trace(requests.current === 1 ? 'native v1 download rejected' : 'PDF download FAIL');
            throw error;
          }
        },
        async clear() {
          await store.clear();
          const root = new Directory(Paths.cache, 'genova-protected-repertoire');
          trace(root.exists ? 'tenant PDF cache clear FAIL' : 'tenant PDF cache clear PASS');
        },
      },
    });
    return { ...gateway, async renderWindow(...input: Parameters<typeof gateway.renderWindow>) {
      const result = await gateway.renderWindow(...input);
      trace(`native render PASS page ${result.currentPage}/${input[0].pageCount}, window ${Object.keys(result.pages).length}`);
      return result;
    } };
  }, [fixture, trace]);

  useEffect(() => {
    if (!fixture || auth.phase !== 'ready' || auth.activeChoir?.choir_id !== fixture.choirB || checkedB.current) return;
    checkedB.current = true;
    void (async () => {
      if (!issuedA.current || requests.current !== 2) throw new Error('Missing recovered A URL');
      const old = await fetch(issuedA.current, { method: 'HEAD' });
      if (old.status !== 403) throw new Error('Old A URL remained readable');
      trace('old A URL PASS 403 after B');
      const { data } = await client.auth.getSession();
      try {
        await requestProtectedRepertoireFileTicket({ endpoint: config.endpoint,
          accessToken: data.session?.access_token ?? '', fileId: fixture.fileId });
      } catch (error) {
        if (error instanceof ProtectedFileRequestError && error.status === 403) {
          trace('new A ticket PASS 403 in B');
          return;
        }
        throw error;
      }
      throw new Error('New A ticket incorrectly issued in B');
    })().catch(() => trace('old A URL FAIL'));
  }, [fixture, auth.phase, auth.activeChoir?.choir_id, trace]);

  return reader ? <AppRoot readerGateway={reader} /> : <Text style={styles.text}>Yerel sentetik giriş hazırlanıyor…</Text>;
}

export default function NativePdfAcceptance() {
  const [events, setEvents] = useState<string[]>(['090 PDF · SYNTHETIC LOOPBACK']);
  const trace = useCallback((event: string) => {
    console.info(`[090 PDF] ${event}`);
    setEvents(current => [...current.slice(-3), event]);
  }, []);
  return <SafeAreaView style={styles.root}>
    <Text style={styles.text}>{events.join(' · ')}</Text>
    <View style={styles.app}><AuthProvider client={client}><NativeRuntime trace={trace} /></AuthProvider></View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#07111f' },
  text: { color: '#38bdf8', fontSize: 10, padding: 8 }, app: { flex: 1 } });
