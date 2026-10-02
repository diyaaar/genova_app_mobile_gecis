// Apply captured non-secret cluster role metadata ONLY to the owned offline container.
// Passwords, provider role settings and role validity times are intentionally not restored.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
const dir='/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo';
const host='unix:///Users/alidiyarduran/.lima/genova090r1/sock/docker.sock';
const container='genova090r1-db';
function docker(args,input) {
  const r=spawnSync('docker',['--host',host,...args],{input,encoding:'utf8',timeout:60000});
  if(r.status!==0) throw Error('Owned offline role command failed; no private body echoed');
  return r.stdout.trim();
}
const target=JSON.parse(docker(['inspect',container]))[0];
const repeating=process.argv[2]==='--fresh-role-execution-repeat';
const outputName=repeating?'role-execution-repeat-parity.json':'role-rehearsal.json';
if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||(!repeating&&process.argv[2]!=='--owned-offline')
  ||process.argv.length!==3||target.HostConfig.NetworkMode!=='none'||target.Mounts.length
  ||Object.keys(target.HostConfig.PortBindings??{}).length
  ||target.Config.Image!=='supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00') throw Error('REFUSED role target');
function sql(q,db='genova_090_r1_restore') {
  return docker(['exec','-i','-e','PGPASSWORD=090-synthetic-local-only',container,'psql','-X','-Atq','-w',
    '-U','supabase_admin','-d',db,'-v','ON_ERROR_STOP=1'],q);
}
if(fs.existsSync(dir+'/'+outputName)) throw Error('REFUSED overwrite of role evidence');
const source=JSON.parse(fs.readFileSync(dir+'/role-extension-catalog.json'));
const query=`select json_build_object('roles',(select json_agg(json_build_object('name',rolname,'super',rolsuper,'inherit',rolinherit,
 'createrole',rolcreaterole,'createdb',rolcreatedb,'login',rolcanlogin,'replication',rolreplication,'bypassrls',rolbypassrls,
 'connlimit',rolconnlimit) order by rolname) from pg_roles),
 'memberships',(select json_agg(json_build_object('role',r.rolname,'member',m.rolname,'grantor',g.rolname,'admin',a.admin_option,
 'inherit',a.inherit_option,'set',a.set_option) order by r.rolname,m.rolname) from pg_auth_members a join pg_roles r on r.oid=a.roleid
 join pg_roles m on m.oid=a.member join pg_roles g on g.oid=a.grantor),
 'extensions',(select json_agg(json_build_object('name',extname,'version',extversion,'owner',pg_get_userbyid(extowner)) order by extname)
 from pg_extension));`;
const before=JSON.parse(sql(query));
for(const r of source.roles) {
  if(!/^[a-z_]+$/.test(r.name)||!Number.isInteger(r.connlimit)) throw Error('REFUSED role metadata');
  const prior=before.roles.find(p=>p.name===r.name);
  if(isDeepStrictEqual(prior,r)) continue;
  const flags=['super','inherit','createrole','createdb','login','replication','bypassrls'].map(k=>(r[k]?'':'no')+(k==='super'?'superuser':k));
  sql(`${prior?'':'create role '+r.name+';'} alter role ${r.name} with ${flags.join(' ')} connection limit ${r.connlimit};`);
}
for(const edge of source.memberships) {
  if(![edge.role,edge.member,edge.grantor].every(n=>/^[a-z_]+$/.test(n))||edge.grantor!=='supabase_admin') throw Error('REFUSED membership metadata');
  if(before.memberships.some(e=>isDeepStrictEqual(e,edge))) continue;
  sql(`grant ${edge.role} to ${edge.member} with admin ${edge.admin}, inherit ${edge.inherit}, set ${edge.set} granted by supabase_admin;`);
}
const after=JSON.parse(sql(query));
if(!isDeepStrictEqual(after.roles,source.roles)||!isDeepStrictEqual(after.memberships,source.memberships)
  ||!isDeepStrictEqual(after.extensions,source.extensions)) throw Error('Role/extension metadata mismatch; no security PASS');
// Exact ACL/role setup must precede fresh acceptance, not merely follow old green checks.
for(const [db,files] of [
  // Owner correction#33 excludes further sibling-site execution. Earlier
  // baseline/clone form checks remain historical, not automatic replay work.
  ['genova_090_r1_test',['078_active_membership_revocation.sql','005_active_choir_isolation.sql',
    '012_list_my_choirs_is_current.sql','090_private_file_ticket_authority.sql']],
]) for(const name of files) sql('set role postgres;\n'+fs.readFileSync('supabase/tests/'+name,'utf8'),db);
const result={recordedAt:new Date().toISOString(),status:'ROLE_EXTENSION_PARITY_AND_FRESH_SQL_PASS',
 roles:after.roles.length,memberships:after.memberships.length,extensions:after.extensions.length,
 changedRoles:source.roles.filter(r=>!before.roles.some(p=>isDeepStrictEqual(p,r))).map(r=>r.name),
 addedOrChangedMemberships:source.memberships.filter(r=>!before.memberships.some(p=>isDeepStrictEqual(p,r))),
 limit:source.limit+' No live Auth/PostgREST/client/provider or password/config recovery claim.',before,after};
fs.writeFileSync(dir+'/'+outputName,JSON.stringify(result,null,2),{flag:'wx',mode:0o600});
console.log(JSON.stringify({...result,before:undefined,after:undefined}));
