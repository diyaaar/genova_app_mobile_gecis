// Actual pinned production Next + actual native controller, browser transport.
// Expected incompatibility reproduction only: NOT Android/iOS WebView acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from '@playwright/test';
import {ROOT,CANDIDATE,hash} from './090_candidate_source.mjs';
import {CANDIDATE_REF,inspectCandidate,compareProviderClosure,loadNativeBoundary} from './090_candidate_native_preflight.mjs';
assert.equal(process.cwd(),ROOT);
assert.deepEqual(process.argv.slice(2),['--owned-loopback-negative']);
assert.equal(fs.realpathSync(CANDIDATE),CANDIDATE);
const pin=JSON.parse(fs.readFileSync(ROOT+'/docs/reports/090/2026-10-03-candidate-source-manifest-v3.json','utf8'));
assert.equal(pin.localCommit,CANDIDATE_REF);
for(const item of [...pin.changed,...pin.unchangedRuntimePaths])assert.equal(hash(fs.readFileSync(CANDIDATE+'/'+item.path)),item.sha256,item.path);
const origin='http://127.0.0.1:18199';
const out=ROOT+'/docs/reports/090/2026-10-03-native-candidate-preflight-runtime.json';
assert(!fs.existsSync(out),'Preserve prior failed attempt; do not overwrite evidence');
const record={date:new Date().toISOString(),candidate:CANDIDATE_REF,candidateTree:pin.gitTree,
  mainSource:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),harnessSha256:hash(fs.readFileSync(import.meta.filename)),
  inspection:inspectCandidate(),providerComparison:compareProviderClosure(),status:'RUNNING',nativeCompatible:false,
  boundary:'Actual production Next + actual native controller in Node, Chrome/browser message transport and non-secret bootstrap. No native Android/iOS renderer, Auth/RLS/provider or platform acceptance.'};
