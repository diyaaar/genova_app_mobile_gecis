import test from 'node:test';
import assert from 'node:assert/strict';
import { aclEntries,planAclAdditions,requireRecoveryMetadata,columnLayoutEvidence } from './090-p3-parity-analysis.mjs';
const empty=()=>({functions:[],schemas:[],relations:[]});
const fn={schema:'extensions',name:'synthetic',signature:'extensions.synthetic(text)',owner:'postgres',acl:'{=X/postgres,postgres=X*/postgres,dashboard_user=X/postgres}'};
test('NULL defaults retain owner and PUBLIC; empty ACL does not mean NULL',()=>{
  assert.equal(aclEntries({...fn,acl:null},'functions').length,2);
  assert.equal(aclEntries({...fn,acl:'{}'},'functions').length,0);
  assert.equal(aclEntries({owner:'postgres',kind:'S',acl:null},'relations').length,3);
  assert.equal(aclEntries({owner:'postgres',kind:'r',acl:null},'relations').length,8);
  assert.throws(()=>aclEntries({...fn,acl:'{"quoted-role"=X/postgres}'},'functions'));
  assert.throws(()=>aclEntries({...fn,acl:'{=X*/postgres}'},'functions'));
  assert.throws(()=>aclEntries({...fn,acl:'{postgres=XX/postgres}'},'functions'));
});
test('captured missing dashboard rights and owner option are restored by explicit scoped additions',()=>{
  const s=empty(),a=empty();s.functions=[fn];a.functions=[{...fn,acl:null}];
  const p=planAclAdditions(s,a);
  assert.equal(p.totals.permissionDifferences,1);assert.equal(p.totals.grantStatements,2);
  assert(p.sql.includes('TO "dashboard_user"'));assert(p.sql.includes('TO "postgres" WITH GRANT OPTION'));
  assert(!p.sql.includes('REVOKE')&&!p.sql.includes('ALTER ROLE')&&!p.sql.includes('UPDATE pg_'));
  assert.equal(p.status,'PREPARED_ONLY_NOT_EXECUTED');
});
test('representation-only owner ACL creates explicit entries without increasing PUBLIC rights',()=>{
  const s=empty(),a=empty();s.schemas=[{name:'genova_999',owner:'postgres',acl:'{postgres=UC/postgres}'}];a.schemas=[{...s.schemas[0],acl:null}];
  const p=planAclAdditions(s,a);assert.equal(p.totals.defaultRepresentationOnly,1);assert.equal(p.totals.permissionDifferences,0);
  assert(!p.sql.includes('PUBLIC'));assert.equal(p.totals.grantStatements,1);
});
test('identity joins tolerate catalog array order; duplicate or missing objects fail',()=>{
  const s=empty(),a=empty();s.schemas=[{name:'first',owner:'postgres',acl:null},{name:'second',owner:'postgres',acl:null}];a.schemas=[...s.schemas].reverse();
  assert.equal(planAclAdditions(s,a).totals.changedObjects,0);
  assert.throws(()=>planAclAdditions(s,{...a,schemas:[a.schemas[0],a.schemas[0]]}));
  assert.throws(()=>planAclAdditions(s,{...a,schemas:[]}));
});
test('extra privilege, grant-option upgrade, grantor drift, owner drift and SQL injection fail closed',()=>{
  const s=empty(),a=empty();s.functions=[{...fn,acl:'{postgres=X/postgres}'}];
  for(const change of [{acl:'{postgres=X/postgres,=X/postgres}'},{acl:'{postgres=X*/postgres}'},{acl:'{postgres=X/dashboard_user}'},{owner:'dashboard_user',acl:fn.acl}]){
    a.functions=[{...s.functions[0],...change}];assert.throws(()=>planAclAdditions(s,a));
  }
  s.functions=[{...fn,signature:'synthetic(text);DROP TABLE public.x;--'}];a.functions=[{...s.functions[0],acl:null}];assert.throws(()=>planAclAdditions(s,a));
});
test('database-owner schema grant uses database owner, not forbidden SET ROLE pg_database_owner',()=>{
  const s=empty(),a=empty();s.schemas=[{name:'public',owner:'pg_database_owner',acl:'{pg_database_owner=UC/pg_database_owner,=U/pg_database_owner}'}];a.schemas=[{...s.schemas[0],acl:'{pg_database_owner=UC/pg_database_owner}'}];
  const p=planAclAdditions(s,a);assert(p.sql.includes('SET ROLE "postgres"'));assert(p.sql.includes('TO PUBLIC'));
  assert(!p.sql.includes('SET ROLE "pg_database_owner"'));
});
test('expanded publication rows cannot replace missing same-snapshot root/schema/dropped metadata',()=>{
  const source={catalog:{publicationTables:[]}};assert.throws(()=>requireRecoveryMetadata(source));
  source.catalog.publicationRelations=[];source.catalog.publicationSchemas=[];source.catalog.droppedColumns=[];
  assert.throws(()=>requireRecoveryMetadata(source));
  source.comparisonContext={searchPath:'public, extensions'};assert.equal(requireRecoveryMetadata(source),true);
});
test('column gap diagnosis preserves physical FAIL and rejects actual order/type/data-contract drift',()=>{
  const column=(name,position)=>({table_schema:'public',table_name:'synthetic',column_name:name,ordinal_position:position,data_type:'text',is_nullable:'YES',column_default:null});
  const s=[column('id',1),column('value',3)],a=[column('id',1),column('value',2)];
  const p=columnLayoutEvidence(s,a);assert.equal(p.ordinalDifferences,1);assert.equal(p.internalGaps,1);assert.equal(p.physicalEquality,'FAIL');
  assert.throws(()=>columnLayoutEvidence(s,[column('value',1),column('id',2)]));
  assert.throws(()=>columnLayoutEvidence(s,[a[0],{...a[1],data_type:'integer'}]));
  assert.throws(()=>columnLayoutEvidence(s,[a[0],a[0]]));
});
