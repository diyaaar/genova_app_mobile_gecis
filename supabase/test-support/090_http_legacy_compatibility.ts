// Real loopback HTTP/actual Edge index + Next adapter + service SQL. Auth/provider/API transport
// are explicit synthetic adapters; not hosted Auth/PostgREST/Drive/browser acceptance.
import process from 'node:process';
import { issueLegacyFileUrl, readLegacyFile } from '../../lib/server/legacy-file-adapter.ts';
const HOST='unix:///Users/alidiyarduran/.lima/genova090r1/sock/docker.sock';
const CONTAINER='genova090r1-db';
const DB='genova_090_r1_test';
const EDGE='http://127.0.0.1:18194';
const PROVIDER='http://127.0.0.1:18195';
const ORIGIN='https://project.supabase.co';
const ACTOR='10000000-0000-4000-8000-000000000090';
const SESSION='11000000-0000-4000-8000-000000000090';
const CHOIR='20000000-0000-4000-8000-000000000090';
const secret=crypto.randomUUID();
const encode=(value:string)=>btoa(value).replaceAll('+','-').replaceAll('/','_').replace(/=+$/u,'');
const token=encode('{}')+'.'+encode(JSON.stringify({sub:ACTOR,session_id:SESSION,exp:Math.floor(Date.now()/1000)+3600}))+'.synthetic';
let providerHits=0, authorityCalls=0;
function check(value:unknown,stage:string):asserts value {if(!value)throw Error('090 legacy HTTP failed: '+stage);}
const cleaning=Deno.args[0]==='--cleanup-owned-http-fixture';
check(Deno.args.length===1&&(cleaning||Deno.args[0]==='--owned-offline'),'explicit scope');
async function docker(args:string[],input?:string) {
  const command=new Deno.Command('/opt/homebrew/bin/docker',{args:['--host',HOST,...args],
    stdin:input===undefined?'null':'piped',stdout:'piped',stderr:'piped'}).spawn();
  if(input!==undefined){const writer=command.stdin.getWriter();await writer.write(new TextEncoder().encode(input));await writer.close();}
  const result=await command.output();
  if(!result.success) {
    const safe=new TextDecoder().decode(result.stderr).split('\n').find(line=>line.startsWith('ERROR:'));
    throw Error('090 owned SQL refused (DETAIL/context omitted): '+(safe??'no safe message'));
  }
  return new TextDecoder().decode(result.stdout).trim();
}
const target=JSON.parse(await docker(['inspect',CONTAINER]))[0];
check(target.Config.Image==='supabase/postgres@sha256:c54d587019323cb7a4264dca3148888fb8697c6b950d82638f64bb952fac8b00'
  &&target.HostConfig.NetworkMode==='none'&&target.Mounts.length===0
  &&Object.keys(target.HostConfig.PortBindings??{}).length===0,'exact disconnected DB');
const parity=JSON.parse(await Deno.readTextFile('/Users/alidiyarduran/Documents/Codex/2026-10-02/genova-090-r1-5bfGvo/legacy-authority-mutations.json'));
check(parity.status==='LEGACY_ACTUAL_ROLES_AND_CURRENT_AUTHORITY_PASS'&&parity.mutations.length===6,'SQL prerequisite');
async function sql(text:string) {
  return docker(['exec','-i','-e','PGPASSWORD=090-synthetic-local-only',CONTAINER,'psql','-X','-Atq','-w',
    '-U','supabase_admin','-d',DB,'-v','ON_ERROR_STOP=1'],'set role postgres;\n'+text);
}
check(await sql(`select current_database()='${DB}' and current_setting('server_version_num') like '17%'`)==='t','database identity');
const fixture=await Deno.readTextFile('supabase/tests/090_legacy_file_authority.sql');
const end=fixture.indexOf('-- Every behavior assertion');check(end>0,'fixture boundary');
const tenants=`('${CHOIR}','20000000-0000-4000-8000-000000000091')`;
async function cleanupFixture() {
  // Tenant foreign keys intentionally RESTRICT parent deletion. Remove only task-owned
  // synthetic children in dependency order, never disable guards or touch baseline rows.
  await sql(`begin;
    delete from public.assignment_submission_private_notes where choir_id in ${tenants};
    delete from public.assignment_submissions where choir_id in ${tenants};
    delete from public.assignments where choir_id in ${tenants};
    delete from public.repertoire_song_comments where choir_id in ${tenants};
    delete from public.song_assignments where choir_id in ${tenants};
    delete from public.repertoire_files where choir_id in ${tenants};
    delete from public.repertoire where choir_id in ${tenants};
    delete from public.choir_member_roles where choir_id in ${tenants};
    delete from public.roles where choir_id in ${tenants};
    delete from genova_005.active_choir_sessions where choir_id in ${tenants};
    delete from public.choir_members where choir_id in ${tenants};
    -- Repertoire triggers create cache counters for fixture choirs, even after child deletion.
    delete from public.repertoire_cache_versions where choir_id in ${tenants};
    delete from public.choirs where id in ${tenants};
    delete from auth.users where id in('${ACTOR}','10000000-0000-4000-8000-000000000091');commit;`);
}
if(cleaning){await cleanupFixture();console.log('PASS owned synthetic HTTP fixture cleanup');Deno.exit(0);}
await sql(fixture.slice(0,end)+'\ncommit;');
const rawFetch=globalThis.fetch, rawServe=Deno.serve;
type Handler=(request:Request)=>Response|Promise<Response>;
let actual:Handler|undefined;
const uu=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/u;
const env={SUPABASE_URL:'http://127.0.0.1:18196',SUPABASE_SERVICE_ROLE_KEY:secret,
  SUPABASE_ANON_KEY:'synthetic-public-key',NEXT_PUBLIC_SUPABASE_URL:ORIGIN};
