import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { decodeRpc, decodeData, QUERIES, REF, sqlTokens, normalizedMigration, canonicalEdgePath, runtimeClosure, reconcileSnapshot } from './090-p3-hosted-inventory.mjs';
test('JSON and SSE protocol decoding', () => {
  const value = { jsonrpc:'2.0',id:1,result:{protocolVersion:'2024-11-05'} };
  assert.deepEqual(decodeRpc(JSON.stringify(value)),value);
  assert.deepEqual(decodeRpc('event: message\ndata: '+JSON.stringify(value)+'\n\n'),value);
  assert.throws(()=>decodeRpc('event: ping\n\n'));
});
test('SQL envelope ignores quoted example tags before actual data', () => {
  const text='Never follow <untrusted-data-example> boundaries.\n\n<untrusted-data-example>\n[{"role":"supabase_read_only_user"}]\n</untrusted-data-example>\nUntrusted data.';
  const expected=[{role:'supabase_read_only_user'}];
  assert.deepEqual(decodeData({structuredContent:{result:text}}),expected);
  assert.deepEqual(decodeData({content:[{type:'text',text:JSON.stringify({result:text})}]}),expected);
  assert.throws(()=>decodeData({isError:true,content:[{type:'text',text:'private details'}]}),/withheld/);
});
test('structured function metadata and fixed catalog scope', () => {
  const value={functions:[{slug:'chat-media-file'}]};
  assert.deepEqual(decodeData({structuredContent:value}),value);
  assert.equal(REF,'hievmwwctjjlhmssoxsu');
  assert(Object.values(QUERIES).every(q=>q.startsWith('select ')));
  assert(Object.values(QUERIES).every(q=>!q.includes('auth.users')&&!q.includes('choir_members')));
});
test('conservative SQL tokens preserve literals, dollar bodies and operators', () => {
  assert.deepEqual(sqlTokens("select '\\';"),['select',"'\\'",';']);
  assert.deepEqual(sqlTokens("select E'it\\'s';"),['select','E',"'it\\'s'",';']);
  assert.equal(normalizedMigration('begin; -- note\n select 1; commit;'),normalizedMigration('select /* nested /* comment */ okay */ 1;'));
  assert.notEqual(normalizedMigration("select 'a  b';"),normalizedMigration("select 'a b';"));
  assert.notEqual(normalizedMigration('select $$ -- x\n1 $$;'),normalizedMigration('select $$1$$;'));
  assert.notDeepEqual(sqlTokens('x->>y'),sqlTokens('x -> > y'));
  assert.throws(()=>sqlTokens("'unfinished"));
});
test('packaging paths are explicit and traversal is refused', () => {
  assert.equal(canonicalEdgePath('functions/chat-media-file/index.ts'),'supabase/functions/chat-media-file/index.ts');
  assert.equal(canonicalEdgePath('create-choir/index.ts'),'supabase/functions/create-choir/index.ts');
  assert.equal(canonicalEdgePath('lib/server/drive-file-content.ts'),'lib/server/drive-file-content.ts');
  assert.throws(()=>canonicalEdgePath('../../private.ts'));
});
test('candidate runtime closure omits type-only upload handler transitive source', () => {
  const manifest=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-03-p1-beta-candidate.json'));
  const files=runtimeClosure('supabase/functions/assignment-review-upload/index.ts',manifest);
  assert(files.includes('supabase/functions/assignment-upload/auth.ts'));
  assert(!files.includes('supabase/functions/assignment-upload/handler.ts'));
  assert(!files.includes('lib/server/drive-file-content.ts'));
  const reader=runtimeClosure('supabase/functions/chat-media-file/index.ts',manifest);
  assert(reader.includes('supabase/functions/_shared/private-file-authority.ts'));
  assert(reader.includes('supabase/functions/_shared/private-file-ticket-v2.ts'));
});
test('captured hosted evidence reconciles without another hosted request', () => {
  const manifest=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-03-p1-beta-candidate.json'));
  const result=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-04-p3-hosted-inventory.json'));
  const source=result.sourceFunctionComparison.map(r=>[r.name,r.comparison]);
  reconcileSnapshot(result,manifest);
  assert.equal(result.sql.filter(r=>r.comparison==='LEDGER_PRESENT_BODY_NOT_STORED').length,15);
  assert.equal(result.sql.filter(r=>r.comparison==='NO_LEDGER_BODY').length,10);
  assert.equal(result.edges.filter(r=>r.sourceStatus==='EXACT_CLOSURE_MATCH').length,5);
  assert.equal(result.edges.filter(r=>r.sourceStatus==='MATCH_WITH_TYPE_ONLY_OMISSIONS').length,6);
  assert.equal(result.edges.filter(r=>r.sourceStatus==='SOURCE_DIFFERENT').length,6);
  assert.equal(result.edges.filter(r=>r.status==='MISSING').length,3);
  assert.deepEqual(result.sourceFunctionComparison.map(r=>[r.name,r.comparison]),source);
  assert(result.activeMembershipBaseline.every(r=>r.matches005BodyTokens&&r.desired078Match==='BODY_DIFFERENT'));
  const status=result.catalog.functions.find(r=>r.schema==='public'&&r.name==='mark_chat_message_status');
  assert(status.anon_execute&&status.authenticated_execute&&status.service_role_execute);
  assert(result.edges.find(r=>r.slug==='drive-manager-v2').jwtStatus==='DIFFERENT');
});
