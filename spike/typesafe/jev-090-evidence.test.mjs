import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {buildPacket,expected} from './jev-090-evidence.mjs';
const record=JSON.parse(readFileSync('docs/reports/090/2026-10-01-http-overlap.json','utf8'));
test('actual event evidence is bounded and expectations remain offline',()=>{
  const packet=buildPacket(record,'a'.repeat(64));assert.equal(Object.keys(packet.questions).length,9);
  assert.equal(JSON.stringify(packet).includes('"expected"'),false);assert.equal(expected.all_families,'contradicts');
  assert.equal(packet.state.event_order.filter(e=>e.phase==='client-first-bytes-before-commit').length,4);
});
test('missing/failed/wrong-family evidence refuses preparation',()=>{
  for(const patch of [{result:'FAIL'},{family:'chat-media-file'},{results:[]}])assert.throws(()=>buildPacket({...record,...patch},'a'.repeat(64)));
});
