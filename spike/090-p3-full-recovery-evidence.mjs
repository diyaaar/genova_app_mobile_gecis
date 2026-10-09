// Actual full pinned-image restore checkpoint, never source/synthetic-only PASS.
// SQL/row values and per-table fingerprints remain in the protected directory.
import fs from 'node:fs';import crypto from 'node:crypto';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const OUTPUT='docs/reports/090/2026-10-09-p3-full-fidelity.json';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function read(name){const file=DIR+'/'+name,s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||(s.mode&511)!==384)throw Error('Private recovery evidence refused');return fs.readFileSync(file);}
function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--record-actual'||fs.existsSync(OUTPUT))throw Error('Full recovery checkpoint scope/output refused');
  if(fs.realpathSync(DIR)!==DIR||fs.lstatSync(DIR).isSymbolicLink()||(fs.statSync(DIR).mode&511)!==448)throw Error('Private source directory refused');
  const source=JSON.parse(read('summary.json')),r=JSON.parse(read('restore-summary.json'));
  if(source.project!=='hievmwwctjjlhmssoxsu'||r.project!==source.project||r.backupSha256!==source.plaintextSha256||r.network!=='none'||r.mounts!==0||r.publishedPorts!==0)throw Error('Full recovery identity/isolation refused');
  const success=r.status==='CURRENT_STATE_SELECTED_FIDELITY_PASS'&&Object.keys(r.differences).length===0;
  if(success&&(r.dataTables!==source.dataTables||!r.exactComparatorUnchanged||!r.originalBackupUnmodified||Object.values(r.catalogCounts).some(c=>c.source!==c.restored)))throw Error('Unsupported recovery success refused');
  const result={recordedAt:new Date().toISOString(),project:source.project,status:success?'ACTUAL_SELECTED_FULL_CATALOG_AND_DATA_FIDELITY_PASS':'ACTUAL_FIDELITY_FAIL_NOT_ACCEPTED',
    source:{cutoff:source.cutoff,completedAt:source.recordedAt,plaintextBytes:source.plaintextBytes,plaintextSha256:source.plaintextSha256,encryptedSha256:source.encryptedSha256},
    actualRestore:{completedAt:r.recordedAt,image:'supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00',
      database:r.database,network:r.network,mounts:r.mounts,publishedPorts:r.publishedPorts,dataTables:r.dataTables,restoredRows:r.restoredRows,
      allCapturedTableFullRowFingerprintsMatch:!r.differences.data,catalogCounts:r.catalogCounts,strictDifferenceGroups:Object.keys(r.differences),
      supportedSeed:r.supportedSeed,aclSupplement:r.aclSupplement,exactComparatorUnchanged:r.exactComparatorUnchanged,originalBackupUnmodified:r.originalBackupUnmodified,status:r.status},
    helperSha256:Object.fromEntries(['spike/090-p3-full-recovery-evidence.mjs','spike/090-p3-offline-restore.mjs','spike/090-p3-recovery-seed.mjs','spike/090-p3-parity-analysis.mjs','spike/090-p3-recovery-queries.mjs','spike/090-p3-resource-policy.mjs'].map(f=>[f,sha(fs.readFileSync(f))])),
    exclusions:source.excluded,limits:'Actual isolated logical recovery of the selected9October held source only. Sequence/non-MVCC, omitted provider/Storage/Vault/Realtime/config/password data and full managed platform/live Auth/RLS/HTTP/client/cache/security/review/deployment remain distinct gates. Not release/product/goal completion.',
    hostedWrites:0,newJevCalls:0,newInferenceCostUSD:0,ownerManualQA:false};
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({output:OUTPUT,status:result.status,dataTables:r.dataTables,rows:r.restoredRows,strictDifferenceGroups:result.actualRestore.strictDifferenceGroups}));
}
try{main();}catch{console.error('Actual full recovery checkpoint refused; private details withheld, no automatic acceptance.');process.exitCode=1;}
