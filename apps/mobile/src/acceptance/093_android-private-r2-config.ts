const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function read093Config(env: Record<string, string | undefined>) {
  const url = new URL(env.EXPO_PUBLIC_SUPABASE_URL ?? '');
  if (url.origin !== 'http://127.0.0.1:54491' ||
      env.EXPO_PUBLIC_GENOVA_093_ACCEPTANCE !== '1') {
    throw new Error('093 yalnız 127.0.0.1:54491 sentetik yerel serviste çalışır.');
  }
  const email = env.EXPO_PUBLIC_GENOVA_093_EMAIL ?? '';
  const password = env.EXPO_PUBLIC_GENOVA_093_PASSWORD ?? '';
  const choirA = env.EXPO_PUBLIC_GENOVA_093_CHOIR_A ?? '';
  const choirB = env.EXPO_PUBLIC_GENOVA_093_CHOIR_B ?? '';
  const fileId = env.EXPO_PUBLIC_GENOVA_093_FILE_ID ?? '';
  if (!email.startsWith('shared-091-') || !email.endsWith('@example.invalid') ||
      !password || !env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      ![choirA, choirB, fileId].every(value => UUID.test(value)) || choirA === choirB) {
    throw new Error('093 sentetik fixture kimliği geçersiz.');
  }
  return { email, password, choirA, choirB, fileId, endpoint: 'http://127.0.0.1:8000' };
}
