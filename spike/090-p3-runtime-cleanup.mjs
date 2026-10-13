// Only the exact newly owned capped recovery runtime; encrypted backup retained.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ATTEMPT } from './090-p3-resource-policy.mjs';
import {requireManagedCleanupOrder} from './090-managed-cleanup-order.mjs';
import {requireFamilyCleanupOrder, requireFailedFamilyCleanup} from './090-five-family-contract.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const owner=JSON.parse(fs.readFileSync(path.join(DIR,'runtime-ownership.json')));
const final=process.argv[2]==='--cleanup-approved-current';
const failed=process.argv[2]==='--cleanup-failed-before-restore';
const phase=ATTEMPT;
const archive=path.join(DIR,`runtime-ownership-${phase}.json`);
const isoCache='/Users/alidiyarduran/Library/Caches/lima/download/by-url-sha256/f42a4799d05c13f53c6ebd553f481a03242764b7450c141dfad516e6c5298335';
const isoUrl='https://github.com/lima-vm/alpine-lima/releases/download/v0.2.49/alpine-lima-std-3.23.0-aarch64.iso';
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||(!final&&!failed)||owner.attempt!==ATTEMPT||
  owner.owner!=='090-P3-only'||owner.mount!=='/Volumes/g090p3'||owner.image!==path.join(DIR,'runtime-'+ATTEMPT+'.sparsebundle')||
  owner.limaHome!=='/Volumes/g090p3/lima'||fs.lstatSync(owner.image).isSymbolicLink()||fs.existsSync(archive))throw Error('Exact cleanup ownership refused');
if(owner.isoCacheWasAbsent&&fs.existsSync(isoCache)&&(fs.lstatSync(isoCache).isSymbolicLink()||fs.readFileSync(path.join(isoCache,'url'),'utf8').trim()!==isoUrl))throw Error('Exact newly created ISO cache refused');
const env={...process.env,LIMA_HOME:owner.limaHome,LIMA_SHELLENV_BLOCK:'*'};
if(failed){
  const file=path.join(DIR,`runtime-${ATTEMPT}-pull-classic-result.json`),stat=fs.lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&511)!==384)throw Error('Private failed-attempt receipt refused');
  const names=fs.readdirSync(DIR).filter(name=>name.includes(ATTEMPT));
  const vms=execFileSync('/opt/homebrew/bin/limactl',['list','--json'],{env,encoding:'utf8',stdio:'pipe',timeout:10000}).trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
  requireFailedFamilyCleanup({attempt:ATTEMPT,pull:JSON.parse(fs.readFileSync(file)),names,vmStatus:vms.find(vm=>vm.name==='g090p3')?.status});
}
if(final&&['20261010-managed-families','20261013-managed-families'].includes(ATTEMPT)){
  const artifact=name=>{const file=path.join(DIR,`managed-${ATTEMPT}-${name}.json`),stat=fs.lstatSync(file);
    if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&511)!==384)throw Error('Private family cleanup prerequisite refused');
    return {body:JSON.parse(fs.readFileSync(file)),mtime:stat.mtimeMs};};
  const matrix=artifact('matrix-v1'),invariants=artifact('final-invariants-v2'),transport=artifact('transport-result-matrix');
  requireFamilyCleanupOrder({matrix:matrix.body,invariants:invariants.body,matrixMtime:matrix.mtime,transport:transport.body});
}
if(['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT)){
  const artifact=name=>{const file=path.join(DIR,'managed-'+ATTEMPT+'-'+name+'.json'),s=fs.lstatSync(file);
    if(!s.isFile()||s.isSymbolicLink()||(s.mode&511)!==384)throw Error('Private cleanup prerequisite refused');return {body:JSON.parse(fs.readFileSync(file)),mtime:s.mtimeMs};};
  const current=artifact('browser-v9'),invariants=artifact('final-invariants-v2');
  let legacy;
  if(ATTEMPT==='20261010-managed-final'){
    const file=path.join(DIR,'managed-20261010-managed-web-browser-v8.json'),s=fs.lstatSync(file);
    if(!s.isFile()||s.isSymbolicLink()||(s.mode&511)!==384)throw Error('Historical legacy proof custody refused');legacy={body:JSON.parse(fs.readFileSync(file)),mtime:s.mtimeMs};
  }else legacy=artifact('browser-v8');
  requireManagedCleanupOrder({current:current.body,legacy:legacy.body,invariants:invariants.body,currentMtime:current.mtime,legacyMtime:legacy.mtime});
}
execFileSync('/opt/homebrew/bin/limactl',['stop','--force','g090p3'],{env,stdio:'pipe',timeout:30000});
execFileSync('/opt/homebrew/bin/limactl',['delete','--force','g090p3'],{env,stdio:'pipe',timeout:30000});
execFileSync('/usr/bin/hdiutil',['detach',owner.mount],{stdio:'pipe',timeout:30000});
if(fs.existsSync(owner.mount)){
  if(fs.readdirSync(owner.mount).length)throw Error('Nonempty detached mount refused');
  fs.rmdirSync(owner.mount);
}
fs.rmSync(owner.image,{recursive:true});
fs.renameSync(path.join(DIR,'runtime-ownership.json'),archive);
if(owner.isoCacheWasAbsent&&fs.existsSync(isoCache))fs.rmSync(isoCache,{recursive:true});
const result={recordedAt:new Date().toISOString(),attempt:ATTEMPT,status:failed?'OWNED_FAILED_PRE_RESTORE_RUNTIME_REMOVED':'OWNED_FINAL_RUNTIME_REMOVED',encryptedBackupRetained:true,
  sourceLogsRetained:true,newTaskIsoCacheRetained:false,cleanupKind:failed?'failed-before-restore':'final-after-required-audit',
  removed:owner.image,noHostUserDataDeleted:true};
fs.writeFileSync(path.join(DIR,`runtime-cleanup-${phase}.json`),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(result));
