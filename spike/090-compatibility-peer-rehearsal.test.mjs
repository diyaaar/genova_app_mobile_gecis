import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {peerSource} from './090-compatibility-peer-rehearsal.mjs';
test('peer source stays exact except explicit local target and retained-session check',()=>{
  const source=fs.readFileSync('supabase/tests/090_private_file_ticket_concurrency.sql','utf8'),generated=peerSource(source);
  assert(!generated.includes('genova_090_concurrency_test'));
  assert(generated.includes('host=/var/run/postgresql dbname=genova_090_p3_peer user=supabase_admin'));
  assert(!generated.includes('pg_sleep'));assert(generated.includes('transaction_timestamp() <'));
  for(const label of ['post-commit switch retained A','post-commit role removal retained A','post-commit membership removal retained A'])assert(generated.includes(label));
  assert.throws(()=>peerSource(source+'\n'));assert.equal(peerSource(source),generated);
});
