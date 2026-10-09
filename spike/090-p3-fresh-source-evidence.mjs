// Finalize only the exact new successful private source; not restore acceptance.
// Preserve original7Octbackup and small failed-stage records, remove failed partials
// only after authentication/roundtrip/preflight and their diagnostic checks finish.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { decryptBuffer,verifySnapshot,freeKiB } from './090-p3-consistent-backup.mjs';
const PARENT='/Users/alidiyarduran/Documents/Codex/2026-10-07';
const DIR=PARENT+'/genova-090-p3-5OnU1m';
const OUTPUT='docs/reports/090/2026-10-09-p3-fresh-protected-source.json';
const hash=body=>crypto.createHash('sha256').update(body).digest('hex');
function directory(dir){if(fs.lstatSync(dir).isSymbolicLink()||fs.realpathSync(dir)!==dir||(fs.statSync(dir).mode&511)!==448)throw Error('Protected source directory refused');}
function read(dir,name){const file=dir+'/'+name,stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&511)!==384)throw Error('Private source file refused');return fs.readFileSync(file);}
function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--finalize-success-only'||fs.existsSync(OUTPUT))throw Error('Evidence scope/output refused');
  directory(DIR);
  if(fs.existsSync(DIR+'/failure.json'))throw Error('Failed new source refused');
  const s=JSON.parse(read(DIR,'summary.json'));
  if(s.project!=='hievmwwctjjlhmssoxsu'||s.status!=='CONSISTENT_PROTECTED_BACKUP_ONLY_RESTORE_NOT_RUN'||s.execution.exitCode!==0||s.execution.stopReason!==null)throw Error('Source completion refused');
  const key=read(DIR,'artifact-key.bin'),encrypted=read(DIR,'database.sql.gcm'),dump=decryptBuffer(encrypted,key),body=decryptBuffer(read(DIR,'snapshot.json.gcm'),key),snapshot=JSON.parse(body);key.fill(0);body.fill(0);
  verifySnapshot(snapshot);
  if(hash(encrypted)!==s.encryptedSha256||hash(dump)!==s.plaintextSha256||dump.length!==s.plaintextBytes||snapshot.cutoff!==s.cutoff||!dump.subarray(-2048).includes(Buffer.from('PostgreSQL database dump complete')))throw Error('Authenticated source equality refused');
  dump.fill(0);
  const gate=spawnSync(process.execPath,['spike/090-p3-offline-restore.mjs','--verify-source-only'],{env:{...process.env,GENOVA_RECOVERY_BACKUP_DIR:DIR},encoding:'utf8',timeout:20000,maxBuffer:4096});
  if(gate.status!==0||JSON.parse(gate.stdout).status!=='SOURCE_METADATA_COMPLETE_ONLY_RUNTIME_NOT_RUN')throw Error('Actual source-only gate refused');
  const failed=[];
  for(const name of ['genova-090-p3-KKw9BH','genova-090-p3-kroZk3']){
    const dir=PARENT+'/'+name;directory(dir);
    if(fs.existsSync(dir+'/summary.json'))throw Error('Successful backup deletion refused');
    const failure=JSON.parse(read(dir,'failure.json'));
    if(failure.status!=='FAILED_NOT_ACCEPTED'||!['dump-stream','snapshot-read'].includes(failure.stage))throw Error('Failed ownership refused');
    const allowed=['artifact-key.bin','database.sql.gcm','export-errors.log','failure.json','snapshot.json.gcm'];
    if(fs.readdirSync(dir).some(n=>!allowed.includes(n)))throw Error('Unexpected failed-directory contents refused');
    const removals=['database.sql.gcm','snapshot.json.gcm','artifact-key.bin'].filter(n=>fs.existsSync(dir+'/'+n));
    const sizes=Object.fromEntries(removals.map(n=>[n,read(dir,n).length]));
    if(sizes['artifact-key.bin']!==32)throw Error('Failed task-key size refused');
    if(name==='genova-090-p3-KKw9BH'&&(failure.stage!=='dump-stream'||sizes['database.sql.gcm']!==1245204))throw Error('Measured partial identity refused');
    const error=read(dir,'export-errors.log').toString('utf8');
    const record={directory:name,stage:failure.stage,failedAt:failure.recordedAt,
      privateLogBytes:Buffer.byteLength(error),signalTermination:/terminating|terminated|signal/i.test(error),
      connectTimeout:/timeout expired|Connection timed out/i.test(error),removedGeneratedFiles:sizes,
      rawFailureRecordsRetained:true,notAnAcceptedBackup:true};
    for(const n of removals)fs.unlinkSync(dir+'/'+n);
    failed.push(record);
  }
  const original=PARENT+'/genova-090-p3-RAJEJt';directory(original);
  const old=JSON.parse(read(original,'summary.json'));
  if(old.plaintextSha256!=='dc8ccf814115b4f4022a8e25c2c9a8683c52b5c6e93ff110eab6cc7f152fd914'||read(original,'artifact-key.bin').length!==32)throw Error('Original accepted source retention refused');
  const result={recordedAt:new Date().toISOString(),project:s.project,status:'COMPLETE_FRESH_PROTECTED_SOURCE_PASS_RESTORE_NOT_RUN',
    backup:{directory:DIR,cutoff:s.cutoff,completedAt:s.recordedAt,plaintextBytes:s.plaintextBytes,encryptedBytes:s.encryptedBytes,
      plaintextSha256:s.plaintextSha256,encryptedSha256:s.encryptedSha256,schemas:s.schemas,dataTables:s.dataTables,
      rows:snapshot.data.reduce((n,t)=>n+t.rows,0),roles:s.roles,memberships:s.memberships,
      catalogCounts:Object.fromEntries(Object.entries(snapshot.catalog).map(([name,rows])=>[name,rows.length])),
      comparisonContext:snapshot.comparisonContext,readOnly:snapshot.readOnly,execution:s.execution,
      authenticatedRoundtripVerified:true,sourceOnlyPreflight:'PASS_ACTUALLY_EXECUTED',directoryMode:'0700',fileMode:'0600',
      custody:'same approved local parent/private task directory; key same directory, not independent/offsite',excluded:s.excluded},
    failedGeneratedCleanup:failed,original7OctoberSourceKept:true,hostFreeKiB:freeKiB(),
    fullVmMountAbsent:!fs.existsSync('/Volumes/g090p3'),newRuntimeRebuilds:0,actualNewRestore:'NOT RUN',
    helperSha256:Object.fromEntries(['spike/090-p3-fresh-source-evidence.mjs','spike/090-p3-consistent-backup.mjs','spike/090-p3-recovery-queries.mjs','spike/090-p3-offline-restore.mjs'].map(f=>[f,hash(fs.readFileSync(f))])),
    limits:'Complete held current snapshot/native logical dump plus authenticated bytes/source guard only. Not actual restore/schema/grant/RLS/publication/full-row equality, managed platform/provider/client/review/release proof. Sequence non-MVCC and original exclusions remain.',
    hostedWrites:0,newJevCalls:0,newInferenceCostUSD:0,ownerManualQA:false};
  fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({output:OUTPUT,status:result.status,cutoff:s.cutoff,dataTables:result.backup.dataTables,rows:result.backup.rows,catalogCounts:result.backup.catalogCounts,failedGeneratedCleanup:failed,hostFreeKiB:result.hostFreeKiB}));
}
try{main();}catch{console.error('Fresh source evidence finalization refused; details private, no source/restore PASS or retry.');process.exitCode=1;}
