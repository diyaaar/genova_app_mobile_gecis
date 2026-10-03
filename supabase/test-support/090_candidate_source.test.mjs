import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {overlays,oldSource,moduleClosure} from './090_candidate_source.mjs';
const require=createRequire(import.meta.url),ts=require('typescript');
const {files,slugs,closure}=overlays();
const source=files.get('lib/drive-file-url.ts');
const errorSource=files.get('lib/repertuvar/protected-file-client.ts');
function load(source,deps={},extra={}){
  const exports={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{assert(n in deps,n);return deps[n];},Date,Headers,Response,...extra});return exports;
}
const error=load(errorSource);
function harness(code=source){let token='session-a';const posts=[];let lookup=null,transport=null;
  const api=load(code,{'@/lib/supabase':{supabase:{auth:{getSession:()=>lookup?lookup():Promise.resolve({data:{session:{access_token:token,user:{id:'synthetic-user'}}}})}}},'@/lib/repertuvar/protected-file-client':error},
    {fetch:async(_input,init)=>{posts.push(init);if(transport)return transport(init);return Response.json({url:'/api/drive-file/synthetic?token=issued-'+posts.length,expiresAt:Date.now()+3600000});}});
  return {api,posts,setToken:t=>{token=t;},setLookup:f=>{lookup=f;},setTransport:f=>{transport=f;}};
}
const file={drive_file_id:'synthetic',file_name:'score.pdf',mime_type:'application/pdf'};
test('backport adds no embedded/native/current feature graph or dependency upgrade',()=>{
  assert(!files.has('package.json'));assert(!files.has('pnpm-lock.yaml'));assert(!source.includes('getProtectedAssignment'));
  assert(!source.includes('web-auth-capability'));assert(!files.has('components/EmbeddedWebBridgeProvider.tsx'));
  assert.equal(slugs.length,6);assert.equal(closure.files.length,15);
  assert.equal(files.get('supabase/config.toml').split('verify_jwt = false').length-oldSource('supabase/config.toml').split('verify_jwt = false').length,6);
  assert.deepEqual(moduleClosure(slugs.map(slug=>`supabase/functions/${slug}/index.ts`)).files,closure.files);
});
test('backported same-user session refresh invalidates cache and rejects late old lookup',async()=>{
  const h=harness();const first=await h.api.getProtectedDriveFileUrl(file);h.setToken('session-b');
  assert.notEqual(await h.api.getProtectedDriveFileUrl(file),first);assert.equal(new Headers(h.posts[1].headers).get('Authorization'),'Bearer session-b');
  let finish;h.setLookup(()=>new Promise(resolve=>{finish=resolve;}));const pending=h.api.getProtectedDriveFileUrl(file);
  h.setLookup(null);h.setToken('session-c');await h.api.getProtectedDriveFileUrl(file);
  finish({data:{session:{access_token:'session-b',user:{id:'synthetic-user'}}}});
  await assert.rejects(pending,/Koro oturumu/);assert.equal(h.posts.length,3);
});
test('backported 401 recovery is exactly one renewal and 403 does not retry',async()=>{
  const h=harness();await h.api.getProtectedDriveFileUrl(file);let heads=0;
  await h.api.getOnlineAuthorizedPrivateFileUrl(()=>h.api.getProtectedDriveFileUrl(file),async()=>new Response(null,{status:++heads===1?401:200}));
  assert.equal(heads,2);assert.equal(h.posts.length,2);
  await assert.rejects(h.api.getOnlineAuthorizedPrivateFileUrl(()=>h.api.getProtectedDriveFileUrl(file),async()=>new Response(null,{status:403})),e=>e.status===403);
  assert.equal(h.posts.length,2);
});
async function concurrentRenewal(h){
  await h.api.getProtectedDriveFileUrl(file);let finish,entered;
  const started=new Promise(resolve=>{entered=resolve;});
  h.setTransport(init=>{if(JSON.parse(init.body).driveFileId==='other'){entered();return new Promise(resolve=>{finish=resolve;});}
    return Response.json({url:'fresh-renewal',expiresAt:Date.now()+60000});});
  const other=h.api.getProtectedDriveFileUrl({...file,drive_file_id:'other'});await started;
  let probes=0;await h.api.getOnlineAuthorizedPrivateFileUrl(()=>h.api.getProtectedDriveFileUrl(file),async()=>new Response(null,{status:++probes===1?401:200}));
  finish(Response.json({url:'other-file',expiresAt:Date.now()+60000}));return other;
}
test('backported 401 renewal preserves another file in flight; old global-eviction mutant fails',async()=>{
  assert.equal(await concurrentRenewal(harness()),'other-file');
  const mutant=source.replace('invalidateProtectedFileUrl(url);\n        continue;','clearProtectedDriveFileUrlCache();\n        continue;');
  assert.notEqual(mutant,source);
  await assert.rejects(concurrentRenewal(harness(mutant)),/Koro oturumu değişti/);
});
test('backported same-file loads coalesce and tenant clear still cancels every waiter',async()=>{
  const h=harness();let finish,entered;const started=new Promise(resolve=>{entered=resolve;});
  h.setTransport(()=>{entered();return new Promise(resolve=>{finish=resolve;});});
  const first=h.api.getProtectedDriveFileUrl(file),second=h.api.getProtectedDriveFileUrl(file);await started;
  assert.equal(h.posts.length,1);h.api.clearProtectedDriveFileUrlCache();
  finish(Response.json({url:'old-tenant',expiresAt:Date.now()+60000}));
  const results=await Promise.allSettled([first,second]);assert(results.every(r=>r.status==='rejected'));
});
test('backported current audio/inline sources have no selected/raw online bypass',()=>{
  const workspace=files.get('components/repertuvar/RepertoireWorkspace.tsx');
  assert(workspace.includes('const allowOfflineFallback = offlineEnabled && !isOnline;'));
  const ast=ts.createSourceFile('workspace.tsx',workspace,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const maps=[];
  function visit(node){if(ts.isArrowFunction(node)&&ts.isCallExpression(node.parent)&&node.parent.expression.getText(ast)==='audioFiles.map'&&node.getText(ast).includes('getProtectedDriveFileUrl'))maps.push(node.getText(ast));ts.forEachChild(node,visit);}visit(ast);
  assert.equal(maps.length,1);assert(maps[0].includes('getOnlineAuthorizedPrivateFileUrl'));assert(!maps[0].includes('drive_download_link'));assert(!maps[0].includes('selectedAudioSource'));
  assert(workspace.includes('onSelectedAudioBodyError();'));assert(workspace.includes('onSelectedPdfBodyError();'));
});
test('candidate generation is deterministic and rejects missing closure paths',()=>{
  assert.deepEqual([...overlays().files], [...files]);
  assert(!files.get('hooks/useProtectedDriveFileUrl.ts').includes('\n  \n'),'No whitespace-only removed parameter');
  assert.throws(()=>moduleClosure(['imaginary.ts'],()=>{throw Error('missing');}),/missing/);
});
test('literal closure includes reexports/dynamic imports/require and refuses computed imports',()=>{
  const sources=new Map([['entry.ts',"export {x} from './a'; import('./b.ts'); require('./c');"],
    ['a.ts','export const x=1;'],['b.ts','export const y=2;'],['c.ts','export const z=3;']]);
  const read=file=>{assert(sources.has(file),'missing');return sources.get(file);};
  const result=moduleClosure(['entry.ts'],read);
  assert.equal(result.files.length,4);assert.equal(result.imports.length,3);
  assert.throws(()=>moduleClosure(['entry.ts'],()=>"const moduleName='./a'; import(moduleName);"),/Nonliteral dependency/);
});
