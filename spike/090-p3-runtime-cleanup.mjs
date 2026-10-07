// Only the exact newly owned capped recovery runtime; encrypted backup retained.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
const owner=JSON.parse(fs.readFileSync(path.join(DIR,'runtime-ownership.json')));
const final=process.argv[2]==='--cleanup-final-owned';
const phase=final?'final':'initial';
const archive=path.join(DIR,`runtime-ownership-${phase}.json`);
const isoCache='/Users/alidiyarduran/Library/Caches/lima/download/by-url-sha256/f42a4799d05c13f53c6ebd553f481a03242764b7450c141dfad516e6c5298335';
const isoUrl='https://github.com/lima-vm/alpine-lima/releases/download/v0.2.49/alpine-lima-std-3.23.0-aarch64.iso';
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||!['--cleanup-owned','--cleanup-final-owned'].includes(process.argv[2])||
  owner.owner!=='090-P3-only'||owner.mount!=='/Volumes/g090p3'||owner.image!==path.join(DIR,'runtime.sparsebundle')||
  owner.limaHome!=='/Volumes/g090p3/lima'||fs.lstatSync(owner.image).isSymbolicLink()||fs.existsSync(archive))throw Error('Exact cleanup ownership refused');
if(final&&(fs.lstatSync(isoCache).isSymbolicLink()||fs.readFileSync(path.join(isoCache,'url'),'utf8').trim()!==isoUrl))throw Error('Exact newly created ISO cache refused');
const env={...process.env,LIMA_HOME:owner.limaHome,LIMA_SHELLENV_BLOCK:'*'};
execFileSync('/opt/homebrew/bin/limactl',['stop','--force','g090p3'],{env,stdio:'pipe',timeout:30000});
execFileSync('/opt/homebrew/bin/limactl',['delete','--force','g090p3'],{env,stdio:'pipe',timeout:30000});
execFileSync('/usr/bin/hdiutil',['detach',owner.mount],{stdio:'pipe',timeout:30000});
if(fs.existsSync(owner.mount)){
  if(fs.readdirSync(owner.mount).length)throw Error('Nonempty detached mount refused');
  fs.rmdirSync(owner.mount);
}
fs.rmSync(owner.image,{recursive:true});
fs.renameSync(path.join(DIR,'runtime-ownership.json'),archive);
if(final)fs.rmSync(isoCache,{recursive:true});
const result={recordedAt:new Date().toISOString(),status:final?'OWNED_FINAL_RUNTIME_REMOVED':'OWNED_INITIAL_RUNTIME_REMOVED',encryptedBackupRetained:true,
  sourceLogsRetained:true,newTaskIsoCacheRetained:!final,
  removed:owner.image,noHostUserDataDeleted:true};
fs.writeFileSync(path.join(DIR,`runtime-cleanup-${phase}.json`),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(result));
