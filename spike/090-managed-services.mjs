// Owner-approved local managed API preparation; no hosted target or raw output.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
import {DIR,LIMA,runtimeEnv,verifyClone} from './090-compatibility-sql-rehearsal.mjs';
export const AUTH='supabase/gotrue@sha256:93bfec0a41cfe3ed81d03c9c1c8807fd230b8ecea260cf999b8a7204ccc7d5cf';
export const REST='postgrest/postgrest@sha256:77c56c839e49d5a037e93fd49de7822a65bcdeafc4b9e37338ead504e36ba307';
assert(['20261010-managed-web','20261010-managed-final','20261010-managed-families','20261013-managed-families','20261014-fresh-recovery'].includes(ATTEMPT));
assert.equal(process.cwd(),'/Users/alidiyarduran/Antigravity/genovakorist');
assert.equal(process.argv.length,3);
const action=process.argv[2];
assert(['pull-auth','pull-rest','inspect-auth-migrations'].includes(action));
verifyClone();
const applied=JSON.parse(fs.readFileSync(path.join(DIR,`compatibility-${ATTEMPT}-deltas.json`)));
assert.equal(applied.status,'ACTUAL_ELEVEN_CLONE_DELTAS_PASS');assert.equal(applied.observations.length,11);
const owner=JSON.parse(fs.readFileSync(path.join(DIR,'runtime-ownership.json')));
let peak=measureRuntime(owner).allocatedKiB;
const output=path.join(DIR,`managed-${ATTEMPT}-${action}`);
const fd=fs.openSync(output+'.log','wx',0o600);
const args=action==='inspect-auth-migrations'
  ? ['run','--rm','--network=none','--memory=64m','--pids-limit=32','--entrypoint=/bin/sh',AUTH,'-c','find /usr/local/etc /usr/local/bin /home -type f -name "*.sql" 2>/dev/null; true']
  : ['pull',action==='pull-auth'?AUTH:REST];
const child=spawn(LIMA,['shell','g090p3','sudo','docker',...args],{env:runtimeEnv,stdio:['ignore',fd,fd]});
let stopped=false;
const stop=()=>{stopped=true;child.kill('SIGTERM');};
const monitor=setInterval(()=>{try{peak=Math.max(peak,measureRuntime(owner).allocatedKiB);}catch{stop();}},2000);
const deadline=setTimeout(stop,300000);
child.on('error',stop);
child.on('exit',code=>{clearInterval(monitor);clearTimeout(deadline);fs.closeSync(fd);
  const result={recordedAt:new Date().toISOString(),attempt:ATTEMPT,action,exitCode:code,resourceStop:stopped,peakAllocatedKiB:peak,
    image:action==='pull-rest'?REST:AUTH,privateOutput:true};
  fs.writeFileSync(output+'.json',JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify(result));process.exitCode=code===0&&!stopped?0:1;
});
