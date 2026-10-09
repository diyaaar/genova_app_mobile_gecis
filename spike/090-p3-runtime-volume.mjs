// Bounded owned virtual volume, not a format/cleanup tool for host disks.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync,spawnSync } from 'node:child_process';
import { freeKiB } from './090-p3-consistent-backup.mjs';
import { ATTEMPT, CAPACITY_MIB, MIN_FREE_KIB, RESERVE_KIB, checkAllocation } from './090-p3-resource-policy.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-5OnU1m';
const IMAGE=path.join(DIR,'runtime-'+ATTEMPT+'.sparsebundle');
const MOUNT='/Volumes/g090p3';
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--create-approved-below-10g')throw Error('Explicit root/action refused');
if(fs.existsSync(IMAGE)||fs.existsSync(MOUNT)||fs.existsSync(path.join(DIR,'runtime-ownership.json'))||fs.lstatSync(DIR).isSymbolicLink()||(fs.statSync(DIR).mode&511)!==448)throw Error('Existing/symlink/private target refused');
if(JSON.parse(fs.readFileSync(path.join(DIR,'summary.json'))).project!=='hievmwwctjjlhmssoxsu')throw Error('Backup identity refused');
const preflight=spawnSync(process.execPath,['spike/090-p3-offline-restore.mjs','--verify-source-only'],{env:{...process.env,GENOVA_RECOVERY_BACKUP_DIR:DIR},encoding:'utf8',timeout:20000,maxBuffer:4096});
if(preflight.status!==0||JSON.parse(preflight.stdout).status!=='SOURCE_METADATA_COMPLETE_ONLY_RUNTIME_NOT_RUN')throw Error('Complete supported-source preflight refused before allocation');
const free=freeKiB();const projected=checkAllocation(free);
const isoCacheWasAbsent=!fs.existsSync('/Users/alidiyarduran/Library/Caches/lima/download/by-url-sha256/f42a4799d05c13f53c6ebd553f481a03242764b7450c141dfad516e6c5298335');
execFileSync('/usr/bin/hdiutil',['create','-size',CAPACITY_MIB+'m','-type','SPARSEBUNDLE','-fs','APFS','-volname','G090P3','-nospotlight',IMAGE],{stdio:'pipe',timeout:30000});
execFileSync('/usr/bin/hdiutil',['attach',IMAGE,'-mountpoint',MOUNT,'-noautoopen'],{stdio:'pipe',timeout:30000});
fs.chmodSync(MOUNT,0o700);
fs.mkdirSync(path.join(MOUNT,'lima'),{mode:0o700});
const record={createdAt:new Date().toISOString(),image:IMAGE,mount:MOUNT,limaHome:path.join(MOUNT,'lima'),
  attempt:ATTEMPT,minFreeKiB:MIN_FREE_KIB,isoCacheWasAbsent,
  capacityMiB:CAPACITY_MIB,reserveKiB:RESERVE_KIB,sourceFreeKiB:free,projectedFreeKiB:projected,
  owner:'090-P3-only',status:'OWNED_VOLUME_ONLY_NO_VM_PRIVATE_DATA'};
fs.writeFileSync(path.join(DIR,'runtime-ownership.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(record));
