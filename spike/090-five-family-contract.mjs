// Narrow preparation contract for the real 090 managed matrix, not runtime proof.
import assert from 'node:assert/strict';

const origin = 'https://127.0.0.1:18443';
export const READERS = Object.freeze([
  ['repertoire-file', 18442, 'repertoire_files', 403],
  ['assignment-file', 18444, 'assignment_submission_file_versions', 403],
  ['assignment-review-file', 18445, 'assignment_review_audio_versions', 403],
  ['repertoire-comment-file', 18446, 'repertoire_comment_audio_versions', 403],
  ['chat-media-file', 18447, 'chat_media_versions', 200],
].map(([family, port, table, chefLossStatus]) => Object.freeze({
  family, port, table, chefLossStatus,
  endpoint: `${origin}/functions/v1/${family}`,
  entrypoint: `supabase/functions/${family}/index.ts`,
})));

/** Only exact local TLS ingress + assigned listener, never arbitrary import paths. */
export function readerAt(endpoint, port) {
  assert.equal(typeof endpoint, 'string');
  const reader = READERS.find(item => item.endpoint === endpoint);
  assert(reader, 'Unknown or non-canonical managed family endpoint');
  assert.equal(port, reader.port, 'Mismatched family listener');
  return reader;
}

/** Minimum matrix rows; future producer must obtain them from actual HTTP reads. */
export function requiredCases(reader) {
  assert(READERS.includes(reader), 'Use a fixed reader descriptor');
  const rows = [];
  const add = (scenario, method, status) => rows.push(Object.freeze({
    family: reader.family, scenario, method, status,
  }));
  const pair = (scenario, status) => {
    add(scenario, 'GET', status);
    add(scenario, 'HEAD', status);
  };
  add('issuance', 'POST', 200);
  pair('full', 200);
  pair('range', 206);
  add('outsider-b', 'POST', 403);
  add('selected-b', 'POST', 403);
  for (const scenario of ['selected-b', 'inactive-member', 'session-expiry', 'sign-out']) pair(scenario, 403);
  pair('chef-loss', reader.chefLossStatus);
  pair('independent-grant', 200);
  pair('effective-family-authority-loss', 403);
  for (const change of ['selection', 'membership', 'effective-family-authority']) {
    pair(`${change}:uncommitted`, 200);
    pair(`${change}:committed`, 403);
    pair(`${change}:held-before-authority-after-commit`, 403);
  }
  add('stream:authorized-before-revocation', 'GET', 200);
  pair('stream:subsequent-revoked', 403);
  if (reader.family === 'repertoire-file') {
    pair('audio:full', 200); pair('audio:range', 206); pair('audio:revoked', 403);
  }
  if (reader.family === 'assignment-review-file') {
    add('hidden-own-review', 'POST', 403); pair('hidden-own-review', 403);
  }
  return Object.freeze(rows);
}

const key = row => `${row.family}/${row.scenario}/${row.method}`;

/** Reject missing/duplicate/wrong-result rows. Validating rows cannot prove provenance. */
export function requireCompleteMatrix(observations) {
  assert(Array.isArray(observations));
  const expected = READERS.flatMap(requiredCases);
  assert.equal(observations.length, expected.length, 'Incomplete/extra matrix observations');
  const actual = new Map();
  for (const row of observations) {
    assert(!actual.has(key(row)), 'Duplicate matrix observation');
    actual.set(key(row), row);
  }
  for (const required of expected) {
    const row = actual.get(key(required));
    assert(row, 'Missing required family/scenario/method');
    assert.equal(row.status, required.status, 'Unexpected HTTP decision');
    assert(Number.isSafeInteger(row.providerDelta) && row.providerDelta >= 0);
    assert(Number.isSafeInteger(row.bodyBytes) && row.bodyBytes >= 0);
    if (row.status === 403 || row.method === 'POST') assert.equal(row.providerDelta, 0);
    else assert(row.providerDelta > 0, 'Allowed read did not reach signed provider');
    if (row.method !== 'POST') assert(row.ticketRemainingMs >= 1000, 'Expired ticket cannot prove authority denial');
    if (row.method === 'HEAD') assert.equal(row.bodyBytes, 0, 'HEAD returned body');
    if (row.method === 'GET' && row.status < 300) assert(row.bodyBytes > 0, 'Empty permitted read');
  }
  return expected.length;
}

/** Never destroy the new backend using the previous goal's browser/SQL receipt. */
export function requireFamilyCleanupOrder({matrix, invariants, matrixMtime, transport}) {
  assert(['20261010-managed-families','20261013-managed-families'].includes(matrix.attempt));
  assert.equal(matrix.status, 'ACTUAL_FIVE_FAMILY_MANAGED_HTTP_MATRIX_PASS');
  assert.equal(invariants.attempt, matrix.attempt);
  assert.equal(invariants.status, 'POST_TEST_17_CATALOG_GROUPS_AND_PROTECTED_SOURCE_UNCHANGED');
  assert.equal(invariants.catalogGroups, 17);
  assert.equal(invariants.noGrantRoleRlsTriggerSchemaRelaxation, true);
  requireCompleteMatrix(matrix.observations);
  assert.equal(matrix.acceptanceComplete, true);
  assert.equal(transport.attempt, matrix.attempt);
  assert.equal(transport.closed, true);
  assert.equal(transport.childrenExited, true);
  assert.equal(transport.metrics.outside, 0);
  const audited = Date.parse(invariants.recordedAt);
  const finished = Date.parse(matrix.recordedAt);
  assert(Number.isFinite(audited) && Number.isFinite(finished) && Number.isFinite(matrixMtime));
  assert(audited >= Math.max(finished, matrixMtime), 'Final audit preceded completely written matrix');
}

/** A resource-aborted download is disposable, never a successful matrix teardown. */
export function requireFailedFamilyCleanup({attempt,pull,names,vmStatus}) {
  assert(['20261010-managed-families','20261013-managed-families'].includes(attempt));
  assert.equal(pull.attempt,attempt);
  assert.equal(pull.action,'pull-classic');
  assert.equal(pull.resourceStop,true);
  assert.notEqual(pull.exitCode,0);
  assert.equal(vmStatus,'Stopped','Failed download VM must already be stopped');
  assert(Array.isArray(names));
  assert(!names.some(name=>name.includes('create-container')||name.startsWith('restore-')||
    name.startsWith('compatibility-')||name.startsWith('managed-')),
  'Post-restore/API attempts require a separate failure-custody procedure');
}
