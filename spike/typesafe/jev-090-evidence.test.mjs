import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {buildPacket,expected,buildFamiliesPacket,familyExpected} from './jev-090-evidence.mjs';
const record=JSON.parse(readFileSync('docs/reports/090/2026-10-01-http-overlap.json','utf8'));
test('actual event evidence is bounded and expectations remain offline',()=>{
  const packet=buildPacket(record,'a'.repeat(64));assert.equal(Object.keys(packet.questions).length,9);
  assert.equal(JSON.stringify(packet).includes('"expected"'),false);assert.equal(expected.all_families,'contradicts');
  assert.equal(packet.state.event_order.filter(e=>e.phase==='client-first-bytes-before-commit').length,4);
});
const current=JSON.parse(readFileSync('docs/reports/090/2026-10-01-http-families-overlap.json','utf8'));
test('combined observed family packet preserves independent chat grant and unrun gates',()=>{
  const packet=buildFamiliesPacket(record,current,{previous:'a'.repeat(64),current:'b'.repeat(64)});
  assert.equal(packet.state.observations.length,20);assert.equal(Object.keys(packet.questions).length,10);
  assert.equal(JSON.stringify(packet).includes('"expected"'),false);
  assert.equal(familyExpected.blanket_role,'contradicts');assert.equal(familyExpected.all_families,'supports');
});
test('missing grant, family or denial refuses combined packet',()=>{
  for(const patch of [{independentGrants:[]},{results:current.results.slice(1)},{providerFailures:1}])
    assert.throws(()=>buildFamiliesPacket(record,{...current,...patch},{}));
  const bad=structuredClone(current);bad.results[0].afterCommit[0].status=200;
  assert.throws(()=>buildFamiliesPacket(record,bad,{}));
});
test('missing/failed/wrong-family evidence refuses preparation',()=>{
  for(const patch of [{result:'FAIL'},{family:'chat-media-file'},{results:[]}])assert.throws(()=>buildPacket({...record,...patch},'a'.repeat(64)));
});
