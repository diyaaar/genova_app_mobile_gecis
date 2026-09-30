const {
  requireGuardedLoopbackEnvironment,
} = require('../with-local-loopback-network');

describe('021 Android loopback network guard', () => {
  it('is inert unless the explicit acceptance flag is enabled', () => {
    expect(requireGuardedLoopbackEnvironment({})).toBe(false);
  });

  it.each([
    ['https://127.0.0.1:54321'],
    ['http://127.0.0.1:54322'],
    ['http://example.com:54321'],
  ])('refuses unsafe endpoint %s', (supabaseUrl) => {
    expect(() => requireGuardedLoopbackEnvironment({
      GENOVA_021_ANDROID_LOOPBACK: '1',
      EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
    })).toThrow();
  });

  it('accepts only the disposable loopback endpoint', () => {
    expect(requireGuardedLoopbackEnvironment({
      GENOVA_021_ANDROID_LOOPBACK: '1',
      EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
    })).toBe(true);
  });

  it('allows only the explicit 093 acceptance endpoint', () => {
    const accepted = {
      GENOVA_093_ANDROID_LOOPBACK: '1',
      EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: '1',
      EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54491',
    };
    expect(requireGuardedLoopbackEnvironment(accepted)).toBe(true);
    expect(() => requireGuardedLoopbackEnvironment({ ...accepted,
      EXPO_PUBLIC_SUPABASE_URL: 'https://hievmwwctjjlhmssoxsu.supabase.co',
    })).toThrow();
    expect(() => requireGuardedLoopbackEnvironment({ ...accepted,
      GENOVA_021_ANDROID_LOOPBACK: '1',
    })).toThrow();
  });

  it('allows 090 audio only with all exact guards and no conflicting runtime', () => {
    const accepted = {
      GENOVA_090_ANDROID_AUDIO_LOOPBACK: '1',
      EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: '1',
      EXPO_PUBLIC_GENOVA_026_ACCEPTANCE: '1',
      EXPO_PUBLIC_GENOVA_026_AUDIO_URL: 'http://127.0.0.1:18026/',
    };
    expect(requireGuardedLoopbackEnvironment(accepted)).toBe(true);
    for (const patch of [
      { EXPO_PUBLIC_GENOVA_090_AUDIO_ACCEPTANCE: '0' },
      { EXPO_PUBLIC_GENOVA_026_ACCEPTANCE: '0' },
      { EXPO_PUBLIC_GENOVA_026_AUDIO_URL: 'https://example.com/' },
      { GENOVA_093_ANDROID_LOOPBACK: '1' },
      { GENOVA_021_ANDROID_LOOPBACK: '1' },
    ]) {
      expect(() => requireGuardedLoopbackEnvironment({ ...accepted, ...patch })).toThrow();
    }
  });
});
