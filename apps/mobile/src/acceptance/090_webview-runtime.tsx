import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { CryptoDigestAlgorithm, digest } from 'expo-crypto';
import { AuthProvider, useAuth } from '../auth/AuthProvider';
import { getGenovaClient } from '../auth/supabase-client';
import { NativeWebViewScreen } from '../webview/NativeWebViewScreen';
import { createNativeWebViewRuntimeConfig } from '../webview/runtime-config';
import { createExpoEphemeralFileStore, createExpoShareGateway, prepareProtectedFileRequest, ProtectedFileCapability } from '../webview/platform-capabilities';
import { createPrivateFileTicketRecovery } from '../webview/private-file-ticket-recovery';
import { require090WebViewConfig, validate090WebViewMetadata, WEBVIEW_APP, WEBVIEW_FIXTURE,
  WEBVIEW_POLICY, type WebViewMetadata } from './090_webview-config';

require090WebViewConfig({
  EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_GENOVA_033_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_033_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_093_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_090_PDF_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO: process.env.EXPO_PUBLIC_GENOVA_090_CONNECTED_AUDIO,
  EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY: process.env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY,
});
const family = process.env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY === 'legacy-next' ? 'legacy-next'
  : process.env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY === 'assignment-file' ? 'assignment-file' : 'repertoire-file';
const protectedFileOrigins = family === 'assignment-file'
  ? [...WEBVIEW_POLICY.protectedFileOrigins, 'http://127.0.0.1:54491'] : WEBVIEW_POLICY.protectedFileOrigins;
const client = getGenovaClient();
type Trace = (event: string) => void;

