import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const manifest = JSON.parse(fs.readFileSync('docs/reports/090/2026-10-03-p1-beta-candidate.json'));
const report = JSON.parse(fs.readFileSync('docs/reports/090/2026-10-03-p3-entry-inventory.json'));
test('inventory regenerates byte-equivalently against every frozen product pin', () => {
  execFileSync(process.execPath, ['spike/090-p3-entry-inventory.mjs', '--verify']);
  assert.equal(report.sourcePinsVerified, 610);
  assert.equal(report.helperSha256, createHash('sha256').update(fs.readFileSync('spike/090-p3-entry-inventory.mjs')).digest('hex'));
});
test('all frozen page/API entries and actual native shell appear, unresolved/dynamic remain explicit', () => {
  const files = new Set(Object.values(report.routes).flatMap(group => group.files));
  for (const file of manifest.routes) assert(files.has(file), file);
  assert(files.has('apps/mobile/src/ui/AppRoot.tsx'));
  assert.equal(Object.values(report.routes).filter(group => group.roots.includes('app/(main)/layout.tsx')).length, 5);
  assert(report.routes['native-shell-auth-repertoire-chat-and-webview'].dynamicCalls.some(call => call.kind === 'rpc'));
  assert(report.routes['web-profile'].unresolvedApiReferences.some(ref => ref.literal === '/api/drive-file'));
});
test('visible metadata cannot silently certify exact deployed/applied state', () => {
  assert.equal(report.sql.length, 25); assert.equal(report.edges.length, 20);
  assert.equal(report.sql.filter(row => row.visibleLedger === 'OBSERVED_ROW').length, 15);
  assert(report.sql.every(row => row.actualDefinitionAndStoredChecksum === 'NOT RUN'));
  assert(report.edges.every(row => row.exactDeployedIdentity === 'NOT RUN'));
  assert.deepEqual(report.edges.filter(row => row.visibleFunctionList === 'NOT_IN_VISIBLE_LIST').map(row => row.slug), ['account-recovery-006', 'legacy-file', 'link-preview']);
  assert.match(report.status, /PARTIAL/u);
});
