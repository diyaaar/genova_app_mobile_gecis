// All decisions are obtained from real Auth/REST/RLS/Edge HTTP, never manufactured.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {DIR, readPrivate, sql, LIMA, CONTAINER, DB, runtimeEnv} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
import {READERS, requireCompleteMatrix} from './090-five-family-contract.mjs';
import {bytesFor} from './090-five-family-media.mjs';
assert.equal(ATTEMPT,'20261010-managed-families');
assert.equal(process.argv[2],'--run-approved');assert.equal(process.argv.length,3);
const prefix=`managed-${ATTEMPT}`,resultFile=path.join(DIR,prefix+'-matrix-v1.json');assert(!fs.existsSync(resultFile));
const config=JSON.parse(readPrivate(prefix+'-config.json')),fixture=JSON.parse(readPrivate(prefix+'-fixture.json'));
assert(fixture.fixtureSqlCommitted&&!fixture.failed);
const owner=JSON.parse(readPrivate('runtime-ownership.json')),ids=fixture.ids,observations=[],media=[],events=[],writers=[];
let peak=measureRuntime(owner).allocatedKiB;
const actualFetch=(url,init)=>{assert.equal(new URL(url).origin,config.api);return fetch(url,{...init,signal:AbortSignal.timeout(30000)});};
const metrics=async()=>{const r=await actualFetch(config.api+'/_test/metrics');assert.equal(r.status,200);return r.json();};
const client=()=>createClient(config.api,config.anon,{auth:{persistSession:false,autoRefreshToken:false}});
const mutate=text=>sql('begin;set role postgres;'+text+';commit;');
const roleDelete=`delete from public.choir_member_roles where choir_id='${ids.choirA}' and member_id='${ids.memberA}' and role_id='${ids.roleA}'`;
const roleRestore=()=>mutate(`insert into public.choir_member_roles(choir_id,member_id,role_id) select '${ids.choirA}','${ids.memberA}','${ids.roleA}' where not exists(select 1 from public.choir_member_roles where member_id='${ids.memberA}' and role_id='${ids.roleA}')`);
const roomDelete=`delete from public.chat_room_members where choir_id='${ids.choirA}' and room_id='${ids.room}' and member_id='${ids.memberA}'`;
const roomRestore=()=>mutate(`insert into public.chat_room_members(choir_id,room_id,member_id,role) select '${ids.choirA}','${ids.room}','${ids.memberA}','admin' where not exists(select 1 from public.chat_room_members where room_id='${ids.room}' and member_id='${ids.memberA}')`);
function ok(error,stage){assert(!error,'Actual local '+stage+' failed');}
async function login(index){const sdk=client(),u=fixture.users[index];const result=await sdk.auth.signInWithPassword({email:u.email,password:u.password});ok(result.error,'password sign-in');
  assert(result.data.session);const token=result.data.session.access_token,c=JSON.parse(Buffer.from(token.split('.')[1],'base64url'));
  assert.equal(c.sub,u.id);assert(c.session_id);assert.equal(c.role,'authenticated');
  const user=await sdk.auth.getUser(token);ok(user.error,'getUser');assert.equal(user.data.user.id,u.id);
  return {sdk,token,session:c.session_id};}
