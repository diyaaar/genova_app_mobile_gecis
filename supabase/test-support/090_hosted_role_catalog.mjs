// R1 exact linked project; role attributes/memberships/extensions ONLY, never passwords.
// Designated MCP is unavailable in the resumed tool inventory; approved read-only psql fallback.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ref = 'hievmwwctjjlhmssoxsu';
const url = `postgresql://postgres.${ref}@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres`;
if (process.cwd() !== '/Users/alidiyarduran/Antigravity/genovakorist'
  || process.argv[2] !== '--read-only-catalog' || process.argv.length !== 3
  || fs.readFileSync('supabase/.temp/project-ref','utf8').trim() !== ref
  || fs.readFileSync('supabase/.temp/pooler-url','utf8').trim() !== url
  || (fs.statSync('.env.local').mode & 0o777) !== 0o600) throw Error('REFUSED catalog target/action');
const env = { PATH: process.env.PATH, PGPASSWORD: require('dotenv').parse(fs.readFileSync('.env.local')).SUPABASE_DB_PASSWORD,
  PGOPTIONS: '-c default_transaction_read_only=on -c statement_timeout=30000 -c lock_timeout=5000' };
if (!env.PGPASSWORD) throw Error('REFUSED missing existing credential');
const query = `begin isolation level repeatable read read only;
select json_build_object('database',current_database(),'user',current_user,'version',current_setting('server_version'),
 'roles',(select json_agg(json_build_object('name',rolname,'super',rolsuper,'inherit',rolinherit,
   'createrole',rolcreaterole,'createdb',rolcreatedb,'login',rolcanlogin,'replication',rolreplication,
   'bypassrls',rolbypassrls,'connlimit',rolconnlimit) order by rolname) from pg_roles),
 'memberships',(select json_agg(json_build_object('role',r.rolname,'member',m.rolname,'grantor',g.rolname,
   'admin',a.admin_option,'inherit',a.inherit_option,'set',a.set_option) order by r.rolname,m.rolname)
   from pg_auth_members a join pg_roles r on r.oid=a.roleid join pg_roles m on m.oid=a.member
   join pg_roles g on g.oid=a.grantor),
 'extensions',(select json_agg(json_build_object('name',extname,'version',extversion,'owner',pg_get_userbyid(extowner))
   order by extname) from pg_extension)); rollback;`;
let data;
try {
  data = JSON.parse(execFileSync('/opt/homebrew/opt/postgresql@17/bin/psql',
    ['-X','-Atq','-w',url+'?sslmode=require&connect_timeout=10','-v','ON_ERROR_STOP=1'],
    { input: query, env, encoding:'utf8', timeout:60000, stdio:['pipe','pipe','pipe'] }));
} catch { throw Error('Read-only catalog unavailable; no credential/query body echoed'); }
finally { env.PGPASSWORD=''; }
if (data.database !== 'postgres' || data.user !== 'postgres' || !/^17\./.test(data.version)) throw Error('REFUSED catalog identity');
const result = { recordedAt:new Date().toISOString(),projectRef:ref,
  limit:'Later metadata-only snapshot, not the original R1 row-count snapshot. Passwords/role configs excluded.',...data };
fs.writeFileSync('/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo/role-extension-catalog.json',
  JSON.stringify(result,null,2),{flag:'wx',mode:0o600});
console.log(JSON.stringify({status:'READ_ONLY_ROLE_CATALOG_CAPTURED',roles:data.roles.length,
  memberships:data.memberships.length,extensions:data.extensions.length}));
