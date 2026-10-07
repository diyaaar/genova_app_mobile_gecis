import test from 'node:test';
import assert from 'node:assert/strict';
import { ident, normalize } from './090-p3-offline-restore.mjs';
test('offline scope identifiers do not interpolate arbitrary SQL',()=>{
  assert.equal(ident('supabase_admin'),'"supabase_admin"');
  for(const value of ['user;drop','user"','postgres --','../public',''])assert.throws(()=>ident(value));
});
test('comparison normalizes object/ACL order without suppressing owner/grant/RLS differences',()=>{
  const expected={rls:true,owner:'postgres',acl:'{postgres=UC/postgres,authenticated=U/postgres}'};
  const reordered={owner:'postgres',acl:'{authenticated=U/postgres,postgres=UC/postgres}',rls:true};
  assert.deepEqual(normalize(expected),normalize(reordered));
  for(const mutation of [{owner:'other'},{rls:false},{acl:'{=UC/postgres}'}])assert.notDeepEqual(normalize(expected),normalize({...expected,...mutation}));
});
