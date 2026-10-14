// Actual old/current React + current Next API + genuine GoTrue/PostgREST/Edge.
// Only provider bytes synthetic. No fulfilled Auth/REST/RPC or seeded user session.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createServer,request as httpRequest} from 'node:http';
import {createRequire} from 'node:module';
import {once} from 'node:events';
import {chromium} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {DIR,readPrivate} from './090-compatibility-sql-rehearsal.mjs';
import {ATTEMPT} from './090-p3-resource-policy.mjs';
import {measureRuntime} from './090-p3-runtime-resources.mjs';
assert.equal(ATTEMPT,'20261014-fresh-recovery');assert.equal(process.argv[2],'--run-approved');assert.equal(process.argv.length,3);
const ROOT=process.cwd(),RUN=ROOT+'/spike/090-runtime/20261014-web',prefix=`managed-${ATTEMPT}`,suffix='-current';
const freshFinal=true,currentOnly=true,leaf=true,legacyOnly=false,oldControls=false;
process.env.TMPDIR=RUN+'/browser-tmp';
const config=JSON.parse(readPrivate(prefix+'-config.json')),fixture=JSON.parse(readPrivate(prefix+'-fixture.json')),owner=JSON.parse(readPrivate('runtime-ownership.json'));
assert(fixture.fixtureSqlCommitted&&!fixture.failed);const tls=JSON.parse(readPrivate(prefix+(leaf?'-tls-v2.json':'-tls.json'))),cert=path.join(DIR,prefix+(leaf?'-tls-ca.crt':'-tls.crt'));
assert.equal(JSON.parse(readPrivate(prefix+'-current-web-build-v2.json')).exitCode,0);
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
const implementation=await build({stdin:{contents:"export {createPrivateFileTicketV2} from './supabase/functions/_shared/private-file-ticket-v2.ts';",resolveDir:ROOT},bundle:true,platform:'node',format:'esm',write:false});
const ticket=await import('data:text/javascript;base64,'+Buffer.from(implementation.outputFiles[0].text).toString('base64'));
const origin='http://127.0.0.1:18197',user=fixture.users.find(u=>u.role==='shared');
const targetSong=legacyOnly?fixture.ids.legacySong:fixture.ids.songA,targetTitle=legacyOnly?'090 Sentetik Eski Eser':'090 Matrix Song';
const record={recordedAt:new Date().toISOString(),attempt:ATTEMPT,status:'RUNNING',scenarios:[],errors:[],outside:[],
  productCommit:'9d1f1a72d2024734a9d8fac6cc540960ce9b1534',
  boundary:'Fresh 13 October restored state, real local Auth/REST/RLS/Edge, current pinned Next/React. Provider bytes are synthetic. No hosted/native/store/legacy-cutover acceptance.'};
const pass=(name,details={})=>{record.scenarios.push({name,status:'PASS',...details});console.log('PASS '+name);};
const children=[],logs=[];let browser,proxy,activePage,phase='current',stage='setup',peak=measureRuntime(owner).allocatedKiB,expiryOverride=null;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const metrics=async()=>await(await fetch(config.api+'/_test/metrics')).json();
const redact=s=>String(s).replace(/([?&](?:token|ticket)=)[^&\s"']+/gu,'$1[redacted]').replace(/Bearer\s+\S+/gu,'Bearer [redacted]').slice(0,400);
const monitor=setInterval(()=>{try{peak=Math.max(peak,measureRuntime(owner).allocatedKiB);}catch{for(const c of children)c.kill('SIGTERM');void browser?.close();}},2000);
async function startNext(name,port){
  const fd=fs.openSync(path.join(DIR,prefix+'-next-'+name+suffix+'.log'),'wx',0o600);logs.push(fd);
  const env={PATH:process.env.PATH,HOME:process.env.HOME,TMPDIR:RUN+'/browser-tmp',NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',APP_URL:origin,
    NEXT_PUBLIC_SUPABASE_URL:config.api,NEXT_PUBLIC_SUPABASE_ANON_KEY:config.anon,SUPABASE_SERVICE_ROLE_KEY:config.service,NODE_EXTRA_CA_CERTS:cert,
    NODE_OPTIONS:'--max-old-space-size=768 --import='+ROOT+'/spike/090-managed-next-fetch.mjs'};
  const child=spawn(process.execPath,[ROOT+'/node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p',String(port)],{cwd:RUN,env,stdio:['ignore',fd,fd]});children.push(child);
  for(let i=0;i<100;i++){assert.equal(child.exitCode,null,'Actual Next exited');try{if((await fetch('http://127.0.0.1:'+port+'/login')).ok)return;}catch{}await delay(100);}throw Error('Actual Next readiness timeout');
}
async function session(page){return page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('sb-')&&k.endsWith('-auth-token'));if(!key)throw Error('Actual browser session missing');return JSON.parse(localStorage.getItem(key));});}
async function login(page){await page.goto(origin+'/login');await page.locator('#email').fill(user.email);await page.locator('#password').fill(user.password);
  await page.getByRole('button',{name:'Giriş Yap',exact:true}).click();await page.waitForURL(url=>url.pathname!=='/login',{timeout:20000});
  const choose=page.getByRole('button',{name:'090 Synthetic A',exact:true}),selector=page.getByLabel('Aktif koroyu değiştir');
  await Promise.race([choose.waitFor({timeout:20000}),selector.waitFor({timeout:20000})]);
  if(await choose.isVisible())await choose.click();await selector.waitFor();await selector.selectOption(fixture.ids.choirA);
  await page.goto(origin+'/repertuvar/'+targetSong);await page.getByRole('heading',{name:targetTitle}).waitFor({timeout:20000});
  const s=await session(page);assert.equal(s.user.id,user.id);const claims=JSON.parse(Buffer.from(s.access_token.split('.')[1],'base64url'));assert.equal(claims.sub,user.id);assert(claims.session_id);
}
async function pdfInk(page){const canvas=page.locator('.react-pdf__Page canvas').first();await canvas.waitFor({timeout:30000});return canvas.evaluate(c=>{
  const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return {width:c.width,height:c.height,ink:Array.from(p).filter((v,i)=>i%4!==3&&v<100).length};});}
