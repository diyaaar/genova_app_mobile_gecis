// Current pinned production web against the owned fresh local service only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {DIR,readPrivate,runtimeGuard} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
assert.equal(ATTEMPT,'20261014-fresh-recovery');assert.equal(process.argv.length,3);
const ROOT=process.cwd(),RUN=ROOT+'/spike/090-runtime/20261014-web',prefix=`managed-${ATTEMPT}`;
runtimeGuard();
const owner=JSON.parse(readPrivate('runtime-ownership.json'));
const manifest=JSON.parse(fs.readFileSync('docs/reports/production-2026-10-13/release-candidate.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const write=(name,value)=>fs.writeFileSync(path.join(DIR,prefix+'-'+name+'.json'),JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
if(process.argv[2]==='--materialize'){
  assert(!fs.existsSync(RUN));fs.mkdirSync(RUN,{mode:0o700});
  const pins=manifest.pins.filter(p=>!p.path.startsWith('apps/'));
  for(const p of pins){
    const bytes=execFileSync('git',['show',manifest.productCommit+':'+p.path]);
    assert.equal(hash(bytes),p.sha256);assert.equal(hash(fs.readFileSync(p.path)),p.sha256);
    const dest=path.join(RUN,p.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes,{flag:'wx'});
  }
  fs.symlinkSync(ROOT+'/node_modules',RUN+'/node_modules');
  write('current-web-source',{attempt:ATTEMPT,productCommit:manifest.productCommit,pins,sourceEnvCopied:false,ownedWebPath:RUN});
  console.log(JSON.stringify({status:'CURRENT_WEB_SOURCE_PINNED',files:pins.length,productCommit:manifest.productCommit}));
}else{
  assert(['--build','--build-complete-source'].includes(process.argv[2]));
  const suffix=process.argv[2]==='--build-complete-source'?'-v2':'';
  const source=JSON.parse(readPrivate(prefix+'-current-web-source'+suffix+'.json'));
  for(const p of source.pins)assert.equal(hash(fs.readFileSync(path.join(RUN,p.path))),p.sha256);
  const config=JSON.parse(readPrivate(prefix+'-config.json')),cert=path.join(DIR,prefix+'-tls-ca.crt');
  assert(fs.existsSync(cert));
  const env={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:process.env.TMPDIR,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
    NEXT_PUBLIC_SUPABASE_URL:config.api,NEXT_PUBLIC_SUPABASE_ANON_KEY:config.anon,SUPABASE_SERVICE_ROLE_KEY:config.service,NODE_EXTRA_CA_CERTS:cert,
    NODE_OPTIONS:'--max-old-space-size=1536'};
  const fd=fs.openSync(path.join(DIR,prefix+'-current-web-build'+suffix+'.log'),'wx',0o600);
  const child=spawn(process.execPath,[ROOT+'/node_modules/next/dist/bin/next','build'],{cwd:RUN,env,stdio:['ignore',fd,fd]});
  let stopped=false,peak=0;const stop=()=>{stopped=true;child.kill('SIGTERM');};
  const monitor=setInterval(()=>{try{peak=Math.max(peak,measureRuntime(owner).allocatedKiB);}catch{stop();}},2000),deadline=setTimeout(stop,300000);
  child.on('error',stop);child.on('exit',code=>{clearInterval(monitor);clearTimeout(deadline);fs.closeSync(fd);
    write('current-web-build'+suffix,{attempt:ATTEMPT,productCommit:source.productCommit,recordedAt:new Date().toISOString(),exitCode:code,resourceStop:stopped,peakAllocatedKiB:peak});
    console.log(JSON.stringify({stage:'current-production-web-build',exitCode:code,resourceStop:stopped,peakAllocatedKiB:peak}));process.exitCode=code===0&&!stopped?0:1;
  });
}
