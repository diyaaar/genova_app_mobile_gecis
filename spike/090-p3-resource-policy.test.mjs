import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {selectAttempt,restoreReceiptNames,checkAllocation,checkLiveBudget,capacityMiB,CAPACITY_MIB,MIN_FREE_KIB,LIVE_STOP_KIB,RESERVE_KIB,requireUnusedAttempt} from './090-p3-resource-policy.mjs';
test('owner-scoped lower floor retains fixed full runtime and zero-disk refusal',()=>{
  assert.equal(CAPACITY_MIB,6656);assert.equal(RESERVE_KIB,7630848);
  assert.equal(checkAllocation(8416988),786140);
  assert.throws(()=>checkAllocation(RESERVE_KIB+MIN_FREE_KIB-1));
  assert.throws(()=>checkAllocation(NaN));assert(LIVE_STOP_KIB>MIN_FREE_KIB);
});
test('only exact historical/new attempts admitted; receipt names cannot overwrite history',()=>{
  assert.equal(selectAttempt(),'20261009-fidelity');
  assert.deepEqual(restoreReceiptNames('20261009-fidelity'),{summary:'restore-summary.json',failure:'restore-failure.log'});
  const names=restoreReceiptNames('20261009-compatibility');assert.equal(names.summary,'restore-summary-20261009-compatibility.json');
  assert.equal(names.failure,'restore-failure-20261009-compatibility.log');
  assert.equal(restoreReceiptNames('20261010-managed-web').summary,'restore-summary-20261010-managed-web.json');
  assert.equal(restoreReceiptNames('20261010-managed-final').summary,'restore-summary-20261010-managed-final.json');
  assert.equal(capacityMiB('20261010-managed-final'),6144);assert.equal(capacityMiB('20261010-managed-web'),6656);
  for(const bad of ['',null,'../other','20261010-compatibility','ANY'])assert.throws(()=>selectAttempt(bad));
});
test('reserve and live physical budget refuse invalid/low/oversize values',()=>{
  assert(checkAllocation(RESERVE_KIB+512*1024)>=512*1024);
  for(const bad of [RESERVE_KIB,NaN,-1,Infinity])assert.throws(()=>checkAllocation(bad));
  checkLiveBudget(LIVE_STOP_KIB,(CAPACITY_MIB-64)*1024);
  for(const [free,allocated] of [[LIVE_STOP_KIB-1,0],[LIVE_STOP_KIB,6656*1024],[LIVE_STOP_KIB,-1],[NaN,0]])
    assert.throws(()=>checkLiveBudget(free,allocated));
});
test('current-only final attempt really enforces the lower six-GiB live cap',()=>{
  const result=spawnSync(process.execPath,['--input-type=module','-e',
    "import assert from 'node:assert/strict';import {CAPACITY_MIB,RESERVE_KIB,LIVE_STOP_KIB,checkLiveBudget,checkAllocation} from './spike/090-p3-resource-policy.mjs';assert.equal(CAPACITY_MIB,6144);assert.equal(RESERVE_KIB,7106560);checkAllocation(7630848);assert.throws(()=>checkAllocation(7630847));checkLiveBudget(LIVE_STOP_KIB,(6144-64)*1024);assert.throws(()=>checkLiveBudget(LIVE_STOP_KIB,6144*1024));"],
    {env:{...process.env,GENOVA_090_ATTEMPT:'20261010-managed-final'},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});
for(const attempt of ['20261010-managed-families','20261013-managed-families']) test(attempt+' enforces runtime cap and unique receipts',()=>{
  assert.equal(capacityMiB(attempt),5888);
  assert.equal(restoreReceiptNames(attempt).summary,`restore-summary-${attempt}.json`);
  const result=spawnSync(process.execPath,['--input-type=module','-e',
    "import assert from 'node:assert/strict';import {CAPACITY_MIB,RESERVE_KIB,LIVE_STOP_KIB,checkLiveBudget,checkAllocation} from './spike/090-p3-resource-policy.mjs';assert.equal(CAPACITY_MIB,5888);assert.equal(RESERVE_KIB,6844416);assert.equal(checkAllocation(7523264),678848);assert.throws(()=>checkAllocation(7368703));checkLiveBudget(LIVE_STOP_KIB,(5888-64)*1024);assert.throws(()=>checkLiveBudget(LIVE_STOP_KIB,5888*1024));"],
    {env:{...process.env,GENOVA_090_ATTEMPT:attempt},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
});
test('archived failure or any prior receipt refuses attempt reuse before allocation',()=>{
  const attempt='20261010-managed-families';
  requireUnusedAttempt(attempt,['summary.json','artifact-key.bin']);
  for(const name of [`runtime-ownership-${attempt}.json`,`runtime-${attempt}-pull-classic-result.json`,
    `restore-summary-${attempt}.json`,`managed-${attempt}-matrix-v1.json`])
    assert.throws(()=>requireUnusedAttempt(attempt,[name]));
  assert.throws(()=>requireUnusedAttempt(attempt,[null]));
});
