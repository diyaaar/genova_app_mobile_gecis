import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPacket,validateOrder} from './090-compatibility-packet.mjs';
test('exact eleven source deltas and actual old-browser closure are reproducible without runtime',()=>{
  const first=buildPacket();assert.deepEqual(buildPacket(),first);
  assert.equal(first.steps.length,11);assert.equal(first.serverParent.unchangedPins,614);
  assert.equal(first.legacyBrowser.materialized,false);assert.equal(first.legacyBrowser.built,false);
  assert.equal(first.sqlTests.length,10);assert.equal(first.fixtures.length,3);
  assert.equal(first.steps[10].pin.sha256,'c191738462dc500e0be524155fb6e5ca3002e7445ba6a70d77f451d7a52bc36c');
});
test('order refuses missing/extra/duplicate/reordered delta and missing security prerequisite',()=>{
  const {steps}=buildPacket(),expected=steps.map(step=>step.pin);
  for(const mutate of [s=>s.pop(),s=>s.push(s[0]),s=>{s[1].pin=s[0].pin;},
    s=>{[s[8].pin,s[9].pin]=[s[9].pin,s[8].pin];},s=>{s[8].after=[];},
    s=>{s[10].pin.sha256='0'.repeat(64);}]){
    const copy=structuredClone(steps);mutate(copy);assert.throws(()=>validateOrder(copy,expected));
  }
});
test('prepared packet retains clone-specific 046 and concurrency blockers, not synthetic acceptance',()=>{
  const packet=buildPacket();assert.equal(packet.status,'SOURCE_PREPARATION_PASS_RESTORED_SQL_NOT_RUN_NOT_RELEASE');
  assert(packet.executionOrder.blockers.some(text=>text.includes('one prior publication')));
  assert(packet.executionOrder.blockers.some(text=>text.includes('hardcoded')));
  assert(packet.steps.every(step=>step.status.startsWith('NOT RUN')));
});
