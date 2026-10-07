import test from 'node:test';
import assert from 'node:assert/strict';
import { digestRows, compareRows, edgeMetadata } from './090-p3-current-state-preflight.mjs';
import { hash } from './090-p3-hosted-inventory.mjs';
test('current projection digests bodies/policies/defaults and withholds non-search config',()=>{
  const source=[{body:'select 1;',definition:'create function synthetic',qual:'true',with_check:null,column_default:'1',config:['search_path=""','synthetic=private']}];
  const row=digestRows(source)[0];
  for(const key of ['body','definition','qual','with_check','column_default'])assert(!(key in row));
  assert.equal(row.bodySha256,hash('select 1;'));
  assert.equal(row.with_checkSha256,null);
  assert.deepEqual(row.config,['search_path=""','synthetic=<value withheld>']);
  assert.equal(source[0].body,'select 1;');
});
test('same body with changed ACL/RLS/owner or missing row is drift, not a silent match',()=>{
  const prior=[{name:'synthetic',owner:'postgres',acl:'auth-only',rls:true}];
  assert(compareRows(prior,prior).exactCapturedProjectionEqual);
  for(const changed of [{owner:'other'},{acl:'public'},{rls:false}])assert(!compareRows([{...prior[0],...changed}],prior).exactCapturedProjectionEqual);
  assert(!compareRows([],prior).exactCapturedProjectionEqual);
});
test('Edge metadata projection excludes source/env values and keeps JWT/version/digest drift',()=>{
  const raw={slug:'synthetic',version:1,status:'ACTIVE',verify_jwt:false,ezbr_sha256:'x',files:'private body',secret:'hidden'};
  const value=edgeMetadata([raw]);
  assert(!('files' in value[0])&&!('secret' in value[0]));
  assert(!compareRows(edgeMetadata([{...raw,verify_jwt:true}]),value).exactCapturedProjectionEqual);
  assert(!compareRows(edgeMetadata([{...raw,version:2}]),value).exactCapturedProjectionEqual);
});
