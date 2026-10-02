import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedSchema, verifyIdentity } from './090_hosted_recovery.mjs';
const identity = { database: 'postgres', user: 'postgres', recovery: false, version: '17.6',
  snapshot: '00000001-00000002-1', schemas: ['auth', 'public', 'supabase_migrations', 'genova_005', 'vault'] };
test('fixed metadata allowlist excludes net/storage/other schemas and SQL metacharacters', () => {
  for (const name of ['auth', 'public', 'genova_078', 'extensions', 'vault']) assert.equal(allowedSchema(name), true);
  for (const name of ['storage', 'net', 'private', 'genova_foo', 'genova_005;drop schema public']) assert.equal(allowedSchema(name), false);
});
test('identity requires exact database/user, writable primary and PG17 snapshot', () => {
  assert.doesNotThrow(() => verifyIdentity(identity));
  for (const change of [{database:'other'}, {user:'service_role'}, {recovery:true}, {version:'16.1'},
    {snapshot:'; SELECT 1'}, {schemas:['auth', 'public']}, {schemas:[...identity.schemas, 'net']}]) {
    assert.throws(() => verifyIdentity({...identity, ...change}), /REFUSED/);
  }
});
