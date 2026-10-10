// Exact old/current sources in one counted subtree; no real env/dependency install.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync,spawn} from 'node:child_process';
import {DIR,readPrivate} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
const ROOT='/Users/alidiyarduran/Antigravity/genovakorist',RUN=ROOT+'/spike/090-runtime/managed-web';
const BASE='a13f696da8c731e9af2a2bce473d4f4ae4a81587',CURRENT='bbc301c62ffb58a533b19d7cf904518be274aae7';
const hash=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,maxBuffer:32*1024*1024});
const require=createRequire(import.meta.url),yaml=require(ROOT+'/node_modules/.pnpm/js-yaml@4.1.1/node_modules/js-yaml');
assert.equal(process.cwd(),ROOT);assert(['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT));assert.equal(process.argv.length,3);
const action=process.argv[2];assert(['--materialize-approved','--build-current','--build-old'].includes(action));
const owner=JSON.parse(readPrivate('runtime-ownership.json'));
assert.deepEqual(owner.webPaths,[RUN]);let peak=measureRuntime(owner).allocatedKiB;
const manifest=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-09-p3-server-convergence-source.json'));
assert.equal(manifest.source,CURRENT);assert.equal(manifest.pins.length,614);
for(const pin of manifest.pins){assert.equal(hash(fs.readFileSync(pin.path)),pin.sha256,'Working source pin mismatch');assert.equal(hash(git('show',CURRENT+':'+pin.path)),pin.sha256,'Committed source pin mismatch');}
const oldLock=yaml.load(git('show',BASE+':pnpm-lock.yaml').toString()),installed=yaml.load(fs.readFileSync('node_modules/.pnpm/lock.yaml','utf8'));
const currentLock=yaml.load(git('show',CURRENT+':pnpm-lock.yaml').toString());
for(const kind of ['dependencies','devDependencies'])for(const [name,value]of Object.entries(oldLock.importers['.'][kind])){
  assert.deepEqual(installed.importers['.'][kind][name],value,'Old declared dependency not installed');
  assert.deepEqual(currentLock.importers['.'][kind][name],value,'Old/current dependency declaration drift');}
for(const kind of ['packages','snapshots'])for(const [name,value]of Object.entries(oldLock[kind]))assert.deepEqual(installed[kind][name],value,'Old transitive dependency closure mismatch');
const privateWrite=(name,value)=>fs.writeFileSync(path.join(DIR,`managed-${ATTEMPT}-${name}.json`),JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});
if(action==='--materialize-approved'){
  assert(!fs.existsSync(RUN),'Do not overwrite runtime sources');fs.mkdirSync(RUN,{recursive:true,mode:0o700});
  const skip=file=>file.endsWith('AGENTS.md')||/(^|\/)\.env(?:\.|$)/u.test(file)||/^(docs|memory-bank|spike|apps)\//u.test(file)||['KARARLAR.md','MIGRATION.md'].includes(file);
  const lists={old:git('ls-tree','-r','--name-only',BASE).toString().trim().split('\n').filter(f=>!skip(f)),current:manifest.pins.map(p=>p.path).filter(f=>!skip(f))};
  const observations={};
  for(const [name,files]of Object.entries(lists)){
    const dir=RUN+'/'+name;fs.mkdirSync(dir,{mode:0o700});const pins=[];
    for(const file of files){assert(!file.startsWith('/')&&!file.split('/').includes('..'));const bytes=git('show',(name==='old'?BASE:CURRENT)+':'+file),destination=dir+'/'+file;
      fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes,{flag:'wx'});pins.push({path:file,bytes:bytes.length,sha256:hash(bytes)});}
    fs.symlinkSync(ROOT+'/node_modules',dir+'/node_modules','dir');observations[name]={source:name==='old'?BASE:CURRENT,pins};
  }
  privateWrite('sources',{recordedAt:new Date().toISOString(),attempt:ATTEMPT,observations,oldLockSha256:hash(git('show',BASE+':pnpm-lock.yaml')),
    installedLockSha256:hash(fs.readFileSync('node_modules/.pnpm/lock.yaml')),oldTransitivePackages:Object.keys(oldLock.packages).length,
    oldTransitiveSnapshots:Object.keys(oldLock.snapshots).length,allOldDependencyPinsInstalled:true,sourceEnvCopied:false,peakAllocatedKiB:measureRuntime(owner).allocatedKiB});
  console.log(JSON.stringify({status:'EXACT_SOURCE_AND_INSTALLED_OLD_DEPENDENCY_CLOSURE_PASS',old:lists.old.length,current:lists.current.length,packages:Object.keys(oldLock.packages).length}));
}else{
  const name=action.endsWith('current')?'current':'old',receipt=JSON.parse(readPrivate(`managed-${ATTEMPT}-sources.json`));
  const dir=RUN+'/'+name;assert(!fs.lstatSync(dir).isSymbolicLink());
  for(const pin of receipt.observations[name].pins)assert.equal(hash(fs.readFileSync(dir+'/'+pin.path)),pin.sha256,'Runtime source mutation');
  const config=JSON.parse(readPrivate(`managed-${ATTEMPT}-config.json`));
  const cert=path.join(DIR,`managed-${ATTEMPT}-tls${ATTEMPT==='20261010-managed-final'?'-ca':''}.crt`);assert(fs.existsSync(cert),'TLS trust not prepared');
  const env={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:process.env.TMPDIR,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
    NEXT_PUBLIC_SUPABASE_URL:config.api,NEXT_PUBLIC_SUPABASE_ANON_KEY:config.anon,SUPABASE_SERVICE_ROLE_KEY:config.service,
    NODE_EXTRA_CA_CERTS:cert,NODE_OPTIONS:'--max-old-space-size=1536'};
  const fd=fs.openSync(path.join(DIR,`managed-${ATTEMPT}-build-${name}.log`),'wx',0o600);
  const child=spawn(process.execPath,[ROOT+'/node_modules/next/dist/bin/next','build'],{cwd:dir,env,stdio:['ignore',fd,fd]});let stopped=false;
  const stop=()=>{stopped=true;child.kill('SIGTERM');};
  const monitor=setInterval(()=>{try{peak=Math.max(peak,measureRuntime(owner).allocatedKiB);}catch{stop();}},2000),deadline=setTimeout(stop,300000);
  child.on('error',stop);child.on('exit',code=>{clearInterval(monitor);clearTimeout(deadline);fs.closeSync(fd);
    privateWrite('build-'+name,{recordedAt:new Date().toISOString(),attempt:ATTEMPT,source:receipt.observations[name].source,exitCode:code,resourceStop:stopped,peakAllocatedKiB:peak,
      actualProductionBuild:true,realLocalApi:config.api,serverRuntimeNotYetAccepted:true});console.log(JSON.stringify({name,exitCode:code,resourceStop:stopped,peakAllocatedKiB:peak}));process.exitCode=code===0&&!stopped?0:1;});
}
