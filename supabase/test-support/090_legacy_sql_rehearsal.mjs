// Exact owned offline target; no hosted credentials, ports or provider access.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const dir='/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo';
const host='unix:///Users/alidiyarduran/.lima/genova090r1/sock/docker.sock';
const container='genova090r1-db';
const output=dir+(process.argv[2]==='--expanded-owned-matrix'
  ?'/legacy-authority-expanded-rehearsal.json':process.argv[2]==='--permission-mutations'
  ?'/legacy-authority-mutations.json':'/legacy-authority-rehearsal.json');
function docker(args,input) {
  return spawnSync('docker',['--host',host,...args],{input,encoding:'utf8',timeout:60000,maxBuffer:4194304});
}
assert.equal(process.cwd(),'/Users/alidiyarduran/Antigravity/genovakorist');
const expanded=process.argv[2]==='--expanded-owned-matrix';
const mutations=process.argv[2]==='--permission-mutations';
const replacing=process.argv[2]==='--replace-owned-unaccepted';
assert.ok(process.argv.length===3&&(replacing||expanded||mutations||process.argv[2]==='--owned-offline'));
assert.equal(fs.existsSync(output),false,'Refuse evidence overwrite');
const inspection=docker(['inspect',container]);assert.equal(inspection.status,0);
const target=JSON.parse(inspection.stdout)[0];
assert.equal(target.Config.Image,'supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00');
assert.equal(target.HostConfig.NetworkMode,'none');assert.equal(target.Mounts.length,0);
assert.equal(Object.keys(target.HostConfig.PortBindings??{}).length,0);
const parity=JSON.parse(fs.readFileSync(dir+'/legacy-compatibility-role-parity.json'));
assert.equal(parity.status,'ROLE_EXTENSION_PARITY_AND_FRESH_SQL_PASS');
assert.equal(parity.roles,32);assert.equal(parity.memberships,22);assert.equal(parity.extensions,6);
function sql(body,db='genova_090_r1_test') {
  return docker(['exec','-i','-e','PGPASSWORD=090-synthetic-local-only',container,
    'psql','-X','-Atq','-w','-U','supabase_admin','-d',db,'-v','ON_ERROR_STOP=1'],body);
}
const migration=fs.readFileSync('supabase/migrations/20261002154343_legacy_file_authority_090.sql','utf8');
const fixture=fs.readFileSync('supabase/tests/090_legacy_file_authority.sql','utf8');
function checked(body,label) {
  const result=sql('set role postgres;\n'+body);
  if(result.status!==0) {
    // Only synthetic fixture/migration errors here; omit private DETAIL/context.
    const safe=(result.stderr??'').split('\n').find(line=>/ERROR:/.test(line));
    throw Error(label+' failed: '+(safe??'no safe error').slice(0,180));
  }
  return result;
}
// Iteration is explicit and confined to the same unpublished test clone, with no accepted
// artifact present. No migration ledger or protected baseline is changed on replacement.
if(expanded||mutations) {
  // Expanded fixtures can reuse only the exact already-accepted migration, never overwrite it.
  const prior=JSON.parse(fs.readFileSync(dir+'/legacy-authority-rehearsal.json'));
  assert.equal(prior.migrationSha256,crypto.createHash('sha256').update(migration).digest('hex'));
} else checked(replacing?migration.replaceAll('create function ','create or replace function '):migration,'New migration');
const green=checked(fixture,'Actual legacy caller fixture');
assert.match(green.stderr,/090 LEGACY actual callers/);
const caught=[];
if(mutations) {
  const signature='(uuid,uuid,uuid,text,text,uuid)';
  const functionStart=migration.indexOf('create function genova_090.resolve_legacy_file(');
  const functionEnd=migration.indexOf('\nrevoke all on function genova_090.resolve_legacy_file',functionStart);
  assert.ok(functionStart>0&&functionEnd>functionStart);
  const definition=migration.slice(functionStart,functionEnd).replace('create function ','create or replace function ');
  const cases=[
    ...['anon','authenticated'].map(role=>({name:role+'-execute-grant',sql:
      `grant usage on schema genova_090 to ${role};
       grant execute on function genova_090.resolve_legacy_file${signature} to ${role};
       grant execute on function public.resolve_legacy_file_090${signature} to ${role};`,
      expected:`Legacy ${role} unexpectedly executed RPC`})),
    {name:'service-execute-revocation',sql:`revoke execute on function public.resolve_legacy_file_090${signature} from service_role;`,
      expected:'permission denied for function resolve_legacy_file_090'},
    {name:'inactive-member-predicate-removed',sql:definition.replace('and m.is_active is true',''),expected:'Legacy alias legacy_submission expected f'},
    {name:'session-selection-predicate-removed',sql:definition.replace('(select choir_id from selection)=p_choir_id','true'),expected:'Legacy alias legacy_repertoire expected f'},
    {name:'hidden-review-predicate-removed',sql:definition.replace('and not s.is_reviewer_note_hidden',''),expected:'Legacy alias legacy_review expected f'},
  ];
  for(const item of cases) {
    const red=sql('set role postgres; begin;\n'+item.sql+'\n'+fixture);
    assert.notEqual(red.status,0,'Unsafe mutant unexpectedly passed: '+item.name);
    assert.ok(red.stderr.includes(item.expected),'Wrong mutant failure: '+item.name);
    caught.push({name:item.name,status:'EXPECTED_FAIL',rolledBackOnConnectionExit:true});
  }
  checked(fixture,'Post-mutation clean fixture');
}
const snapshot=JSON.parse(fs.readFileSync(dir+'/snapshot.json'));
const count=sql(`begin read only;
select json_object_agg(format('%I.%I',t.table_schema,t.table_name),
 (xpath('/row/cnt/text()',query_to_xml(format('select count(*) as cnt from %I.%I',t.table_schema,t.table_name),false,true,'')))[1]::text::bigint)
from information_schema.tables t where t.table_type='BASE TABLE' and
 (t.table_schema in ('auth','public','supabase_migrations','extensions') or t.table_schema ~ '^genova_[0-9]{3}$');
rollback;`,'genova_090_r1_restore');
assert.equal(count.status,0);assert.deepEqual(JSON.parse(count.stdout),snapshot.counts);
const result={recordedAt:new Date().toISOString(),status:'LEGACY_ACTUAL_ROLES_AND_CURRENT_AUTHORITY_PASS',
  migrationSha256:crypto.createHash('sha256').update(migration).digest('hex'),
  fixtureSha256:crypto.createHash('sha256').update(fixture).digest('hex'),
  roleParity:32,membershipParity:22,extensionParity:6,baselineTablesUnchanged:101,mutations:caught,
  limit:'Owned offline PG17.6 actual service/anon/auth calls and rollback-only synthetic rows; not live Auth/PostgREST/HTTP/provider/browser acceptance.'};
fs.writeFileSync(output,JSON.stringify(result,null,2),{flag:'wx',mode:0o600});console.log(JSON.stringify(result));
