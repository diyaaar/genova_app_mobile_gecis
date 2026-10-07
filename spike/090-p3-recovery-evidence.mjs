// Redacted evidence and exact failed-key-only cleanup after the approved operation.
// No SQL, private table names/rows, per-table digests, keys or raw logs leave this process.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { decryptBuffer, freeKiB, verifySnapshot } from './090-p3-consistent-backup.mjs';
const ROOT='/Users/alidiyarduran/Antigravity/genovakorist';
const PARENT='/Users/alidiyarduran/Documents/Codex/2026-10-07';
const DIR=path.join(PARENT,'genova-090-p3-RAJEJt');
const OUTPUT='docs/reports/090/2026-10-07-p3-protected-recovery.json';
const ISO='/Users/alidiyarduran/Library/Caches/lima/download/by-url-sha256/f42a4799d05c13f53c6ebd553f481a03242764b7450c141dfad516e6c5298335';
const hash=body=>crypto.createHash('sha256').update(body).digest('hex');
function privateFile(name){
  const file=path.join(DIR,name),s=fs.lstatSync(file);
  if(!s.isFile()||s.isSymbolicLink()||(s.mode&511)!==384)throw Error('Private file scope refused');
  return fs.readFileSync(file);
}
function main(){
  if(process.cwd()!==ROOT||process.argv.length!==3||process.argv[2]!=='--finalize-approved'||fs.existsSync(OUTPUT))throw Error('Root/action/overwrite refused');
  if(fs.lstatSync(DIR).isSymbolicLink()||(fs.statSync(DIR).mode&511)!==448)throw Error('Private directory refused');
  const s=JSON.parse(privateFile('summary.json')),key=privateFile('artifact-key.bin');
  if(s.project!=='hievmwwctjjlhmssoxsu'||key.length!==32)throw Error('Backup identity refused');
  const ciphertext=privateFile('database.sql.gcm'),plaintext=decryptBuffer(ciphertext,key);
  const metadata=decryptBuffer(privateFile('snapshot.json.gcm'),key),snapshot=JSON.parse(metadata);
  key.fill(0);metadata.fill(0);verifySnapshot(snapshot);
  if(hash(ciphertext)!==s.encryptedSha256||hash(plaintext)!==s.plaintextSha256||plaintext.length!==s.plaintextBytes||snapshot.cutoff!==s.cutoff)throw Error('Backup equality refused');
  plaintext.fill(0);
  const cleanup=JSON.parse(privateFile('runtime-cleanup-final.json'));
  if(cleanup.status!=='OWNED_FINAL_RUNTIME_REMOVED'||fs.existsSync('/Volumes/g090p3')||fs.existsSync(path.join(DIR,'runtime.sparsebundle'))||fs.existsSync(ISO)||fs.existsSync(path.join(DIR,'restore-summary.json')))throw Error('Final runtime boundary refused');
  const removed=[];
  for(const name of ['genova-090-p3-lkgvfQ','genova-090-p3-tHnlDq']){
    const dir=path.join(PARENT,name),stat=fs.lstatSync(dir);
    if(stat.isSymbolicLink()||(stat.mode&511)!==448||JSON.stringify(fs.readdirSync(dir).sort())!==JSON.stringify(['artifact-key.bin','export-errors.log']))throw Error('Failed directory ownership refused');
    for(const [file,size] of [['artifact-key.bin',32],['export-errors.log',0]]){
      const p=path.join(dir,file),s=fs.lstatSync(p);
      if(!s.isFile()||s.isSymbolicLink()||s.size!==size||(s.mode&511)!==384)throw Error('Failed file ownership refused');
    }
    fs.unlinkSync(path.join(dir,'artifact-key.bin'));fs.unlinkSync(path.join(dir,'export-errors.log'));fs.rmdirSync(dir);
    removed.push(name);
  }
  const phases=['start','provision-repair','provision-resume','pull','start-classic','provision-clean','pull-classic'];
  const attempts=phases.map(action=>{
    const r=JSON.parse(privateFile(`runtime-${action}-result.json`));
    return {action,recordedAt:r.recordedAt,exitCode:r.exitCode,resourceStop:r.resourceStop,hostFreeKiB:r.freeKiB};
  });
  const result={recordedAt:new Date().toISOString(),project:s.project,status:'BACKUP_PASS_RESTORE_NOT_RUN_RESOURCE_BLOCKER',
    backup:{completedAt:s.recordedAt,cutoff:s.cutoff,plaintextBytes:s.plaintextBytes,encryptedBytes:s.encryptedBytes,
      plaintextSha256:s.plaintextSha256,encryptedSha256:s.encryptedSha256,schemas:s.schemas,dataTables:s.dataTables,
      rows:snapshot.data.reduce((n,t)=>n+t.rows,0),roles:s.roles,memberships:s.memberships,
      catalogCounts:Object.fromEntries(Object.entries(snapshot.catalog).map(([name,rows])=>[name,rows.length])),
      readOnly:snapshot.readOnly,encryption:'AES-256-GCM',directoryMode:'0700',fileMode:'0600',
      roundtripVerified:true,keyCustody:'same permission-restricted local directory, not independent/offsite',excluded:s.excluded},
    runtime:{image:'supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00',
      physicalVolumeCapMiB:2458,attempts,actualRestore:'NOT RUN',privateDataEnteredRuntime:false,
      failure:'two storage layouts reached capped volume pressure/read-only filesystem while extracting the same full image',
      finalCleanupAt:cleanup.recordedAt,ownedVmVolumeCacheRemoved:true,failedKeyOnlyDirectoriesRemoved:removed},
    hostFreeKiB:freeKiB(),hostDiskFloorKiB:10485760,
    defaultLimaInstances:execFileSync('/opt/homebrew/bin/limactl',['list','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()===''?0:'RECHECK',
    newJevCalls:0,newInferenceCostUSD:0,hostedWrites:false,ownerManualQA:false,
    limits:'Protected consistent logical export and authenticated-decryption verification are not restore fidelity. Sequence state is non-MVCC; external storage bytes/config/passwords are excluded. No full managed-platform, client, hosted revocation or independent-review acceptance.'};
  if(result.hostFreeKiB<result.hostDiskFloorKiB)throw Error('Final disk floor refused');
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:result.status,output:OUTPUT,hostFreeKiB:result.hostFreeKiB,removedKeyOnlyDirectories:removed}));
}
try{main();}catch{console.error('Protected recovery finalization refused; no private details printed.');process.exitCode=1;}
