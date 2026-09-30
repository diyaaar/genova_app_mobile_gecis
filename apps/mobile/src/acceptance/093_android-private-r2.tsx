import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Directory, Paths } from 'expo-file-system';
import { requestProtectedRepertoireFileTicket } from '@shared/repertuvar/protected-file-client';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { getGenovaClient } from '../auth/supabase-client';
import { createSupabaseAnnotationSource } from '../repertoire/annotation-source';
import { createExpoPrivateScoreFileStore } from '../repertoire/expo-private-file-store';
import { nativePdfRenderer } from '../repertoire/pdf-renderer';
import { createNativeScoreReaderGateway } from '../repertoire/reader-gateway';
import { AppRoot } from '../ui/AppRoot';
import { read093Config } from './093_android-private-r2-config';

const config = read093Config({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_093_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_093_EMAIL: process.env.EXPO_PUBLIC_GENOVA_093_EMAIL,
  EXPO_PUBLIC_GENOVA_093_PASSWORD: process.env.EXPO_PUBLIC_GENOVA_093_PASSWORD,
  EXPO_PUBLIC_GENOVA_093_CHOIR_A: process.env.EXPO_PUBLIC_GENOVA_093_CHOIR_A,
  EXPO_PUBLIC_GENOVA_093_CHOIR_B: process.env.EXPO_PUBLIC_GENOVA_093_CHOIR_B,
  EXPO_PUBLIC_GENOVA_093_FILE_ID: process.env.EXPO_PUBLIC_GENOVA_093_FILE_ID,
});
const client = getGenovaClient();

function Automation({ trace }: { trace: (event: string) => void }) {
  const auth = useAuth();
  const loginStarted = useRef(false);
  const capturedAUrl = useRef<string | null>(null);
  const captureStarted = useRef(false);
  const isolationChecked = useRef(false);
  useEffect(() => {
    if (auth.phase !== 'signed-out' || loginStarted.current) return;
    loginStarted.current = true;
    void auth.signIn(config.email, config.password).then(({ error }) => {
      trace(error ? 'auth FAIL' : 'auth PASS synthetic');
    });
  }, [auth, trace]);
  useEffect(() => {
    if (auth.phase !== 'ready' || auth.activeChoir?.choir_id !== config.choirA || captureStarted.current) return;
    captureStarted.current = true;
    void (async () => {
      const { data } = await client.auth.getSession();
      try {
        const ticket = await requestProtectedRepertoireFileTicket({ endpoint: config.endpoint,
          accessToken: data.session?.access_token ?? '', fileId: config.fileId });
        const response = await fetch(ticket.url, { method: 'HEAD' });
        if (response.status !== 200) throw new Error('A URL not readable');
        // Keep the URL only in memory; never put the signed ticket in traces.
        capturedAUrl.current = ticket.url;
        trace('090 A URL captured PASS');
      } catch {
        trace('090 A URL capture FAIL');
      }
    })();
  }, [auth.activeChoir?.choir_id, auth.phase, trace]);
  useEffect(() => {
    if (auth.phase !== 'ready' || auth.activeChoir?.choir_id !== config.choirB || isolationChecked.current) return;
    isolationChecked.current = true;
    void (async () => {
      const { data } = await client.auth.getSession();
      try {
        await requestProtectedRepertoireFileTicket({ endpoint: config.endpoint,
          accessToken: data.session?.access_token ?? '', fileId: config.fileId });
        trace('choir B isolation FAIL ticket issued');
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        trace(message.includes('yetkiniz yok') ? 'choir B isolation PASS 403' : 'choir B isolation FAIL');
      }
      if (!capturedAUrl.current) {
        trace('090 old A URL FAIL missing');
      } else {
        try {
          const response = await fetch(capturedAUrl.current, { method: 'HEAD' });
          trace(response.status === 403 ? '090 old A URL PASS 403' : '090 old A URL FAIL');
        } catch {
          trace('090 old A URL FAIL transport');
        }
      }
    })();
  }, [auth.activeChoir?.choir_id, auth.phase, trace]);
  return null;
}

export default function AndroidPrivateR2Acceptance() {
  const [events, setEvents] = useState<string[]>(['093 · SYNTHETIC LOOPBACK']);
  const trace = useCallback((event: string) => {
    console.info(`[093] ${event}`);
    setEvents(current => [...current.slice(-3), event]);
  }, []);
  const reader = useMemo(() => {
    const store = createExpoPrivateScoreFileStore();
    return createNativeScoreReaderGateway({
    endpoint: config.endpoint,
    session: { async getAccessToken() {
      const { data, error } = await client.auth.getSession();
      if (error) throw new Error(error.message);
      return data.session?.access_token ?? null;
    } },
    annotations: createSupabaseAnnotationSource(client),
    files: {
      ...store,
      async download(input) {
        const result = await store.download(input);
        trace(`PDF download PASS ${result.size}B`);
        return result;
      },
      async clear() {
        await store.clear();
        const root = new Directory(Paths.cache, 'genova-protected-repertoire');
        trace(root.exists ? 'tenant PDF cache clear FAIL' : 'tenant PDF cache clear PASS');
      },
    },
    pdf: nativePdfRenderer,
    });
  }, [trace]);
  return <SafeAreaView style={styles.root}>
    <View style={styles.banner} testID="runtime-093-banner">
      <Text style={styles.text}>{events.join(' · ')}</Text>
    </View>
    <View style={styles.app}>
      <AuthProvider client={client}>
        <Automation trace={trace} />
        <AppRoot readerGateway={reader} />
      </AuthProvider>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07111f' },
  banner: { minHeight: 42, padding: 8 },
  text: { color: '#38bdf8', fontSize: 10 },
  app: { flex: 1 },
});
