// Explicit owned-offline invocation and rollback-only permission mutations.
// This is SQL caller evidence, not an Auth service/PostgREST/hosted transport test.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const host='unix:///Users/alidiyarduran/.lima/genova090r1/sock/docker.sock';
const container='genova090r1-db';
const dir='/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo';
const output=dir+'/actual-rpc-caller-rehearsal.json';
function command(args,input) {
  return spawnSync('docker',['--host',host,...args],{input,encoding:'utf8',timeout:60000,maxBuffer:4194304});
}
const inspected=command(['inspect',container]);
assert.equal(inspected.status,0,'Offline target missing');
const target=JSON.parse(inspected.stdout)[0];
assert.equal(process.cwd(),'/Users/alidiyarduran/Antigravity/genovakorist');
assert.deepEqual(process.argv.slice(2),['--owned-offline']);
assert.equal(target.Config.Image,'supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00');
assert.equal(target.HostConfig.NetworkMode,'none');
assert.equal(target.Mounts.length,0);
assert.equal(Object.keys(target.HostConfig.PortBindings??{}).length,0);
assert.equal(fs.existsSync(output),false,'Refuse historical evidence overwrite');
const parity=JSON.parse(fs.readFileSync(dir+'/role-execution-repeat-parity.json'));
assert.equal(parity.status,'ROLE_EXTENSION_PARITY_AND_FRESH_SQL_PASS');
assert.equal(parity.roles,32); assert.equal(parity.memberships,22); assert.equal(parity.extensions,6);
const fixture=fs.readFileSync('supabase/tests/090_private_file_ticket_authority.sql','utf8');
function sql(body,db='genova_090_r1_test') {
  return command(['exec','-i','-e','PGPASSWORD=090-synthetic-local-only',container,
    'psql','-X','-Atq','-w','-U','supabase_admin','-d',db,'-v','ON_ERROR_STOP=1'],body);
}
const green=sql('set role postgres;\n'+fixture);
assert.equal(green.status,0,'Actual caller fixture failed; no private SQL/error body echoed');
assert.match(green.stderr,/090 actual RPC callers PASS:/);
// Disable only the earlier ACL predicate in an in-memory mutant to demonstrate
// that the actual invocation assertions independently catch broken permissions.
const start=fixture.indexOf("  if has_function_privilege('anon'");
const end=fixture.indexOf('  -- Execute, rather than infer',start);
assert.ok(start>0&&end>start,'Refuse changed mutation boundary');
const mutant=fixture.slice(0,start)+fixture.slice(end);
const signature='(uuid,uuid,uuid,text,uuid)';
const results=[];
for(const role of ['anon','authenticated','service_role']) {
  const grant=role==='service_role'
    ? `revoke execute on function public.private_file_ticket_authorized_090${signature} from service_role;`
    : `grant usage on schema genova_090 to ${role};
       grant execute on function genova_090.can_read_private_file${signature} to ${role};
       grant execute on function public.private_file_ticket_authorized_090${signature} to ${role};`;
  const red=sql('set role postgres; begin;\n'+grant+'\n'+mutant);
  assert.notEqual(red.status,0,'Permission mutant unexpectedly passed');
  const expected=role==='service_role'?'permission denied for function private_file_ticket_authorized_090'
    : `090 ${role} unexpectedly executed repertoire-file RPC`;
  assert.ok(red.stderr.includes(expected),'Wrong permission-mutant failure; no private body echoed');
  results.push({role,status:'EXPECTED_FAIL',message:expected,rolledBackOnConnectionExit:true});
}
// Every failed mutation must have rolled back; rerun the unchanged fixture.
const final=sql('set role postgres;\n'+fixture);
assert.equal(final.status,0,'Post-mutation clean caller fixture failed');
const snapshot=JSON.parse(fs.readFileSync(dir+'/snapshot.json'));
const baseline=sql(`begin read only;
select json_object_agg(format('%I.%I',t.table_schema,t.table_name),
 (xpath('/row/cnt/text()',query_to_xml(format('select count(*) as cnt from %I.%I',t.table_schema,t.table_name),false,true,'')))[1]::text::bigint)
from information_schema.tables t where t.table_type='BASE TABLE' and
 (t.table_schema in ('auth','public','supabase_migrations','extensions') or t.table_schema ~ '^genova_[0-9]{3}$');
rollback;`,'genova_090_r1_restore');
assert.equal(baseline.status,0,'Baseline count query failed');
assert.deepEqual(JSON.parse(baseline.stdout),snapshot.counts);
const result={recordedAt:new Date().toISOString(),status:'ACTUAL_THREE_ROLE_RPC_AND_MUTATION_PASS',
 fixtureSha256:crypto.createHash('sha256').update(fixture).digest('hex'),families:5,
 serviceRole:{allowed:5,actorSessionChoirDenied:15,unknownFamilyDenied:1},
 anonExecutionDenied:5,authenticatedExecutionDenied:5,permissionMutants:results,
 baselineTablesUnchanged:Object.keys(snapshot.counts).length,
 limit:'Owned offline PG17.6, synthetic rolled-back SQL; not hosted Auth/PostgREST/HTTP/provider/client proof.'};
fs.writeFileSync(output,JSON.stringify(result,null,2),{flag:'wx',mode:0o600});
console.log(JSON.stringify(result));
