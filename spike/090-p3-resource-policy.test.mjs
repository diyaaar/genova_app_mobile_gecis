import test from 'node:test';
import assert from 'node:assert/strict';
import {selectAttempt,restoreReceiptNames,checkAllocation,checkLiveBudget,CAPACITY_MIB,MIN_FREE_KIB,LIVE_STOP_KIB,RESERVE_KIB} from './090-p3-resource-policy.mjs';
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
  for(const bad of ['',null,'../other','20261010-compatibility','ANY'])assert.throws(()=>selectAttempt(bad));
});
test('reserve and live physical budget refuse invalid/low/oversize values',()=>{
  assert(checkAllocation(RESERVE_KIB+512*1024)>=512*1024);
  for(const bad of [RESERVE_KIB,NaN,-1,Infinity])assert.throws(()=>checkAllocation(bad));
  checkLiveBudget(LIVE_STOP_KIB,(CAPACITY_MIB-64)*1024);
  for(const [free,allocated] of [[LIVE_STOP_KIB-1,0],[LIVE_STOP_KIB,6656*1024],[LIVE_STOP_KIB,-1],[NaN,0]])
    assert.throws(()=>checkLiveBudget(free,allocated));
});
