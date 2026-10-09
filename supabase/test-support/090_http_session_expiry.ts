// Real current readers + signed HTTP objects + actual090RPC on synthetic nativePG17.
// Auth/POST/PostgREST transport/full restored schema/RLS are deliberately excluded.
import { AwsClient } from 'npm:aws4fetch@1.0.20';
import { createActualFamilyReaders, familySpecs } from './090_http_families.ts';
import { createRepertoireFileHandler } from '../functions/repertoire-file/handler.ts';
import { fetchR2Object } from '../functions/repertoire-file/r2.ts';
import { createPrivateFileTicketV2, verifyPrivateFileTicketV2 } from '../functions/_shared/private-file-ticket-v2.ts';

const ROOT='/Users/alidiyarduran/Antigravity/genovakorist';
const socket=Deno.env.get('GENOVA_090_EXPIRY_SOCKET')??'';
const DB=Deno.env.get('GENOVA_090_EXPIRY_DB'),port=Deno.env.get('GENOVA_090_EXPIRY_PORT');
function check(value:unknown,stage:string):asserts value {if(!value)throw Error('090 expiry HTTP: '+stage);}
check(socket.startsWith(ROOT+'/spike/090-runtime/session-expiry-')&&!socket.includes('..')&&DB==='genova_090_session_expiry'&&port==='58192','scope');
const PSQL='/opt/homebrew/opt/postgresql@17/bin/psql';
const args=['-XAtq','-w','-h',socket,'-p',port,'-U','fixture_admin','-d',DB,'-v','ON_ERROR_STOP=1'];
const pgEnv={PGOPTIONS:'-c statement_timeout=5000',LANG:'C',LC_ALL:'C'};
const encoder=new TextEncoder(),decoder=new TextDecoder();
async function sql(statement:string,asService=false){
  const result=await new Deno.Command(PSQL,{args:[...args,'-c',`set role ${asService?'service_role':'postgres'};${statement}`],
    clearEnv:true,env:pgEnv,stdout:'piped',stderr:'piped'}).output();
  check(result.success,'SQL command refused (details withheld)');return decoder.decode(result.stdout).trim();
}
check(await sql("select current_database()='genova_090_session_expiry' and inet_server_addr() is null")==='t','private actual SQL');
const actor='10000000-0000-4000-8000-000000000090',session='11000000-0000-4000-8000-000000000090';
const choir='20000000-0000-4000-8000-000000000090',file='51000000-0000-4000-8000-000000000090';
const pdf=encoder.encode('%PDF-1.4\nSynthetic transport fixture only\n%%EOF');
const specs=[{family:'repertoire-file' as const,file,bytes:pdf,mime:'application/pdf',table:'repertoire_file_storage_locations',
  key:`choirs/${choir}/repertoire/${file}/score.pdf`},...familySpecs];
const ticketSecret=crypto.randomUUID(),access='090EXPIRYLOCAL',secret=crypto.randomUUID();
const hash=async(bytes:Uint8Array|string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',
  typeof bytes==='string'?encoder.encode(bytes):new Uint8Array(bytes)))).map(n=>n.toString(16).padStart(2,'0')).join('');
