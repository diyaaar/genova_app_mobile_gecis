// Single bounded, owned nativePG17 synthetic authority/HTTP test. Not recovery proof.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync, execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';

const ROOT='/Users/alidiyarduran/Antigravity/genovakorist';
const PG='/opt/homebrew/opt/postgresql@17/bin/';
const BASE='supabase/migrations/20260930080046_private_file_ticket_authority_090.sql';
const DELTA='supabase/migrations/20261009190611_private_file_session_expiry_090.sql';
const DELTA_SHA='c191738462dc500e0be524155fb6e5ca3002e7445ba6a70d77f451d7a52bc36c';
const DB='genova_090_session_expiry', PORT=58192, CAP=262144, STOP=8388608;
const OUTPUT='docs/reports/090/2026-10-09-p3-session-expiry-v3.json';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const free=()=>Number(execFileSync('df',['-k',ROOT],{encoding:'utf8'}).trim().split('\n').at(-1).split(/\s+/)[3]);
const env={PATH:process.env.PATH,LANG:'C',LC_ALL:'C'};
let dir,stage='preflight',proof,peak=0;
function measure(){if(dir){peak=Math.max(peak,Number(execFileSync('du',['-sk',dir],{encoding:'utf8'}).split(/\s+/)[0]));}
  if(peak>=CAP||free()<STOP)throw Error('Owned test resource boundary');}
function command(name,args,input){measure();const r=spawnSync(PG+name,args,{env,input,encoding:'utf8',timeout:20000,maxBuffer:1024*1024});
  if(r.status!==0){if(dir)fs.appendFileSync(dir+'/errors.log',(r.stderr||'')+(r.stdout||''),{mode:0o600});throw Error('Owned PG command failed');}return r.stdout.trim();}
function sql(text,db=DB){return command('psql',['-XAtq','-w','-h',dir,'-p',String(PORT),'-U','fixture_admin','-d',db,'-v','ON_ERROR_STOP=1'],"set statement_timeout='5s';"+text);}
function block(file,name){const source=fs.readFileSync(file,'utf8');const start=source.indexOf('create function '+name+'(');
  if(start<0)throw Error('Exact source function missing');const tag=source.slice(start).match(/\bas\s+(\$[a-z_]*\$)/i);
  if(!tag)throw Error('Exact function delimiter missing');const bodyStart=start+tag.index+tag[0].length;
  const end=source.indexOf(tag[1]+';',bodyStart);if(end<0)throw Error('Function end missing');return source.slice(start,end+tag[1].length+1);}
const actor='10000000-0000-4000-8000-000000000090',session='11000000-0000-4000-8000-000000000090',choir='20000000-0000-4000-8000-000000000090';
const files=['51000000-0000-4000-8000-000000000090','62000000-0000-4000-8000-000000000090',
  '63000000-0000-4000-8000-000000000090','71000000-0000-4000-8000-000000000090','81000000-0000-4000-8000-000000000090'];
const families=['repertoire-file','assignment-file','assignment-review-file','repertoire-comment-file','chat-media-file'];
const decisions=()=>JSON.parse(sql(`set role service_role;select json_agg(public.private_file_ticket_authorized_090('${actor}','${session}','${choir}',x.family,x.file::uuid) order by x.n)
 from (values ${families.map((f,i)=>`(${i},'${f}','${files[i]}')`).join(',')}) x(n,family,file);`));