const prior=Object.fromEntries(Object.keys(env).map(key=>[key,Deno.env.get(key)]));
for(const [key,value] of Object.entries(env))Deno.env.set(key,value);
process.env.NEXT_PUBLIC_SUPABASE_URL=ORIGIN;
const provider=rawServe({hostname:'127.0.0.1',port:18195,onListen(){}},()=>{
  providerHits++;return new Response('abcdef',{headers:{'Content-Type':'application/pdf'}});
});
globalThis.fetch=async(input,init)=>{
  const request=new Request(input,init),url=new URL(request.url);
  if(url.origin==='http://127.0.0.1:18196') {
    const bearer=request.headers.get('authorization');
    if(url.pathname==='/auth/v1/user') {
      check(request.method==='GET'&&bearer===`Bearer ${token}`,'synthetic Auth request');
      return Response.json({id:ACTOR,aud:'authenticated',role:'authenticated'});
    }
    if(url.pathname==='/rest/v1/rpc/current_choir_id') {
      check(request.method==='POST'&&bearer===`Bearer ${token}`,'user choir request');
      const claims=JSON.stringify({sub:ACTOR,session_id:SESSION,role:'authenticated'});
      const data=await sql(`begin;set local role authenticated;
        set local request.jwt.claims='${claims}';select coalesce(to_json(public.current_choir_id())::text,'null');rollback;`);
      return new Response(data,{headers:{'Content-Type':'application/json'}});
    }
    const object='assignment-submissions/60000000-0000-4000-8000-000000000090/30000000-0000-4000-8000-000000000092/take.wav';
    if(url.pathname===`/storage/v1/object/info/${object}`||url.pathname===`/storage/v1/object/${object}`) {
      check(request.method==='GET'&&bearer===`Bearer ${secret}`&&request.headers.get('apikey')===secret,'exact private Storage transport');
      return url.pathname.includes('/object/info/')
        ?Response.json({content_type:'audio/wav'}):rawFetch(PROVIDER);
    }
    check(url.pathname==='/rest/v1/rpc/resolve_legacy_file_090'&&request.method==='POST'
      &&bearer===`Bearer ${secret}`&&request.headers.get('apikey')===secret,'service authority request');
    const body=await request.json();
    check(Object.keys(body).sort().join(',')==='p_actor_id,p_alias,p_choir_id,p_kind,p_resource_id,p_session_id','exact RPC arguments');
    for(const key of ['p_actor_id','p_session_id','p_choir_id'])check(uu.test(body[key]),'UUID argument');
    check(/^[A-Za-z0-9_-]{1,256}$/u.test(body.p_alias),'alias argument');
    check(body.p_kind===null||['repertoire','submission','comment','review','private-review'].includes(body.p_kind),'kind argument');
    check(body.p_resource_id===null||uu.test(body.p_resource_id),'resource argument');
    const literal=(value:string|null)=>value===null?'null':`'${value}'`;
    const data=JSON.parse(await sql(`begin;set local role service_role;
      select json_build_object('caller',current_user,'data',public.resolve_legacy_file_090(
        '${body.p_actor_id}','${body.p_session_id}','${body.p_choir_id}','${body.p_alias}',
        ${literal(body.p_kind)},${literal(body.p_resource_id)}));rollback;`));
    check(data.caller==='service_role','actual RPC caller');authorityCalls++;
    return Response.json(data.data);
  }
  if(url.origin===ORIGIN) {
    check(url.pathname==='/functions/v1/legacy-file','only fixed Edge path');
    return rawFetch(new Request(EDGE+url.pathname+url.search,request));
  }
  if(url.origin==='https://drive.google.com') {
    check(url.pathname==='/uc'&&url.searchParams.get('export')==='download'
      &&/^legacy_/u.test(url.searchParams.get('id')??''),'exact synthetic Drive mapping');
    return rawFetch(PROVIDER);
  }
  check(url.origin===EDGE||url.origin===PROVIDER,'no external fallback');
  return rawFetch(request);
};
Deno.serve=((_options:unknown,handler:Handler)=>{check(!actual&&typeof handler==='function','index registration');actual=handler;return {};}) as typeof Deno.serve;
let server:ReturnType<typeof Deno.serve>|undefined;
let output:Record<string,unknown>|undefined;
try {
  await import('../functions/legacy-file/index.ts');check(actual,'actual entrypoint loaded');
  Deno.serve=rawServe;
  server=rawServe({hostname:'127.0.0.1',port:18194,onListen(){}},request=>{
    const url=new URL(request.url);return actual!(new Request(ORIGIN+url.pathname+url.search,request));
  });
  const observations=[];
  await sql(`update public.assignment_submissions set drive_download_link=
    'storage://assignment-submissions/60000000-0000-4000-8000-000000000090/30000000-0000-4000-8000-000000000092/take.wav'
    where id='61000000-0000-4000-8000-000000000090';`);
  const kinds=['repertoire','submission','review','comment','private-review'];
  for(const [i,alias] of ['legacy_repertoire','legacy_submission','legacy_review','legacy_comment','legacy_review'].entries()) {
    if(kinds[i]==='private-review')await sql(`update public.assignment_submissions set is_reviewer_note_hidden=true,
      reviewer_audio_drive_file_id=null,reviewer_audio_file_name=null,reviewer_audio_mime_type=null
      where id='61000000-0000-4000-8000-000000000090';`);
    const response=await issueLegacyFileUrl(new Request('https://web.test/api/drive-file-token',{
      method:'POST',headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({driveFileId:alias,fileName:'untrusted.html',mimeType:'text/html'}),
    }));
    check(response.status===200,'old POST '+alias);
    const payload=await response.json();check(payload.url.startsWith(`/api/drive-file/${alias}?token=`),'relative old URL');
    const get=await readLegacyFile(new Request('https://web.test'+payload.url,{headers:{Range:'bytes=1-3'}}),alias,'GET');
    check(get.status===206&&await get.text()==='bcd'&&get.headers.get('content-range')==='bytes 1-3/6','Range '+alias);
    const head=await readLegacyFile(new Request('https://web.test'+payload.url),alias,'HEAD');
    check(head.status===200&&head.headers.get('content-length')==='6'&&await head.text()==='','HEAD '+alias);
    observations.push({alias,kind:kinds[i],provider:kinds[i]==='submission'?'Storage':'Drive',post:200,get:206,head:200,url:payload.url});
  }
  const before=providerHits;
  await sql(`update public.choir_members set is_active=false where id='30000000-0000-4000-8000-000000000090';`);
  for(const item of observations)for(const method of ['GET','HEAD'] as const) {
    const response=await readLegacyFile(new Request('https://web.test'+item.url),item.alias,method);
    check(response.status===403,'next request after committed revoke '+method);
  }
  check(providerHits===before,'revoked provider attempts zero');
  output={recordedAt:new Date().toISOString(),status:'LOCAL_HTTP_ACTUAL_INDEX_NEXT_SQL_PASS',
    observations:observations.map(({url:_,...item})=>item),authorityCalls,providerHits,
    deniedAfterCommittedRevoke:10,deniedProviderAttempts:0,
    limit:'Real loopback HTTP and actual index/SDK/Next adapter/service SQL. Explicit synthetic Auth, RPC transport and Drive provider; not real PostgREST/Auth/browser/Drive ACL.'};
} finally {
  globalThis.fetch=rawFetch;Deno.serve=rawServe;
  if(server)await server.shutdown();await provider.shutdown();
  // Exact synthetic fixture IDs only; the protected baseline and original 068 are untouched.
  await cleanupFixture();
  for(const [key,value] of Object.entries(prior))value===undefined?Deno.env.delete(key):Deno.env.set(key,value);
}
check(output,'completed HTTP checks');
output.cleanup='PASS: exact synthetic children/parents removed transactionally';
await Deno.writeTextFile('docs/reports/090/2026-10-02-legacy-http-compatibility.json',JSON.stringify(output,null,2),{createNew:true});
console.log(JSON.stringify(output));
