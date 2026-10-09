// Public redacted receipt of actual clone gates, never private SQL/rows/key output.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readPrivate,query,verifyClone,DIR} from './090-compatibility-sql-rehearsal.mjs';
import {dataDigestQuery} from './090-p3-recovery-queries.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
const tag='20261009-compatibility',output='docs/reports/090/2026-10-10-p3-recovered-sql-compatibility.json';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=name=>JSON.parse(readPrivate(name));
const pin=file=>({path:file,sha256:sha(fs.readFileSync(file)),bytes:fs.statSync(file).size});
const helpers=['spike/090-p3-resource-policy.mjs','spike/090-p3-resource-policy.test.mjs',
  'spike/090-p3-runtime-resources.mjs','spike/090-p3-runtime-volume.mjs','spike/090-p3-runtime-command.mjs',
  'spike/090-p3-runtime-cleanup.mjs','spike/090-p3-offline-restore.mjs',
  'spike/090-compatibility-retry-startup.mjs','spike/090-compatibility-sql-rehearsal.mjs',
  'spike/090-compatibility-peer-rehearsal.mjs','spike/090-compatibility-peer-rehearsal.test.mjs',
  'spike/090-realtime-clone-test.mjs','spike/090-realtime-clone-test.test.mjs','spike/090-compatibility-evidence.mjs'];
function main(){
  assert.equal(process.argv.length,3);
  if(process.argv[2]==='--capture-before-cleanup'){
    const restore=verifyClone(),deltas=read('compatibility-'+tag+'-deltas.json'),tests=read('compatibility-'+tag+'-tests.json'),peer=read('compatibility-'+tag+'-peer.json');
    assert.equal(deltas.status,'ACTUAL_ELEVEN_CLONE_DELTAS_PASS');assert.equal(deltas.observations.length,11);
    assert.equal(tests.observations.length,10);assert(tests.observations.every(o=>o.originalDataUnchanged));
    assert.equal(peer.status,'ACTUAL_RECOVERED_COPY_PEER_SQL_PASS_NOT_RELEASE');assert(peer.mainDataUnchanged&&peer.ownedPeerDatabaseRemoved);
    assert.deepEqual(query(dataDigestQuery),read('compatibility-'+tag+'-post-delta-digests.json'));
    const packetPath='docs/reports/090/2026-10-09-p3-compatibility-packet.json',packet=JSON.parse(fs.readFileSync(packetPath));
    assert.equal(deltas.packetSha256,sha(fs.readFileSync(packetPath)));
    deltas.observations.forEach((step,i)=>{assert.equal(step.path,packet.steps[i].pin.path);assert.equal(step.sha256,packet.steps[i].pin.sha256);assert.equal(sha(fs.readFileSync(step.path)),step.sha256);});
    const summary=read('summary.json');assert.equal(sha(fs.readFileSync(DIR+'/database.sql.gcm')),summary.encryptedSha256);
    const meter=measureRuntime(read('runtime-ownership.json'));
    const record={recordedAt:new Date().toISOString(),clientDate:'2026-10-10',attempt:tag,
      status:'ACTUAL_RECOVERED_STATE_SQL_PASS_CLEANUP_NOT_YET_VERIFIED',source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
      helperPins:helpers.map(pin),packet:pin(packetPath),
      sourceSnapshot:{cutoff:summary.cutoff,plaintextSha256:summary.plaintextSha256,encryptedSha256:summary.encryptedSha256,originalEncryptedBytesUnchanged:true},
      actualRestore:{recordedAt:restore.recordedAt,catalogGroups:17,catalogCounts:restore.catalogCounts,tables:101,rows:2880,
        allCapturedMetadataAndFullRowFingerprintsEqual:true,network:'none',mounts:0,ports:0,image:'supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00'},
      deltas:deltas.observations,sqlTests:tests.observations,peer,
      retainedPostDeltaDataUnchangedAfterAllTests:true,
      resources:{capKiB:6656*1024,observedAllocatedKiB:Math.max(meter.allocatedKiB,deltas.peakAllocatedKiB,tests.peakAllocatedKiB),
        freeKiBBeforeCleanup:meter.freeKiB,stopFreeKiB:640*1024,measurement:'Maximum observed sampled allocation, not an OS-enforced total host quota'},
      actualFailuresRetained:['PG first socket not ready; archived after readiness0 and DBabsence proof, no reset',
        'First legacy fixture alias UPDATE refused by retained059guard under supabase_admin; corrected harness to postgres fixture executor, real service/anon/auth callers unchanged; all ten re-run'],
      fullP3Status:'OPEN_NO_GO',laterNotRun:['Managed Auth/REST/HTTP/current-old browser full build/cache/mixedclient',
        'Current-source Android+iOS reacceptance','Independent release review','Hosted rollout/provider activation/beta/store'],
      boundary:'Actual complete selected fidelity and exact eleven clone SQL/role/RLS/fivefamily/legacy controls. Peer concurrency and long-transaction expiry are repertoire-file only, not all-five. Not fullP3/release.',
      newJevCalls:0,newInferenceCostUSD:0,hostedWrites:0,ownerManualQA:false};
    fs.writeFileSync(DIR+'/compatibility-'+tag+'-public-pending.json',JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});
    console.log(JSON.stringify({captured:true,deltas:11,sqlTests:10,catalogGroups:17,tables:101,rows:2880,observedAllocatedKiB:record.resources.observedAllocatedKiB,cleanup:'NOT YET VERIFIED'}));
  }else{
    assert.equal(process.argv[2],'--record-after-cleanup');assert(!fs.existsSync(output));
    const record=read('compatibility-'+tag+'-public-pending.json'),cleanup=read('runtime-cleanup-'+tag+'.json');
    assert.equal(cleanup.status,'OWNED_FINAL_RUNTIME_REMOVED');
    assert(!fs.existsSync('/Volumes/g090p3')&&!fs.existsSync(DIR+'/runtime-'+tag+'.sparsebundle')&&!fs.existsSync(DIR+'/runtime-ownership.json'));
    const vms=execFileSync('/opt/homebrew/bin/limactl',['list','--json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();assert.equal(vms,'');
    record.helperPins.forEach(p=>assert.equal(sha(fs.readFileSync(p.path)),p.sha256,'Evidence helper drift'));
    const info=execFileSync('/bin/df',['-k','.'],{encoding:'utf8'}).trim().split('\n').at(-1).split(/\s+/u);
    record.resources.freeKiBAfterCleanup=Number(info[3]);record.cleanup={recordedAt:cleanup.recordedAt,ownedVmImageAndNewIsoRemoved:true,privateBackupAndSmallReceiptsRetained:true};
    record.status='ACTUAL_SELECTED_FIDELITY_ELEVEN_SQL_TEN_CONTROLS_PEER_AND_CLEANUP_PASS_NOT_RELEASE';
    const serialized=JSON.stringify(record,null,2)+'\n';assert(Buffer.byteLength(serialized)<64*1024);assert(!/apikey_|eyJ[A-Za-z0-9_-]+\./u.test(serialized));
    fs.writeFileSync(output,serialized,{flag:'wx'});console.log(JSON.stringify({output,status:record.status,freeKiBAfterCleanup:record.resources.freeKiBAfterCleanup}));
  }
}
try{main();}catch{console.error('Recovered-state SQL evidence refused; no automatic acceptance/private output.');process.exitCode=1;}