let child,browser,controller,stage='setup',leases=0,covered=0,cleared=0;const messages=[],outside=[],errors=[];
const redact=text=>String(text).replace(/([?&](?:token|ticket)=)[^&\s"']+/g,'$1[redacted]').replace(/Bearer\s+\S+/g,'Bearer [redacted]').slice(0,600);
try{
  assert.equal(record.inspection.sourcePreflightReady,false,'Negative control must remain the exact incompatible source');
  const native=await loadNativeBoundary();record.nativeBundleSources=native.sourcePins;
  child=spawn(process.execPath,[ROOT+'/node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','18199'],{
    cwd:CANDIDATE,env:{PATH:process.env.PATH,NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',
      NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'090-synthetic-anon'},stdio:['ignore','pipe','pipe']});
  const logs=[];child.stdout.on('data',b=>logs.push(redact(b)));child.stderr.on('data',b=>logs.push(redact(b)));
  stage='Next-readiness';let ready=false;
  for(let n=0;n<100;n++){assert.equal(child.exitCode,null,'Owned Next stopped');try{const r=await fetch(origin+'/login');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert(ready,'Owned Next readiness timeout');
  browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const context=await browser.newContext({viewport:{width:412,height:915},serviceWorkers:'block'});
  await context.routeWebSocket('**/*',socket=>socket.close());
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin===origin)return route.continue();
    outside.push({origin:url.origin,path:url.pathname});return route.abort();});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(redact(e.message)));
  const instanceId='090_candidate_native_preflight';
  controller=new native.NativeWebViewBridgeController({instanceId,tenantEpoch:1,initialUrl:origin+'/profil',
    routePolicy:{appOrigin:origin,protectedFileOrigins:[]},createMessageId:()=> '090_native_preflight_message',
    createChallenge:()=> '090_native_preflight_challenge',getLease:async()=>{leases++;throw Error('Unexpected credential request');},
    postMessage:()=>{throw Error('Unexpected native credential command');},getTheme:()=>({scheme:'dark',resolved:'dark'}),
    setTheme:async()=>({scheme:'dark',resolved:'dark'}),onSnapshot:()=>{},onNativeRoute:()=>{},onExternalRequest:()=>{},
    onPasswordRequest:()=>false,writeClipboard:async()=>false,onProtectedFileRequest:()=>false,
    onCapabilityClear:()=>{cleared++;},onExit:()=>{},onSignOut:()=>{},coverContent:()=>{covered++;}});
  await page.exposeFunction('__090BridgeReceive',async(raw,sourceUrl)=>{
    const parsed=JSON.parse(raw);messages.push({type:typeof parsed.type==='string'&&/^[a-z.]+$/.test(parsed.type)?parsed.type:'unknown'});
    await controller.handleMessage(raw,sourceUrl);
  });
  await page.addInitScript(({instanceId})=>{const bootstrap={channel:'genova.mobile.webview',instanceId,tenantEpoch:1};
    window.ReactNativeWebView={injectedObjectJson:()=>JSON.stringify(bootstrap),
      postMessage:raw=>void window.__090BridgeReceive(raw,location.href)};},{instanceId});
  stage='actual-embedded-entry';await page.goto(origin+'/profil',{waitUntil:'domcontentloaded'});
  await page.waitForURL(origin+'/login',{timeout:10000});
  assert(await page.getByRole('button',{name:'Giriş Yap',exact:true}).isVisible());
  stage='actual-native-deadline';const deadline=Date.now()+17000;
  while(controller.snapshot().phase!=='error'&&Date.now()<deadline)await new Promise(r=>setTimeout(r,100));
  assert.equal(controller.snapshot().errorCode,'handshake-timeout');assert.deepEqual(messages,[]);
  assert.equal(leases,0);assert.equal(covered,1);assert.equal(cleared,1);
  const persistence=await page.evaluate(()=>({localStorageKeys:Object.keys(localStorage).filter(k=>/^sb-/.test(k)),
    sessionStorageKeys:Object.keys(sessionStorage).filter(k=>/^sb-/.test(k))}));
  assert.deepEqual(persistence,{localStorageKeys:[],sessionStorageKeys:[]});
  record.observation={contract:'FAIL_REPRODUCED',finalPath:new URL(page.url()).pathname,controller:controller.snapshot(),
    webBridgeMessages:messages.length,nativeLeaseRequests:leases,credentialCommands:0,covered,cleared,persistence};
  controller.dispose();
  stage='actual-legacy-Next-recovery';let fetches=0,renewals=0;
  const recovery=native.createPrivateFileTicketRecovery({getIssuer:()=> 'https://example.supabase.co',
    getLease:async()=>{renewals++;throw Error('Unexpected bearer');},fetcher:async()=>{fetches++;throw Error('Unexpected network');}});
  await assert.rejects(recovery({url:origin+'/api/drive-file/090-score?token=synthetic.expired',
    signal:new AbortController().signal}),/Unsupported private-file issuer/);
  assert.equal(fetches,0);assert.equal(renewals,0);
  record.legacyRecovery={contract:'FAIL_REPRODUCED',reason:'Unsupported private-file issuer',networkCalls:0,leaseCalls:0,
    limit:'Direct Edge recovery still has its own tests. This proves the current Next-URL compatibility gap, not authority bypass.'};
  assert.deepEqual(outside,[],'Unexpected remote browser consumer');
  record.status='PASS'; // The blocker/preflight reproduction passed; compatibility did not.
}catch(error){record.status='FAIL';record.failure={stage,message:redact(error.message)};process.exitCode=1;}
finally{
  controller?.dispose();if(browser)await browser.close();
  if(child&&child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');
    const force=setTimeout(()=>child.kill('SIGKILL'),5000);await ended;clearTimeout(force);}
  record.outsideRequests=outside;record.browserErrors=errors;
  record.cleanup={browserClosed:true,ownedNextStopped:!child||child.exitCode!==null};
  fs.writeFileSync(out,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({preflightStatus:record.status,nativeCompatible:false,stage,report:out}));
}
