// Read-only migration dependency inventory, not an apply/restore runner.
// No live DO blocks, locks, rows, source bodies, logs or credential output.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { connect, QUERIES, REF, hash } from './090-p3-hosted-inventory.mjs';

const MANIFEST='docs/reports/090/2026-10-03-p1-beta-candidate.json';
const HOSTED='docs/reports/090/2026-10-04-p3-hosted-inventory.json';
const OUTPUT='docs/reports/090/2026-10-04-p3-delta-preflight.json';
export const missingIds=['024','046','048','078','079','082','087','088','090-actor','090-legacy'];
export function assess(value) {
  const ns=name=>value.namespaces.find(n=>n.name===name)?.exists===true;
  const rel=name=>value.relations.find(n=>n.name===name)?.exists===true;
  const fn=name=>value.procedures.find(n=>n.name===name)?.exists===true;
  const all=(values,predicate)=>values.every(predicate);
  const noPolicyCollision=!(value.realtimePolicies||[]).some(p=>['046 room members receive chat signals','046 room members send chat signals'].includes(p.name));
  const results=[
    {id:'024',catalogReady:!ns('genova_024')&&rel('public.repertoire_pdf_annotations')&&rel('public.repertoire_files')&&value.annotationUpdaterCount===1&&!value.annotationRevision?.length&&!fn('public.save_repertoire_pdf_annotation_snapshot(uuid,integer,text,text,integer,jsonb,bigint)'),
      dependsOn:[],unrun:['row song/file/choir consistency','actual RLS layer mutation/old-new client conflicts','lock duration/rewrite cost'],
      boundary:'Catalog-only preliminary checks; source preflight reads application rows and still MUST run on the authorized clone.'},
    {id:'046',catalogReady:!ns('genova_046')&&rel('realtime.messages')&&value.relations.find(r=>r.name==='realtime.messages')?.rls===true&&fn('realtime.topic()')&&!!value.publication?.length&&noPolicyCollision&&all(['public.chat_rooms','public.chat_room_members','public.chat_messages','public.chat_reactions','public.chat_message_status'],rel)&&all(['public.current_choir_id()','public.current_chat_member_id()'],fn),
      dependsOn:[],unrun:['actual authenticated private Broadcast/Presence authorization','public permissive-policy interactions','Realtime provider settings'],boundary:'No policy/publication mutation; source guards preserved.'},
    {id:'048',catalogReady:!ns('genova_048')&&!rel('public.idx_chat_messages_room_created_id_048')&&!fn('public.mark_chat_room_read(uuid)')&&rel('public.chat_messages')&&ns('genova_046')&&(value.publishedChatTables||[]).includes('chat_messages'),
      dependsOn:['046'],unrun:['ordered pagination/index creation lock impact','actual room read tenant negatives'],boundary:'Current preflight fails because046is missing; future success is not claimed.'},
    {id:'078',catalogReady:!ns('genova_078')&&rel('genova_005.active_choir_sessions')&&all(['genova_005.current_session_id()','public.current_choir_id()','public.current_choir_member_id()','public.set_active_choir(uuid)'],fn),
      dependsOn:[],unrun:['active/inactive/multi-membership and stale session selection','concurrency and retained web consumers'],boundary:'Existing005bodies/ACL provenance retained; no mutation here.'},
    {id:'079',catalogReady:!ns('genova_079')&&ns('genova_043')&&fn('public.mark_chat_message_status(uuid,text)')&&value.statusAclProvenanceValid===true,
      dependsOn:[],unrun:['actual anon/authenticated/service role invocation negatives','lock/ACL recovery stop'],boundary:'Catalog provenance validated, not execute-role behavior.'},
    {id:'082',catalogReady:ns('genova_078')&&all(['public.current_choir_id()','public.current_choir_member_id()','public.current_member_has_role(text)'],fn)&&rel('public.song_assignments')&&!fn('public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])'),
      dependsOn:['078'],unrun:['invoker RLS/concurrent expected-set changes','chef/section-leader/no lost update/tenant mismatch'],boundary:'Current preflight fails because078is missing.'},
    {id:'087',catalogReady:ns('genova_078')&&!ns('genova_087')&&rel('public.profile_change_requests')&&!fn('public.submit_profile_change_request(uuid,jsonb,text)'),
      dependsOn:['078'],unrun:['same-user sessions/atomic merge and profile tenant negatives','recovery rollback of unexpected data'],boundary:'Current preflight fails because078is missing.'},
    {id:'088',catalogReady:fn('genova_087.normalize_changes(jsonb)')&&ns('genova_078')&&!fn('public.review_profile_change_request(uuid,text,text)'),
      dependsOn:['078','087'],unrun:['role loss/changed request/concurrent review atomicity','full profile schema dependencies'],boundary:'Current preflight fails because078and087are missing.'},
    {id:'090-actor',catalogReady:!ns('genova_090')&&all(['auth.sessions','genova_005.active_choir_sessions','public.assignment_submission_file_versions','public.assignment_review_audio_versions','public.repertoire_comment_audio_versions'],rel)&&fn('public.can_read_chat_media_060(uuid,uuid,uuid)'),
      dependsOn:[],releaseAfter:['078'],unrun:['actual five-family Auth/RLS existing-ticket next-request negatives','session not_after expiration source gap','legacy client compatibility'],boundary:'Formal source preflight observed only.078is package security sequencing, not an explicit source SQL prerequisite.'},
    {id:'090-legacy',catalogReady:ns('genova_090')&&!fn('public.resolve_legacy_file_090(uuid,uuid,uuid,text,text,uuid)'),
      dependsOn:['090-actor'],releaseAfter:['078'],unrun:['legacy alias collision/resource/version/Auth/RLS negatives','storage and old Next relay compatibility'],boundary:'Source has no preflight DO. Schema090is an actual CREATE FUNCTION prerequisite; other function-body dependencies require clone acceptance.'},
  ];
  return results.map(row=>({...row,status:row.catalogReady?'CATALOG_GUARDS_OBSERVED; NOT EXECUTION_ACCEPTED':'ORDERED_PREREQUISITE_MISSING_OR_COLLISION; NOT READY'}));
}
export function redact(value) {
  const result=structuredClone(value);
  for(const item of result.realtimePolicies||[])for(const key of ['qual','withCheck']){item[key+'Sha256']=item[key]===null?null:hash(item[key]);delete item[key];}
  for(const item of result.annotationTriggers||[]){item.definitionSha256=hash(item.definition);delete item.definition;}
  return result;
}
async function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||fs.existsSync(OUTPUT))throw Error('Owned output/root refused');
  const manifest=JSON.parse(fs.readFileSync(MANIFEST));for(const pin of manifest.pins)if(hash(fs.readFileSync(pin.path))!==pin.sha256)throw Error('Source pins changed');
  const prior=JSON.parse(fs.readFileSync(HOSTED));if(prior.project!==REF)throw Error('Wrong prior project');
  const client=await connect(),identity=await client.call('execute_sql',{query:QUERIES.identity});
  if(identity.length!==1||identity[0].role!=='supabase_read_only_user'||identity[0].transaction_read_only!=='on')throw Error('Read-only identity refused');
  const records=await client.call('execute_sql',{query:QUERIES.deltaDependencies});
  if(records.length!==1||!records[0].inventory)throw Error('Delta metadata shape refused');
  const value=records[0].inventory,assessment=assess(value);
  const pins=prior.sql.filter(r=>r.ledgerStatus==='ABSENT').map(({path,sha256,bytes,id})=>({path,sha256,bytes,id}));
  const result={candidate:manifest.candidateId,project:REF,observedAt:new Date().toISOString(),identity:identity[0],
    manifestSha256:hash(fs.readFileSync(MANIFEST)),priorHostedSha256:hash(fs.readFileSync(HOSTED)),
    helperSha256:hash(fs.readFileSync(import.meta.filename)),connectionHelperSha256:hash(fs.readFileSync('spike/090-p3-hosted-inventory.mjs')),
    querySha256:hash(QUERIES.deltaDependencies),catalog:redact(value),assessment,missingSourcePins:pins,
    historicalStatementEquality:'UNAVAILABLE / NOT VERIFIED;15 relevant prior ledger statements are NULL. Required original criterion remains open.',
    limits:'Catalog-only observation. Original source preflights/row checks not executed. No writes/data/log/backup/restore/build/runtime/AI calls. No deployment readiness claim.'};
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify({output:OUTPUT,bytes:fs.statSync(OUTPUT).size,assessment:assessment.map(({id,catalogReady,dependsOn})=>({id,catalogReady,dependsOn})),authSessionNotAfter:value.authSessionNotAfter,publication:value.publishedChatTables}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv.length!==3||process.argv[2]!=='--observe')throw Error('Explicit --observe required');
  main().catch(()=>{console.error('Read-only delta inventory failed; details withheld. No automatic retry.');process.exitCode=1;});
}
