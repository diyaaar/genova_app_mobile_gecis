import { read093Config } from '../093_android-private-r2-config';

const valid = {
  EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54491',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'local-anon',
  EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: '1',
  EXPO_PUBLIC_GENOVA_093_EMAIL: 'shared-091-test@example.invalid',
  EXPO_PUBLIC_GENOVA_093_PASSWORD: 'synthetic-only',
  EXPO_PUBLIC_GENOVA_093_CHOIR_A: '11111111-1111-4111-8111-111111111111',
  EXPO_PUBLIC_GENOVA_093_CHOIR_B: '22222222-2222-4222-8222-222222222222',
  EXPO_PUBLIC_GENOVA_093_FILE_ID: '33333333-3333-4333-8333-333333333333',
};

test('accepts only guarded synthetic local runtime', () => {
  expect(read093Config(valid).endpoint).toBe('http://127.0.0.1:8000');
});

test.each([
  { EXPO_PUBLIC_SUPABASE_URL: 'https://hievmwwctjjlhmssoxsu.supabase.co' },
  { EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321' },
  { EXPO_PUBLIC_GENOVA_093_ACCEPTANCE: '0' },
  { EXPO_PUBLIC_GENOVA_093_EMAIL: 'real@example.com' },
  { EXPO_PUBLIC_GENOVA_093_CHOIR_B: valid.EXPO_PUBLIC_GENOVA_093_CHOIR_A },
  { EXPO_PUBLIC_GENOVA_093_FILE_ID: 'bad' },
])('rejects mismatched fixture or endpoint %#', override => {
  expect(() => read093Config({ ...valid, ...override })).toThrow();
});
