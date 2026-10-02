// R1 only: exact owned offline container, no hosted target/credential fallback.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const DIR = '/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo';
const HOST = 'unix:///Users/alidiyarduran/.lima/genova090r1/sock/docker.sock';
const CONTAINER = 'genova090r1-db';
const DB = 'genova_090_r1_restore';
const IMAGE = 'supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00';
function docker(args, input, quiet = false) {
  const r = spawnSync('docker', ['--host', HOST, ...args], { input, encoding: 'utf8',
    maxBuffer: 4194304, timeout: 120000 });
  if (r.status !== 0) {
    const errorName=process.argv[2]==='--fresh-role-execution-repeat'
      ? 'role-execution-repeat-error.log' : 'rehearsal-error.log';
    fs.writeFileSync(DIR + '/' + errorName, (r.stderr ?? '') + (r.stdout ?? ''), { mode: 0o600 });
    // SQL error logs may echo row data. Return only SQLSTATE/message without DETAIL/context.
    const line = (r.stderr ?? '').split('\n').find(l => /ERROR:|FATAL:/.test(l));
    throw Error('Local command failed; protected log retained' + (quiet ? '' : ': ' + (line ?? 'no safe SQL error').slice(0,200)));
  }
  return r.stdout.trim();
}
function sql(query, db = DB) {
  return docker(['exec', '-i', '-e', 'PGPASSWORD=090-synthetic-local-only', CONTAINER,
    'psql', '-X', '-Atq', '-w', '-U', 'supabase_admin', '-d', db, '-v', 'ON_ERROR_STOP=1'], query);
}
const inspect = JSON.parse(docker(['inspect', CONTAINER]))[0];
const rebuilding = process.argv[2] === '--rebuild-owned-restore';
const repeating = process.argv[2] === '--fresh-role-execution-repeat';
const summaryName = repeating ? 'role-execution-repeat-summary.json' : 'rehearsal-summary.json';
const restoreName = repeating ? 'role-execution-repeat-restore.log' : 'restore.log';
if (process.cwd() !== '/Users/alidiyarduran/Antigravity/genovakorist'
  || (!rebuilding && !repeating && process.argv[2] !== '--restore-and-test') || process.argv.length !== 3
  || inspect.Config.Image !== IMAGE || inspect.HostConfig.NetworkMode !== 'none'
  || inspect.Mounts.length || Object.keys(inspect.HostConfig.PortBindings ?? {}).length) throw Error('REFUSED isolated target');
const summary = JSON.parse(fs.readFileSync(DIR + '/summary.json'));
const snapshot = JSON.parse(fs.readFileSync(DIR + '/snapshot.json'));
const dump = fs.readFileSync(DIR + '/database.sql');
if (crypto.createHash('sha256').update(dump).digest('hex') !== summary.sha256) throw Error('REFUSED backup hash');
if (sql('show supautils.privileged_extensions;', 'postgres') !== '') throw Error('REFUSED image owner override; explicit offline setup required');
if (repeating && [summaryName,restoreName].some(name=>fs.existsSync(DIR+'/'+name))) {
  throw Error('REFUSED overwrite of repeated recovery evidence');
}
if (rebuilding) {
  const prior = JSON.parse(fs.readFileSync(DIR + '/rehearsal-summary.json'));
  if (prior.backupSha256 !== summary.sha256 || prior.baselineDatabase !== DB
    || prior.testDatabase !== 'genova_090_r1_test') throw Error('REFUSED restore ownership');
  if (['rehearsal-summary.json','restore.log'].some(name => fs.existsSync(DIR+'/initial-owner-mismatch-'+name))) {
    throw Error('REFUSED overwrite of historical rehearsal');
  }
  for (const name of ['rehearsal-summary.json','restore.log']) {
    fs.renameSync(DIR + '/' + name, DIR + '/initial-owner-mismatch-' + name);
  }
  sql('drop database genova_090_r1_test; drop database genova_090_r1_restore;', 'postgres');
}
if (sql(`select exists(select 1 from pg_database where datname='${DB}');`, 'postgres') !== 'f') throw Error('REFUSED existing target');
for (const r of snapshot.roles) {
  if (!/^[a-z_]+$/.test(r.name) || !Number.isInteger(r.connlimit)) throw Error('REFUSED role');
  const flags = ['super', 'inherit', 'createrole', 'createdb', 'login', 'replication', 'bypassrls'].map(k =>
    (r[k] ? '' : 'no') + (k === 'super' ? 'superuser' : k));
  sql(`do $$begin if not exists(select 1 from pg_roles where rolname='${r.name}') then create role ${r.name}; end if; end$$;
    alter role ${r.name} with ${flags.join(' ')} connection limit ${r.connlimit};`, 'postgres');
}
sql(`create database ${DB} owner postgres template template0;`, 'postgres');
sql('drop schema public cascade;');
// pg_dump -n does not carry extension dependencies. Add a small explicit seed,
// preserving the original protected dump and every owner/grant/RLS statement.
const seed = `
-- Offline bootstrap only: install canonical extension objects under recorded owner.
-- Revert temporary role attribute before any application data or security test.
alter role postgres superuser;
set role postgres;
create extension pgcrypto with schema extensions version '1.3';
create extension "uuid-ossp" with schema extensions version '1.1';
create extension pg_stat_statements with schema extensions version '1.11';
reset role;
alter role postgres nosuperuser;
create extension pg_net with schema public version '0.19.5';
create extension supabase_vault with schema vault version '0.3.1';
`;
const original = dump.toString();
if (original.split('CREATE SCHEMA vault;').length !== 2) throw Error('REFUSED schema seed boundary changed');
const restored = original.replace('CREATE SCHEMA vault;', 'CREATE SCHEMA vault;\n' + seed);
const output = executeFileFromText(restored);
fs.writeFileSync(DIR + '/' + restoreName, output, { flag:'wx', mode: 0o600 });
function executeFileFromText(text) { return sql('begin;\n' + text + '\ncommit;\n'); }
const schemas = JSON.parse(sql(`select json_agg(nspname order by nspname) from pg_namespace
  where nspname in ('auth','public','supabase_migrations','extensions','vault') or nspname ~ '^genova_[0-9]{3}$';`));
