import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { allowedSchema, verifySnapshot, dumpArgs, ByteGuard, encryptBuffer, decryptBuffer, completedSnapshotLine } from './090-p3-consistent-backup.mjs';
import { snapshotQuery, catalogQueries, dataDigestQuery } from './090-p3-recovery-queries.mjs';
const valid={database:'postgres',user:'postgres',readOnly:'on',recovery:false,version:'17.6',snapshot:'00000001-00000002-1',
  schemas:['auth','public','realtime','supabase_migrations','genova_005'],data:[{rows:0,sha256:'0'.repeat(64)}],
  comparisonContext:{searchPath:'public, extensions'},catalog:{roles:[{name:'postgres'}],publicationRelations:[],publicationSchemas:[],droppedColumns:[]}};
test('large metadata is not parsed from a partial stdout chunk before complete newline',()=>{
  const text=JSON.stringify({catalog:'synthetic'.repeat(20000)});
  assert.equal(completedSnapshotLine(text.slice(0,65536)),undefined);
  assert.equal(completedSnapshotLine(text),undefined);
  assert.deepEqual(completedSnapshotLine(text+'\n'),JSON.parse(text));
  assert.throws(()=>completedSnapshotLine('{invalid}\n'));
  const multiline='{ "catalog": [ {"body":"quoted \\\" brace {"},\n {"roles": [1,2]} ] }\n';
  assert.equal(completedSnapshotLine(multiline.slice(0,multiline.indexOf('\n')+1)),undefined);
  assert.deepEqual(completedSnapshotLine(multiline),JSON.parse(multiline));
});
test('snapshot/namespace guards fail closed and preserve real row fingerprint requirement',()=>{
  assert(allowedSchema('realtime'));assert(!allowedSchema('net'));assert(!allowedSchema('storage'));
  assert.doesNotThrow(()=>verifySnapshot(valid));
  for(const change of [{readOnly:'off'},{user:'service_role'},{version:'16.9'},{snapshot:';drop'},{schemas:['public']},{data:[{rows:1,sha256:'md5'}]}])assert.throws(()=>verifySnapshot({...valid,...change}));
  const args=dumpArgs(valid);assert(!args.includes('--no-owner')&&!args.includes('--no-privileges'));
  assert(args.includes('--exclude-table-data=realtime.*'));assert(args.includes('--exclude-table-data=vault.*'));
});
test('streaming limit refuses bytes before output, not merely post-export',async()=>{
  let received=0;const sink=new Writable({write(chunk,_encoding,done){received+=chunk.length;done();}});
  await assert.rejects(pipeline(Readable.from([Buffer.alloc(2),Buffer.alloc(3)]),new ByteGuard(4),sink),/streaming cap/);
  assert(received<=2);
});
test('authenticated encryption roundtrip rejects corruption and wrong key',()=>{
  const key=Buffer.alloc(32,7),plain=Buffer.from('synthetic private rows'),encrypted=encryptBuffer(plain,key);
  assert(!encrypted.includes(plain));assert.deepEqual(decryptBuffer(encrypted,key),plain);
  assert.throws(()=>decryptBuffer(encrypted,Buffer.alloc(32,8)));
  const changed=Buffer.from(encrypted);changed[21]^=1;assert.throws(()=>decryptBuffer(changed,key));
});
test('held recovery queries preserve relevant security catalogs without role passwords or user logs',()=>{
  assert(snapshotQuery.startsWith('select jsonb_build_object'));assert(snapshotQuery.includes('pg_export_snapshot()'));
  assert(!snapshotQuery.includes('rolpassword'));assert(!snapshotQuery.includes('pg_stat_activity'));
  for(const key of ['memberships','defaultAcls','triggers','indexes','policies','publications','publicationTables','publicationRelations','publicationSchemas','droppedColumns'])assert(catalogQueries[key]);
  assert(catalogQueries.publicationRelations.includes('pg_publication_rel'));
  assert(catalogQueries.publicationRelations.includes('prattrs is null'));
  assert(catalogQueries.publicationRelations.includes('pg_get_expr(r.prqual,r.prrelid)'));
  assert(catalogQueries.droppedColumns.includes('a.attisdropped'));
  assert(dataDigestQuery.includes('collate "C"'));assert(dataDigestQuery.includes('to_jsonb(x)::text'));
  assert(!dataDigestQuery.includes('distinct row_value'));assert(!dataDigestQuery.includes("table_schema in ('realtime'"));
});
