import test from 'node:test';import assert from 'node:assert/strict';import {compareGroup} from './090-p3-snapshot-drift.mjs';
const key=r=>[r.schema,r.name];
test('source drift joins identities, counts removals/additions/changes, exposes only field names',()=>{
  const before=[{schema:'public',name:'first',definition:'PRIVATE OLD'},{schema:'realtime',name:'second',definition:'PRIVATE REMOVED'}];
  const after=[{schema:'realtime',name:'third',definition:'PRIVATE NEW'},{schema:'public',name:'first',definition:'PRIVATE CHANGE'}];
  const r=compareGroup(before,after,key);assert.equal(r.added,1);assert.equal(r.removed,1);assert.equal(r.changed,1);
  assert.equal(r.applicationChanged,1);assert.equal(r.applicationAdded,0);assert.equal(r.applicationRemoved,0);assert.deepEqual(r.changedFields,{definition:1});
  for(const v of ['PRIVATE','first','second','third'])assert(!JSON.stringify(r).includes(v));
});
test('source duplicates and missing identifiers are not accepted as equality',()=>{
  const rows=[{schema:'public',name:'same'},{schema:'public',name:'same'}];assert.throws(()=>compareGroup(rows,[],key));
  assert.throws(()=>compareGroup([],[{},{}],key));
  const r=compareGroup([{schema:'public',name:'kept',acl:'{postgres=X/postgres,=X/postgres}'}],[{acl:'{=X/postgres,postgres=X/postgres}',name:'kept',schema:'public'}],key);
  assert.equal(r.changed,0);
});
