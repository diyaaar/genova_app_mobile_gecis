// Post-test catalogue equality; data now includes legitimate synthetic fixtures.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {DIR,readPrivate,query} from './090-compatibility-sql-rehearsal.mjs';
import {catalogQueries} from './090-p3-recovery-queries.mjs';
import {normalize} from './090-p3-offline-restore.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
assert(['20261010-managed-web','20261010-managed-final'].includes(ATTEMPT));assert.equal(process.argv.length,3);assert(['--verify-approved','--verify-final-approved'].includes(process.argv[2]));
const prefix=`managed-${ATTEMPT}`,before=JSON.parse(readPrivate(prefix+'-before-startup.json'));
const catalogue=Object.fromEntries(Object.entries(catalogQueries).map(([name,text])=>[name,normalize(query(text))]));
assert.deepEqual(catalogue,before.catalog,'Post-test metadata drift');
const sha=createHash('sha256').update(readPrivate('database.sql.gcm')).digest('hex');
assert.equal(sha,'c9ed4dfc9da9bf7e4317bb751f98e87b71bd4e06ef93daba9f0f1a5ccfb4dd2e');
const result={recordedAt:new Date().toISOString(),attempt:ATTEMPT,status:'POST_TEST_17_CATALOG_GROUPS_AND_PROTECTED_SOURCE_UNCHANGED',
  catalogGroups:17,sourceCiphertextSha256:sha,noGrantRoleRlsTriggerSchemaRelaxation:true,
  dataBoundary:'Runtime includes newly generated Auth sessions/users/audit and synthetic choir/file fixtures; final whole-table row equality is NOT claimed. Whole selected 101-table equality was established before deltas and before managed startup.'};
fs.writeFileSync(path.join(DIR,prefix+'-final-invariants'+(process.argv[2]==='--verify-final-approved'?'-v2':'')+'.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify(result));