const countQuery = `select json_object_agg(format('%I.%I',t.table_schema,t.table_name),
  (xpath('/row/cnt/text()',query_to_xml(format('select count(*) as cnt from %I.%I',t.table_schema,t.table_name),false,true,'')))[1]::text::bigint)
  from information_schema.tables t where t.table_type='BASE TABLE' and
  (t.table_schema in ('auth','public','supabase_migrations','extensions') or t.table_schema ~ '^genova_[0-9]{3}$');`;
const counts = JSON.parse(sql(countQuery));
if (JSON.stringify(schemas) !== JSON.stringify(snapshot.schemas)
  || Object.keys(counts).length !== Object.keys(snapshot.counts).length
  || Object.entries(snapshot.counts).some(([key, value]) => counts[key] !== value)) throw Error('Restore schema/count mismatch');
const extensions = JSON.parse(sql(`select json_agg(json_build_object('name',e.extname,'version',e.extversion,
  'owner',pg_get_userbyid(e.extowner)) order by e.extname) from pg_extension e;`));
console.log(JSON.stringify({ stage: 'RESTORE_COUNTS_PASS', schemas: schemas.length,
  tables: Object.keys(counts).length, extensionMetadata: extensions, network: 'none', mounts: 0 }));
// A separate clone is the only writer for synthetic migration tests. Baseline remains intact.
const TEST = 'genova_090_r1_test';
if (sql(`select exists(select 1 from pg_database where datname='${TEST}');`, 'postgres') !== 'f') throw Error('REFUSED existing test');
sql(`create database ${TEST} owner postgres template ${DB};`, 'postgres');
function testFile(file) { return sql('set role postgres;\n' + fs.readFileSync(file, 'utf8'), TEST); }
let red;
try { testFile('supabase/tests/078_active_membership_revocation.sql'); }
catch (e) { red = e.message; }
if (!red?.includes('inactive selected membership retains tenant authority')) throw Error('Wrong red-before-green failure');
testFile('supabase/migrations/20260928140000_active_membership_revocation_078.sql');
for (const file of ['078_active_membership_revocation.sql', '005_active_choir_isolation.sql', '012_list_my_choirs_is_current.sql']) testFile('supabase/tests/' + file);
testFile('supabase/migrations/20260930080046_private_file_ticket_authority_090.sql');
testFile('supabase/tests/090_private_file_ticket_authority.sql');
const result = { date: new Date().toISOString(), stage: 'RESTORE_AND_SQL_MATRIX_PASS',
  baselineDatabase: DB, testDatabase: TEST, schemas: schemas.length, tables: Object.keys(counts).length,
  extensions, backupSha256: summary.sha256,
  limits: 'Synthetic SQL fixtures/direct request claims, not Auth service/PostgREST/live HTTP/client proof. Role membership/catalog comparison remains required; owner excludes sibling-site changes.' };
fs.writeFileSync(DIR + '/' + summaryName, JSON.stringify(result, null, 2), { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify(result));
