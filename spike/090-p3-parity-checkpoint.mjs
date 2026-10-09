// One bounded diagnosis of already protected source/actual catalogs. No SQL writes,
// restore, retry, raw-data stdout or AI export. Generated repair SQL stays private.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { decryptBuffer } from './090-p3-consistent-backup.mjs';
import { connect,QUERIES,REF,sqlTokens } from './090-p3-hosted-inventory.mjs';
import { aclEntries,planAclAdditions,requireRecoveryMetadata,columnLayoutEvidence } from './090-p3-parity-analysis.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
const OUTPUT='docs/reports/090/2026-10-09-p3-parity-diagnosis.json';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function privateRead(name){const file=DIR+'/'+name,stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&511)!==384)throw Error('Private diagnostic scope refused');return fs.readFileSync(file);}
async function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--analyze'||fs.existsSync(OUTPUT))throw Error('Scope/output refused');
  if(fs.lstatSync(DIR).isSymbolicLink()||(fs.statSync(DIR).mode&511)!==448)throw Error('Private directory refused');
  for(const name of ['acl-additions-20261009.sql','metadata-projection-20261009.json'])if(fs.existsSync(DIR+'/'+name))throw Error('Private diagnostic overwrite refused');
  const backup=JSON.parse(privateRead('summary.json')),restore=JSON.parse(privateRead('restore-summary.json'));
  if(backup.project!==REF||restore.backupSha256!==backup.plaintextSha256||restore.status!=='FIDELITY_FAIL_NOT_ACCEPTED')throw Error('Evidence identity refused');
  const key=privateRead('artifact-key.bin'),body=decryptBuffer(privateRead('snapshot.json.gcm'),key),source=JSON.parse(body);key.fill(0);body.fill(0);
  const actual=Object.fromEntries(['functions','schemas','relations','columns','constraints'].map(group=>[group,JSON.parse(privateRead('fidelity-canonical-actual-'+group+'.json'))]));
  const plan=planAclAdditions(source.catalog,actual);
  const columns=columnLayoutEvidence(source.catalog.columns,actual.columns);
  const index=new Map(actual.constraints.map(r=>[JSON.stringify([r.schema,r.table_name,r.name]),r]));
  if(index.size!==actual.constraints.length||index.size!==source.catalog.constraints.length)throw Error('Constraint identity mismatch');
  let definitionDifferences=0,parenthesesOnlyDifferences=0;
  for(const r of source.catalog.constraints){
    const a=index.get(JSON.stringify([r.schema,r.table_name,r.name]));if(!a)throw Error('Missing constraint');
    if(r.definition!==a.definition){definitionDifferences++;
      const withoutParentheses=value=>JSON.stringify(sqlTokens(value).filter(t=>t!=='('&&t!==')'));
      if(withoutParentheses(r.definition)===withoutParentheses(a.definition))parenthesesOnlyDifferences++;
    }
  }
  let sameSnapshotMetadataComplete=true;try{requireRecoveryMetadata(source);}catch{sameSnapshotMetadataComplete=false;}
  const client=await connect(),identity=await client.call('execute_sql',{query:QUERIES.identity});
  if(identity.length!==1||identity[0].database!=='postgres'||identity[0].role!=='supabase_read_only_user'||identity[0].transaction_read_only!=='on'||!/^17\./.test(identity[0].server_version))throw Error('Named read-only target refused');
  const rows=await client.call('execute_sql',{query:QUERIES.recoveryMetadataProjection});
  if(rows.length!==1||!rows[0].projection)throw Error('Metadata projection refused');
  const projection=rows[0].projection;
  for(const group of ['publicationRelations','publicationSchemas','droppedColumns'])if(!Array.isArray(projection[group]))throw Error('Metadata projection shape refused');
  const defaults={};
  for(const [family,kind] of [['functions',undefined],['schemas',undefined],['relations','r'],['sequences','S']]){
    const f=family==='sequences'?'relations':family;
    defaults[family]=JSON.stringify(aclEntries({owner:'postgres',acl:null,kind},f))===JSON.stringify(aclEntries({owner:'postgres',acl:projection.defaults[family],kind},f));
    if(!defaults[family])throw Error('PostgreSQL built-in ACL default mismatch');
  }
  const recordedAt=new Date().toISOString();
  fs.writeFileSync(DIR+'/metadata-projection-20261009.json',JSON.stringify({recordedAt,identity:identity[0],projection}),{flag:'wx',mode:0o600});
  fs.writeFileSync(DIR+'/acl-additions-20261009.sql',plan.sql+'\n',{flag:'wx',mode:0o600});
  const result={recordedAt,project:REF,status:'DIAGNOSIS_AND_REPAIR_PLAN_ONLY_FULL_FIDELITY_FAIL',
    backupCutoff:backup.cutoff,backupSha256:backup.plaintextSha256,originalRestoreStatus:restore.status,
    acl:{...plan.totals,groups:plan.groups,sqlStatus:plan.status,privateSqlSha256:hash(plan.sql+'\n'),
      rules:'Exact captured additive privileges/options only; preserve grantor/owner. Refuse extra rights, delegated grants, identity/body changes and unsupported SQL. Not executed or accepted.'},
    columns,constraints:{definitionDifferences,parenthesesOnlyDifferences,logicalEquivalence:'NOT_PROVEN; token observation does not establish AST equivalence'},
    sourceMetadata:{sameSnapshotMetadataComplete,missingGroups:['publicationRelations','publicationSchemas','droppedColumns'].filter(g=>!Array.isArray(source.catalog[g])),canonicalContextCaptured:!!source.comparisonContext,
      historicalSupplement:'REFUSED; current metadata is not the7October held snapshot'},
    currentReadOnlyQuery:{observedAt:recordedAt,identity:identity[0],querySha256:hash(QUERIES.recoveryMetadataProjection),
      counts:Object.fromEntries(['publicationRelations','publicationSchemas','droppedColumns'].map(g=>[g,projection[g].length])),
      postgresAclDefaultsMatch:defaults,projectionSha256:hash(JSON.stringify(projection)),
      limits:'Query syntax/default ACL models verified against current correct-project PG17. No application rows, current backup, historical membership/root equality or restore execution inferred.'},
    helperSha256:Object.fromEntries(['spike/090-p3-parity-analysis.mjs','spike/090-p3-parity-checkpoint.mjs','spike/090-p3-recovery-queries.mjs','spike/090-p3-consistent-backup.mjs','spike/090-p3-offline-restore.mjs','spike/090-p3-hosted-inventory.mjs'].map(f=>[f,hash(fs.readFileSync(f))])),
    hostedWrites:0,runtimeRebuilds:0,newJevCalls:0,newInferenceCostUSD:0,ownerManualQA:false};
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({output:OUTPUT,status:result.status,acl:plan.totals,columns,sourceMetadata:result.sourceMetadata,currentQuery:result.currentReadOnlyQuery}));
}
main().catch(()=>{console.error('Protected parity diagnosis failed; private details withheld, no retry or acceptance.');process.exitCode=1;});
