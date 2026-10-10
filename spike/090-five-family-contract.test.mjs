import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {READERS, readerAt, requiredCases, requireCompleteMatrix, requireFamilyCleanupOrder, requireFailedFamilyCleanup} from './090-five-family-contract.mjs';

// Artificial rows exercise rejection logic only; never exported as runtime evidence.
const rows = () => READERS.flatMap(requiredCases).map(row => ({...row,
  providerDelta: row.status < 300 && row.method !== 'POST' ? 1 : 0,
  bodyBytes: row.status < 300 && row.method === 'GET' ? 12 : 0,
}));
const cleanup = () => ({
  matrix: {attempt: '20261010-managed-families', status: 'ACTUAL_FIVE_FAMILY_MANAGED_HTTP_MATRIX_PASS',
    recordedAt: '2026-10-10T09:00:00Z', observations: rows()},
  invariants: {attempt: '20261010-managed-families', status: 'POST_TEST_17_CATALOG_GROUPS_AND_PROTECTED_SOURCE_UNCHANGED',
    catalogGroups: 17, noGrantRoleRlsTriggerSchemaRelaxation: true, recordedAt: '2026-10-10T09:00:02Z'},
  matrixMtime: Date.parse('2026-10-10T09:00:01Z'),
});

test('five unique descriptors route to existing actual source, not adapter handlers', () => {
  assert.equal(READERS.length, 5);
  assert.equal(new Set(READERS.map(r => r.port)).size, 5);
  for (const r of READERS) {
    assert.equal(readerAt(r.endpoint, r.port), r);
    assert(fs.statSync(r.entrypoint).isFile());
    const source = fs.readFileSync(r.entrypoint, 'utf8');
    assert(source.includes('authorizePrivateFileTicket'));
    assert(source.includes(`createPrivateFileTicketV2('${r.family}'`));
    assert(source.includes(`from('${r.table}')`));
    assert(Object.isFrozen(r));
  }
});
test('hosted/arbitrary/normalized/import-path endpoints and wrong listeners refused', () => {
  const r = READERS[0];
  for (const value of [r.endpoint + '?x=1', r.endpoint + '#x', r.endpoint + '/',
    r.endpoint.replace('127.0.0.1', 'localhost'), r.endpoint.replace('https:', 'http:'),
    r.endpoint.replace('127.0.0.1', 'example.com'), r.endpoint.replace('/repertoire-file', '/x/../repertoire-file'),
    'https://127.0.0.1:18443/functions/v1/legacy-file', null]) assert.throws(() => readerAt(value, r.port));
  for (const port of [18441, 18443, '18442', undefined]) assert.throws(() => readerAt(r.endpoint, port));
});
test('Chef loss is denied in four primary fixtures but retained room membership still grants chat', () => {
  for (const r of READERS) {
    const expected = r.family === 'chat-media-file' ? 200 : 403;
    assert.deepEqual(requiredCases(r).filter(c => c.scenario === 'chef-loss').map(c => c.status), [expected, expected]);
    assert.deepEqual(requiredCases(r).filter(c => c.scenario === 'independent-grant').map(c => c.status), [200, 200]);
  }
  assert.throws(() => requiredCases({...READERS[0]}));
});
test('complete observations accepted; missing family/method or duplicate rejected', () => {
  const full = rows();
  assert.equal(requireCompleteMatrix(full), 39 * 5);
  assert.throws(() => requireCompleteMatrix(full.filter(r => r.family !== 'chat-media-file')));
  assert.throws(() => requireCompleteMatrix(full.slice(1)));
  const duplicate = rows(); duplicate[1] = {...duplicate[0]};
  assert.throws(() => requireCompleteMatrix(duplicate));
});
test('provider contact on denial, empty allow, HEAD body and wrong decisions rejected', () => {
  for (const mutate of [
    list => {list.find(r => r.status === 403).providerDelta = 1;},
    list => {list.find(r => r.method === 'GET' && r.status === 200).providerDelta = 0;},
    list => {list.find(r => r.method === 'GET' && r.status === 200).bodyBytes = 0;},
    list => {list.find(r => r.method === 'HEAD').bodyBytes = 1;},
    list => {list.find(r => r.scenario === 'sign-out').status = 200;},
    list => {list.find(r => r.scenario === 'chef-loss' && r.family === 'chat-media-file').status = 403;},
  ]) {const list = rows(); mutate(list); assert.throws(() => requireCompleteMatrix(list));}
});
test('each concurrency dimension needs precommit, postcommit and held real-authority HTTP reads', () => {
  const list = rows();
  for (const change of ['selection', 'membership', 'effective-family-authority']) {
    for (const phase of ['uncommitted', 'committed', 'held-before-authority-after-commit']) {
      assert.equal(list.filter(r => r.scenario === `${change}:${phase}`).length, 10);
      assert.throws(() => requireCompleteMatrix(list.filter(r => r.scenario !== `${change}:${phase}`)));
    }
  }
});
test('final audit after fully written complete new matrix admits cleanup', () => {
  requireFamilyCleanupOrder(cleanup());
});
test('old receipts, mismatched attempt, unfinished audit, incomplete matrix refuse cleanup', () => {
  for (const mutate of [
    state => {state.matrix.attempt = '20261010-managed-final';},
    state => {state.matrix.status = 'CURRENT_REAL_READ_FLOW_PASS_LEGACY_SUPPORT_OWNER_RETIRED';},
    state => {state.matrix.status = 'ACTUAL_FIVE_FAMILY_CORE_MATRIX_PASS_ACCEPTANCE_GAPS_OPEN';},
    state => {state.invariants.attempt = '20261010-managed-final';},
    state => {state.invariants.recordedAt = '2026-10-10T09:00:00Z';},
    state => {state.matrixMtime = NaN;},
    state => {state.invariants.catalogGroups = 16;},
    state => {state.matrix.observations.pop();},
  ]) {const state = cleanup(); mutate(state); assert.throws(() => requireFamilyCleanupOrder(state));}
});

test('failed pre-restore cleanup admits only the stopped resource-aborted new download', () => {
  const state=()=>({attempt:'20261010-managed-families',
    pull:{attempt:'20261010-managed-families',action:'pull-classic',resourceStop:true,exitCode:null},
    names:['runtime-20261010-managed-families-pull-classic-result.json'],vmStatus:'Stopped'});
  requireFailedFamilyCleanup(state());
  for(const mutate of [s=>{s.attempt='20261010-managed-final';},s=>{s.pull.resourceStop=false;},
    s=>{s.pull.exitCode=0;},s=>{s.vmStatus='Running';},s=>{s.pull.action='create-container';},
    s=>{s.names.push('restore-summary-20261010-managed-families.json');},
    s=>{s.names.push('managed-20261010-managed-families-config.json');}]){
    const s=state();mutate(s);assert.throws(()=>requireFailedFamilyCleanup(s));
  }
});
