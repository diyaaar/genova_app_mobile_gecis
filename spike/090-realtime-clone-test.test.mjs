import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {baselinePath,baselineSha256,captureBefore046Sql,expectedPublicationState,
  assertPublicationState,buildRealtimeCloneTest} from './090-realtime-clone-test.mjs';
const row=tablename=>({schemaname:'public',tablename});
const before=[row('chat_reactions'),row('chat_messages'),row('chat_message_status'),row('unrelated_retained_table')];
test('captured three-chat-table state generates exact symmetric prior and full-publication checks',()=>{
  const result=buildRealtimeCloneTest(before);
  assert.equal(result.sourceSha256,baselineSha256);assert.equal(result.expected.prior.length,3);
  assert.equal(result.expected.after.length,4);assert.equal(result.sql.split('except all').length,5);
  assert(result.sql.includes("'unrelated_retained_table'"));
  assert(!result.sql.includes('prior_publication_tables) <> 1'));
  assert(result.sql.endsWith('rollback;\n'));
  assert(result.sql.includes('on commit drop'));assert(captureBefore046Sql.includes("pubname='supabase_realtime'"));
  assert(!/alter publication|grant|disable row level|truncate/iu.test(result.sql));
});
test('set comparison refuses same-count substitution, missing/extra prior and unrelated publication loss',()=>{
  const {prior,after}=expectedPublicationState(before);assertPublicationState(before,prior,after);
  for(const bad of [prior.slice(1),[...prior,row('unexpected')],prior.map((r,i)=>i? r:row('same_count_wrong'))])
    assert.throws(()=>assertPublicationState(before,bad,after),/Prior publication set drift/);
  for(const bad of [after.filter(r=>r.tablename!=='unrelated_retained_table'),[...after,row('unexpected')],
    after.map((r,i)=>i?r:row('same_count_wrong'))])assert.throws(()=>assertPublicationState(before,prior,bad),/Current publication set drift/);
});
test('minimal old fixture and empty publication derive required additions without weakening prior equality',()=>{
  for(const state of [[],[row('chat_messages')]]){
    const {prior,after}=expectedPublicationState(state);assert.equal(prior.length,state.length);assert.equal(after.length,3);
    assertPublicationState(state,prior,after);assert.throws(()=>assertPublicationState(state,[...prior,row('wrong')],after));
  }
});
test('identifier injection/duplicate/unexpected shape/oversize metadata refuses before SQL construction',()=>{
  for(const bad of [[row("x');drop table public.choirs;--")],[row('chat_messages'),row('chat_messages')],
    [{...row('chat_messages'),secret:'not-accepted'}],[{schemaname:null,tablename:'chat_messages'}],
    Array.from({length:257},(_,i)=>row('synthetic_'+i)),null])assert.throws(()=>buildRealtimeCloneTest(bad));
});
test('all original authority/test bytes survive except exact old fixture clause and temporary expectations',()=>{
  const source=fs.readFileSync(baselinePath,'utf8'),result=buildRealtimeCloneTest(before,source);
  for(const label of ['cross-choir member accessed room','anonymous role accessed room','revoked room member accessed room',
    'unsupported extension insert was accepted','same-choir nonmember accessed room','helper privilege boundary is wrong'])
    assert(result.sql.includes(label));
  assert.throws(()=>buildRealtimeCloneTest(before,source+'\n'),/changed historical test/);
});
test('deterministic source pins survive captured metadata ordering and do not claim runtime acceptance',()=>{
  assert.deepEqual(buildRealtimeCloneTest(before),buildRealtimeCloneTest([...before].reverse()));
  assert(buildRealtimeCloneTest(before).boundary.includes('NOT RUN'));
});

test('dated restore uses existing partition date only in fixture inserts', async () => {
  const {bindRealtimeFixtureDate}=await import('./090-realtime-clone-test.mjs');
  const source=fs.readFileSync(baselinePath,'utf8');
  const output=bindRealtimeFixtureDate(source,'2026-10-09');
  assert.equal(output.split("timestamp '2026-10-09 12:00:00'").length-1,7);
  assert.equal(output.replaceAll(',inserted_at)',')').replaceAll(",timestamp '2026-10-09 12:00:00'",''),source);
  assert.throws(()=>bindRealtimeFixtureDate(source,"2026-10-09';drop table x;--"));
  assert.throws(()=>bindRealtimeFixtureDate(source.replace("('fixture','presence')",'missing'),'2026-10-09'));
});
