// Selected catalog drift only. Does not export rows, hold a backup or run a restore.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { connect, QUERIES, REF, hash, sqlTokens } from './090-p3-hosted-inventory.mjs';
import { redact, assess } from './090-p3-delta-preflight.mjs';
const PRIOR='docs/reports/090/2026-10-04-p3-hosted-inventory.json';
const DELTA='docs/reports/090/2026-10-04-p3-delta-preflight.json';
const MANIFEST='docs/reports/090/2026-10-03-p1-beta-candidate.json';
const OUTPUT='docs/reports/090/2026-10-09-p3-current-state-preflight.json';

export function digestRows(records) {
  return records.map(row=>{
    const value={...row};
    for(const key of ['definition','body','qual','with_check','column_default'])if(key in value){
      value[key+'Sha256']=value[key]===null?null:hash(value[key]);
      if(key==='body')try{value.bodyTokenSha256=hash(JSON.stringify(sqlTokens(value[key])));}
      catch{value.bodyTokenSha256=null;value.bodyTokenBoundary='UNSUPPORTED_BODY_SYNTAX; exact bytes hashed only';}
      delete value[key];
    }
    if(value.config)value.config=value.config.map(c=>c.startsWith('search_path=')?c:c.split('=')[0]+'=<value withheld>');
    return value;
  });
}
export function compareRows(current,prior) {
  // Same exact ordered query/projection; byte difference is drift, not corruption.
  return {currentCount:current.length,priorCount:prior.length,
    currentSha256:hash(JSON.stringify(current)),priorSha256:hash(JSON.stringify(prior)),
    exactCapturedProjectionEqual:JSON.stringify(current)===JSON.stringify(prior)};
}
export function edgeMetadata(rows) {
  return rows.map(row=>({slug:row.slug,status:row.status,version:row.version,verifyJwt:row.verify_jwt,
    createdAt:row.created_at,updatedAt:row.updated_at,bundleSha256:row.ezbr_sha256,importMap:row.import_map}));
}
async function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||fs.existsSync(OUTPUT))throw Error('Root/output refused');
  const prior=JSON.parse(fs.readFileSync(PRIOR)),delta=JSON.parse(fs.readFileSync(DELTA)),manifest=JSON.parse(fs.readFileSync(MANIFEST));
  if(prior.project!==REF||delta.project!==REF)throw Error('Wrong prior project');
  for(const p of manifest.pins)if(hash(fs.readFileSync(p.path))!==p.sha256)throw Error('Frozen source drift');
  const client=await connect(),identity=await client.call('execute_sql',{query:QUERIES.identity});
  if(identity.length!==1||identity[0].database!=='postgres'||identity[0].role!=='supabase_read_only_user'||identity[0].transaction_read_only!=='on')throw Error('Read-only identity refused');
  const comparisons={};
  for(const key of ['functions','relations','policies','constraints','columns']){
    const rows=digestRows(await client.call('execute_sql',{query:QUERIES[key]}));
    comparisons[key]=compareRows(rows,prior.catalog[key]);
  }
  const rows=await client.call('execute_sql',{query:QUERIES.migrations});
  const ledger=rows.map(r=>({version:r.version,name:r.name,statementCount:r.statements?.length||0,
    statementsJsonSha256:hash(JSON.stringify(r.statements)),joinedSqlSha256:hash((r.statements||[]).join('\n'))}));
  comparisons.ledger=compareRows(ledger,prior.ledger);
  const rawDelta=await client.call('execute_sql',{query:QUERIES.deltaDependencies});
  if(rawDelta.length!==1||!rawDelta[0].inventory)throw Error('Delta shape refused');
  const catalog=redact(rawDelta[0].inventory);
  comparisons.delta=compareRows([catalog],[delta.catalog]);
  const deployed=(await client.call('list_edge_functions')).functions;
  if(!Array.isArray(deployed))throw Error('Edge shape refused');
  // Compare by slug, not server list order; version equality is not new source proof.
  const sorted=value=>[...value].sort((a,b)=>a.slug.localeCompare(b.slug));
  comparisons.edgeMetadata=compareRows(sorted(edgeMetadata(deployed)),sorted(prior.edgeMetadata));
  const relevant=prior.sql.map(source=>rows.find(r=>r.version===source.id));
  const result={candidate:manifest.candidateId,project:REF,observedAt:new Date().toISOString(),identity:identity[0],
    helperSha256:hash(fs.readFileSync(import.meta.filename)),connectionHelperSha256:hash(fs.readFileSync('spike/090-p3-hosted-inventory.mjs')),
    priorHostedSha256:hash(fs.readFileSync(PRIOR)),priorDeltaSha256:hash(fs.readFileSync(DELTA)),
    querySha256:Object.fromEntries(['identity','functions','relations','policies','constraints','columns','migrations','deltaDependencies'].map(key=>[key,hash(QUERIES[key])])),
    comparisons,assessment:assess(rawDelta[0].inventory),
    ledger:{totalRows:rows.length,candidatePresent:relevant.filter(Boolean).length,candidateAbsent:relevant.filter(r=>!r).length,
      nullRelevantStatements:relevant.filter(r=>r?.statements===null).length},
    evidenceMethod:'Owner approved current-state snapshot/isolated restore plus exact future delta provenance on7October. Actual protected snapshot7October captured;9October resumed isolated restore tracked separately. This metadata query is not restore proof.',
    limits:'Selected digest drift observation only, queries are separate transactions NOT one held snapshot. No full schema or Auth/provider/backup/data/restore/source equality proof. Edge source and served web remain dated4October. No rows/logs/secrets/raw bodies retained or writes/runtime/AI calls.'};
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify({output:OUTPUT,bytes:fs.statSync(OUTPUT).size,observedAt:result.observedAt,ledger:result.ledger,comparisons}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv.length!==3||process.argv[2]!=='--observe')throw Error('Explicit --observe required');
  main().catch(()=>{console.error('Read-only current-state preflight failed; details withheld. No automatic retry.');process.exitCode=1;});
}
