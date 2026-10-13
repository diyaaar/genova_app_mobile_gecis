// Remove only ephemeral local test secrets after the owned backend and listeners stop.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {DIR,readPrivate} from './090-compatibility-sql-rehearsal.mjs';
import {READERS} from './090-five-family-contract.mjs';
assert.equal(ATTEMPT,'20261013-managed-families');
assert.equal(process.argv.length,3);assert.equal(process.argv[2],'--cleanup-approved');
const prefix=`managed-${ATTEMPT}`;
const owner=JSON.parse(readPrivate(`runtime-ownership-${ATTEMPT}.json`));
assert.equal(owner.attempt,ATTEMPT);assert.deepEqual(owner.webPaths,[]);
assert.equal(JSON.parse(readPrivate(`runtime-cleanup-${ATTEMPT}.json`)).status,'OWNED_FINAL_RUNTIME_REMOVED');
assert(!fs.existsSync(owner.image)&&!fs.existsSync(owner.mount));
const transport=JSON.parse(readPrivate(prefix+'-transport-result-matrix.json'));
assert(transport.closed&&transport.childrenExited);
for(const port of [18443,18092,19999,19300,...READERS.map(r=>r.port)]) {
  let active='';try{active=execFileSync('/usr/sbin/lsof',['-nP',`-iTCP:${port}`,'-sTCP:LISTEN'],{encoding:'utf8'});}catch{}
  assert.equal(active,'','Local listener still active');
}
const names=['config.json','auth.env','rest.env','fixture.json',
  'tls-ca.key','tls-ca.crt','tls-leaf.key','tls-leaf.csr','tls-leaf.crt','tls-leaf.ext'];
// Validate all files before deleting any; keep encrypted source, evidence and errors.
for(const name of names)readPrivate(prefix+'-'+name);
for(const name of names)fs.unlinkSync(path.join(DIR,prefix+'-'+name));
for(const name of ['database.sql.gcm','snapshot.json.gcm','artifact-key.bin'])readPrivate(name);
const result={recordedAt:new Date().toISOString(),attempt:ATTEMPT,
  status:'FIVE_FAMILY_EPHEMERAL_SECRETS_REMOVED',removed:names.length,listenersAbsent:true,
  encryptedBackupAndKeyRetained:true,privateEvidenceAndErrorsRetained:true};
fs.writeFileSync(path.join(DIR,prefix+'-cleanup.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(result));
