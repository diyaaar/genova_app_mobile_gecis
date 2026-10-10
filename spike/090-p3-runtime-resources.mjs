// Measure only this owned image/new ISO/attempt receipts. Never purge host caches.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ATTEMPT,checkLiveBudget} from './090-p3-resource-policy.mjs';
import {freeKiB} from './090-p3-consistent-backup.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const iso='/Users/alidiyarduran/Library/Caches/lima/download/by-url-sha256/f42a4799d05c13f53c6ebd553f481a03242764b7450c141dfad516e6c5298335';
function allocated(file){return Number(execFileSync('/usr/bin/du',['-sk',file],{encoding:'utf8',timeout:10000}).split(/\s/u)[0]);}
export function measureRuntime(owner){
  if(owner.attempt!==ATTEMPT||owner.image!==path.join(DIR,'runtime-'+ATTEMPT+'.sparsebundle')||owner.owner!=='090-P3-only'||fs.lstatSync(owner.image).isSymbolicLink())throw Error('Resource ownership refused');
  let used=allocated(owner.image);
  for(const file of owner.webPaths||[]){
    if(!['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT)||file!=='/Users/alidiyarduran/Antigravity/genovakorist/spike/090-runtime/managed-web')throw Error('Web resource ownership refused');
    if(fs.existsSync(file)){if(fs.lstatSync(file).isSymbolicLink())throw Error('Web resource symlink refused');used+=allocated(file);}
  }
  if(owner.isoCacheWasAbsent&&fs.existsSync(iso))used+=allocated(iso);
  for(const name of fs.readdirSync(DIR))if(name.includes(ATTEMPT)&&!name.endsWith('.sparsebundle')){
    const stat=fs.lstatSync(path.join(DIR,name));if(!stat.isFile()||stat.isSymbolicLink())throw Error('Attempt resource shape refused');
    used+=Math.ceil(stat.blocks/2);
  }
  const free=freeKiB();checkLiveBudget(free,used);return {allocatedKiB:used,freeKiB:free};
}