const acl=()=>JSON.parse(sql(`select json_agg(json_build_object('name',n.nspname||'.'||p.proname,'owner',pg_get_userbyid(proowner),
 'definer',prosecdef,'volatility',provolatile,'config',proconfig,'acl',proacl::text) order by n.nspname,p.proname)
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname in('can_read_private_file','private_file_ticket_authorized_090');`));
try {
  if(process.cwd()!==ROOT||process.argv.length!==3||process.argv[2]!=='--run-owned'||fs.existsSync(OUTPUT))throw Error('Explicit exclusive test scope required');
  if(hash(fs.readFileSync(DELTA))!==DELTA_SHA)throw Error('Forward source pin changed');
  const initialFreeKiB=free();if(initialFreeKiB-CAP<STOP)throw Error('Owned test reserve refused');
  for(const port of [18190,18191])if(spawnSync('lsof',['-nP',`-iTCP:${port}`,'-sTCP:LISTEN'],{env,stdio:'pipe'}).status===0)throw Error('Owned HTTP port busy');
  if(fs.lstatSync('spike/090-runtime').isSymbolicLink())throw Error('Linked runtime parent');
  dir=fs.mkdtempSync(ROOT+'/spike/090-runtime/session-expiry-');fs.chmodSync(dir,0o700);
  if((dir+'/.s.PGSQL.'+PORT).length>=104)throw Error('Socket path too long');
  fs.writeFileSync(dir+'/owner.json',JSON.stringify({owner:'090-session-expiry-synthetic',dir}),{flag:'wx',mode:0o600});
  stage='init';command('initdb',['-D',dir+'/data','-U','fixture_admin','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8','--no-instructions']);
  stage='start';command('pg_ctl',['start','-D',dir+'/data','-l',dir+'/server.log','-w','-t','10','-o',
    `-c listen_addresses='' -c unix_socket_directories='${dir}' -c unix_socket_permissions=0700 -c shared_buffers=16MB -c max_connections=10 -c max_wal_size=32MB -c min_wal_size=32MB -p ${PORT}`]);
  const identity=JSON.parse(sql("select json_build_object('version',current_setting('server_version'),'listen',current_setting('listen_addresses'),'unixOnly',inet_server_addr() is null);",'postgres'));
  if(!identity.version.startsWith('17.')||identity.listen!==''||!identity.unixOnly)throw Error('Wrong native target');
  sql(`create role postgres nosuperuser;create role service_role nosuperuser;create role anon nosuperuser;create role authenticated nosuperuser;
    create database ${DB} owner postgres template template0;`,'postgres');
  stage='synthetic-schema';sql('set role postgres;'+fs.readFileSync('supabase/test-support/090_session_expiry_fixture.sql','utf8'));
  sql('set role postgres;'+block('supabase/migrations/20260903214901_tenant_schema_003.sql','genova_003.enforce_tenant_links')+
    '\ncreate trigger synthetic_tenant_link before insert or update on public.choir_member_roles for each row execute function genova_003.enforce_tenant_links();'+
    block('supabase/migrations/20260923193000_private_r2_chat_media_060.sql','public.can_read_chat_media_060')+
    block('supabase/migrations/20260923193000_private_r2_chat_media_060.sql','genova_060.guard_private_identity')+
    '\ncreate trigger synthetic_avatar_guard before update of avatar_url,avatar_media_version_id on public.chat_rooms for each row execute function genova_060.guard_private_identity();');
  sql('set role postgres;'+fs.readFileSync(BASE,'utf8'));
  sql('set role postgres;'+fs.readFileSync('supabase/migrations/20261002154343_legacy_file_authority_090.sql','utf8'));
  stage='legacy-control';sql(fs.readFileSync('supabase/tests/090_legacy_file_authority.sql','utf8'));
  const test=fs.readFileSync('supabase/tests/090_private_file_ticket_authority.sql','utf8');
  const setup=test.split('do $test$')[0];if(!setup.startsWith('-- Disposable')||!setup.includes('begin;'))throw Error('Fixture boundary drift');
  sql(setup+'commit;');sql(`update auth.sessions set not_after=statement_timestamp()-interval '1 minute' where id='${session}'`);
  const baselineExpired=decisions();if(baselineExpired.some(value=>value!==true))throw Error('Baseline defect not reproduced');
  sql(`update auth.sessions set not_after=null where id='${session}'`);
  const before=acl();stage='guard-negatives';
  const delta=fs.readFileSync(DELTA,'utf8');const guard=delta.slice(delta.indexOf('do $preflight$'),delta.indexOf('$preflight$;')+'$preflight$;'.length);
  if(!guard.startsWith('do $preflight$')||!guard.endsWith('$preflight$;'))throw Error('Forward preflight extraction failed');
  sql('create role unexpected_fixture_role nosuperuser;');
  const privateName='genova_090.can_read_private_file(uuid,uuid,uuid,text,uuid)',publicName='public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)';
  const guards=[
    ['wrapper-body',`create or replace function public.private_file_ticket_authorized_090(p_actor_id uuid,p_session_id uuid,p_choir_id uuid,p_family text,p_file_id uuid) returns boolean language sql stable security invoker set search_path='' as 'select true'`],
    ['private-owner',`alter function ${privateName} owner to anon`],
    ['private-search-path',`alter function ${privateName} set search_path=public`],
    ['private-volatility',`alter function ${privateName} volatile`],
    ['public-execute',`grant execute on function ${publicName} to public`],
    ['extra-grantee',`grant execute on function ${privateName} to unexpected_fixture_role`],
  ];
  for(const [name,mutation]of guards){
    sql(`begin;${mutation};do $probe$ declare refused boolean:=false;begin
      begin execute $guard_sql$${guard}$guard_sql$;
      exception when raise_exception then if SQLERRM not like '090 expiry refused%' then raise;end if;refused:=true;end;
      if not refused then raise exception 'Missing forward guard';end if;end $probe$;rollback;`);
    if(JSON.stringify(acl())!==JSON.stringify(before))throw Error('Guard negative escaped rollback: '+name);
  }
  stage='forward';sql('set role postgres;'+delta);
  if(JSON.stringify(acl())!==JSON.stringify(before))throw Error('Authority metadata changed');
  sql(`update auth.sessions set not_after=statement_timestamp()-interval '1 minute' where id='${session}'`);
  if(decisions().some(value=>value!==false))throw Error('Expired session still allowed');
  // Restore the fixture to empty, then execute the actual expanded SQL suite unchanged.
  sql("truncate auth.users,auth.sessions,public.choirs,public.choir_members,public.roles,public.choir_member_roles,genova_005.active_choir_sessions,public.repertoire,public.repertoire_files,public.song_assignments,public.assignments,public.assignment_submissions,public.assignment_submission_file_versions,public.assignment_review_audio_versions,public.repertoire_comment_audio_versions,public.repertoire_song_comments,public.chat_rooms,public.chat_room_members,public.chat_media_versions cascade;");
  stage='expanded-sql';sql(test);sql(fs.readFileSync('supabase/tests/090_legacy_file_authority.sql','utf8'));
  sql(setup+'commit;');
  stage='http';const httpEnv={...env,GENOVA_090_EXPIRY_SOCKET:dir,GENOVA_090_EXPIRY_PORT:String(PORT),GENOVA_090_EXPIRY_DB:DB};
  const child=spawn('/opt/homebrew/bin/deno',['run','--no-config','--cached-only','--node-modules-dir=none','--no-lock',
    '--allow-run='+PG+'psql','--allow-env','--allow-net=127.0.0.1:18190,127.0.0.1:18191',
    'supabase/test-support/090_http_session_expiry.ts'],{env:httpEnv,stdio:['ignore','pipe','pipe']});
  let output='',error='';child.stdout.on('data',chunk=>{output+=chunk;});child.stderr.on('data',chunk=>{error+=chunk;});
  const timer=setInterval(()=>{try{measure();if(output.length+error.length>1024*1024)throw Error();}catch{child.kill('SIGTERM');}},250);
  const deadline=setTimeout(()=>child.kill('SIGTERM'),120000);
  const [code]=await once(child,'exit');clearInterval(timer);clearTimeout(deadline);measure();
  if(code!==0){fs.writeFileSync(dir+'/http-error.log',error,{mode:0o600});throw Error('HTTP test failed');}
  const http=JSON.parse(output.trim());
  if(http.families!==5||!http.passed||!http.providerZeroOnDenial)throw Error('Incomplete HTTP evidence');
  proof={recordedAt:new Date().toISOString(),status:'LOCAL_SYNTHETIC_SERVER_EXPIRY_PASS_NOT_RELEASE',identity,
    baselineRetainedExpiredAllowed:baselineExpired,forwardSha256:DELTA_SHA,authorityMetadataUnchanged:before,
    forwardGuardNegatives:guards.map(([name])=>name),expandedActualSqlPass:true,unchangedLegacyControlPass:true,http,initialFreeKiB,
    boundary:'Actual090/003/060SQL and current readers on synthetic schema/private nativePG17. No managedAuth/POST/PostgREST/RLS/recovered-state/hosted/platform/provider release proof.'};
}catch(error){console.error('090 session expiry failed at '+stage+': '+error.message);process.exitCode=1;}
finally {
  if(dir&&fs.existsSync(dir+'/data/postmaster.pid')){
    const r=spawnSync(PG+'pg_ctl',['stop','-D',dir+'/data','-m','fast','-w','-t','10'],{env,encoding:'utf8',timeout:20000});
    if(r.status!==0){proof=undefined;process.exitCode=1;console.error('Owned cluster stop failed; retain directory');}
  }
  if(dir&&!fs.existsSync(dir+'/data/postmaster.pid')){
    const owner=JSON.parse(fs.readFileSync(dir+'/owner.json'));
    if(path.dirname(dir)!==ROOT+'/spike/090-runtime'||fs.realpathSync(dir)!==dir||owner.owner!=='090-session-expiry-synthetic'||owner.dir!==dir)throw Error('Cleanup ownership refused');
    if(!proof){const logs=['errors.log','http-error.log'].filter(file=>fs.existsSync(dir+'/'+file));
      for(const file of logs)fs.copyFileSync(dir+'/'+file,ROOT+'/spike/090-runtime/session-expiry-failure-'+crypto.randomUUID()+'.log');}
    fs.rmSync(dir,{recursive:true});
    if(proof){proof.resources={peakKiB:peak,capKiB:CAP,ownedRuntimeRemoved:!fs.existsSync(dir),finalFreeKiB:free()};
      proof.pins=[BASE,DELTA,'supabase/tests/090_private_file_ticket_authority.sql','supabase/tests/090_legacy_file_authority.sql',
        'supabase/test-support/090_session_expiry_fixture.sql','supabase/test-support/090_http_session_expiry.ts',import.meta.filename]
        .map(file=>({path:file.startsWith(ROOT+'/')?file.slice(ROOT.length+1):file,sha256:hash(fs.readFileSync(file))}));
      fs.writeFileSync(OUTPUT,JSON.stringify(proof,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(proof));}
  }
}
