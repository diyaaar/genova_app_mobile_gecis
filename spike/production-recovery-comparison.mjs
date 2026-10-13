// Private snapshots are decrypted only in memory; publish counts and catalog identities.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {decryptBuffer,verifySnapshot} from './090-p3-consistent-backup.mjs';
import {normalize} from './090-p3-offline-restore.mjs';
import {hash} from '../supabase/test-support/090_candidate_source.mjs';
const baseline='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const current=process.argv[2];
assert.equal(process.argv.length,3);
assert.match(current,/^\/Users\/alidiyarduran\/Documents\/Codex\/2026-10-07\/genova-090-p3-[A-Za-z0-9]+$/u);
assert.notEqual(current,baseline);
function read(dir){
  const stat=fs.lstatSync(dir);assert(stat.isDirectory()&&!stat.isSymbolicLink()&&(stat.mode&511)===448);
  const file=name=>{const p=path.join(dir,name),s=fs.lstatSync(p);assert(s.isFile()&&!s.isSymbolicLink()&&(s.mode&511)===384);return fs.readFileSync(p);};
  const summary=JSON.parse(file('summary.json'));assert.equal(summary.project,'hievmwwctjjlhmssoxsu');
  const key=file('artifact-key.bin'),encrypted=file('database.sql.gcm');
  try{
    assert.equal(hash(encrypted),summary.encryptedSha256);
    const dump=decryptBuffer(encrypted,key);
    try{assert.equal(hash(dump),summary.plaintextSha256);assert.equal(dump.length,summary.plaintextBytes);}finally{dump.fill(0);}
    const bytes=decryptBuffer(file('snapshot.json.gcm'),key);
    try{const snapshot=JSON.parse(bytes);verifySnapshot(snapshot);return {snapshot,summary};}finally{bytes.fill(0);}
  }finally{key.fill(0);}
}
const before=read(baseline),after=read(current);
const same=(a,b)=>isDeepStrictEqual(normalize(a),normalize(b));
// Exact comparisons include every catalog property; labels omit SQL bodies/ACLs.
const label=row=>Object.fromEntries(Object.entries(row).filter(([k])=>[
  'schema','schemaname','table_schema','table_name','tablename','name','signature',
  'column_name','indexname','policyname','pubname','publication','role','member','grantor','position',
].includes(k)));
const groups=Object.keys(before.snapshot.catalog).map(name=>{
  const old=before.snapshot.catalog[name],fresh=after.snapshot.catalog[name];assert(Array.isArray(fresh));
  return {name,unchanged:same(old,fresh),before:old.length,after:fresh.length,
    removedOrChanged:old.filter(row=>!fresh.some(other=>same(row,other))).map(label),
    addedOrChanged:fresh.filter(row=>!old.some(other=>same(row,other))).map(label)};
});
assert.equal(Object.keys(after.snapshot.catalog).length,groups.length);
const data=after.snapshot.data.map(row=>{const old=before.snapshot.data.find(r=>r.schema===row.schema&&r.table_name===row.table_name);return {
  schema:row.schema,table:row.table_name,beforeRows:old?.rows??null,afterRows:row.rows,
  unchanged:!!old&&same(old,row)};});
const removedTables=before.snapshot.data.filter(row=>!after.snapshot.data.some(r=>r.schema===row.schema&&r.table_name===row.table_name)).map(label);
const result={recordedAt:new Date().toISOString(),project:after.summary.project,
  previousCutoff:before.summary.cutoff,currentCutoff:after.summary.cutoff,
  backup:{plaintextBytes:after.summary.plaintextBytes,encryptedBytes:after.summary.encryptedBytes,
    plaintextSha256:after.summary.plaintextSha256,encryptedSha256:after.summary.encryptedSha256,
    encryptedRoundtrip:true,privateModesVerified:true,originalBackupPreserved:true},
  groups,data,removedTables,catalogUnchanged:groups.every(g=>g.unchanged),
  dataUnchanged:data.every(t=>t.unchanged)&&removedTables.length===0,
  status:'FRESH_PROTECTED_SNAPSHOT_COMPARED_RESTORE_NOT_RUN',
  boundary:'Read-only held snapshot. No row bodies, per-table hashes, credentials or SQL definitions retained here. Comparison is not a restore or current runtime acceptance. Object bytes, Storage metadata, provider configuration/secrets and offsite custody remain outside this logical backup.'};
fs.writeFileSync('docs/reports/production-2026-10-13/recovery-comparison.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({currentCutoff:result.currentCutoff,catalogChanged:groups.filter(g=>!g.unchanged).map(g=>g.name),
  tablesChanged:data.filter(t=>!t.unchanged).map(t=>`${t.schema}.${t.table}`),status:result.status}));
