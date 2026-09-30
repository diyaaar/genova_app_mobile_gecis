import { read090AudioConfig } from '../090_audio-config';

const valid = {
  EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: '1',
  EXPO_PUBLIC_GENOVA_026_ACCEPTANCE: '1',
  EXPO_PUBLIC_GENOVA_026_AUDIO_URL: 'http://127.0.0.1:18026/',
};

describe('090 synthetic audio guard', () => {
  it('accepts explicit credential-free loopback only', () => {
    expect(read090AudioConfig(valid)).toEqual({ baseUrl: 'http://127.0.0.1:18026' });
  });
  it.each([
    { ...valid, EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: '0' },
    { ...valid, EXPO_PUBLIC_GENOVA_026_ACCEPTANCE: '0' },
    { ...valid, EXPO_PUBLIC_GENOVA_026_AUDIO_URL: 'https://example.com/' },
    { ...valid, EXPO_PUBLIC_GENOVA_026_AUDIO_URL: 'http://user:secret@127.0.0.1:18026/' },
    { ...valid, EXPO_PUBLIC_GENOVA_026_AUDIO_URL: 'http://127.0.0.1:18026/?ticket=secret' },
  ])('refuses missing flags or non-exact input %#', env => {
    expect(() => read090AudioConfig(env)).toThrow();
  });
});
