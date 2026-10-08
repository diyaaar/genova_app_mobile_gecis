import test from 'node:test';
import assert from 'node:assert/strict';
import { CAPACITY_MIB, MIN_FREE_KIB, LIVE_STOP_KIB, RESERVE_KIB, checkAllocation } from './090-p3-resource-policy.mjs';
test('owner-scoped lower floor retains fixed full runtime and zero-disk refusal',()=>{
  assert.equal(CAPACITY_MIB,6656);assert.equal(RESERVE_KIB,7630848);
  assert.equal(checkAllocation(8416988),786140);
  assert.throws(()=>checkAllocation(RESERVE_KIB+MIN_FREE_KIB-1));
  assert.throws(()=>checkAllocation(NaN));assert(LIVE_STOP_KIB>MIN_FREE_KIB);
});
