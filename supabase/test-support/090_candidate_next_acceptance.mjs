// Real production-mode Next baseline/candidate, real React/SW/PDF/WAV, actual
// Next candidate routes + adapter + legacy handler/HMAC. Auth/REST/authority/media
// are synthetic; this is NOT SQL, hosted Auth, native WebView or a deployment.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {createServer,request as httpRequest} from 'node:http';
import {readFileSync,writeFileSync} from 'node:fs';
import {createInterface} from 'node:readline';
import {once} from 'node:events';
import {chromium} from '@playwright/test';
import {ROOT,CANDIDATE,BASELINE_RUNTIME,BASE,hash} from './090_candidate_source.mjs';
assert.equal(process.cwd(),ROOT);
assert.equal(process.argv.length,3);
assert(['--owned-loopback','--candidate-only'].includes(process.argv[2]));
const candidateOnly=process.argv[2]==='--candidate-only';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
const compiled=await build({stdin:{contents:`export {issueLegacyFileUrl,readLegacyFile} from './lib/server/legacy-file-adapter.ts';
export {createLegacyFileHandler} from './supabase/functions/legacy-file/handler.ts';
export {createLegacyTicket,verifyLegacyTicket} from './supabase/functions/legacy-file/ticket.ts';`,resolveDir:ROOT},
bundle:true,platform:'node',format:'esm',write:false});
const impl=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const origin='http://127.0.0.1:18197', edge='https://example.supabase.co/functions/v1/legacy-file';
const uuid=n=>`09000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const actorId=uuid(1),sessionId=uuid(2),choirA=uuid(3),choirB=uuid(4),songId=uuid(5);
const token='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:actorId,session_id:sessionId,
exp:Math.floor(Date.now()/1000)+7200,role:'authenticated'})).toString('base64url')+'.synthetic-signature';
const user={id:actorId,email:'090-next@example.invalid',aud:'authenticated',role:'authenticated',
app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:'2026-10-03T00:00:00Z'};
const session={access_token:token,refresh_token:'090-synthetic-refresh',token_type:'bearer',
expires_in:7200,expires_at:Math.floor(Date.now()/1000)+7200,user};
let activeChoir=choirA,denied=false,expireNext=false,onlyScore=false,phase=candidateOnly?'candidate':'old';
const counters={posts:0,heads:0,gets:0,providers:0,outside:0};
const statuses=[],restRequests=[],errors=[],unknown=[],outsideRequests=[];
const files={
'090-score':{alias:'090-score',fileName:'090 Synthetic.pdf',mimeType:'application/pdf',resourceId:uuid(6),kind:'repertoire',choirId:choirA,sourceLink:null},
'090-audio':{alias:'090-audio',fileName:'090 Synthetic.wav',mimeType:'audio/wav',resourceId:uuid(7),kind:'repertoire',choirId:choirA,sourceLink:null}};
function wave(){const rate=8000,samples=rate*8,b=Buffer.alloc(44+samples*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);
b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);
b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples*2,40);for(let i=0;i<samples;i++)b.writeInt16LE(Math.round(800*Math.sin(i*2*Math.PI*440/rate)),44+i*2);return b;}
function pdf(){const stream='BT /F1 18 Tf 30 100 Td (090 Synthetic score) Tj ET';const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 240 140] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
let body='%PDF-1.4\n';const offsets=[];objects.forEach((o,i)=>{offsets.push(Buffer.byteLength(body));body+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=Buffer.byteLength(body);
body+='xref\n0 6\n0000000000 65535 f \n'+offsets.map(n=>`${String(n).padStart(10,'0')} 00000 n \n`).join('');return Buffer.from(body+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);}
const media={'090-score':pdf(),'090-audio':wave()};
const handler=impl.createLegacyFileHandler({authenticate:async(_a,t)=>t===token?{actorId,sessionId,choirId:activeChoir}:null,
resolve:async input=>!denied&&input.choirId===activeChoir&&files[input.alias]?.choirId===activeChoir&&
(!input.resourceId||input.resourceId===files[input.alias].resourceId)?files[input.alias]:null,
createTicket:input=>impl.createLegacyTicket(input,'090-ephemeral-synthetic-key'),
verifyTicket:async t=>{if(expireNext){expireNext=false;return null;}return impl.verifyLegacyTicket(t,'090-ephemeral-synthetic-key');},
fetchDrive:async alias=>{counters.providers++;return new Response(media[alias],{headers:{'content-type':files[alias].mimeType}});},
fetchStorage:async()=>{throw Error('Unexpected Storage fixture');}});
const originalFetch=globalThis.fetch;
process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='090-synthetic-anon';
globalThis.fetch=(input,init)=>{assert.equal(new URL(String(input)).origin,new URL(edge).origin);return handler(new Request(input,init));};
const sourcePins=JSON.parse(readFileSync(CANDIDATE+'/candidate-source.json','utf8'));
const record={date:new Date().toISOString(),baseline:BASE,candidateChanged:sourcePins.changed,
harnessSha256:hash(readFileSync(import.meta.filename)),scenarios:[],boundary:'Actual full Next web UI and candidate Next routes, adapter, legacy handler/HMAC, SW/PDF/WAV. Synthetic Auth/REST/current authority/provider. NOT SQL/hosted/native/independent release review.',status:'RUNNING'};
const out=ROOT+'/docs/reports/090/2026-10-03-candidate-next'+(candidateOnly?'-candidate-only':'')+'.json';
function redact(text){return String(text).replace(/([?&](?:token|ticket)=)[^&\s"']+/gu,'$1[redacted]').replace(/Bearer\s+\S+/gu,'Bearer [redacted]').slice(0,1800);}
let next,proxy,fixture,browser,activePage,stage='setup';
async function asRequest(req,url){const chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks);return new Request(url,{method:req.method,headers:req.headers,
...(['GET','HEAD'].includes(req.method)?{}:{body})});}
async function send(res,response,method){res.writeHead(response.status,Object.fromEntries(response.headers));res.end(method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));}
async function adapter(req,res){const url=new URL(req.url,origin);let response;
if(url.pathname==='/api/drive-file-token'){counters.posts++;response=await impl.issueLegacyFileUrl(await asRequest(req,url));}
else{counters[req.method==='HEAD'?'heads':'gets']++;response=await impl.readLegacyFile(await asRequest(req,url),url.pathname.split('/').at(-1),req.method);}
statuses.push({phase,method:req.method,status:response.status});await send(res,response,req.method);}
async function startNext(dir){assert(!next);const logs=[];next=spawn(process.execPath,[ROOT+'/node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','18199'],{
cwd:dir,env:{...process.env,GENOVA_090_OWNED_NEXT:'synthetic-loopback-only',APP_URL:origin,
NODE_OPTIONS:'--import='+ROOT+'/supabase/test-support/090_candidate_fetch_bootstrap.mjs',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
next.stdout.on('data',c=>logs.push(redact(c)));next.stderr.on('data',c=>logs.push(redact(c)));
for(let i=0;i<100;i++){if(next.exitCode!==null)throw Error('Owned Next exited '+logs.join(' '));try{const r=await originalFetch('http://127.0.0.1:18199/login');if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}
throw Error('Owned Next startup timeout '+logs.join(' '));}
async function stopNext(){if(!next)return;const child=next;next=null;if(child.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}}
async function listen(server,port){await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});}
async function closeServer(server){if(!server)return;server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
function song(){return {id:songId,title:'090 Sentetik Eser',composer:'Synthetic',drive_folder_id:'090-folder',is_visible:true,created_at:'2026-10-03T00:00:00Z',repertoire_song_tags:[],
repertoire_files:Object.values(files).filter(f=>!onlyScore||f.alias==='090-score').map(f=>({id:f.resourceId,song_id:songId,file_name:f.fileName,file_type:f.alias==='090-score'?'sheet':'audio',partition_label:'Tutti',drive_file_id:f.alias,
drive_web_view_link:'https://drive.google.com/file/d/'+f.alias+'/view',drive_download_link:'https://drive.google.com/uc?id='+f.alias,mime_type:f.mimeType,file_size_bytes:media[f.alias].length,
created_at:'2026-10-03T00:00:00Z',updated_at:'2026-10-03T00:00:00Z',uploaded_by:uuid(8)}))};}
async function rest(route){const req=route.request(),u=new URL(req.url()),name=u.pathname.split('/').at(-1);restRequests.push({method:req.method(),path:u.pathname});let data;
if(u.pathname==='/auth/v1/user')data=user;
else if(u.pathname==='/auth/v1/logout'){await route.fulfill({status:204});return;}
else if(u.pathname==='/rest/v1/rpc/list_my_choirs')data=[choirA,choirB].map((id,i)=>({choir_id:id,member_id:uuid(8+i),choir_name:'090 Sentetik Koro '+(i?'B':'A'),choir_slug:'090-'+i,member_is_active:true,is_current:id===activeChoir}));
else if(u.pathname==='/rest/v1/rpc/set_active_choir'){const id=req.postDataJSON().p_choir_id;assert([choirA,choirB].includes(id));activeChoir=id;data=id;}
else if(name==='choir_members')data={id:activeChoir===choirA?uuid(8):uuid(9),choir_id:activeChoir,auth_user_id:actorId,first_name:'090',last_name:'Synthetic',voice_group:'Soprano',sub_voice_group:null,is_active:true,email:user.email,photo_url:null,schools:null,departments:null,repertoire:null};
else if(name==='choir_member_roles')data=[{roles:{name:'Şef'}}];
else if(name==='repertoire_cache_versions')data={version:1,updated_at:'2026-10-03T00:00:00Z'};
else if(name==='repertoire')data=activeChoir===choirA?[song()]:[];
else if(name==='song_assignments')data=activeChoir===choirA?[{song_id:songId,part_name:'Tutti'}]:[];
else if(['repertoire_tags','repertoire_pdf_annotations','repertoire_song_comments','assignments','song_chef_comments','profile_change_requests','notifications','member_notifications','push_subscriptions','announcements','rehearsals'].includes(name))data=[];
else{unknown.push({method:req.method(),path:u.pathname});await route.abort();return;}
assert(req.method()==='GET'||u.pathname.includes('/rpc/')||u.pathname==='/auth/v1/logout','No synthetic write outside declared RPC');
await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});}
function pass(name,details={}){record.scenarios.push({name,status:'PASS',...details});console.log('PASS '+name);}
async function pdfInk(page){await page.locator('.react-pdf__Page canvas').first().waitFor({state:'visible',timeout:45000});return page.locator('.react-pdf__Page canvas').first().evaluate(c=>{const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return {width:c.width,height:c.height,ink:Array.from(pixels).filter((v,i)=>i%4!==3&&v<100).length};});}
async function play(page){
await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.title==='Oynat'||b.getAttribute('aria-label')==='Müzik oynatıcıyı aç'));
const open=page.getByRole('button',{name:'Müzik oynatıcıyı aç'});if(await open.isVisible())await open.click();
const button=page.getByTitle('Oynat').first();await button.waitFor({timeout:15000});await button.click();
await page.waitForFunction(()=>globalThis.__090Audio?.some(a=>!a.paused&&a.currentTime>0.15));}
async function pause(page){
  for(const name of ['Duraklat','Durdur']){const button=page.getByTitle(name,{exact:true}).first();if(await button.isVisible()){await button.click();break;}}
  await page.waitForFunction(()=>globalThis.__090Audio?.every(a=>a.paused));
}
async function selectedSources(page){return page.evaluate(()=>({audio:(globalThis.__090Audio||[]).map(a=>({src:new URL(a.src||location.href).pathname,paused:a.paused,time:a.currentTime})),
pdf:document.querySelectorAll('.react-pdf__Page canvas').length}));}
try{
fixture=createServer(async(req,res)=>{try{const u=new URL(req.url,edge);assert.equal(u.pathname,'/functions/v1/legacy-file');const canonical=new URL(edge);canonical.search=u.search;
if(phase==='candidate')counters[req.method==='POST'?'posts':req.method==='HEAD'?'heads':'gets']++;
const response=await handler(await asRequest(req,canonical));statuses.push({phase,method:req.method,status:response.status});await send(res,response,req.method);
}catch{res.writeHead(500);res.end('Synthetic fixture failure');}});await listen(fixture,18198);
proxy=createServer(async(req,res)=>{try{if(phase==='old'&&req.url.startsWith('/api/drive-file')){await adapter(req,res);return;}
const upstream=httpRequest({hostname:'127.0.0.1',port:18199,path:req.url,method:req.method,headers:req.headers},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});
upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end();});req.pipe(upstream);
}catch{res.writeHead(500);res.end('Owned proxy failure');}});await listen(proxy,18197);
await startNext(candidateOnly?CANDIDATE:BASELINE_RUNTIME);
browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const context=await browser.newContext({viewport:{width:1280,height:960},serviceWorkers:'allow'});
await context.routeWebSocket('**/*',socket=>socket.close());
await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===origin)return route.continue();if(u.origin==='https://example.supabase.co')return rest(route);
counters.outside++;outsideRequests.push({phase,origin:u.origin,path:u.pathname});return route.abort();});
await context.addInitScript(({session})=>{if(!sessionStorage.getItem('090-seeded')){localStorage.setItem('sb-example-auth-token',JSON.stringify(session));sessionStorage.setItem('090-seeded','yes');}
const NativeAudio=globalThis.Audio;globalThis.__090Audio=[];globalThis.Audio=function(...args){const audio=new NativeAudio(...args);globalThis.__090Audio.push(audio);return audio;};globalThis.Audio.prototype=NativeAudio.prototype;},{session});
await context.addInitScript(()=>{const NativeWorker=globalThis.Worker;globalThis.__090Workers=[];globalThis.Worker=function(...args){const worker=new NativeWorker(...args),entry={path:new URL(String(args[0]),location.href).pathname,terminated:false};globalThis.__090Workers.push(entry);const terminate=worker.terminate.bind(worker);worker.terminate=()=>{entry.terminated=true;return terminate();};return worker;};globalThis.Worker.prototype=NativeWorker.prototype;});
const page=await context.newPage();activePage=page;page.on('pageerror',e=>errors.push(redact(e.message)));page.on('console',m=>{if(m.type()==='error')errors.push(redact(m.text()));});
stage='initial-real-Next-UI';await page.goto(origin+'/repertuvar/'+songId,{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:'090 Sentetik Eser'}).waitFor({timeout:30000});
const ink=await pdfInk(page);assert(ink.ink>0);await play(page);await page.evaluate(()=>{const a=globalThis.__090Audio.find(a=>!a.paused);a.currentTime=1;});
await page.waitForFunction(()=>globalThis.__090Audio.some(a=>!a.paused&&a.currentTime>1.15));await pause(page);
assert(statuses.some(s=>s.method==='GET'&&s.status===206));pass(phase+'-actual-Next-PDF-WAV-play-seek-Range',{ink});
await page.getByRole('switch',{name:'Offline kullanım'}).click();await page.getByText('2 dosya offline kullanıma hazır.',{exact:true}).waitFor({timeout:30000});
await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
const cachePins=await page.evaluate(async()=>{const c=await caches.open('genova-offline-repertoire-files-v1');const requests=await c.keys();return Promise.all(requests.map(async r=>{const b=await(await c.match(r)).arrayBuffer();const d=await crypto.subtle.digest('SHA-256',b);return {path:new URL(r.url).pathname,bytes:b.byteLength,sha256:Array.from(new Uint8Array(d)).map(n=>n.toString(16).padStart(2,'0')).join('')};}));});
assert.equal(cachePins.length,2);assert(cachePins.some(p=>p.sha256===hash(media['090-score'])));assert(cachePins.some(p=>p.sha256===hash(media['090-audio'])));pass('real-SW-offline-cache-integrity',{cachePins});
if(!candidateOnly){stage='old-open-cutover';console.log('OLD_UI_READY; waiting for candidate-ready on stdin');const input=createInterface({input:process.stdin});
for await(const line of input){if(line==='candidate-ready'){input.close();break;}if(line==='abort')throw Error('Owned fixture aborted by driver control');}
await stopNext();phase='candidate';await startNext(CANDIDATE);denied=true;
await context.setOffline(true);await page.waitForFunction(()=>!navigator.onLine);await context.setOffline(false);await page.waitForFunction(()=>navigator.onLine);
const before={...counters};await play(page);await pause(page);const sources=await selectedSources(page);
record.oldOpenObservation={sources,before,after:{...counters},online:await page.evaluate(()=>navigator.onLine)};
assert(sources.audio.some(a=>a.time>0.15));assert.equal(counters.providers,before.providers);
assert.equal(counters.posts,before.posts);assert.equal(counters.heads,before.heads);
record.scenarios.push({name:'actual-old-open-online-buffer-after-server-cutover',contract:'FAIL_REPRODUCED',actuallyPlayed:true,providerDelta:0,newAuthorityRequests:0,limit:'Already downloaded HTMLMediaElement/cache bytes. Old bundle not automatically refreshed; no new online provider access. Source path recorded, not assumed.'});
stage='explicit-candidate-refresh';const beforeRefresh=counters.providers;await page.reload();await page.getByRole('heading',{name:'090 Sentetik Eser'}).waitFor();
await page.waitForFunction(()=>globalThis.__090Audio.every(a=>!a.src||a.paused));await page.waitForTimeout(800);
assert.equal((await selectedSources(page)).pdf,0);assert.equal(counters.providers,beforeRefresh);pass('explicit-refresh-online-denied-cache',{providerDelta:0});
denied=false;await page.reload();await page.getByRole('heading',{name:'090 Sentetik Eser'}).waitFor();assert((await pdfInk(page)).ink>0);await play(page);await pause(page);pass('refreshed-candidate-actual-Next-PDF-audio');
// The earlier denial correctly purged both cache and offline opt-in. Re-authorize
// downloads via the real switch; do not silently reuse revoked fixture bytes.
assert.equal(await page.getByRole('switch',{name:'Offline kullanım'}).getAttribute('aria-checked'),'false');
await page.getByRole('switch',{name:'Offline kullanım'}).click();await page.getByText('2 dosya offline kullanıma hazır.',{exact:true}).waitFor();pass('candidate-authorized-offline-reenable-after-denial-purge');}
stage='401-renewal';const beforeRenew=counters.posts;expireNext=true;
await context.setOffline(true);await page.waitForFunction(()=>!navigator.onLine);await page.waitForFunction(()=>globalThis.__090Audio.some(a=>new URL(a.src||location.href).pathname.startsWith('/offline-drive/')));
await context.setOffline(false);await page.waitForFunction(()=>navigator.onLine);
await page.waitForFunction(()=>globalThis.__090Audio.some(a=>a.src.includes('/api/drive-file/')));await page.waitForTimeout(700);
assert(statuses.some(s=>s.phase==='candidate'&&s.method==='HEAD'&&s.status===401));
assert((await pdfInk(page)).ink>0);await play(page);await pause(page);const settledPosts=counters.posts;await page.waitForTimeout(800);assert.equal(counters.posts,settledPosts);
pass('candidate-multi-consumer-401-recovery-settles',{newPosts:counters.posts-beforeRenew,limit:'Multiple PDF/audio/playlist consumers and shared invalidation. Not a globally single ticket issuance claim; single-consumer check below.'});
const replayUrl=await page.evaluate(()=>globalThis.__090Audio.find(a=>a.src.includes('/api/drive-file/'))?.src);assert(replayUrl);
stage='offline-playback';await context.setOffline(true);await page.waitForFunction(()=>!navigator.onLine);
await page.waitForFunction(()=>globalThis.__090Audio.some(a=>new URL(a.src||location.href).pathname.startsWith('/offline-drive/')));await play(page);await pause(page);
assert((await selectedSources(page)).audio.some(a=>a.src.startsWith('/offline-drive/')));pass('candidate-real-offline-playback');
stage='403-reconnect-stop';denied=true;const beforeDeny={...counters};await context.setOffline(false);await page.waitForFunction(()=>navigator.onLine);await page.waitForTimeout(1000);
assert.equal(counters.providers,beforeDeny.providers);assert.equal(counters.posts,beforeDeny.posts);assert(statuses.some(s=>s.phase==='candidate'&&s.method==='HEAD'&&s.status===403));
assert.equal((await selectedSources(page)).pdf,0);assert((await selectedSources(page)).audio.every(a=>a.paused));pass('candidate-403-stop-online-cache',{providerDelta:0,postDelta:0,headDelta:counters.heads-beforeDeny.heads});
const replay=await page.evaluate(async url=>{const statuses=[];for(const method of ['GET','HEAD']){const response=await fetch(url,{method,cache:'no-store',headers:{Range:'bytes=0-15'}});statuses.push(response.status);}return statuses;},replayUrl);
assert.deepEqual(replay,[403,403]);assert.equal(counters.providers,beforeDeny.providers);pass('actual-Next-issued-URL-replay-revoked-GET-HEAD',{statuses:replay,providerDelta:0});
const workers=await page.evaluate(()=>globalThis.__090Workers.filter(w=>w.path.includes('pdf.worker')));assert.equal(workers.length,1);assert.equal(workers[0].terminated,false);pass('same-page-PDF-worker-retained-across-source-transitions',{workers});
await context.close();denied=false;onlyScore=true;stage='single-consumer-401';
const single=await browser.newContext({viewport:{width:1280,height:960},serviceWorkers:'allow'});
await single.routeWebSocket('**/*',socket=>socket.close());await single.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===origin)return route.continue();if(u.origin==='https://example.supabase.co')return rest(route);outsideRequests.push({phase,origin:u.origin,path:u.pathname});return route.abort();});
await single.addInitScript(({session})=>localStorage.setItem('sb-example-auth-token',JSON.stringify(session)),{session});
const scorePage=await single.newPage();activePage=scorePage;await scorePage.goto(origin+'/repertuvar/'+songId);await scorePage.getByRole('heading',{name:'090 Sentetik Eser'}).waitFor();assert((await pdfInk(scorePage)).ink>0);stage='single-consumer-offline-PDF';
await scorePage.waitForFunction(async()=>!!navigator.serviceWorker.controller&&(await(await caches.open('genova-runtime-drive-files-v1')).keys()).length===1);
await single.setOffline(true);await scorePage.waitForFunction(()=>!navigator.onLine);await scorePage.waitForTimeout(500);assert((await pdfInk(scorePage)).ink>0);
stage='single-consumer-401-reconnect';const beforeSingle=counters.posts;expireNext=true;await single.setOffline(false);await scorePage.waitForFunction(()=>navigator.onLine);await scorePage.waitForTimeout(500);assert((await pdfInk(scorePage)).ink>0);
assert.equal(counters.posts-beforeSingle,1);pass('candidate-single-consumer-401-one-renewal',{newPosts:1});await single.close();
assert.deepEqual(unknown,[],'Unexpected synthetic REST consumer');assert.equal(outsideRequests.filter(r=>r.phase==='candidate').length,0,'Unexpected candidate external request');
record.status='PASS';record.sourceBoundary='Unrelated baseline source preserved; imports recorded separately.';
}catch(error){record.status='FAIL';record.failure={stage,message:redact(error?.message)};
if(activePage&&!activePage.isClosed())record.failureUI={sources:await selectedSources(activePage),text:redact(await activePage.locator('body').innerText())};
console.error(JSON.stringify(record.failure));process.exitCode=1;}
finally{record.counters=counters;record.statuses=statuses;record.restPaths=[...new Set(restRequests.map(r=>r.path))];record.unknown=unknown;record.outsideRequests=outsideRequests;record.browserErrors=errors;
if(browser)await browser.close();await stopNext();await closeServer(proxy);await closeServer(fixture);globalThis.fetch=originalFetch;
record.cleanup={browserClosed:true,nextStopped:!next,ownedServersClosed:true};writeFileSync(out,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify({status:record.status,stage,scenarios:record.scenarios.length,report:out}));}