function Runtime({ trace }: { trace: Trace }) {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;
  const started = useRef(false);
  const selected = useRef(false);
  const inspected = useRef(false);
  const [metadata, setMetadata] = useState<WebViewMetadata | null>(null);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (auth.phase === 'loading' || started.current) return;
    started.current = true;
    void (async () => {
      if (auth.phase === 'signed-out') {
        const response = await fetch(`${WEBVIEW_FIXTURE}/090/webview-fixture`, { method: 'POST' });
        if (response.status !== 200) throw new Error('Fixture unavailable');
        const input = await response.json() as { email: string; password: string };
        if (!/^shared-091-[0-9a-f-]+@example\.invalid$/.test(input.email) ||
            !/^[A-Za-z0-9_-]{32}$/.test(input.password)) throw new Error('Invalid synthetic login');
        if ((await fetch(`${WEBVIEW_FIXTURE}/090/webview-fixture`, { method: 'POST' })).status !== 410) {
          throw new Error('Credential channel reusable');
        }
        const result = await auth.signIn(input.email, input.password);
        input.email = ''; input.password = '';
        if (result.error) throw new Error('Sign-in failed');
        trace('Auth PASS one-use runtime credential');
      }
      const response = await fetch(`${WEBVIEW_FIXTURE}/090/webview-metadata`);
      if (!response.ok) throw new Error('Metadata unavailable');
      setMetadata(validate090WebViewMetadata(await response.json(), family));
    })().catch(() => trace('Auth FAIL local fixture'));
  }, [auth, trace]);

  useEffect(() => {
    if (!metadata || auth.phase !== 'selection-required' || selected.current) return;
    selected.current = true;
    void auth.selectChoir(metadata.choirA).catch(() => trace('select A FAIL'));
  }, [auth, metadata, trace]);

  const capability = useMemo(() => {
    if (!metadata) return null;
    const files = createExpoEphemeralFileStore();
    const sharing = createExpoShareGateway();
    return new ProtectedFileCapability({
      ...files,
      async download(input) {
        const result = await files.download(input);
        const checksum = Array.from(new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256,
          await new File(result.uri).bytes()))).map(byte => byte.toString(16).padStart(2, '0')).join('');
        if (result.size !== 65_905 || checksum !== metadata.pdfSha256) throw new Error('Native PDF mismatch');
        trace('native PDF/hash PASS 65905B');
        return result;
      },
      async clear() {
        await files.clear();
        const root = new Directory(Paths.cache, 'genova-webview-files');
        trace(root.exists ? 'ephemeral clear FAIL' : 'ephemeral clear PASS');
      },
    }, { ...sharing, async share(uri, options) {
      if (family === 'legacy-next') {
        if (!new File(uri).exists) throw new Error('Inspection file unavailable');
        trace('inspection share port observed NOT actual sheet');
        return;
      }
      trace('actual share sheet RUNNING');
      await sharing.share(uri, options);
      trace('actual share sheet returned');
    } }, createPrivateFileTicketRecovery({ getIssuer: () => WEBVIEW_FIXTURE,
      getAppOrigin: () => WEBVIEW_APP,
      getLease: options => authRef.current.getWebViewLease(options), allowLoopback: true }));
  }, [metadata, trace]);

  const isB = auth.activeChoir?.choir_id === metadata?.choirB;
  const path = isB || family === 'legacy-next' ? '/profil' : `/koristler/${metadata?.targetMember ?? ''}`;
  const config = useMemo(() => metadata ? createNativeWebViewRuntimeConfig({ initialPath: path,
    isDevelopment: true, developmentOrigin: WEBVIEW_APP,
    protectedFileOrigins }) : null, [metadata, path]);
  if (!metadata || !capability || !config || auth.phase !== 'ready') {
    return <Text style={styles.text}>Yerel oturum hazırlanıyor: {auth.phase}</Text>;
  }
  if (auth.user?.id !== metadata.userId) return <Text style={styles.text}>FAIL wrong synthetic identity</Text>;
  const inspectLegacy = async () => {
    if (inspected.current || family !== 'legacy-next') return;
    inspected.current = true;
    const prepare = (url: string) => {
      const request = prepareProtectedFileRequest({ requestId: '090_legacy_inspection', url,
        disposition: 'view', fileName: '090-synthetic.pdf', mimeType: 'application/pdf' }, config.routePolicy);
      if (!request) throw new Error('Inspection URL refused');
      return request;
    };
    const mode = async (value: string) => {
      const response = await fetch(`${WEBVIEW_FIXTURE}/090/native-mode`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: value }) });
      if (!response.ok) throw new Error('Inspection mode refused');
      const input = { ...metadata, legacyUrl: (await response.json() as { url: string }).url };
      return validate090WebViewMetadata(input, 'legacy-next').legacyUrl;
    };
    try {
      const renewed = await capability.run(prepare(metadata.legacyUrl));
      await capability.clear();
      if (!renewed || new Directory(Paths.cache, 'genova-webview-files').exists) throw new Error('Renewal inspection failed');
      trace('legacy Android renewal/hash/removal PASS');
      const denied = await capability.run(prepare(await mode('revoke')));
      await capability.clear();
      if (denied) throw new Error('Revoked inspection shared');
      trace('legacy Android current denial PASS');
      const oldA = await mode('restore');
      // Unmount and clear before actual native choir selection; never retain an A surface.
      setClosed(true); await capability.clear();
      await authRef.current.selectChoir(metadata.choirB);
      for (const method of ['GET', 'HEAD']) {
        const response = await fetch(oldA, { method, redirect: 'error' });
        await response.text();
        if (response.status !== 403) throw new Error('A-to-B read was not denied');
      }
      if (await capability.run(prepare(metadata.legacyUrl))) throw new Error('B renewed an A file');
      await capability.clear();
      if (new Directory(Paths.cache, 'genova-webview-files').exists) throw new Error('Inspection cache retained');
      const finish = await fetch(`${WEBVIEW_FIXTURE}/090/native-evidence`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: Platform.OS,
          profileBridge: true, renewal: true, revoked: true, switched: true, cacheEmpty: true,
          actualShare: false, actualConsent: false }) });
      trace(finish.ok ? 'Android profile/native file boundary PASS' : 'Android boundary evidence FAIL');
    } catch { trace('Android legacy inspection FAIL'); }
  };
  return <View style={styles.body}>
    <Pressable accessibilityRole="button" onPress={() => void (async () => {
      await auth.selectChoir(metadata.choirB);
      const result = await fetch(`${WEBVIEW_FIXTURE}/090/webview-evidence`, { method: 'POST' });
      trace(result.ok ? `B old A URL PASS 403/no provider ${family}` : 'B old A URL FAIL');
    })().catch(() => trace('B switch FAIL'))} style={styles.button}>
      <Text style={styles.text}>Koro B</Text>
    </Pressable>
    {closed ? <Text style={styles.text}>Web görünümü kapandı</Text> : <NativeWebViewScreen
      key={auth.activeChoir?.choir_id} initialPath={path} runtimeConfig={config}
      getLease={options => authRef.current.getWebViewLease(options)}
      protectedFileCapability={capability} onNativeRoute={() => trace('unexpected native route')}
      onExit={() => setClosed(true)} onSignOut={auth.signOut} changePassword={auth.changePassword}
      onBridgeSnapshot={snapshot => {
        trace(`bridge ${snapshot.phase}:${snapshot.routeFamily}`);
        if (snapshot.phase === 'running' && snapshot.routeFamily === 'profile') void inspectLegacy();
      }}
      onDiagnostic={value => trace(`diagnostic ${value.type}:${value.outcome}:${value.reasonCode ?? ''}`)} />}
  </View>;
}

export default function WebViewAcceptance() {
  const [events, setEvents] = useState<string[]>([`090 WEBVIEW ${Platform.OS} · SYNTHETIC LOOPBACK`]);
  const trace = useCallback<Trace>(event => {
    console.info(`[090 WebView] ${event}`);
    setEvents(current => [...current.slice(-2), event]);
  }, []);
  return <SafeAreaView style={styles.root}>
    <Text style={styles.text}>{events.join(' · ')}</Text>
    <AuthProvider client={client}><Runtime trace={trace} /></AuthProvider>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#07111f',
  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }, body: { flex: 1 },
  text: { color: '#38bdf8', fontSize: 10, padding: 5 }, button: { minHeight: 36 } });
