// Actual production Next + current native controller over Chrome transport.
// Auth/REST are synthetic explicit fixtures. This is NOT RN, RLS or hosted acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {chromium} from '@playwright/test';
import {ROOT,hash} from './090_candidate_source.mjs';
import {EMBEDDED_CANDIDATE} from './090_candidate_embedded_source.mjs';
import {loadNativeBoundary} from './090_candidate_native_preflight.mjs';
assert.equal(process.cwd(),ROOT);assert.deepEqual(process.argv.slice(2),['--owned-loopback']);
assert.equal(fs.realpathSync(EMBEDDED_CANDIDATE),EMBEDDED_CANDIDATE);
const pin=JSON.parse(fs.readFileSync(EMBEDDED_CANDIDATE+'/embedded-source.json','utf8'));
for(const p of pin.pins)assert.equal(hash(fs.readFileSync(EMBEDDED_CANDIDATE+'/'+p.path)),p.sha256,p.path);
const origin='http://127.0.0.1:31090',service='http://127.0.0.1:54491',foreign='http://127.0.0.1:31091';
const out=ROOT+'/docs/reports/090/2026-10-03-embedded-profile-runtime.json';
assert(!fs.existsSync(out),'Preserve prior failed evidence before retry');
const uuid=n=>`09000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const userId=uuid(1),choirId=uuid(2),memberId=uuid(3),wrongChoir=uuid(4);
const expiresAt=Math.floor(Date.now()/1000)+7200;
const accessToken='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:userId,role:'authenticated',exp:expiresAt,session_id:uuid(5)})).toString('base64url')+'.synthetic-signature';
const user={id:userId,email:'090-profile@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-10-03T00:00:00Z'};
const member={id:memberId,choir_id:choirId,auth_user_id:userId,first_name:'Synthetic',last_name:'Profile',voice_group:'Soprano',sub_voice_group:null,
  email:user.email,phone:null,is_active:true,photo_url:null,birth_date:null,join_date:null,schools:null,departments:null,repertoire:null};
const record={date:new Date().toISOString(),baseline:pin.baseline,sourceRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  harnessSha256:hash(fs.readFileSync(import.meta.filename)),candidatePins:pin.pins,closure:pin.closure,scenarios:[],status:'RUNNING',
  boundary:'Actual production Next, actual current NativeWebViewBridgeController in Node, Chrome transport, actual Supabase SDK/proof/lease vault. Synthetic Auth/REST authority responses, blocked Realtime. NOT native renderer/navigation/platform or hosted RLS/provider/release proof.'};
const requests=[],unknown=[],outside=[],errors=[],transportErrors=[];
const redact=value=>String(value).replace(/Bearer\s+\S+/g,'Bearer [redacted]').replace(/([?&](?:token|ticket)=)[^&\s"']+/g,'$1[redacted]').slice(0,500);
let server,next,browser,controller,stage='setup';
try{
  server=createServer(async(req,res)=>{
    const u=new URL(req.url,service),headers={'content-type':'application/json','access-control-allow-origin':origin,
      'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'authorization,apikey,content-type,x-client-info,x-supabase-api-version'};
    if(req.method==='OPTIONS'){res.writeHead(204,headers);res.end();return;}
    requests.push({method:req.method,path:u.pathname,authorized:req.headers.authorization==='Bearer '+accessToken});
    const finish=(status,body)=>{res.writeHead(status,headers);res.end(JSON.stringify(body));};
    if(req.headers.authorization!=='Bearer '+accessToken)return finish(401,{message:'synthetic unauthorized'});
    if(req.method==='GET'&&u.pathname==='/auth/v1/user')return finish(200,user);
    if(req.method==='POST'&&u.pathname==='/rest/v1/rpc/list_my_choirs')return finish(200,[{choir_id:choirId,member_id:memberId,choir_name:'Synthetic A',choir_slug:'synthetic-a',member_is_active:true,is_current:true}]);
    if(req.method==='GET'&&u.pathname==='/rest/v1/choir_members'){
      assert.equal(u.searchParams.get('id'),'eq.'+memberId);assert.equal(u.searchParams.get('choir_id'),'eq.'+choirId);
      assert.equal(u.searchParams.get('auth_user_id'),'eq.'+userId);return finish(200,member);
    }
    if(req.method==='GET'&&u.pathname==='/rest/v1/choir_member_roles'){
      assert.equal(u.searchParams.get('member_id'),'eq.'+memberId);assert.equal(u.searchParams.get('choir_id'),'eq.'+choirId);
      return finish(200,[{roles:{name:'Korist'}}]);
    }
    unknown.push({method:req.method,path:u.pathname});return finish(500,{message:'unsupported synthetic request'});
  });
  server.listen(54491,'127.0.0.1');await once(server,'listening');
  const native=await loadNativeBoundary();record.nativeBundleSources=native.sourcePins;
  next=spawn(process.execPath,[ROOT+'/node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','31090'],{
    cwd:EMBEDDED_CANDIDATE,env:{PATH:process.env.PATH,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
      NEXT_PUBLIC_SUPABASE_URL:service,NEXT_PUBLIC_SUPABASE_ANON_KEY:'090-synthetic-anon'},stdio:['ignore','pipe','pipe']});
  next.stdout.on('data',()=>{});next.stderr.on('data',()=>{});
  let ready=false;for(let i=0;i<100;i++){assert.equal(next.exitCode,null);try{if((await fetch(origin+'/login')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready);
  browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  async function scenario(name,{embedded=true,mismatch=false,foreignOrigin=false}={}){
    stage=name;const start=requests.length,messages=[],commands=[],pending=[];let leases=0,clears=0;
    const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});
    await context.routeWebSocket('**/*',socket=>socket.close());
    await context.route('**/*',async route=>{
      const u=new URL(route.request().url());if([origin,service].includes(u.origin))return route.continue();
      if(foreignOrigin&&u.origin===foreign){const response=await route.fetch({url:origin+u.pathname+u.search});return route.fulfill({response});}
      outside.push({origin:u.origin,path:u.pathname});return route.abort();
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push({scenario:name,message:redact(e.message)}));
    const instanceId='090_embedded_'+randomUUID().replaceAll('-','');
    if(embedded){
      controller=new native.NativeWebViewBridgeController({instanceId,tenantEpoch:1,initialUrl:origin+'/profil',
        routePolicy:{appOrigin:origin,protectedFileOrigins:[]},createMessageId:randomUUID,createChallenge:randomUUID,
        getLease:async()=>{leases++;return {accessToken,expiresAt,userId,choirId:mismatch?wrongChoir:choirId,memberId};},
        postMessage:raw=>{commands.push(JSON.parse(raw).type);pending.push(page.evaluate(raw=>window.dispatchEvent(new MessageEvent('message',{data:raw})),raw).catch(e=>transportErrors.push(redact(e.message))));},
        getTheme:()=>({scheme:'dark',resolved:'dark'}),setTheme:async()=>({scheme:'dark',resolved:'dark'}),
        onSnapshot:()=>{},onNativeRoute:()=>{},onExternalRequest:()=>{},onPasswordRequest:()=>false,
        writeClipboard:async()=>false,onProtectedFileRequest:()=>false,onCapabilityClear:()=>{clears++;},
        onExit:()=>{},onSignOut:()=>{},coverContent:()=>{}});
      await page.exposeFunction('__090BridgeReceive',async(raw,sourceUrl)=>{messages.push(JSON.parse(raw).type);await controller.handleMessage(raw,sourceUrl);});
      await page.addInitScript(({instanceId})=>{window.ReactNativeWebView={
        injectedObjectJson:()=>JSON.stringify({channel:'genova.mobile.webview',instanceId,tenantEpoch:1}),
        postMessage:raw=>void window.__090BridgeReceive(raw,location.href)};},{instanceId});
    }
    await page.goto((foreignOrigin?foreign:origin)+'/profil',{waitUntil:'domcontentloaded'});
    if(!embedded){await page.waitForURL(origin+'/login');assert(await page.getByRole('button',{name:'Giriş Yap',exact:true}).isVisible());
      await page.waitForFunction(()=>{const image=document.querySelector('img[src="/login.png"]');return image?.complete&&image.naturalWidth>0;});}
    else if(mismatch||foreignOrigin){await page.getByRole('heading',{name:'Bağlantı kurulamadı'}).waitFor();
      assert.equal(await page.getByText('Synthetic Profile',{exact:true}).count(),0);
      if(foreignOrigin){assert.equal(leases,0);assert.equal(requests.length-start,0);}
      else{assert.equal(leases,1);assert(requests.slice(start).some(r=>r.path==='/auth/v1/user'));assert(!requests.slice(start).some(r=>r.path==='/rest/v1/choir_members'));}
    }else{
      await page.getByText('Synthetic Profile',{exact:true}).waitFor();assert.equal(new URL(page.url()).pathname,'/profil');
      assert.equal(controller.snapshot().phase,'running');assert.equal(leases,1);
      assert(messages.includes('bridge.ready'));assert(messages.includes('bridge.challenge.ack'));assert(messages.includes('navigation.state'));
      const beforeClear=requests.length;
      await controller.clearAndRun('choir-switch',()=>{});await Promise.all(pending);
      await page.getByRole('heading',{name:'Güvenli oturum hazırlanıyor'}).waitFor();
      assert.equal(await page.getByText('Synthetic Profile',{exact:true}).count(),0);assert.equal(clears,1);
      assert.equal(new URL(page.url()).pathname,'/profil');
      await page.waitForTimeout(150);assert.equal(requests.length,beforeClear,'Clear must not consult browser Auth or reload private data');
    }
    await Promise.all(pending);
    const persistence=await page.evaluate(()=>({local:Object.keys(localStorage).filter(k=>/^sb-/.test(k)),session:Object.keys(sessionStorage).filter(k=>/^sb-/.test(k))}));
    assert.deepEqual(persistence,{local:[],session:[]});
    const credentialStored=await page.evaluate(token=>[localStorage,sessionStorage].some(storage=>
      Object.keys(storage).some(key=>(storage.getItem(key)??'').includes(token))),accessToken);
    assert.equal(credentialStored,false,'Access credential must not be persisted under another key');
    record.scenarios.push({name,status:'PASS',finalPath:new URL(page.url()).pathname,leases,clears,messages,commands,
      requests:requests.slice(start),persistence,credentialStored,controller:controller?.snapshot()??null});
    controller?.dispose();controller=null;await context.close();
  }
  await scenario('challenged-profile-and-tenant-clear');
  await scenario('server-current-choir-mismatch',{mismatch:true});
  await scenario('foreign-bootstrap-origin',{foreignOrigin:true});
  await scenario('ordinary-browser-no-session',{embedded:false});
  assert.deepEqual(unknown,[]);assert.deepEqual(outside,[]);assert.deepEqual(errors,[]);assert.deepEqual(transportErrors,[]);
  record.status='PASS';
}catch(error){record.status='FAIL';record.failure={stage,message:redact(error.message)};process.exitCode=1;}
finally{
  controller?.dispose();if(browser)await browser.close();
  if(next&&next.exitCode===null){const ended=once(next,'exit');next.kill('SIGTERM');const force=setTimeout(()=>next.kill('SIGKILL'),5000);await ended;clearTimeout(force);}
  if(server)await new Promise(resolve=>server.close(resolve));
  record.unknownRequests=unknown;record.outsideRequests=outside;record.browserErrors=errors;record.transportErrors=transportErrors;
  record.cleanup={browserClosed:true,nextStopped:!next||next.exitCode!==null,fixtureClosed:!server||!server.listening};
  fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:record.status,stage,report:out}));
}
