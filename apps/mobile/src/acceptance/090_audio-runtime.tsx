import { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { clearTenantCaches } from '../auth/tenant-cache';
import { AudioPlaybackProvider, useAudioPlayback } from '../repertoire/AudioPlaybackProvider';
import type { NativeAudioSession } from '../repertoire/audio-contract';
import type { NativeAudioSourceGateway } from '../repertoire/audio-source-gateway';
import { read090AudioConfig } from './090_audio-config';

const config = read090AudioConfig({
  EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_026_ACCEPTANCE: process.env.EXPO_PUBLIC_GENOVA_026_ACCEPTANCE,
  EXPO_PUBLIC_GENOVA_026_AUDIO_URL: process.env.EXPO_PUBLIC_GENOVA_026_AUDIO_URL,
});
const session: NativeAudioSession = {
  songId: '090-synthetic-song', songTitle: '090 synthetic audio recovery',
  tracks: [{
    supported: true, label: 'Synthetic tone',
    file: {
      id: '11111111-1111-4111-8111-111111111111', song_id: '090-synthetic-song',
      file_name: 'tone.wav', file_type: 'audio', partition_label: '',
      drive_file_id: '090-synthetic', drive_web_view_link: null, drive_download_link: null,
      mime_type: 'audio/wav', file_size_bytes: 160_044, uploaded_by: null,
      created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z',
    },
  }],
};

function Automation({ opens, trace }: { opens: { current: number }; trace: (event: string) => void }) {
  const playback = useAudioPlayback();
  const latest = useRef(playback);
  latest.current = playback;
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancelled = false;
    async function until(test: () => boolean, label: string) {
      const deadline = Date.now() + 15_000;
      while (!cancelled && !test() && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (cancelled) throw new Error('unmounted');
      if (!test()) throw new Error(`${label}: timeout`);
    }
    void (async () => {
      await latest.current.openSession(session);
      await until(() => latest.current.loaded && opens.current === 2, 'body recovery');
      trace('body 401 recovery PASS opens=2');
      await latest.current.seekTo(4);
      await until(() => Math.abs(latest.current.currentTime - 4) < 0.4, 'seek');
      trace('seek PASS 4s');
      // Ticket 2 deliberately expires soon; normal toggle must renew and resume at 4s.
      await latest.current.togglePlayback();
      await until(() => opens.current === 3 && latest.current.playing &&
        latest.current.currentTime >= 4.2, 'expiry resume');
      trace('expiry resume PASS opens=3 position>=4.2');
      await latest.current.togglePlayback();
      await until(() => !latest.current.playing, 'pause');
      await latest.current.seekTo(2);
      await until(() => Math.abs(latest.current.currentTime - 2) < 0.4, 'second seek');
      await latest.current.togglePlayback();
      await until(() => latest.current.playing && latest.current.currentTime >= 2.2,
        'second resume');
      if (opens.current !== 3) throw new Error('unexpected re-ticket');
      trace('pause seek resume PASS opens=3');
      await clearTenantCaches();
      await until(() => !latest.current.session && latest.current.ticketExpiresAt === null &&
        !latest.current.playing, 'tenant clear');
      trace('tenant clear PASS owner empty');
      await latest.current.openSession(session);
      await until(() => latest.current.error?.includes('erişim yetkisi sona erdi') === true &&
        latest.current.ticketExpiresAt === null, 'confirmed denial');
      // openSession mutates the ref asynchronously; undo TS's earlier literal narrowing.
      if ((opens.current as number) !== 4) throw new Error('403 caused re-ticket');
      trace('body 403 denial PASS no re-ticket opens=4');
      await clearTenantCaches();
      trace('ALL PASS synthetic Android audio only');
    })().catch(error => { if (!cancelled) trace(`FAIL ${error.message}`); });
    return () => { cancelled = true; };
  }, [opens, trace]);
  return <Text>{playback.loaded ? 'loaded' : 'loading'} · {playback.currentTime.toFixed(2)}s
    · {playback.error ?? 'no error'}</Text>;
}

export default function AudioAcceptance() {
  const [events, setEvents] = useState<string[]>([]);
  const opens = useRef(0);
  const { gateway, trace } = useMemo(() => {
    const trace = (event: string) => {
      console.info(`[090_AUDIO] ${event}`);
      setEvents(current => [...current.slice(-7), event]);
    };
    const gateway: NativeAudioSourceGateway = {
      async open(fileId) {
        const version = ++opens.current;
        trace(`synthetic ticket ${version}`);
        if (version > 4) throw new Error('retry budget exceeded');
        return {
          url: `${config.baseUrl}/android/tone.wav?fileId=${fileId}&ticket=${
            version === 4 ? 'synthetic-090-denied' : `synthetic-090-${version}`}`,
          expiresAt: Date.now() + (version === 2 ? 1_000 : 60_000),
        };
      },
      clear() { trace('synthetic source cleared'); },
    };
    return { gateway, trace };
  }, []);
  return <SafeAreaView style={{ flex: 1, padding: 32, backgroundColor: '#e0f2fe' }}>
    <Text>090 · SYNTHETIC LOOPBACK · NO AUTH / NO PROVIDER</Text>
    <Text testID="090-audio-events">{events.join('\n')}</Text>
    <AudioPlaybackProvider gateway={gateway}>
      <Automation opens={opens} trace={trace} />
    </AudioPlaybackProvider>
  </SafeAreaView>;
}