// Own synthetic metadata only. This is not proof of production immutable-write rules.
for(const spec of specs){const digest=await hash(spec.bytes);
  if(spec.family==='repertoire-file')await sql(`insert into public.repertoire_file_storage_locations values(
    '${file}','${choir}','r2','genova-private','${spec.key}',${spec.bytes.length},'application/pdf','${digest}',clock_timestamp(),true)`);
  else await sql(`update public.${spec.table} set object_key='${spec.key}',content_length=${spec.bytes.length},sha256_hex='${digest}' where id='${spec.file}'`);
}
function deferred(){let resolve!:()=>void;const promise=new Promise<void>(r=>{resolve=r;});return{promise,resolve};}
async function bounded<T>(promise:Promise<T>){let timer:ReturnType<typeof setTimeout>|undefined;
  try{return await Promise.race([promise,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Barrier timeout')),5000);})]);}
  finally{clearTimeout(timer);}}
const peer=new Deno.Command(PSQL,{args,clearEnv:true,env:pgEnv,stdin:'piped',stdout:'piped',stderr:'piped'}).spawn();
const writer=peer.stdin.getWriter(),acks=new Map<string,ReturnType<typeof deferred>>();let counter=0;
const outDrain=(async()=>{let pending='';for await(const chunk of peer.stdout){pending+=decoder.decode(chunk,{stream:true});
  const lines=pending.split('\n');pending=lines.pop()!;for(const line of lines)acks.get(line.trim())?.resolve();}})();
const errDrain=(async()=>{for await(const _chunk of peer.stderr){/* no raw statements/errors */}})();
async function peerSql(statement:string){const key='EXPIRY_ACK_'+(++counter),done=deferred();acks.set(key,done);
  await writer.write(encoder.encode(`${statement};select '${key}';\n`));await bounded(done.promise);acks.delete(key);}
let gate:{reached:ReturnType<typeof deferred>;release:ReturnType<typeof deferred>}|null=null;
async function beforeAuthority(){if(gate){gate.reached.resolve();await bounded(gate.release.promise);}}
const hmac=async(key:string|Uint8Array,text:string)=>new Uint8Array(await crypto.subtle.sign('HMAC',
  await crypto.subtle.importKey('raw',typeof key==='string'?encoder.encode(key):new Uint8Array(key),{name:'HMAC',hash:'SHA-256'},false,['sign']),encoder.encode(text)));
let providerHits=0,providerFailures=0;
const providerAbort=new AbortController(),edgeAbort=new AbortController();
const objectServer=Deno.serve({hostname:'127.0.0.1',port:18191,signal:providerAbort.signal,onListen(){}},async request=>{
  try{const url=new URL(request.url),spec=specs.find(s=>url.pathname==='/genova-private/'+s.key);
    check(spec&&url.origin==='http://127.0.0.1:18191'&&!url.search,'object target');
    const envelope=request.headers.get('authorization')?.match(/^AWS4-HMAC-SHA256 Credential=([^,]+), SignedHeaders=([^,]+), Signature=([a-f0-9]{64})$/);
    check(envelope,'AWS4 envelope');const[key,date,region,service,end]=envelope[1].split('/');
    check(key===access&&region==='auto'&&service==='s3'&&end==='aws4_request','AWS4 scope');
    const headers=envelope[2].split(';').map(name=>`${name}:${request.headers.get(name)?.trim().replace(/\s+/g,' ')??''}\n`).join('');
    const canonical=`${request.method}\n${url.pathname}\n\n${headers}\n${envelope[2]}\n${request.headers.get('x-amz-content-sha256')??await hash('')}`;
    const signingKey=await hmac(await hmac(await hmac(await hmac('AWS4'+secret,date),region),service),end);
    const signature=await hmac(signingKey,`AWS4-HMAC-SHA256\n${request.headers.get('x-amz-date')}\n${date}/${region}/${service}/${end}\n${await hash(canonical)}`);
    check(Array.from(signature).map(x=>x.toString(16).padStart(2,'0')).join('')===envelope[3],'AWS4 signature');
    providerHits++;const range=request.headers.get('range')?.match(/^bytes=(\d+)-(\d+)$/);
    const bytes=range?spec.bytes.subarray(Number(range[1]),Number(range[2])+1):spec.bytes;
    return new Response(request.method==='HEAD'?null:new Uint8Array(bytes),{status:range?206:200,headers:{
      'content-type':spec.mime,'content-length':String(bytes.length),...(range?{'content-range':`bytes ${range[1]}-${range[2]}/${spec.bytes.length}`}:{})}});
  }catch{providerFailures++;return new Response('Synthetic transport rejected',{status:500});}
});
const aws=new AwsClient({accessKeyId:access,secretAccessKey:secret,service:'s3',region:'auto',retries:0});
const repertoire=createRepertoireFileHandler({storageMode:'r2-required',authorize(){throw Error('Auth/POST excluded');},
  async authorizeTicket(ticket){await beforeAuthority();return await sql(`select public.private_file_ticket_authorized_090(
    '${ticket.actorId}','${ticket.sessionId}','${ticket.choirId}','repertoire-file','${ticket.fileId}')`,true)==='t';},
  async loadTicketFile({fileId,choirId}){return JSON.parse(await sql(`select row_to_json(f) from public.repertoire_files f where id='${fileId}' and choir_id='${choirId}'`,true)||'null');},
  async loadR2Location({fileId,choirId}){return JSON.parse(await sql(`select row_to_json(f) from public.repertoire_file_storage_locations f where repertoire_file_id='${fileId}' and choir_id='${choirId}' and is_active`,true)||'null');},
  createTicket:input=>createPrivateFileTicketV2('repertoire-file',input,ticketSecret),
  verifyTicket:token=>verifyPrivateFileTicketV2('repertoire-file',token,ticketSecret),
  fetchDrive(){throw Error('No fallback');},fetchStorage(){throw Error('No fallback');},
  fetchR2({location,method,range}){return fetchR2Object({accountId:'0123456789abcdef0123456789abcdef',jurisdiction:'',bucket:location.bucket,
    objectKey:location.object_key,method,range:range??undefined,signedFetch:(input,options)=>aws.fetch(input,options),
    testEndpoint:'http://127.0.0.1:18191',allowInsecureLoopback:true});},
});
const actual=await createActualFamilyReaders({sql,beforeAuthority,ticketSecret,access,secret});
let handler:(request:Request)=>Response|Promise<Response>=repertoire;
const edgeServer=Deno.serve({hostname:'127.0.0.1',port:18190,signal:edgeAbort.signal,onListen(){}},request=>handler(request));
const observations:unknown[]=[];
let observationFamily='repertoire-file',scenario='initial';
async function read(url:string,method:string,status:number,range=false){const before=providerHits;
  const response=await fetch(url,{method,headers:range?{range:'bytes=1-4'}:{},signal:AbortSignal.timeout(5000)});
  const bytes=new Uint8Array(await response.arrayBuffer());check(response.status===status,'HTTP status '+response.status+' expected '+status);
  check(providerHits-before===(status===200||status===206?1:0),'provider denial boundary');
  observations.push({family:observationFamily,scenario,method,status,range,providerDelta:providerHits-before,bytes:bytes.length});return bytes;}
try{
  for(const spec of specs){handler=spec.family==='repertoire-file'?repertoire:actual.handlers.get(spec.family)!;check(handler,'current reader');
    observationFamily=spec.family;
    const issued=await createPrivateFileTicketV2(spec.family,{actorId:actor,sessionId:session,choirId:choir,fileId:spec.file},ticketSecret);
    const url=`http://127.0.0.1:18190/?fileId=${spec.file}&ticket=${issued.token}`;
    const start=observations.length;
    for(const expiry of ['null',"statement_timestamp()+interval '1 hour'"]){
      scenario=expiry==='null'?'null-expiry':'future-expiry';
      await sql(`update auth.sessions set not_after=${expiry} where id='${session}'`);
      check(await hash(await read(url,'GET',200))===await hash(spec.bytes),'full checksum');
      await read(url,'HEAD',200);check(await hash(await read(url,'GET',206,true))===await hash(spec.bytes.subarray(1,5)),'Range bytes');
    }
    scenario='retained-expired-valid-ticket';
    await sql(`update auth.sessions set not_after=statement_timestamp()-interval '1 minute' where id='${session}'`);
    check(await verifyPrivateFileTicketV2(spec.family,issued.token,ticketSecret)!==null,'ticket still valid independently');
    check(await sql(`select count(*) from auth.sessions where id='${session}'`)==='1','expired row retained');
    await read(url,'GET',403);await read(url,'HEAD',403);
    await sql(`update auth.sessions set not_after=null where id='${session}'`);
    const expired=await createPrivateFileTicketV2(spec.family,{actorId:actor,sessionId:session,choirId:choir,fileId:spec.file},ticketSecret,1,Date.now()-60000);
    const expiredUrl=`http://127.0.0.1:18190/?fileId=${spec.file}&ticket=${expired.token}`;
    scenario='expired-ticket-live-session';await read(expiredUrl,'GET',401);await read(expiredUrl,'HEAD',401);
    // Two connections: readers see null while the peer expiry update is uncommitted.
    await peerSql(`begin;update auth.sessions set not_after=statement_timestamp()-interval '1 minute' where id='${session}'`);
    scenario='peer-expiry-uncommitted';await read(url,'GET',200);await read(url,'HEAD',200);await peerSql('commit');
    scenario='peer-expiry-committed';
    await read(url,'GET',403);await read(url,'HEAD',403);
    await sql(`update auth.sessions set not_after=null where id='${session}'`);
    await peerSql(`begin;update auth.sessions set not_after=statement_timestamp()-interval '1 minute' where id='${session}'`);
    scenario='request-held-until-after-commit';gate={reached:deferred(),release:deferred()};const waiting=read(url,'GET',403);
    await bounded(gate.reached.promise);await peerSql('commit');gate.release.resolve();await waiting;gate=null;
    // In one old transaction, expiry is strictly after transaction start but
    // before a subsequent statement. No sleep or wall-clock rounding assumption.
    await peerSql(`begin;update auth.sessions set not_after=transaction_timestamp()+(clock_timestamp()-transaction_timestamp())/2 where id='${session}'`);
    await peerSql(`do $assert$ begin if not exists(select 1 from auth.sessions where id='${session}' and not_after>transaction_timestamp() and not_after<statement_timestamp()) then raise exception 'clock ordering missing';end if;end $assert$`);
    await peerSql(`set local role service_role;do $assert$ begin if public.private_file_ticket_authorized_090('${actor}','${session}','${choir}','${spec.family}','${spec.file}') then raise exception 'old transaction retained authority';end if;end $assert$`);
    await peerSql('rollback');await sql(`update auth.sessions set not_after=null where id='${session}'`);
    // Cross-actor and cross-choir signed identities stay denied independently.
    for(const identity of [{actorId:'10000000-0000-4000-8000-000000000091',choirId:choir},
      {actorId:actor,choirId:'20000000-0000-4000-8000-000000000091'}]){
      scenario=identity.actorId===actor?'foreign-choir':'foreign-actor';
      const foreign=await createPrivateFileTicketV2(spec.family,{...identity,sessionId:session,fileId:spec.file},ticketSecret);
      await read(`http://127.0.0.1:18190/?fileId=${spec.file}&ticket=${foreign.token}`,'GET',403);
    }
    check(observations.length-start===17,'complete per-family controls');
  }
  check(providerFailures===0,'signed provider verification');
  console.log(JSON.stringify({passed:true,families:5,reads:observations.length,providerZeroOnDenial:true,
    nullFutureFullHeadRange:true,retainedExpiredValidTicket:true,ticketExpiryDistinct401:true,
    actualPeerCommitBoundary:true,heldNextRequestDenied:true,longTransactionStatementTime:true,foreignIdentityDenied:true,
    providerHits,providerFailures,observations,
    boundary:'Current actual reader handlers/indices and SQL service RPC, synthetic schema/Auth+PostgREST seam/signed loopback objects; no hosted or platform proof.'}));
}finally{
  actual.cleanup();edgeAbort.abort();providerAbort.abort();await Promise.allSettled([edgeServer.finished,objectServer.finished]);
  await writer.write(encoder.encode('rollback;\n\\q\n')).catch(()=>{});await writer.close().catch(()=>{});
  await bounded(peer.status);await Promise.all([outDrain,errDrain]);
}
