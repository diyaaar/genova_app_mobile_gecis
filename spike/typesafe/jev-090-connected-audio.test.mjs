import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAudioPacket,expected } from './jev-090-connected-audio.mjs';
const record={result:'PASS',tickets:[200,200,200,403],contentLength:160044,sha256:'a'.repeat(64),reads:[
  ...['GET','HEAD'].map(method=>({method,status:401,providerDelta:0})),
  ...[1,2].map(()=>({method:'GET',status:200,providerDelta:1})),
  ...['GET','HEAD','HEAD'].map(method=>({method,status:403,providerDelta:0})),
]};
const trace='ALL PASS connected local Android audio; not hosted/iOS/audibility';
test('one bounded packet preserves actual scope and unknown-vs-opposite distinction',()=>{
  const packet=buildAudioPacket(record,trace,{http:'a'.repeat(64),native:'b'.repeat(64)});
  assert.equal(Object.keys(packet.questions).length,11);assert.equal(Object.keys(expected).length,11);
  assert.equal(packet.model,'jev-1.13.0');assert.ok(Buffer.byteLength(JSON.stringify(packet))<24000);
  assert.match(packet.questions.ios.criteria.contradicts,/unrun gate alone is NOT/);
  assert.match(packet.state.method,/intentional injections/);
});
test('unaccepted native or HTTP evidence cannot prepare',()=>{
  assert.throws(()=>buildAudioPacket({...record,result:'FAIL'},trace,{}));
  assert.throws(()=>buildAudioPacket(record,'loading',{}));
  assert.throws(()=>buildAudioPacket({...record,tickets:[200,200,200,200]},trace,{}));
});
test('missing denials/provider activity/renewal evidence cannot be hidden',()=>{
  assert.throws(()=>buildAudioPacket({...record,reads:record.reads.slice(1)},trace,{}));
  assert.throws(()=>buildAudioPacket({...record,reads:record.reads.map(r=>({...r,providerDelta:1}))},trace,{}));
  assert.throws(()=>buildAudioPacket({...record,reads:record.reads.filter(r=>r.status!==200)},trace,{}));
});
