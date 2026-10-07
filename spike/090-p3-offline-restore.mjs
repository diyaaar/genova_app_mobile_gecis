// Private actual restore/fidelity only. No hosted fallback, migration application,
// source mutation or SQL body/error/row stdout. One fixed owned network-none target.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { decryptBuffer, freeKiB } from './090-p3-consistent-backup.mjs';
import { catalogQueries, dataDigestQuery, canonicalSettings } from './090-p3-recovery-queries.mjs';
const DIR='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
const LIMA='/opt/homebrew/bin/limactl',VM='g090p3',CONTAINER='genova090p3-db',DB='genova_090_p3_restore';
const IMAGE='supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00';
const env={...process.env,LIMA_HOME:'/Volumes/g090p3/lima',LIMA_SHELLENV_BLOCK:'*'};
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
export function ident(name){if(!/^[a-z_][a-z_0-9]*$/.test(name))throw Error('Identifier scope refused');return '"'+name+'"';}
function privateRead(name){
  const file=path.join(DIR,name),stat=fs.lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||(stat.mode&511)!==384)throw Error('Private file ownership refused');
  return fs.readFileSync(file);
}
function command(args,input){
  const result=spawnSync(LIMA,['shell',VM,'sudo','docker',...args],{env,input,encoding:'utf8',timeout:120000,maxBuffer:16*1024*1024});
  if(result.status!==0){fs.writeFileSync(path.join(DIR,'restore-failure.log'),(result.stderr||'')+(result.stdout||''),{flag:'wx',mode:0o600});throw Error('Private offline command failed');}
  return result.stdout.trim();
}
function sql(text,database=DB){return command(['exec','-i','-e','PGPASSWORD=090-synthetic-local-only',CONTAINER,'psql','-X','-Atq','-w','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d',database],text);}
function json(query){return JSON.parse(sql('begin read only;'+canonicalSettings+`select coalesce(jsonb_agg(q),'[]'::jsonb) from (${query}) q;rollback;`));}
export function normalize(value){
  if(Array.isArray(value))return value.map(normalize);
  if(!value||typeof value!=='object')return value;
  return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>[key,key==='acl'&&typeof v==='string'?v.slice(1,-1).split(',').sort():normalize(v)]));
}
function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--restore-approved'||fs.existsSync(path.join(DIR,'restore-summary.json'))||fs.existsSync(path.join(DIR,'restore-failure.log')))throw Error('Root/action/overwrite refused');
  if(fs.lstatSync(DIR).isSymbolicLink()||(fs.statSync(DIR).mode&511)!==448)throw Error('Private directory refused');
  const owner=JSON.parse(privateRead('runtime-ownership.json'));
  if(owner.limaHome!==env.LIMA_HOME||owner.owner!=='090-P3-only'||freeKiB()<10485760+131072)throw Error('Runtime ownership/floor refused');
  const target=JSON.parse(command(['inspect',CONTAINER]))[0];
  if(target.Config.Image!==IMAGE||target.HostConfig.NetworkMode!=='none'||target.Mounts.length||Object.keys(target.HostConfig.PortBindings||{}).length)throw Error('Private isolation refused');
  const summary=JSON.parse(privateRead('summary.json'));
  if(summary.project!=='hievmwwctjjlhmssoxsu')throw Error('Backup project refused');
  const key=privateRead('artifact-key.bin');
  const encrypted=privateRead('database.sql.gcm');
  if(sha(encrypted)!==summary.encryptedSha256)throw Error('Encrypted backup identity refused');
  const dump=decryptBuffer(encrypted,key),metadata=decryptBuffer(privateRead('snapshot.json.gcm'),key),source=JSON.parse(metadata);
  key.fill(0);metadata.fill(0);
  if(sha(dump)!==summary.plaintextSha256||source.readOnly!=='on')throw Error('Backup plaintext/snapshot refused');
  if(sql(`select exists(select 1 from pg_database where datname='${DB}');`,'postgres')!=='f')throw Error('Existing database refused');
  // All role/password changes are inside this network-none container only.
  for(const role of source.catalog.roles){
    const name=ident(role.name);if(!Number.isInteger(role.connlimit))throw Error('Role scope refused');
    const flags=['super','inherit','createrole','createdb','login','replication','bypassrls'].map(k=>(role[k]?'':'no')+(k==='super'?'superuser':k));
    sql(`do $$begin if not exists(select 1 from pg_roles where rolname='${role.name}') then create role ${name};end if;end$$;
      alter role ${name} with ${flags.join(' ')} connection limit ${role.connlimit};`,'postgres');
  }
  // Restore exact membership grantors/options, admin-option foundations first.
  for(const m of [...source.catalog.memberships].sort((a,b)=>Number(b.admin_option)-Number(a.admin_option))){
    for(const [option,key] of [['admin','admin_option'],['inherit','inherit_option'],['set','set_option']]){
      if(typeof m[key]!=='boolean')throw Error('Membership flag refused');
      sql(`grant ${ident(m.role)} to ${ident(m.member)} with ${option} ${m[key]?'true':'false'} granted by ${ident(m.grantor)};`,'postgres');
    }
  }
  sql(`create database ${DB} owner postgres template template0;`,'postgres');
  sql('drop schema public cascade;');
  // Exact source extension dependency seed; original encrypted dump is unchanged.
  const expected={pgcrypto:['1.3','postgres','extensions'],'uuid-ossp':['1.1','postgres','extensions'],
    pg_stat_statements:['1.11','postgres','extensions'],pg_net:['0.19.5','supabase_admin','public'],supabase_vault:['0.3.1','supabase_admin','vault'],plpgsql:['1.0','supabase_admin','pg_catalog']};
  if(source.catalog.extensions.length!==6||source.catalog.extensions.some(e=>JSON.stringify(expected[e.name])!==JSON.stringify([e.version,e.owner,e.schema])))throw Error('Extension seed/source mismatch');
  const seed=`
set supautils.privileged_extensions='';
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
  const original=dump.toString();dump.fill(0);
  if(original.split('CREATE SCHEMA vault;').length!==2)throw Error('Extension boundary mismatch');
  const restored=original.replace('CREATE SCHEMA vault;','CREATE SCHEMA vault;\n'+seed);
  sql('begin;\n'+restored+'\ncommit;');
  const differences={},counts={};
  for(const [name,query] of Object.entries(catalogQueries)){
    const actual=json(query),expected=source.catalog[name];counts[name]={source:expected.length,restored:actual.length};
    if(JSON.stringify(normalize(actual))!==JSON.stringify(normalize(expected)))differences[name]={sourceSha256:sha(JSON.stringify(normalize(expected))),restoredSha256:sha(JSON.stringify(normalize(actual)))};
  }
  const data=json(dataDigestQuery);
  if(JSON.stringify(normalize(data))!==JSON.stringify(normalize(source.data)))differences.data={sourceTables:source.data.length,restoredTables:data.length};
  const result={recordedAt:new Date().toISOString(),project:summary.project,backupSha256:summary.plaintextSha256,
    database:DB,network:'none',mounts:0,publishedPorts:0,catalogCounts:counts,dataTables:data.length,
    restoredRows:data.reduce((n,t)=>n+t.rows,0),differences,status:Object.keys(differences).length?'FIDELITY_FAIL_NOT_ACCEPTED':'CURRENT_STATE_SELECTED_FIDELITY_PASS',
    limits:'Actual isolated logical restore and selected same-snapshot catalog/data equality only. Sequence/non-MVCC/provider/Storage/Vault/config and full Next/Auth/RLS/client/review gates remain separate; no hosted mutation or source fix.'};
  fs.writeFileSync(path.join(DIR,'restore-summary.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
  // Detailed comparisons/digests remain protected; stdout only counts/category names.
  console.log(JSON.stringify({...result,differences:Object.keys(differences)}));
  if(Object.keys(differences).length)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{main();}catch{console.error('Offline restore failed; details private, no recovery PASS or automatic retry.');process.exitCode=1;}
}
