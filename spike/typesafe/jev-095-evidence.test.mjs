import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPacket, expected } from './jev-095-evidence.mjs';
const browser = { passed: 8, unexpected: 0, tests: Array.from({ length: 8 }, () => ({ status: 'expected' })) };
const code = 'current_file_version_id; isSwitchingChoir';
test('nine bounded claims distinguish intercepted browser, native unknown and explicit non-release', () => {
  const packet = buildPacket(browser, code, {});
  assert.equal(Object.keys(packet.questions).length, 9);
  assert.equal(expected.android, 'insufficient'); assert.equal(expected.rls, 'contradicts');
  assert.match(packet.state.method, /All remote HTTP intercepted/);
});
test('unpassed execution cannot become a claimed acceptance packet', () => {
  assert.throws(() => buildPacket({ ...browser, passed: 7 }, code, {}));
  assert.throws(() => buildPacket({ ...browser, unexpected: 1 }, code, {}));
  assert.throws(() => buildPacket({ ...browser, tests: [{ status: 'unexpected' }] }, code, {}));
});
test('secret/source omissions and over-bound packets fail before any network', () => {
  assert.throws(() => buildPacket(browser, '', {}));
  assert.throws(() => buildPacket(browser, `${code} apikey_${'a'.repeat(32)}`, {}));
  assert.throws(() => buildPacket(browser, `${code}${'x'.repeat(24_000)}`, {}));
});
