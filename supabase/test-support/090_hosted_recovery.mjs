// 090/R1: exact-project read-only logical snapshot. Private bytes never enter stdout.
// No credential in arguments, no live DDL/DML, no restore or automatic retry.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const ROOT = '/Users/alidiyarduran/Antigravity/genovakorist';
const PSQL = '/opt/homebrew/opt/postgresql@17/bin/psql';
const DUMP = '/opt/homebrew/opt/postgresql@17/bin/pg_dump';
const REF = 'hievmwwctjjlhmssoxsu';
const URL = `postgresql://postgres.${REF}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
const PARENT = '/Users/alidiyarduran/Documents/Codex/2026-10-02';
export function allowedSchema(name) {
  return ['auth', 'public', 'supabase_migrations', 'extensions', 'vault'].includes(name)
    || /^genova_[0-9]{3}$/.test(name);
}
export function verifyIdentity(value) {
  if (value.database !== 'postgres' || value.user !== 'postgres' || value.recovery !== false
    || !/^17\./.test(value.version) || !/^[0-9A-F-]+$/.test(value.snapshot)
    || !Array.isArray(value.schemas) || !value.schemas.every(allowedSchema)
    || !['auth', 'public', 'supabase_migrations'].every(s => value.schemas.includes(s))) {
    throw Error('REFUSED snapshot identity/schema');
  }
}
function privateJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}
function safeParent(dir) {
  if (fs.lstatSync(dir).isSymbolicLink()) throw Error('REFUSED symlink parent');
}
async function backup() {
  if (process.cwd() !== ROOT || process.argv.length !== 3 || process.argv[2] !== '--backup') {
    throw Error('REFUSED explicit backup action/root required');
  }
  if (fs.readFileSync('supabase/.temp/project-ref', 'utf8').trim() !== REF
    || fs.readFileSync('supabase/.temp/pooler-url', 'utf8').trim() !== URL) throw Error('REFUSED project');
  const free = Number(execFileSync('df', ['-k', '.'], { encoding: 'utf8' }).trim().split('\n')[1].trim().split(/\s+/)[3]);
  if (free - 655360 < 10485760) throw Error('REFUSED disk floor');
  if ((fs.statSync('.env.local').mode & 0o777) !== 0o600) throw Error('REFUSED credential mode');
  const credential = require('dotenv').parse(fs.readFileSync('.env.local')).SUPABASE_DB_PASSWORD;
  if (!credential) throw Error('REFUSED missing existing credential');
  // Deliberately do not inherit connection/service files or other provider credentials.
  const env = { PATH: process.env.PATH, PGPASSWORD: credential,
    PGOPTIONS: '-c default_transaction_read_only=on -c statement_timeout=60000 -c lock_timeout=10000' };
  fs.mkdirSync(PARENT, { recursive: true, mode: 0o700 }); safeParent(PARENT);
  const dir = fs.mkdtempSync(path.join(PARENT, 'genova-090-r1-')); fs.chmodSync(dir, 0o700);
  const log = fs.openSync(path.join(dir, 'export-errors.log'), 'wx', 0o600);
  const holder = spawn(PSQL, ['-X', '-Atq', '-w', URL + '?sslmode=require&connect_timeout=10'],
    { env, stdio: ['pipe', 'pipe', log] });
  const select = `select json_build_object(
    'database',current_database(),'user',current_user,'version',current_setting('server_version'),
    'recovery',pg_is_in_recovery(),'snapshot',pg_export_snapshot(),
    'schemas',(select json_agg(nspname order by nspname) from pg_namespace where
      nspname in ('auth','public','supabase_migrations','extensions','vault') or nspname ~ '^genova_[0-9]{3}$'),
    'roles',(select json_agg(json_build_object('name',rolname,'super',rolsuper,'inherit',rolinherit,
      'createrole',rolcreaterole,'createdb',rolcreatedb,'login',rolcanlogin,'replication',rolreplication,
      'bypassrls',rolbypassrls,'connlimit',rolconnlimit) order by rolname) from pg_roles
      where rolname in ('postgres','anon','authenticated','service_role','authenticator','dashboard_user',
        'pgbouncer','supabase_admin','supabase_auth_admin','supabase_storage_admin',
        'supabase_realtime_admin','supabase_replication_admin','supabase_read_only_user')),
    'counts',(select json_object_agg(format('%I.%I',t.table_schema,t.table_name),
      (xpath('/row/cnt/text()',query_to_xml(format('select count(*) as cnt from %I.%I',t.table_schema,t.table_name),false,true,'')))[1]::text::bigint)
      from information_schema.tables t where t.table_type='BASE TABLE' and
      (t.table_schema in ('auth','public','supabase_migrations','extensions') or t.table_schema ~ '^genova_[0-9]{3}$')));`;
  let buffer = '';
  let timer;
  try {
    const ready = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(Error('Snapshot timeout')), 90000);
      holder.on('error', () => reject(Error('Snapshot connection unavailable')));
      holder.on('exit', () => reject(Error('Snapshot connection ended before export')));
      holder.stdout.on('data', data => {
        buffer += data.toString();
        const line = buffer.split('\n').find(x => x.trim().startsWith('{'));
        if (line) { try { resolve(JSON.parse(line)); } catch { reject(Error('Snapshot metadata invalid')); } }
      });
    });
    holder.stdin.write('begin isolation level repeatable read read only;\n' + select + '\n');
    const snapshot = await ready; clearTimeout(timer); verifyIdentity(snapshot);
    const file = path.join(dir, 'database.sql'); fs.closeSync(fs.openSync(file, 'wx', 0o600));
    const args = [URL + '?sslmode=require&connect_timeout=10', '--snapshot=' + snapshot.snapshot,
      ...snapshot.schemas.map(s => '--schema=' + s), '--exclude-table-data=vault.*',
      '--exclude-table-data=net.*', '--file=' + file];
    const code = await new Promise((resolve, reject) => {
      const dump = spawn(DUMP, args, { env, stdio: ['ignore', 'ignore', log] });
      dump.on('error', () => reject(Error('Dump spawn failed'))); dump.on('exit', resolve);
    });
    if (code !== 0 || holder.exitCode !== null) throw Error('Dump or held snapshot failed; no recovery PASS');
    const bytes = fs.statSync(file).size;
    if (bytes < 1000 || bytes > 134217728) throw Error('Unexpected backup size; inspect private artifact');
    // Check structure without returning even a line of private SQL.
    const body = fs.readFileSync(file);
    if (!body.includes(Buffer.from('PostgreSQL database dump complete'))) throw Error('Incomplete dump');
    const coverage = { includedSchemas: snapshot.schemas,
      data: 'Auth/public/genova_*/migration rows; owners, grants, RLS, function definitions retained',
      excluded: ['Vault values/all vault table data', 'pending net queue/response table data',
        'Storage object metadata schema and object bodies', 'Drive/R2 object bodies',
        'role passwords/global credential secrets/external provider configuration values'],
      roleAttributes: '13 selected non-secret role attributes; cluster role membership not yet rehearsed',
      snapshotConsistency: 'pg_dump and table counts share one held repeatable-read exported snapshot',
      limits: 'Logical recovery artifact only; no restore PASS until actual supported isolated backend succeeds' };
    privateJson(path.join(dir, 'snapshot.json'), snapshot);
    privateJson(path.join(dir, 'coverage.json'), coverage);
    privateJson(path.join(dir, 'summary.json'), { date: new Date().toISOString(), projectRef: REF,
      bytes, sha256: crypto.createHash('sha256').update(body).digest('hex'),
      schemas: snapshot.schemas.length, tables: Object.keys(snapshot.counts).length,
      status: 'BACKUP_ONLY_RESTORE_NOT_RUN', snapshotConsistency: true });
    console.log(JSON.stringify({ result: 'BACKUP_ONLY_RESTORE_NOT_RUN', artifactDirectory: dir,
      bytes, sha256: crypto.createHash('sha256').update(body).digest('hex'),
      schemas: snapshot.schemas.length, tables: Object.keys(snapshot.counts).length }));
  } finally {
    clearTimeout(timer); holder.stdin.end('rollback;\n'); holder.kill(); fs.closeSync(log);
    env.PGPASSWORD = '';
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  backup().catch(error => { console.error(error.message.replace(/apikey_\S+|postgresql:\/\/\S+/g, '[redacted]')); process.exitCode = 1; });
}
