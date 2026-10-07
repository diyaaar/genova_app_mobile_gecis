// Bounded owned virtual volume, not a format/cleanup tool for host disks.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { freeKiB } from './090-p3-consistent-backup.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
const IMAGE=path.join(DIR,'runtime.sparsebundle');
const MOUNT='/Volumes/g090p3';
const RESERVE_KIB=2458*1024+220*1024+512*1024+64*1024;
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--create-approved')throw Error('Explicit root/action refused');
if(fs.existsSync(IMAGE)||fs.existsSync(MOUNT)||fs.lstatSync(DIR).isSymbolicLink()||(fs.statSync(DIR).mode&511)!==448)throw Error('Existing/symlink/private target refused');
if(JSON.parse(fs.readFileSync(path.join(DIR,'summary.json'))).project!=='hievmwwctjjlhmssoxsu')throw Error('Backup identity refused');
const free=freeKiB();if(free-RESERVE_KIB<10485760)throw Error('Full reserved allocation disk floor refused');
execFileSync('/usr/bin/hdiutil',['create','-size','2458m','-type','SPARSEBUNDLE','-fs','APFS','-volname','G090P3','-nospotlight',IMAGE],{stdio:'pipe',timeout:30000});
execFileSync('/usr/bin/hdiutil',['attach',IMAGE,'-mountpoint',MOUNT,'-noautoopen'],{stdio:'pipe',timeout:30000});
fs.chmodSync(MOUNT,0o700);
fs.mkdirSync(path.join(MOUNT,'lima'),{mode:0o700});
const record={createdAt:new Date().toISOString(),image:IMAGE,mount:MOUNT,limaHome:path.join(MOUNT,'lima'),
  capacityMiB:2458,reserveKiB:RESERVE_KIB,sourceFreeKiB:free,projectedFreeKiB:free-RESERVE_KIB,
  owner:'090-P3-only',status:'OWNED_VOLUME_ONLY_NO_VM_PRIVATE_DATA'};
fs.writeFileSync(path.join(DIR,'runtime-ownership.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(record));
