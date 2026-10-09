// Exact eleven-delta rehearsal inside the actual fidelity-verified network-none copy.
// Private SQL output/errors/digests remain private. No hosted target or grant fallback.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ATTEMPT,restoreReceiptNames} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
import {dataDigestQuery,canonicalSettings,dataPredicate} from './090-p3-recovery-queries.mjs';
import {buildRealtimeCloneTest,captureBefore046Sql} from './090-realtime-clone-test.mjs';
export const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
export const DB='genova_090_p3_restore',CONTAINER='genova090p3-db',LIMA='/opt/homebrew/bin/limactl';
export const IMAGE='supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00';
const packetPath='docs/reports/090/2026-10-09-p3-compatibility-packet.json';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export const runtimeEnv={...process.env,LIMA_HOME:'/Volumes/g090p3/lima',LIMA_SHELLENV_BLOCK:'*'};
let stage='scope',owner,peak=0;
export const resourcePeakKiB=()=>peak;
export function readPrivate(name){const file=path.join(DIR,name),s=fs.lstatSync(file);
  assert(s.isFile()&&!s.isSymbolicLink()&&(s.mode&511)===384,'Private artifact scope');return fs.readFileSync(file);}
function writePrivate(name,body){fs.writeFileSync(path.join(DIR,name),body,{flag:'wx',mode:0o600});}
export function runtimeGuard(){
  assert.equal(ATTEMPT,'20261009-compatibility');assert.equal(process.cwd(),'/Users/alidiyarduran/Antigravity/genovakorist');
  owner=JSON.parse(readPrivate('runtime-ownership.json'));assert.equal(owner.attempt,ATTEMPT);assert.equal(owner.limaHome,runtimeEnv.LIMA_HOME);
  peak=Math.max(peak,measureRuntime(owner).allocatedKiB);
}
function command(args,input){runtimeGuard();
  const result=spawnSync(LIMA,['shell','g090p3','sudo','docker',...args],{env:runtimeEnv,input,encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024});
  if(result.status!==0){writePrivate('compatibility-'+ATTEMPT+'-'+stage+'-failure.log',(result.stderr||'')+(result.stdout||''));
    throw Error('Actual clone command failed; details private');}
  return result.stdout.trim();
}
export function sql(text,database=DB){assert([DB,'postgres','genova_090_p3_peer'].includes(database),'Fixed database only');
  return command(['exec','-i','-e','PGPASSWORD=090-synthetic-local-only',CONTAINER,'psql','-X','-Atq','-w',
    '-v','ON_ERROR_STOP=1','-U','supabase_admin','-d',database],text);}
export function query(text){return JSON.parse(sql('begin read only;'+canonicalSettings+
  `select coalesce(jsonb_agg(q),'[]'::jsonb) from (${text}) q;rollback;`));}
