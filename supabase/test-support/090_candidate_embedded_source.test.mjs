import {test} from 'node:test';
import assert from 'node:assert/strict';
import {embeddedOverlays,replaceOnce,browserCandidateBytes} from './090_candidate_embedded_source.mjs';
import {candidateSource,currentSource,inspectCandidate} from './090_candidate_native_preflight.mjs';
const result=embeddedOverlays(),read=file=>result.files.get(file)??candidateSource(file);
test('existing embedded machinery is mounted, not merely copied',()=>{
  assert.equal(inspectCandidate(read).sourcePreflightReady,true);
  const broken=file=>file==='components/AppProviders.tsx'?read(file).replace('<EmbeddedWebBridgeProvider>{children}</EmbeddedWebBridgeProvider>','{children}'):read(file);
  assert.equal(inspectCandidate(broken).sourcePreflightReady,false);
});
test('ordinary product dependencies and contracts stay at browser candidate versions',()=>{
  for(const file of ['lib/chat.ts','lib/chat-cache.ts','lib/drive.ts','lib/repertuvar/annotations.ts',
    'lib/repertuvar/offline.ts','lib/repertuvar/cache.ts','lib/repertuvar/queries.ts',
    'lib/repertuvar/annotation-types.ts','package.json','pnpm-lock.yaml'])assert.equal(read(file),candidateSource(file));
  assert(!result.closure.files.some(p=>/annotation-save|chat-media|catalog-core|repertuvar\/upload/.test(p.path)));
});
test('Auth and provider cache teardown uses existing baseline caches without an invented queue',()=>{
  for(const file of ['components/AuthProvider.tsx','components/EmbeddedWebBridgeProvider.tsx']){
    assert(!read(file).includes('annotationSaveQueue'));assert(read(file).includes('useChatStore.getState().reset()'));
    assert(read(file).includes('clearProtectedDriveFileUrlCache()'));
  }
  assert(read('components/AuthProvider.tsx').includes('expectedEmbeddedContext'));
  assert(read('lib/supabase.ts').includes('embeddedLeaseVault.clear()'));
});
test('actual runtime/protocol/access primitives are reused without editing their policy',()=>{
  for(const file of ['lib/embedded-web-runtime.ts','lib/mobile-webview-bridge.ts','lib/web-auth-capability.ts'])assert.equal(read(file),currentSource(file));
  assert(!read('lib/drive-file-url.ts').includes('supabase.auth'));
  assert(!read('components/EmbeddedWebBridgeProvider.tsx').includes('setSession('));
});
test('backport refuses ambiguous or missing boundaries',()=>{
  assert.throws(()=>replaceOnce('xx','x','z'),/Ambiguous/);assert.throws(()=>replaceOnce('y','x','z'),/missing/);
});
test('unchanged PNG assets are binary, not UTF-8 source',()=>{
  const bytes=browserCandidateBytes('public/login.png');assert(Buffer.isBuffer(bytes));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.notDeepEqual(Buffer.from(bytes.toString('utf8')),bytes,'Regression must catch lossy text materialization');
});
