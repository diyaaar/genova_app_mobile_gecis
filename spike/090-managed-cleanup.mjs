// Only counted task-owned web outputs and ephemeral local test secrets.
// Backend VM/image must already be removed; protected backups/errors stay intact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {DIR,readPrivate} from './090-compatibility-sql-rehearsal.mjs';
import {freeKiB} from './090-p3-consistent-backup.mjs';
assert(['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT));assert.equal(process.argv.length,3);assert.equal(process.argv[2],'--cleanup-approved');
const ROOT='/Users/alidiyarduran/Antigravity/genovakorist',RUN=ROOT+'/spike/090-runtime/managed-web',prefix=`managed-${ATTEMPT}`;
assert.equal(process.cwd(),ROOT);const owner=JSON.parse(readPrivate('runtime-ownership-'+ATTEMPT+'.json'));
assert.equal(owner.attempt,ATTEMPT);assert.deepEqual(owner.webPaths,[RUN]);
assert.equal(JSON.parse(readPrivate('runtime-cleanup-'+ATTEMPT+'.json')).status,'OWNED_FINAL_RUNTIME_REMOVED');
assert(!fs.existsSync(owner.image)&&!fs.existsSync(owner.mount));
const tree=fs.lstatSync(RUN);assert(tree.isDirectory()&&!tree.isSymbolicLink());
assert.deepEqual(fs.readdirSync(RUN).sort(),['browser-tmp','current','old']);
for(const name of ['old','current']){
  assert(!fs.lstatSync(RUN+'/'+name).isSymbolicLink());assert(fs.lstatSync(RUN+'/'+name+'/node_modules').isSymbolicLink());
  assert.equal(fs.readlinkSync(RUN+'/'+name+'/node_modules'),ROOT+'/node_modules');
}
for(const port of [18197,18199,18200,18443,18441,18442,18092,19999,19300]){
  let listener='';try{listener=execFileSync('/usr/sbin/lsof',['-nP','-iTCP:'+port,'-sTCP:LISTEN'],{encoding:'utf8'});}catch{}
  assert.equal(listener,'','Owned listeners still active; refuse source/secret removal');
}
const sourcesKiB=Number(execFileSync('/usr/bin/du',['-sk',RUN],{encoding:'utf8'}).split(/\s/u)[0]);
fs.rmSync(RUN,{recursive:true});
const removed=[];
for(const name of ['config.json','auth.env','rest.env','fixture.json','fixture-before-legacy.json','tls.key','tls.crt',
  'tls-ca.key','tls-ca.crt','tls-leaf.key','tls-leaf.csr','tls-leaf.crt','tls-leaf.ext']){
  const file=path.join(DIR,prefix+'-'+name);if(!fs.existsSync(file)){assert(ATTEMPT==='20261010-managed-final'&&['fixture-before-legacy.json','tls.key','tls.crt'].includes(name),'Required ephemeral artifact missing');continue;}
  const stat=fs.lstatSync(file);assert(stat.isFile()&&!stat.isSymbolicLink()&&(stat.mode&511)===384);
  fs.unlinkSync(file);removed.push(name);
}
const result={recordedAt:new Date().toISOString(),attempt:ATTEMPT,status:'OWNED_WEB_BUILDS_AND_EPHEMERAL_TEST_SECRETS_REMOVED',
  webPath:RUN,removedWebAllocatedKiB:sourcesKiB,ephemeralArtifactsRemoved:removed.length,freeKiB:freeKiB(),
  rootDependenciesPreserved:fs.existsSync(ROOT+'/node_modules'),encryptedSourceRetained:fs.existsSync(DIR+'/database.sql.gcm'),
  protectedCustodyKeyRetained:fs.existsSync(DIR+'/artifact-key.bin'),privateEvidenceAndErrorsRetained:true,noGlobalCacheOrUserDataDeletion:true};
fs.writeFileSync(path.join(DIR,prefix+'-cleanup.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(result));