export function verifyClone(){runtimeGuard();
  const target=JSON.parse(command(['inspect',CONTAINER]))[0];assert.equal(target.Config.Image,IMAGE);
  assert.equal(target.HostConfig.NetworkMode,'none');assert.equal(target.Mounts.length,0);assert.equal(Object.keys(target.HostConfig.PortBindings||{}).length,0);
  const proof=JSON.parse(readPrivate(restoreReceiptNames().summary));
  assert.equal(proof.attempt,ATTEMPT);assert.equal(proof.status,'CURRENT_STATE_SELECTED_FIDELITY_PASS');
  assert.equal(proof.project,'hievmwwctjjlhmssoxsu');assert.equal(proof.database,DB);
  assert.equal(proof.backupSha256,'422ccf87eb8977c4cff1529c57878bee779c955f10a438f3543361b80a7c58d6');
  assert.deepEqual(proof.differences,{});assert.equal(Object.keys(proof.catalogCounts).length,17);
  assert(Object.values(proof.catalogCounts).every(g=>g.source===g.restored));assert.equal(proof.dataTables,101);assert.equal(proof.restoredRows,2880);
  assert(proof.originalBackupUnmodified&&proof.exactComparatorUnchanged);
  return proof;
}
function checkedSource(pin){const bytes=fs.readFileSync(pin.path);assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,'Source drift');return bytes.toString();}
export function refuseFixtureCollisions(source){
  const ids=[...new Set(source.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/giu)||[])];
  if(!ids.length)return;
  const columns=query(`select c.table_schema,c.table_name,c.column_name from information_schema.columns c
    join information_schema.tables t using(table_schema,table_name) where t.table_type='BASE TABLE'
    and (${dataPredicate}) and c.udt_name='uuid' and c.column_name in('id','session_id')`);
  const ident=value=>{assert(/^[a-z_][a-z0-9_]*$/u.test(value));return '"'+value+'"';};
  const checks=columns.map(c=>`exists(select 1 from ${ident(c.table_schema)}.${ident(c.table_name)} where ${ident(c.column_name)}=any(array[${ids.map(id=>"'"+id+"'").join(',')}]::uuid[]))`);
  assert.equal(sql('select '+(checks.join(' or ')||'false')+';'),'f','Synthetic UUID collides with retained rows');
}
function main(){
  assert.equal(process.argv.length,3);const action=process.argv[2];assert(['--apply-eleven-approved','--tests-approved'].includes(action));
  const proof=verifyClone(),packet=JSON.parse(fs.readFileSync(packetPath));assert.equal(packet.steps.length,11);
  const receipt='compatibility-'+ATTEMPT+(action==='--apply-eleven-approved'?'-deltas.json':'-tests.json');
  assert(!fs.existsSync(path.join(DIR,receipt)),'Refuse repeating recorded action');
  const observations=[];
  if(action==='--apply-eleven-approved'){
    for(const step of packet.steps){stage='delta-'+step.ordinal;const source=checkedSource(step.pin);
      if(step.ordinal===2)writePrivate('compatibility-'+ATTEMPT+'-before046.json',JSON.stringify(query(captureBefore046Sql.replace(/;$/u,''))));
      sql("set role postgres;set lock_timeout='2s';set statement_timeout='90s';"+source);
      observations.push({ordinal:step.ordinal,path:step.pin.path,sha256:step.pin.sha256,status:'ACTUALLY_APPLIED_ON_COPY'});
      console.log(JSON.stringify({stage,passed:true,allocatedKiB:measureRuntime(owner).allocatedKiB}));
    }
    writePrivate('compatibility-'+ATTEMPT+'-post-delta-digests.json',JSON.stringify(query(dataDigestQuery)));
  }else{
    const applied=JSON.parse(readPrivate('compatibility-'+ATTEMPT+'-deltas.json'));
    assert.equal(applied.observations.length,11);assert.equal(applied.status,'ACTUAL_ELEVEN_CLONE_DELTAS_PASS');
    const before=JSON.parse(readPrivate('compatibility-'+ATTEMPT+'-post-delta-digests.json'));
    for(const [index,pin] of packet.sqlTests.entries()){
      stage='v2-test-'+index;let source=checkedSource(pin),fixture='';
      if(index===5)fixture=checkedSource(packet.fixtures[0]);
      if(index===6||index===7)fixture=checkedSource(packet.fixtures[1]);
      if(index===7)fixture+='\n'+checkedSource(packet.fixtures[2]);
      refuseFixtureCollisions(fixture+'\n'+source);
      if(index===1)source=buildRealtimeCloneTest(JSON.parse(readPrivate('compatibility-'+ATTEMPT+'-before046.json')),source).sql;
      if(fixture){assert.equal(source.split('begin;').length,2);source=source.replace('begin;','begin;\n'+fixture);}
      const executed="set role postgres;set lock_timeout='2s';set statement_timeout='30s';"+source;
      sql(executed);
      assert.deepEqual(query(dataDigestQuery),before,'Rollback changed retained data');
      observations.push({path:pin.path,originalSha256:pin.sha256,executedSha256:sha(executed),fixtureExecutor:'postgres',fixtureInsideRollback:!!fixture,
        originalDataUnchanged:true,status:'ACTUAL_SQL_PASS_NOT_MANAGED_AUTH'});
      console.log(JSON.stringify({stage,path:pin.path,passed:true,retainedDataUnchanged:true}));
    }
  }
  const result={recordedAt:new Date().toISOString(),attempt:ATTEMPT,baselineRestoreCompletedAt:proof.recordedAt,
    packetSha256:sha(fs.readFileSync(packetPath)),observations,peakAllocatedKiB:peak,
    status:action==='--apply-eleven-approved'?'ACTUAL_ELEVEN_CLONE_DELTAS_PASS':'ACTUAL_TEN_SQL_CONTROLS_PASS_CONCURRENCY_OPEN',
    boundary:'Actual faithful clone and exact SQL/RPC/role/RLS controls only; managed Auth/REST/HTTP/browser/platform/release NOT RUN. No hosted writes, broad grants or source mutation.'};
  writePrivate(receipt,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,observations:observations.length,peakAllocatedKiB:peak}));
}
if(process.argv[1]===fileURLToPath(import.meta.url))try{main();}catch{console.error('Compatibility rehearsal failed at '+stage+'; details private, no automatic retry or acceptance.');process.exitCode=1;}