async function play(page){await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(b=>b.title==='Oynat'||b.getAttribute('aria-label')==='Müzik oynatıcıyı aç'));
  const open=page.getByRole('button',{name:'Müzik oynatıcıyı aç'});if(await open.isVisible())await open.click();await page.getByTitle('Oynat',{exact:true}).first().click();
  await page.waitForFunction(()=>globalThis.__090Audio?.some(a=>!a.paused&&a.currentTime>0.15));}
async function pause(page){for(const title of ['Duraklat','Durdur']){const button=page.getByTitle(title,{exact:true}).first();if(await button.isVisible()){await button.click();break;}}
  await page.waitForFunction(()=>globalThis.__090Audio.every(a=>a.paused));}
async function probe(page,url,expected){const before=await metrics();const statuses=await page.evaluate(async u=>{
  const out=[];for(const method of ['GET','HEAD']){const r=await fetch(u,{method,cache:'no-store',headers:{Range:'bytes=0-15'}});out.push(r.status);await r.arrayBuffer();}return out;},url);
  assert.deepEqual(statuses,[expected,expected]);const after=await metrics();if(expected===403)assert.equal(after.provider,before.provider);return {statuses,providerDelta:after.provider-before.provider};}
try{
  assert(!fs.existsSync(path.join(DIR,prefix+'-browser'+suffix+'.json')));
  if(!fs.existsSync(RUN+'/browser-tmp'))fs.mkdirSync(RUN+'/browser-tmp',{mode:0o700});assert(!fs.lstatSync(RUN+'/browser-tmp').isSymbolicLink());
  await startNext('current',18199);if(!freshFinal)await startNext('old',18200);
  proxy=createServer((req,res)=>{const actualApi=req.url.startsWith('/api/drive-file');const port=actualApi||phase==='current'?18199:18200;
    const upstream=httpRequest({hostname:'127.0.0.1',port,path:req.url,method:req.method,headers:req.headers},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});
    upstream.on('error',()=>{res.writeHead(502);res.end();});req.pipe(upstream);});await new Promise(r=>proxy.listen(18197,'127.0.0.1',r));
  browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,
    env:{...process.env,TMPDIR:RUN+'/browser-tmp'},args:['--autoplay-policy=no-user-gesture-required','--ignore-certificate-errors-spki-list='+tls.spkiSha256Base64]});
  for(phase of currentOnly?['current']:legacyOnly?['old']:['current','old']){
    stage=phase+'-real-login';const responses=[];
    const context=await browser.newContext({viewport:{width:1280,height:960},serviceWorkers:'allow'});await context.routeWebSocket('**/*',s=>s.close());
    await context.route('**/*',async route=>{const u=new URL(route.request().url());
      if([origin,config.api].includes(u.origin)){
        if(expiryOverride&&route.request().method()==='HEAD'&&u.pathname==='/functions/v1/repertoire-file'){
          const override=expiryOverride;expiryOverride=null;await route.continue({url:override});return;}
        await route.continue();return;}
      record.outside.push({phase,origin:u.origin,path:u.pathname});await route.abort();});
    await context.addInitScript(()=>{const Native=globalThis.Audio;globalThis.__090Audio=[];globalThis.Audio=function(...args){const audio=new Native(...args);globalThis.__090Audio.push(audio);return audio;};globalThis.Audio.prototype=Native.prototype;});
    const page=await context.newPage();activePage=page;page.on('pageerror',e=>record.errors.push(redact(e.message)));
    page.on('response',r=>{const u=new URL(r.url());if(u.pathname.includes('file')&&(u.pathname.includes('/functions/')||u.pathname.startsWith('/api/drive-file')))
      responses.push({method:r.request().method(),status:r.status(),url:r.url()});});
    await login(page);pass(phase+'-genuine-browser-login-choir-catalogue');
    stage=phase+'-media';const ink=await pdfInk(page);assert(ink.ink>0);await play(page);await page.evaluate(()=>{globalThis.__090Audio.find(a=>!a.paused).currentTime=1;});
    await page.waitForFunction(()=>globalThis.__090Audio.some(a=>!a.paused&&a.currentTime>1.15));await pause(page);
    const issued=responses.filter(r=>r.method==='GET'&&[200,206].includes(r.status)).map(r=>r.url);assert(issued.length>=2);assert(responses.some(r=>r.status===206));
    pass(phase+'-actual-PDF-audio-play-seek-range',{ink,actualRange:true});
    await page.screenshot({path:path.join(DIR,prefix+'-'+phase+'-media'+suffix+'.png')});
    stage=phase+'-offline-cache';await page.getByRole('switch',{name:'Offline kullanım'}).click();await page.getByText('2 dosya offline kullanıma hazır.',{exact:true}).waitFor({timeout:20000});
    await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await page.waitForFunction(()=>!navigator.onLine);
    if(oldControls){
      // Preserve the failed old-source transition. Do not give an old bundle
      // current-source offline behavior or promote downloaded buffers to proof.
      record.oldOfflineObservation=await page.evaluate(()=>({online:navigator.onLine,controlled:!!navigator.serviceWorker.controller,
        audio:globalThis.__090Audio.map(a=>({path:new URL(a.src||location.href).pathname,paused:a.paused,time:a.currentTime}))}));
      record.scenarios.push({name:'old-offline-source-transition',status:'FAIL_REPRODUCED_NOT_WAIVED',
        note:'Original v6 timed out waiting for offline-drive source. Exact old hook has no online-event dependency; v7 only continues independent server revocation controls.'});
    }else{await page.waitForFunction(()=>globalThis.__090Audio.some(a=>new URL(a.src||location.href).pathname.startsWith('/offline-drive/')));await play(page);await pause(page);pass(phase+'-actual-authorized-offline-audio');}
    if(phase==='current'){
      stage='current-expired-ticket-renewal';const normal=new URL(issued.find(u=>u.includes('/functions/v1/repertoire-file')));const claims=JSON.parse(Buffer.from(normal.searchParams.get('ticket').split('.')[0],'base64url'));
      const expired=await ticket.createPrivateFileTicketV2(claims.family,{fileId:claims.fileId,choirId:claims.choirId,actorId:claims.actorId,sessionId:claims.sessionId},config.service,1000,Date.now()-2000);
      normal.searchParams.set('ticket',expired.token);expiryOverride=normal.href;const before=await metrics();await context.setOffline(false);
      await page.waitForFunction(()=>navigator.onLine);await page.waitForFunction(()=>globalThis.__090Audio.some(a=>a.src.includes('/functions/v1/repertoire-file')));
      assert((await pdfInk(page)).ink>0);await delay(800);assert.equal(expiryOverride,null);assert(responses.some(r=>r.method==='HEAD'&&r.status===401));
      // Renewal means ticket issuance POSTs. Fresh HEAD probes and legitimate
      // media GET/range reads must not be mistaken for an issuance retry loop.
      const issuances=m=>m.requests.filter(r=>r.path==='/functions/v1/repertoire-file'&&r.method==='POST').length;
      await play(page);await pause(page);const after=await metrics();await delay(800);assert.equal(issuances(await metrics()),issuances(after),'Renewal issuance did not settle');
      const newPosts=issuances(after)-issuances(before);
      assert(newPosts>0&&newPosts<=6);pass('current-real-expired-HMAC-401-bounded-renewal',{newPosts,expiredTicketTransportInjection:true,authorityResponseMocked:false});
    }else{await context.setOffline(false);await page.waitForFunction(()=>navigator.onLine);await delay(300);}
    // The full-screen repertoire workspace deliberately hides TopBar navigation.
    // Use the real home screen where the choir selector is actually rendered.
    stage=phase+'-choir-switch';await page.goto(origin+'/');await page.getByLabel('Aktif koroyu değiştir').selectOption(fixture.ids.choirB);
    await page.waitForFunction(id=>document.querySelector('[aria-label="Aktif koroyu değiştir"]')?.value===id,fixture.ids.choirB);
    await delay(500);for(const url of [...new Set(issued)])pass(phase+'-retained-URL-choir-B-denied',await probe(page,url,403));
    const s=await session(page),rest=await page.evaluate(async({api,anon,access,song})=>{const r=await fetch(api+'/rest/v1/repertoire?select=id&id=eq.'+song,{headers:{apikey:anon,Authorization:'Bearer '+access}});return {status:r.status,data:await r.json()};},
      {api:config.api,anon:config.anon,access:s.access_token,song:targetSong});assert.equal(rest.status,200);assert.deepEqual(rest.data,[]);pass(phase+'-actual-choir-B-catalogue-isolation');
    if(phase==='current'){await page.goto(origin+'/repertuvar/'+fixture.ids.songA);await delay(700);assert.equal(await page.locator('.react-pdf__Page canvas').count(),0);pass('current-no-online-cross-choir-cached-PDF');}
    stage=phase+'-logout';await page.goto(origin+'/profil');await page.getByLabel('Profil menüsünü aç').click();await page.getByRole('button',{name:/^Çıkış Yap/u}).click();await page.waitForURL(url=>url.pathname==='/login',{timeout:10000});
    for(const url of [...new Set(issued)])pass(phase+'-retained-URL-sign-out-denied',await probe(page,url,403));pass(phase+'-actual-browser-sign-out');
    record.scenarios.push({name:phase+'-already-downloaded-bytes-boundary',status:'LIMITATION_NOT_RELEASE_WAIVER',
      note:'Previously downloaded/buffered bytes cannot be recalled. This fresh run establishes new GET/HEAD refusal, not old-open server-cutover cache remediation. Historical old-open client FAIL remains open.'});
    await context.close();activePage=null;
  }
  stage='outsider';const outsider=fixture.users.find(u=>u.role==='outsider'),sdk=createClient(config.api,config.anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const signed=await sdk.auth.signInWithPassword({email:outsider.email,password:outsider.password});assert.equal(signed.error,null);
  const selected=await sdk.rpc('set_active_choir',{p_choir_id:fixture.ids.choirB});assert.equal(selected.error,null);
  const before=await metrics();const r=await fetch(config.api+'/functions/v1/repertoire-file',{method:'POST',headers:{apikey:config.anon,Authorization:'Bearer '+signed.data.session.access_token,'Content-Type':'application/json'},body:JSON.stringify({fileId:fixture.ids.score})});
  assert.equal(r.status,403);assert.equal((await metrics()).provider,before.provider);await sdk.auth.signOut();pass('independent-B-user-cannot-issue-A-file-provider-zero');
  assert.equal(record.errors.length,0,'Browser page errors');assert.equal(record.outside.length,0,'Outside browser requests');
  record.status='CURRENT_CANDIDATE_REAL_BROWSER_PASS';
}catch(error){record.status='FAIL_NOT_ACCEPTED';record.failedStage=stage;record.failure=redact(error.message);
  if(activePage)try{await activePage.screenshot({path:path.join(DIR,prefix+'-failure'+suffix+'.png')});}catch{}
  console.error('Actual managed browser failed at '+stage+'; details private');process.exitCode=1;
}finally{
  clearInterval(monitor);await browser?.close();if(proxy){proxy.closeAllConnections();await new Promise(r=>proxy.close(r));}
  for(const child of children)if(child.exitCode===null){child.kill('SIGTERM');await once(child,'exit');}for(const fd of logs)fs.closeSync(fd);
  record.childrenExited=true;
  record.completedAt=new Date().toISOString();record.peakAllocatedKiB=peak;fs.writeFileSync(path.join(DIR,prefix+'-browser'+suffix+'.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx',mode:0o600});console.log(JSON.stringify({status:record.status,stage,scenarios:record.scenarios.length,peakAllocatedKiB:peak}));
}
