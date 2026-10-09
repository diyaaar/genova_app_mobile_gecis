// Compare held-source metadata/data fingerprints internally; no private names,
// definitions, row text, per-table fingerprints or credentials in public output.
import fs from 'node:fs';import crypto from 'node:crypto';import {pathToFileURL} from 'node:url';
import {decryptBuffer} from './090-p3-consistent-backup.mjs';
import {normalize} from './090-p3-offline-restore.mjs';
const PARENT='/Users/alidiyarduran/Documents/Codex/2026-10-07';
const OUTPUT='docs/reports/090/2026-10-09-p3-held-source-drift.json';
const keys={functions:r=>[r.schema,r.signature],schemas:r=>[r.name],relations:r=>[r.schema,r.name],policies:r=>[r.schemaname,r.tablename,r.policyname],
  constraints:r=>[r.schema,r.table_name,r.name],columns:r=>[r.table_schema,r.table_name,r.column_name],indexes:r=>[r.schemaname,r.tablename,r.indexname],
  triggers:r=>[r.schema,r.table_name,r.name],defaultAcls:r=>[r.owner,r.schema,r.type],roles:r=>[r.name],memberships:r=>[r.role,r.member,r.grantor],
  extensions:r=>[r.name],publications:r=>[r.name],publicationTables:r=>[r.pubname,r.schemaname,r.tablename]};
const app=r=>{const s=r.schema||r.table_schema||r.schemaname;return s==='public'||/^genova_[0-9]{3}$/.test(s||'');};
const equal=(a,b)=>JSON.stringify(normalize(a))===JSON.stringify(normalize(b));
function index(rows,key){const m=new Map(rows.map(r=>[JSON.stringify(key(r)),r]));if(m.size!==rows.length)throw Error('Duplicate source identity');return m;}
export function compareGroup(before,after,key){
  const a=index(before,key),b=index(after,key),fields={};let added=0,removed=0,changed=0,applicationAdded=0,applicationRemoved=0,applicationChanged=0;
  for(const [id,r] of b){if(!a.has(id)){added++;if(app(r))applicationAdded++;continue;}
    const old=a.get(id);if(!equal(old,r)){changed++;if(app(r))applicationChanged++;for(const f of new Set([...Object.keys(old),...Object.keys(r)]))if(!equal({[f]:old[f]},{[f]:r[f]}))fields[f]=(fields[f]||0)+1;}}
  for(const [id,r] of a)if(!b.has(id)){removed++;if(app(r))applicationRemoved++;}
  return {before:a.size,after:b.size,added,removed,changed,changedFields:fields,applicationAdded,applicationRemoved,applicationChanged};
}
function load(name){
  const dir=PARENT+'/'+name;
  if(fs.realpathSync(dir)!==dir||fs.lstatSync(dir).isSymbolicLink()||(fs.statSync(dir).mode&511)!==448)throw Error('Source directory refused');
  const read=n=>{const p=dir+'/'+n,s=fs.lstatSync(p);if(!s.isFile()||s.isSymbolicLink()||(s.mode&511)!==384)throw Error('Protected input refused');return fs.readFileSync(p);};
  const summary=JSON.parse(read('summary.json'));if(summary.project!=='hievmwwctjjlhmssoxsu'||summary.status!=='CONSISTENT_PROTECTED_BACKUP_ONLY_RESTORE_NOT_RUN')throw Error('Completed source refused');
  const k=read('artifact-key.bin'),b=decryptBuffer(read('snapshot.json.gcm'),k),s=JSON.parse(b);k.fill(0);b.fill(0);
  if(s.cutoff!==summary.cutoff||s.readOnly!=='on')throw Error('Snapshot identity refused');return {summary,s};
}
function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--compare-protected'||fs.existsSync(OUTPUT))throw Error('Comparison scope/output refused');
  const old=load('genova-090-p3-RAJEJt'),fresh=load('genova-090-p3-5OnU1m');
  const groups=Object.fromEntries(Object.entries(keys).map(([name,key])=>[name,compareGroup(old.s.catalog[name],fresh.s.catalog[name],key)]));
  const data=compareGroup(old.s.data,fresh.s.data,r=>[r.schema,r.table_name]);
  const rowsBefore=old.s.data.reduce((n,t)=>n+t.rows,0),rowsAfter=fresh.s.data.reduce((n,t)=>n+t.rows,0);
  const result={recordedAt:new Date().toISOString(),project:fresh.summary.project,status:'HELD_SOURCE_METADATA_DRIFT_OBSERVATION_ONLY',
    before:{cutoff:old.s.cutoff,backupSha256:old.summary.plaintextSha256},after:{cutoff:fresh.s.cutoff,backupSha256:fresh.summary.plaintextSha256},groups,
    data:{tablesBefore:data.before,tablesAfter:data.after,tablesAdded:data.added,tablesRemoved:data.removed,tablesWithChangedCapturedRowsOrFingerprint:data.changed,rowsBefore,rowsAfter},
    newlyCapturedGroups:['publicationRelations','publicationSchemas','droppedColumns'].map(name=>({name,count:fresh.s.catalog[name].length,before:'NOT_CAPTURED'})),
    helperSha256:crypto.createHash('sha256').update(fs.readFileSync(import.meta.filename)).digest('hex'),
    limits:'Held7Octvs9Octsource observation, not source-to-restore equality. Application means public/genova schemas; no inference about full web/Edge/HTTP/client/Auth/tenant behavior or cause of managed-schema changes. No raw private content or table-level row fingerprints published.',
    hostedWrites:0,newJevCalls:0,newInferenceCostUSD:0};
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)try{main();}catch{console.error('Protected source drift comparison failed; details withheld, no retry or acceptance.');process.exitCode=1;}
