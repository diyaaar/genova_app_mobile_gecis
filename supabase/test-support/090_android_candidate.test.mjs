import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validatePinnedSource, buildEnv, ROOT, CORS_HEADERS, hasAuthorizedInitialProfile, nativeFixtureOptions, nativeFixtureJson } from './090_android_candidate.mjs';

const entries = JSON.parse(fs.readFileSync(ROOT + '/docs/reports/090/2026-10-03-embedded-profile-source-manifest.json')).pins;
test('iOS authority and credential JSON forbids HTTP persistence; Android historical default is unchanged', async () => {
  const response = nativeFixtureJson(200, { synthetic: true }, 'ios');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('pragma'), 'no-cache');
  assert.deepEqual(await response.json(), { synthetic: true });
  assert.equal(nativeFixtureJson(401, {}, 'ios').headers.get('cache-control'), 'private, no-store');
  assert.equal(nativeFixtureJson(200, {}, 'android').headers.get('cache-control'), null);
  assert.throws(() => nativeFixtureJson(200, {}, 'unscoped'));
});
test('iOS evidence has explicit bounded platform/attempt; unchanged Android defaults cannot redirect reports', () => {
  assert.deepEqual(nativeFixtureOptions(), { platform: 'android', attempt: 1 });
  assert.deepEqual(nativeFixtureOptions({ platform: 'ios', attempt: 2 }), { platform: 'ios', attempt: 2 });
  for (const options of [{ platform: 'web' }, { platform: 'ios', attempt: 0 }, { platform: 'ios', attempt: 4 },
    { platform: 'ios', attempt: 1.5 }, { platform: 'android', attempt: 2 }, { report: '../outside' }]) {
    assert.throws(() => nativeFixtureOptions(options));
  }
});
test('initial authorized profile data may finish after bridge starts renewal, not after revoke/switch', () => {
  const read = { path: '/rest/v1/choir_members', method: 'GET', status: 200, authorized: true, phase: 'renewal' };
  assert(hasAuthorizedInitialProfile([read]));
  assert(hasAuthorizedInitialProfile([{ ...read, phase: 'profile' }]));
  for (const patch of [{ phase: 'revoked' }, { phase: 'switched' }, { status: 403 }, { authorized: false }, { method: 'OPTIONS' }]) {
    assert(!hasAuthorizedInitialProfile([{ ...read, ...patch }]));
  }
});
test('local web SDK CORS explicitly permits PostgREST schema headers, not arbitrary headers', () => {
  assert(CORS_HEADERS.split(',').includes('content-profile'));
  assert(CORS_HEADERS.split(',').includes('accept-profile'));
  assert(!CORS_HEADERS.includes('*'));
});
test('immutable candidate reconstruction reads all accepted raw Git bytes', () => {
  const source = validatePinnedSource(entries);
  assert.equal(source.length, 426);
  const png = source.find(item => item.path === 'public/login.png').body;
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});
test('partial manifest, traversing path and changed bytes cannot materialize', () => {
  assert.throws(() => validatePinnedSource(entries.slice(1)));
  assert.throws(() => validatePinnedSource([{ ...entries[0], path: '../escape' }, ...entries.slice(1)]));
  assert.throws(() => validatePinnedSource(entries, () => Buffer.from('corrupted source')));
});
test('build environment never inherits hosted public keys, passwords or unrelated flags', () => {
  const prior = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const priorSecret = process.env.GENOVA_TEST_PRIVATE_PASSWORD;
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://hosted.invalid';
  process.env.GENOVA_TEST_PRIVATE_PASSWORD = 'synthetic-private-control';
  try {
    const env = buildEnv();
    assert.equal(env.EXPO_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54491');
    assert.equal(env.EXPO_NO_DOTENV, '1');
    assert.equal(env.EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY, 'legacy-next');
    assert.equal(env.NEXT_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE, '1');
    assert.equal(env.NEXT_PUBLIC_GENOVA_090_APP_ORIGIN, 'http://127.0.0.1:31090');
    // Immutable web candidate predates the native inspection family; use its existing policy.
    assert.equal(env.NEXT_PUBLIC_GENOVA_090_WEBVIEW_FAMILY, undefined);
    assert.equal(env.GENOVA_TEST_PRIVATE_PASSWORD, undefined);
    assert.equal(JSON.parse(Buffer.from(env.EXPO_PUBLIC_SUPABASE_ANON_KEY.split('.')[1], 'base64url')).role, 'anon');
  } finally {
    if (prior === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL; else process.env.EXPO_PUBLIC_SUPABASE_URL = prior;
    if (priorSecret === undefined) delete process.env.GENOVA_TEST_PRIVATE_PASSWORD; else process.env.GENOVA_TEST_PRIVATE_PASSWORD = priorSecret;
  }
});