async function choose(account,choir){ok((await account.sdk.rpc('set_active_choir',{p_choir_id:choir})).error,'server choir selection');}
async function observe(reader,scenario,method,url,expected,init={}){
  peak=Math.max(peak,measureRuntime(owner).allocatedKiB);const before=(await metrics()).provider;
  const response=await actualFetch(url,{...init,method}),body=Buffer.from(await response.arrayBuffer()),after=(await metrics()).provider;
  assert.equal(response.status,expected,reader.family+'/'+scenario+'/'+method);
  const row={family:reader.family,scenario,method,status:response.status,providerDelta:after-before,bodyBytes:body.length};
  if(expected===403)assert.equal(row.providerDelta,0,'Denial reached provider');if(method==='HEAD')assert.equal(body.length,0);
  observations.push(row);return {response,body};
}
async function issue(reader,account,fileId,scenario=null){const before=(await metrics()).provider;
  const r=await actualFetch(reader.endpoint,{method:'POST',headers:{authorization:'Bearer '+account.token,apikey:config.anon,'content-type':'application/json'},body:JSON.stringify({fileId})});
  const text=await r.text();assert.equal(r.status,200,'Actual ticket issuance '+reader.family);assert.equal((await metrics()).provider,before);
  if(scenario)observations.push({family:reader.family,scenario,method:'POST',status:r.status,providerDelta:0,bodyBytes:Buffer.byteLength(text)});
  const url=new URL(JSON.parse(text).url,reader.endpoint);assert.equal(url.origin,config.api);assert.equal(url.pathname,new URL(reader.endpoint).pathname);return url.href;
}
const pair=async(r,s,url,status)=>{await observe(r,s,'GET',url,status);await observe(r,s,'HEAD',url,status);};
async function deniedPost(reader,account,fileId,scenario){await observe(reader,scenario,'POST',reader.endpoint,403,{headers:{authorization:'Bearer '+account.token,apikey:config.anon,'content-type':'application/json'},body:JSON.stringify({fileId})});}
async function barrier(action,family){const r=await actualFetch(config.api+'/_test/barrier',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,family})});assert.equal(r.status,200);}
async function held(){for(let i=0;i<100;i++){const r=await actualFetch(config.api+'/_test/barrier');if((await r.json()).waiting===2)return;await new Promise(resolve=>setTimeout(resolve,30));}throw Error('Both real authority requests did not reach barrier');}
function writer(){const child=spawn(LIMA,['shell','g090p3','sudo','docker','exec','-i','-e','PGPASSWORD=090-synthetic-local-only',CONTAINER,'psql','-X','-Atq','-w','-v','ON_ERROR_STOP=1','-U','supabase_admin','-d',DB],{env:runtimeEnv,stdio:['pipe','pipe','pipe']});
  writers.push(child);let output='',pending=null;const errorFile=path.join(DIR,prefix+'-writer-'+writers.length+'.log');
  child.stderr.on('data',b=>fs.appendFileSync(errorFile,b,{mode:0o600}));child.stdout.on('data',b=>{output+=b; if(pending&&output.includes(pending.marker)){const done=pending;pending=null;output='';clearTimeout(done.timer);done.resolve();}});
  child.on('exit',()=>{if(pending){clearTimeout(pending.timer);pending.reject(Error('Actual writer ended before acknowledgement'));pending=null;}});
  return {async send(statement,marker){assert(!pending);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{pending=null;reject(Error('Writer acknowledgement deadline'));},10000);pending={marker,resolve,reject,timer};child.stdin.write(statement+`;select '${marker}';\n`);});},async close(){child.stdin.end();await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);});}};
}
try{
  const outsider=await login(1);await choose(outsider,ids.choirB);
  for(const reader of READERS){
    const account=await login(0);await choose(account,ids.choirA);roleRestore();roomRestore();
    const primary={ 'repertoire-file':ids.score,'assignment-file':ids.assignmentFile,'assignment-review-file':ids.reviewFile,'repertoire-comment-file':ids.commentFile,'chat-media-file':ids.chatFile }[reader.family];
    const url=await issue(reader,account,primary,'issuance'),file=fixture.files.find(f=>f.id===primary),bytes=bytesFor(file.mime);
    const full=await observe(reader,'full','GET',url,200);assert.equal(full.response.headers.get('content-type'),file.mime);
    assert.equal(full.body.length,bytes.length);assert.equal(createHash('sha256').update(full.body).digest('hex'),file.sha256);
    const head=await observe(reader,'full','HEAD',url,200);assert.equal(Number(head.response.headers.get('content-length')),bytes.length);
    const ranged=await observe(reader,'range','GET',url,206,{headers:{range:'bytes=5-17'}});assert.deepEqual(ranged.body,bytes.subarray(5,18));
    const rangeHead=await observe(reader,'range','HEAD',url,206,{headers:{range:'bytes=1-4'}});assert.equal(rangeHead.response.headers.get('content-length'),'4');
    media.push({family:reader.family,mime:file.mime,checksumMatch:true,fullBytes:bytes.length,rangeBytes:13,headRangeBytes:4});
    await deniedPost(reader,outsider,primary,'outsider-b');
    await choose(account,ids.choirB);await deniedPost(reader,account,primary,'selected-b');await pair(reader,'selected-b',url,403);await choose(account,ids.choirA);
    mutate(`update public.choir_members set is_active=false where id='${ids.memberA}'`);await pair(reader,'inactive-member',url,403);
    mutate(`update public.choir_members set is_active=true where id='${ids.memberA}'`);await choose(account,ids.choirA);
    mutate(`update auth.sessions set not_after=statement_timestamp()-interval '1 minute' where id='${account.session}'`);await pair(reader,'session-expiry',url,403);
    mutate(`update auth.sessions set not_after=null where id='${account.session}'`);
    mutate(roleDelete);await pair(reader,'chef-loss',url,reader.chefLossStatus);
    let independent=primary;
    if(reader.family==='repertoire-file')mutate(`insert into public.song_assignments(choir_id,song_id,member_id) values('${ids.choirA}','${ids.songA}','${ids.memberA}')`);
    else if(reader.family==='assignment-file')independent=ids.ownFile;
    else if(reader.family==='assignment-review-file')independent=ids.ownReview;
    else if(reader.family==='repertoire-comment-file')independent=ids.openCommentFile;
    await pair(reader,'independent-grant',await issue(reader,account,independent),200);
    if(reader.family==='repertoire-file')mutate(`delete from public.song_assignments where song_id='${ids.songA}' and member_id='${ids.memberA}'`);
    if(reader.family==='chat-media-file')mutate(roomDelete);
    await pair(reader,'effective-family-authority-loss',url,403);roleRestore();roomRestore();
    for(const change of ['selection','membership','effective-family-authority']){
      const statement=change==='selection'?`update genova_005.active_choir_sessions set choir_id='${ids.choirB}' where session_id='${account.session}'`:
        change==='membership'?`update public.choir_members set is_active=false where id='${ids.memberA}'`:reader.family==='chat-media-file'?roomDelete:roleDelete;
      const w=writer();await w.send("begin;set local lock_timeout='2s';set local statement_timeout='8s';set local role postgres;"+statement,'090_WRITER_READY');
      events.push({family:reader.family,change,phase:'writer-uncommitted-ready',at:new Date().toISOString()});
      await pair(reader,change+':uncommitted',url,200);
      await barrier('arm',reader.family);
      const pending=Promise.all(['GET','HEAD'].map(method=>observe(reader,change+':held-before-authority-after-commit',method,url,403)));
      await held();events.push({family:reader.family,change,phase:'both-http-held-before-real-rpc',at:new Date().toISOString()});
      await w.send('commit','090_WRITER_COMMITTED');events.push({family:reader.family,change,phase:'writer-commit-ack',at:new Date().toISOString()});
      await barrier('release',reader.family);await pending;await pair(reader,change+':committed',url,403);await w.close();
      mutate(`update public.choir_members set is_active=true where id='${ids.memberA}'`);roleRestore();roomRestore();await choose(account,ids.choirA);
    }
    ok((await account.sdk.auth.signOut()).error,'real sign-out');await pair(reader,'sign-out',url,403);
    console.log('PASS '+reader.family+' genuine managed reads, grants, revocations and actual HTTP/COMMIT barriers.');
  }
  ok((await outsider.sdk.auth.signOut()).error,'outsider sign-out');
  const count=requireCompleteMatrix(observations),transport=await metrics();assert.equal(transport.outside,0);
  // This staged producer cannot close acceptance until the separately named
  // media/lifetime/stream/shutdown/secret-custody controls are implemented and run.
  const result={attempt:ATTEMPT,recordedAt:new Date().toISOString(),status:'ACTUAL_FIVE_FAMILY_CORE_MATRIX_PASS_ACCEPTANCE_GAPS_OPEN',acceptanceComplete:false,observations,media,events,
    remaining:['Retained-ticket lifetime controls','Explicit repertoire audio','Hidden own-review denial',
      'In-flight stream boundary','Awaited child shutdown','Five-family ephemeral-secret cleanup'],
    peakAllocatedKiB:peak,genuinePasswordSessions:true,authRestAuthorityMocked:false,onlyProviderBytesSynthetic:true,
    boundary:'Real local Auth/REST/RLS/current Edge HTTP; synthetic signed provider bytes/loopback ingress only. Not hosted/native/fullP3/release proof.'};
  fs.writeFileSync(resultFile,JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify({status:result.status,observations:count,families:5,peakAllocatedKiB:peak}));
}catch(error){for(const child of writers)if(child.exitCode===null)child.kill('SIGTERM');
  fs.writeFileSync(path.join(DIR,prefix+'-matrix-failure.json'),JSON.stringify({at:new Date().toISOString(),observations,media,events,message:error.message},null,2)+'\n',{flag:'wx',mode:0o600});
  console.error('Actual five-family matrix failed; details private, no acceptance.');process.exitCode=1;
}
