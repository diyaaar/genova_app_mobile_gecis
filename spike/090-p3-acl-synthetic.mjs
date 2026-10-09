// Verify only the additive ACL protocol on installed native PG17. No real backup
// reads, network listener, hosted target or full recovery acceptance. Sole writer.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync,execFileSync } from 'node:child_process';
import { planAclAdditions } from './090-p3-parity-analysis.mjs';
import { normalize } from './090-p3-offline-restore.mjs';
import { freeKiB } from './090-p3-consistent-backup.mjs';
import { LIVE_STOP_KIB } from './090-p3-resource-policy.mjs';
const PARENT='/Users/alidiyarduran/Documents/Codex/2026-10-07/genova-090-p3-RAJEJt';
const OUTPUT='docs/reports/090/2026-10-09-p3-acl-synthetic.json';
const PG='/opt/homebrew/opt/postgresql@17/bin/';
const RESERVE_KIB=262144,PORT=58190;
const env={PATH:process.env.PATH,LANG:'C',LC_ALL:'C'};
let dir,stage='preflight',result;
function command(name,args,input){
  if(freeKiB()<LIVE_STOP_KIB)throw Error('Synthetic live floor refused');
  const r=spawnSync(PG+name,args,{input,env,encoding:'utf8',timeout:20000,maxBuffer:1024*1024});
  if(r.status!==0){fs.appendFileSync(PARENT+'/acl-synthetic-errors-20261009.log',(r.stderr||'')+(r.stdout||''),{mode:0o600});throw Error('Synthetic PostgreSQL operation failed');}
  return r.stdout.trim();
}
function sql(text,db='genova_090_acl_test'){
  return command('psql',['-XAtq','-w','-h',dir,'-p',String(PORT),'-U','supabase_admin','-d',db,'-v','ON_ERROR_STOP=1'],"set statement_timeout='5s';set search_path=public,extensions;"+text);
}
function projection(){
  const q=`select jsonb_build_object(
    'functions',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'signature',p.oid::regprocedure::text,
      'owner',pg_get_userbyid(p.proowner),'acl',p.proacl::text)) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='extensions'),
    'schemas',(select jsonb_agg(jsonb_build_object('name',n.nspname,'owner',pg_get_userbyid(n.nspowner),'acl',n.nspacl::text)) from pg_namespace n where n.nspname in ('public','genova_999')),
    'relations',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,'kind',c.relkind,'owner',pg_get_userbyid(c.relowner),'acl',c.relacl::text)) from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relname in ('synthetic_table','synthetic_view')))`;
  return JSON.parse(sql(q+';'));
}
function allocated(){return Number(execFileSync('du',['-sk',dir],{encoding:'utf8'}).split(/\s+/)[0]);}
function main(){
  if(process.cwd()!=='/Users/alidiyarduran/Antigravity/genovakorist'||process.argv.length!==3||process.argv[2]!=='--verify-synthetic'||fs.existsSync(OUTPUT)||fs.existsSync(PARENT+'/acl-synthetic-errors-20261009.log'))throw Error('Synthetic scope/overwrite refused');
  if(fs.lstatSync(PARENT).isSymbolicLink()||fs.realpathSync(PARENT)!==PARENT||(fs.statSync(PARENT).mode&511)!==448)throw Error('Protected parent refused');
  const initialFreeKiB=freeKiB();if(initialFreeKiB-RESERVE_KIB<LIVE_STOP_KIB)throw Error('Synthetic resource reserve refused');
  dir=fs.mkdtempSync(PARENT+'/acl-pg-');fs.chmodSync(dir,0o700);
  if((dir+'/.s.PGSQL.'+PORT).length>=104)throw Error('Private socket path too long');
  fs.writeFileSync(dir+'/owner.json',JSON.stringify({owner:'090-synthetic-ACL-only',directory:dir,containsRealBackupData:false}),{flag:'wx',mode:0o600});
  stage='init';command('initdb',['-D',dir+'/data','-U','supabase_admin','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8','--no-instructions']);
  stage='start';command('pg_ctl',['start','-D',dir+'/data','-l',dir+'/server.log','-w','-t','10','-o',`-c listen_addresses='' -c unix_socket_directories='${dir}' -c unix_socket_permissions=0700 -c shared_buffers=16MB -c max_connections=10 -p ${PORT}`]);
  stage='synthetic-fixtures';
  const identity=JSON.parse(sql("select jsonb_build_object('version',current_setting('server_version'),'listen',current_setting('listen_addresses'),'unixOnly',inet_server_addr() is null);",'postgres'));
  if(!/^17\./.test(identity.version)||identity.listen!==''||identity.unixOnly!==true)throw Error('Synthetic target refused');
  sql('create role postgres nosuperuser;create role dashboard_user nologin;create database genova_090_acl_test owner postgres template template0;','postgres');
  sql(`create schema extensions authorization postgres;create schema genova_999 authorization postgres;
    create function extensions.synthetic(text) returns void language sql as 'select null::void';alter function extensions.synthetic(text) owner to postgres;
    create table public.synthetic_table(id int);alter table public.synthetic_table owner to postgres;
    create view public.synthetic_view as select 1 as id;alter view public.synthetic_view owner to postgres;
    set role postgres;grant select on public.synthetic_view to public;revoke usage on schema public from public;reset role;`);
  const actual=projection(),expected=structuredClone(actual);
  if(actual.functions.length!==1||actual.schemas.length!==2||actual.relations.length!==2)throw Error('Synthetic fixture coverage refused');
  expected.functions[0].acl='{=X/postgres,postgres=X*/postgres,dashboard_user=X/postgres}';
  expected.schemas.find(r=>r.name==='genova_999').acl='{postgres=UC/postgres}';
  expected.schemas.find(r=>r.name==='public').acl='{pg_database_owner=UC/pg_database_owner,=U/pg_database_owner}';
  expected.relations.find(r=>r.name==='synthetic_table').acl='{postgres=arwdDxtm/postgres}';
  expected.relations.find(r=>r.name==='synthetic_view').acl='{postgres=a*r*w*d*D*x*t*m*/postgres,=r/postgres,dashboard_user=arwdDxtm/postgres}';
  const plan=planAclAdditions(expected,actual);
  stage='synthetic-grants';sql('begin;'+plan.sql+'commit;');
  stage='exact-acl-comparison';
  if(JSON.stringify(normalize(projection()))!==JSON.stringify(normalize(expected)))throw Error('Synthetic exact ACL mismatch');
  const allocatedKiB=allocated();if(allocatedKiB>RESERVE_KIB)throw Error('Synthetic peak reserve exceeded');
  result={recordedAt:new Date().toISOString(),status:'SYNTHETIC_ADDITIVE_ACL_PROTOCOL_PASS_ONLY',version:identity.version,
    network:{listenAddresses:'',privateUnixSocket:true,hostedConnections:0},realDataRead:false,objects:5,
    planner:plan.totals,exactOwnerGranteePrivilegeOptionGrantorMatch:true,initialFreeKiB,allocatedKiB,reserveKiB:RESERVE_KIB,
    limits:'Native PG17 synthetic GRANT semantics only. No full Supabase extensions, historical/current source restore, tenant/Auth/client/release or actual177-statement plan execution acceptance.'};
}
try{main();}catch{console.error('Synthetic ACL verification failed at '+stage+'; details retained privately, no recovery PASS.');process.exitCode=1;}
finally{
  if(dir&&fs.existsSync(dir+'/data/postmaster.pid')){
    const stopped=spawnSync(PG+'pg_ctl',['stop','-D',dir+'/data','-m','fast','-w','-t','10'],{env,encoding:'utf8',timeout:20000,stdio:'pipe'});
    if(stopped.status!==0){console.error('Owned synthetic cluster stop failed; do not delete running target.');process.exitCode=1;result=undefined;}
  }
  if(dir&&!fs.existsSync(dir+'/data/postmaster.pid')){
    if(path.dirname(dir)!==PARENT||!/^acl-pg-[A-Za-z0-9]+$/.test(path.basename(dir))||fs.realpathSync(dir)!==dir)throw Error('Synthetic cleanup scope refused');
    const owner=JSON.parse(fs.readFileSync(dir+'/owner.json'));
    if(owner.owner!=='090-synthetic-ACL-only'||owner.directory!==dir)throw Error('Synthetic cleanup ownership refused');
    fs.rmSync(dir,{recursive:true});
    if(result){result.cleanup={ownedClusterRemoved:!fs.existsSync(dir),finalFreeKiB:freeKiB()};
      result.helperSha256=Object.fromEntries(['spike/090-p3-acl-synthetic.mjs','spike/090-p3-parity-analysis.mjs'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
      fs.writeFileSync(OUTPUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));}
  }
}
