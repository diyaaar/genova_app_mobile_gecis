// Source-only rehearsal packet. Never connects, restores, applies SQL or copies a runtime.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {BASE,ROOT,hash,overlays,oldSource,moduleClosure} from '../supabase/test-support/090_candidate_source.mjs';
const source='aa58bf836a7298cf31671367748d26ec4facc4aa';
const parentPath='docs/reports/090/2026-10-09-p3-server-convergence-source.json';
const inventoryPath='docs/reports/090/2026-10-04-p3-delta-preflight.json';
const output='docs/reports/090/2026-10-09-p3-compatibility-packet.json';
const read=file=>fs.readFileSync(ROOT+'/'+file);
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,stdio:['ignore','pipe','pipe'],maxBuffer:32*1024*1024});
const pin=file=>({path:file,sha256:hash(read(file)),bytes:read(file).length});
const dependencies=[[],[],[1],[],[],[3],[3],[3,6],[3],[8],[8,9]];
const testPaths=[
  '024_repertoire_pdf_annotation_safe_save.sql','046_private_chat_realtime.sql',
  '048_chat_read_order.sql','078_active_membership_revocation.sql',
  '079_message_status_rpc_privileges.sql','082_atomic_repertoire_assignments.sql',
  '087_atomic_profile_submit.sql','088_atomic_profile_review.sql',
  '090_private_file_ticket_authority.sql','090_legacy_file_authority.sql',
];
const callers=[
  'lib/repertuvar/annotations.ts','lib/choir-context-core.ts',
  'app/api/repertoire/assignments/update/route.ts',
  'app/api/profile-change-requests/submit/route.ts',
  'app/api/profile-change-requests/review/route.ts',
  'supabase/functions/_shared/private-file-authority.ts','supabase/functions/legacy-file/index.ts',
];
// Pure structural gate. Hash/byte verification is additional, not execution proof.
export function validateOrder(steps,expected){
  assert.equal(steps.length,11);assert.equal(expected.length,11);
  const visited=new Set();
  steps.forEach((step,index)=>{
    assert.equal(step.ordinal,index+1);assert.deepEqual(step.pin,expected[index],'Exact delta drift/reorder');
    assert.deepEqual(step.after,dependencies[index].map(i=>expected[i].path),'Dependency policy drift');
    for(const dependency of step.after)assert(visited.has(dependency),'Missing ordered prerequisite');
    assert(!visited.has(step.pin.path),'Duplicate delta');visited.add(step.pin.path);
  });
  return true;
}
export function buildPacket(){
  assert.equal(process.cwd(),ROOT);
  const parent=JSON.parse(read(parentPath)),inventory=JSON.parse(read(inventoryPath));
  assert.equal(parent.pins.length,614);assert.equal(inventory.missingSourcePins.length,10);
  for(const item of [...parent.pins,...parent.auxiliarySourcePins]){
    assert.equal(hash(read(item.path)),item.sha256,'Current server source drift: '+item.path);
    assert.equal(hash(git('show',`${source}:${item.path}`)),item.sha256,'Committed server source drift');
  }
  const factories=['supabase/test-support/090_candidate_source.mjs','supabase/test-support/090_candidate_source.test.mjs'];
  for(const file of factories)assert.equal(hash(read(file)),hash(git('show',`${source}:${file}`)),'Factory drift');
  const expected=[...inventory.missingSourcePins.map(({id,...item})=>item),
    {path:parent.forwardDelta.path,sha256:parent.forwardDelta.sha256,bytes:parent.forwardDelta.bytes}];
  expected.forEach(item=>assert.deepEqual(pin(item.path),item,'Exact SQL bytes drift'));
  const steps=expected.map((item,index)=>({ordinal:index+1,pin:item,
    after:dependencies[index].map(i=>expected[i].path),status:'NOT RUN; clone-only after resource approval'}));
  validateOrder(steps,expected);
  const {files,closure,slugs}=overlays();
  const browserClosure=moduleClosure(['hooks/useProtectedDriveFileUrl.ts',
    'components/FloatingMiniPlayer.tsx','components/repertuvar/RepertoireWorkspace.tsx'],
  file=>files.get(file)??oldSource(file));
  assert(!browserClosure.files.some(item=>/embedded-|mobile-webview/u.test(item.path)));
  const tests=testPaths.map(file=>'supabase/tests/'+file);
  const fixtures=['082_atomic_repertoire_assignments_fixture.sql','087_profile_submit_fixture.sql',
    '088_profile_review_fixture.sql'].map(file=>'supabase/tests/'+file);
  for(const file of [...tests,...fixtures,...callers])assert.equal(hash(read(file)),hash(git('show',`${source}:${file}`)),'Test/caller drift');
  for(const file of tests)assert(/\bbegin;/iu.test(read(file))&&/\brollback;/iu.test(read(file)),'Missing rollback boundary');
  const realtime=read(tests[1]).toString();
  assert(realtime.includes("prior_publication_tables) <> 1"),'Reassess changed 046 fixture assumption');
  assert(realtime.includes("where tablename='chat_messages'"));
  return {date:'2026-10-09',source,status:'SOURCE_PREPARATION_PASS_RESTORED_SQL_NOT_RUN_NOT_RELEASE',
    serverParent:{...pin(parentPath),source:parent.source,unchangedPins:614},
    priorInventory:{...pin(inventoryPath),observedAt:inventory.observedAt,
      boundary:'Historical catalog-only provenance; not a fresh hosted guard or execution result'},
    factories:factories.map(pin),steps,
    legacyBrowser:{baseline:BASE,overlays:[...files].map(([path,value])=>({path,bytes:Buffer.byteLength(value),sha256:hash(value)})),
      closure:browserClosure,edgeClosure:closure,slugs,materialized:false,built:false,runtimeTested:false},
    sqlTests:tests.map(pin),fixtures:fixtures.map(pin),callers:callers.map(pin),
    executionOrder:{first:'Exclusive full-image recovery: all captured metadata and all full-row fingerprints equal BEFORE any delta',
      second:'Apply only these eleven verified paths in order, actual preflight and bounded locks; stop on first failure',
      third:'After all eleven: 024,046,048,078,079; collision-checked082fixture then082; collision-checked087fixture then087;088fixture reuses087 then088;090actor and090legacy',
      cleanup:'Never delete source records. Test fixture transactions/digests must establish no original-row mutation; remove the entire owned clone after evidence. Do not adapt by broad grants/RLS disable.',
      blockers:[
        'New 6.5GiB resource exception PENDING; no VM/image/download/restore started',
        '046 test asserts one prior publication table, whereas captured source has three; replace that fixture-only assertion with exact captured-before/retained-after set equality in a reviewed clone-specific test, not publication deletion',
        'Persistent synthetic fixtures require pre-insert collision checks and a same-copy original-row digest invariant; not authorized for hosted execution',
        '090 concurrency hardcoded historical DB/dblink target not reusable; implement exclusive-target peer controls before concurrency acceptance',
      ]},
    laterRequired:['Browser full build/pnpm check and actual current/old browser cache/runtime',
      'Managed Auth/PostgREST and mixed-client authorization/HTTP tests',
      'Agent-owned current-source Android+iOS acceptance','Independent review and separately authorized hosted rollout'],
    boundary:'No SQL/HTTP/Auth/runtime/platform/build/restore/release PASS. No private SQL/rows/keys, hosted access, Jev calls or spending.',
    helper:pin('spike/090-compatibility-packet.mjs')};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const packet=buildPacket(),serialized=JSON.stringify(packet,null,2)+'\n';
  assert(Buffer.byteLength(serialized)<256*1024);assert(!/apikey_[a-f0-9]{20}|eyJ[A-Za-z0-9_-]+\./u.test(serialized));
  if(process.argv[2]==='--write')fs.writeFileSync(ROOT+'/'+output,serialized,{flag:'wx'});
  else{assert.equal(process.argv[2],'--verify');assert.equal(fs.readFileSync(ROOT+'/'+output,'utf8'),serialized);}
  console.log(JSON.stringify({source,deltas:packet.steps.length,tests:packet.sqlTests.length,
    fixtures:packet.fixtures.length,browserModules:packet.legacyBrowser.closure.files.length,
    unchangedServerPins:614,bytes:Buffer.byteLength(serialized),runtime:'NOT RUN'}));
}
