import { readAudioRuntimeAcceptanceConfig } from './audio-runtime-config';

/** Acceptance-only, credential-free configuration; never falls back to hosted targets. */
export function read090AudioConfig(env: Record<string, string | undefined>) {
  if (env.EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE !== '1' ||
      env.EXPO_PUBLIC_GENOVA_026_AUDIO_URL !== 'http://127.0.0.1:18026/') {
    throw new Error('090 requires explicit synthetic audio acceptance on exact loopback.');
  }
  return readAudioRuntimeAcceptanceConfig(env);
}
