import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectCandidate,candidateSource,currentSource,compareProviderClosure,loadNativeBoundary} from './090_candidate_native_preflight.mjs';

test('exact pinned candidate refuses native readiness across mounted Auth/data/loader boundaries',()=>{
  const result=inspectCandidate();assert.equal(result.sourcePreflightReady,false);
  for(const code of ['missing-module','bridge-not-mounted','browser-only-auth','browser-only-layout','browser-only-data-client','browser-only-private-ticket-issuer'])assert(result.blockers.some(b=>b.code===code));
  assert.equal(result.evidence.find(e=>e.path==='lib/web-auth-capability.ts').sha256,null);
});
test('copying protocol/provider files without actual wiring cannot pass',()=>{
  const result=inspectCandidate(p=>['components/EmbeddedWebBridgeProvider.tsx','lib/embedded-web-runtime.ts','lib/mobile-webview-bridge.ts','lib/web-auth-capability.ts'].includes(p)?currentSource(p):candidateSource(p));
  assert.equal(result.sourcePreflightReady,false);assert(!result.blockers.some(b=>b.code==='missing-module'));
  assert(result.blockers.some(b=>b.code==='bridge-not-mounted'));
  assert(result.blockers.some(b=>b.code==='browser-only-private-ticket-issuer'));
});
test('current source has prerequisites, not a certificate of runtime/native compatibility',()=>{
  const result=inspectCandidate(currentSource);assert.equal(result.sourcePreflightReady,true);
  assert.match(result.limit,/No positive web\/native/);
});
test('unmounting the imported provider is caught even if source file/import remain',()=>{
  const result=inspectCandidate(p=>p==='components/AppProviders.tsx'?currentSource(p).replace(/<\/?EmbeddedWebBridgeProvider>/g,''):currentSource(p));
  assert.deepEqual(result.blockers.map(b=>b.code),['bridge-not-mounted']);
});
test('provider comparison retains import edges and warns against whole graph promotion',()=>{
  const comparison=compareProviderClosure();assert(comparison.files.length>comparison.differences.length);
  assert(comparison.imports.some(e=>e.from==='components/AppProviders.tsx'&&e.to==='components/EmbeddedWebBridgeProvider.tsx'));
  assert(comparison.differences.some(e=>e.path==='lib/chat.ts'));assert.match(comparison.limit,/NOT a minimal backport/);
});
test('actual native legacy-Next renewal refuses before bearer/network side effects',async()=>{
  const {createPrivateFileTicketRecovery}=await loadNativeBoundary();let fetches=0,leases=0;
  const recover=createPrivateFileTicketRecovery({getIssuer:()=> 'https://example.supabase.co',
    getLease:async()=>{leases++;throw Error('Unexpected lease');},fetcher:async()=>{fetches++;throw Error('Unexpected network');}});
  await assert.rejects(recover({url:'https://app.genesinovachoir.com/api/drive-file/090-score?token=synthetic.expired',signal:new AbortController().signal}),/Unsupported private-file issuer/);
  assert.equal(fetches,0);assert.equal(leases,0);
});
test('actual native controller timer stays fail closed without any web ready/proof',async()=>{
  const {NativeWebViewBridgeController}=await loadNativeBoundary();let expire,covered=0,cleared=0,leases=0;
  const controller=new NativeWebViewBridgeController({instanceId:'090_native_preflight_instance',tenantEpoch:1,
    initialUrl:'http://127.0.0.1:18199/profil',routePolicy:{appOrigin:'http://127.0.0.1:18199',protectedFileOrigins:[]},
    createMessageId:()=> '090_native_preflight_message',createChallenge:()=> '090_native_preflight_challenge',
    getLease:async()=>{leases++;throw Error('Unexpected lease');},postMessage:()=>{throw Error('Unexpected native credential message');},
    getTheme:()=>({scheme:'dark',resolved:'dark'}),setTheme:async()=>({scheme:'dark',resolved:'dark'}),onSnapshot:()=>{},
    onNativeRoute:()=>{},onExternalRequest:()=>{},onPasswordRequest:()=>false,writeClipboard:async()=>false,
    onProtectedFileRequest:()=>false,onCapabilityClear:()=>{cleared++;},onExit:()=>{},onSignOut:()=>{},coverContent:()=>{covered++;},
    setTimer:(callback,delay)=>{assert.equal(delay,15000);expire=callback;return 1;},clearTimer:()=>{}});
  assert.equal(controller.snapshot().phase,'locked');expire();
  assert.deepEqual(controller.snapshot(),{phase:'error',errorCode:'handshake-timeout',canGoBackWithinWeb:false,routeFamily:'profile'});
  assert.equal(leases,0);assert.equal(covered,1);assert.equal(cleared,1);controller.dispose();
});
