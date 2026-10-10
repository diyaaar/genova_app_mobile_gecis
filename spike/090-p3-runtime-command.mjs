// Scoped runtime operations only, guarded by the owned volume and live host floor.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { freeKiB } from './090-p3-consistent-backup.mjs';
import { ATTEMPT, LIVE_STOP_KIB } from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const VM='g090p3',LIMA='/opt/homebrew/bin/limactl';
const IMAGE='supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00';
const action=process.argv[2];
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||!['start','start-classic','provision-repair','provision-resume','provision-clean','pull','pull-classic','create-container'].includes(action))throw Error('Bounded runtime action refused');
const owner=JSON.parse(fs.readFileSync(path.join(DIR,'runtime-ownership.json')));
if(owner.attempt!==ATTEMPT||owner.mount!=='/Volumes/g090p3'||owner.limaHome!=='/Volumes/g090p3/lima'||owner.owner!=='090-P3-only'||!fs.existsSync(owner.limaHome))throw Error('Runtime ownership refused');
const env={...process.env,LIMA_HOME:owner.limaHome,LIMA_SHELLENV_BLOCK:'*'};
const vmConfig=['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT)?'spike/090-p3-managed-web-lima.yaml':'spike/090-p3-offline-lima.yaml';
const commands={start:['--tty=false','start','--name='+VM,vmConfig,'--timeout=4m'],
  'start-classic':['--tty=false','start','--name='+VM,vmConfig,'--timeout=4m'],
  'provision-repair':['shell',VM,'sudo','sh','-s'],
  'provision-resume':['shell',VM,'sudo','sh','-s'],
  'provision-clean':['shell',VM,'sudo','sh','-s'],
  pull:['shell',VM,'sudo','docker','pull',IMAGE],
  'pull-classic':['shell',VM,'sudo','docker','pull',IMAGE],
  'create-container':['shell',VM,'sudo','docker','run','-d','--name','genova090p3-db','--network=none','--memory=384m','--memory-swap=384m',
    '--pids-limit=128','--shm-size=64m','-e','POSTGRES_USER=supabase_admin','-e','POSTGRES_PASSWORD=090-synthetic-local-only',IMAGE]};
if(freeKiB()<LIVE_STOP_KIB)throw Error('Runtime live floor refused');
let peak=measureRuntime(owner).allocatedKiB;
const logPath=path.join(DIR,'runtime-'+ATTEMPT+'-'+action+'.log');
const log=fs.openSync(logPath,'wx',0o600);
if(action==='provision-clean')execFileSync(LIMA,['copy','spike/090-p3-docker-classic.json',VM+':/tmp/090-p3-docker-classic.json'],{env,stdio:'pipe',timeout:10000});
const provisioning=action.startsWith('provision-');
const child=spawn(LIMA,commands[action],{env,stdio:[provisioning?'pipe':'ignore',log,log]});
if(provisioning)child.stdin.end(fs.readFileSync('spike/090-p3-guest-provision.sh'));
let stopped=false;
function stop(){if(stopped)return;stopped=true;child.kill('SIGTERM');spawn(LIMA,['stop','--force',VM],{env,stdio:'ignore'});}
const interval=setInterval(()=>{try{peak=Math.max(peak,measureRuntime(owner).allocatedKiB);}catch{stop();}},2000);
const timer=setTimeout(stop,action==='create-container'?60000:300000);
child.on('error',()=>{stop();});
child.on('exit',async code=>{
  clearInterval(interval);clearTimeout(timer);fs.closeSync(log);
  if(action==='create-container'&&code===0&&!stopped){
    let ready=false;
    for(let i=0;i<60&&!ready;i++){
      try{peak=Math.max(peak,measureRuntime(owner).allocatedKiB);
        // Image bootstrap briefly runs a socket-only temporary server. pg_isready
        // alone can succeed just before that server is shut down. Require the
        // final listener configuration through a real SQL connection instead.
        const finalServer=execFileSync(LIMA,['shell',VM,'sudo','docker','exec','-e','PGPASSWORD=090-synthetic-local-only','genova090p3-db',
          'psql','-X','-Atq','-w','-U','supabase_admin','-d','postgres','-c',"select current_setting('listen_addresses') <> '';"],{env,encoding:'utf8',stdio:'pipe',timeout:3000});
        ready=finalServer.trim()==='t';
      }catch{await new Promise(resolve=>setTimeout(resolve,500));}
    }
    if(!ready)stopped=true;
  }
  const result={recordedAt:new Date().toISOString(),attempt:ATTEMPT,action,exitCode:code,resourceStop:stopped,
    freeKiB:freeKiB(),peakAllocatedKiB:peak,privateLog:logPath,noBackupBodyInOutput:true};
  fs.writeFileSync(path.join(DIR,'runtime-'+ATTEMPT+'-'+action+'-result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  console.log(JSON.stringify(result));process.exitCode=code===0&&!stopped?0:1;
});
