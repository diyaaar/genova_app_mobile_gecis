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
test('actual legacy hook closure resolves against only the declared overlays and served parent',()=>{
  const hook=files.get('hooks/useProtectedDriveFileUrl.ts');
  assert(!hook.includes('isEmbeddedRuntimeActive'),'Legacy browser hook must not import native mode');
  const resolved=moduleClosure(['hooks/useProtectedDriveFileUrl.ts'],file=>files.get(file)??oldSource(file));
  assert(!resolved.files.some(file=>file.path.includes('embedded-')||file.path.includes('mobile-webview')));
  assert(hook.includes('const nextUrl = await getOnlineAuthorizedPrivateFileUrl(loadTicketUrl);'));
});
test('legacy package includes the exact guarded forward expiry source',()=>{
  const path='supabase/migrations/20261009190611_private_file_session_expiry_090.sql';
  assert(files.has(path));
  assert(files.get(path).includes('s.not_after > statement_timestamp()'));
  assert(files.get(path).includes('090 expiry refused extra authority grants'));
});
test('both actual generated media error handlers refuse capability-bearing diagnostics',()=>{
  for(const path of ['components/FloatingMiniPlayer.tsx','components/repertuvar/RepertoireWorkspace.tsx']){
    const source=files.get(path);assert(source,'Missing actual player backport');
    const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let handler;
    function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='handleError'){
      assert(!handler,'Ambiguous media handler');handler=node.initializer.getText(ast);}ts.forEachChild(node,visit);}visit(ast);assert(handler);
    for(const code of [1,2,3,4,3.5,Infinity,NaN,'synthetic-ticket-in-code',{token:'synthetic-ticket-in-code'},null]){
      const marker='synthetic-private-capability',calls=[];let stopped=0;
      const state=()=>{stopped++;};
      const api=load('exports.fail='+handler+';',{}, {el:{src:'https://synthetic.invalid/?ticket='+marker,error:{code,message:marker}},
        currentTrackId:marker,isSwitchingRef:{current:true},intendedPlayState:{current:true},
        setPlaybackState:state,setIsPlaying:state,setAudioState:state,setMiniPlaybackState:state,
        onSelectedAudioBodyError:state,selectedAudioSource:'synthetic-source',isSourceMatch:()=>true,
        console:Object.fromEntries(['error','warn','log','info','debug'].map(name=>[name,(...args)=>calls.push({name,args})]))});
      api.fail();assert(stopped>0);
      assert.equal(calls.length,1);assert.equal(calls[0].name,'error');
      assert.equal(calls[0].args[0],'[AUDIO_PLAYER_ERROR]');
      assert.deepEqual(JSON.parse(JSON.stringify(calls[0].args[1])),{
        player:path.includes('FloatingMini')?'mini':'workspace',code:[1,2,3,4].includes(code)?code:null});
      const out=JSON.stringify(calls);assert(!out.includes(marker)&&!out.includes('ticket=')&&!out.includes('https://'));
    }
  }
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
test('actual backported browser loader rejects a successful HEAD arriving after choir invalidation',async()=>{
  const h=harness();let entered,finish;
  const started=new Promise(resolve=>{entered=resolve;});
  const pending=h.api.getOnlineAuthorizedPrivateFileUrl(()=>h.api.getProtectedDriveFileUrl(file),
    async(_url,init)=>{assert.equal(init.method,'HEAD');assert.equal(init.cache,'no-store');
      entered();return new Promise(resolve=>{finish=resolve;});});
  await started;h.api.clearProtectedDriveFileUrlCache();finish(new Response(null,{status:200}));
  await assert.rejects(pending,/Koro oturumu değişti/);assert.equal(h.posts.length,1);
});
test('actual backported browser loader permits initial same-user bearer rotation before HEAD',async()=>{
  const h=harness();const old=await h.api.getProtectedDriveFileUrl(file);h.setToken('session-b');let heads=0;
  const fresh=await h.api.getOnlineAuthorizedPrivateFileUrl(()=>h.api.getProtectedDriveFileUrl(file),
    async()=>{heads++;return new Response(null,{status:200});});
  assert.notEqual(fresh,old);assert.equal(heads,1);assert.equal(h.posts.length,2);
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
  assert(workspace.includes('if (!allowOfflineFallback && !selectedAudioSource)'));
  assert(workspace.includes('suspendMiniAudioSources();'));
});
test('candidate generation is deterministic and rejects missing closure paths',()=>{
  assert.deepEqual([...overlays().files], [...files]);
  assert(!files.get('hooks/useProtectedDriveFileUrl.ts').includes('\n  \n'),'No whitespace-only removed parameter');
  assert.throws(()=>moduleClosure(['imaginary.ts'],()=>{throw Error('missing');}),/missing/);
});
test('actual suspended playlist removes sources without discarding playback metadata',()=>{
  const workspace=files.get('components/repertuvar/RepertoireWorkspace.tsx');
  const ast=ts.createSourceFile('workspace.tsx',workspace,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const helper=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='suspendMiniAudioSources');
  let payload;
  const state={songId:'synthetic-song',songTitle:'Synthetic',coverSource:null,currentTime:12,duration:90,playbackRate:1.25,
    tracks:[{source:'private-ticket'}],currentTrackId:'track',isPlaying:true,setSession:p=>{payload=p;}};
  const api=load(helper.getText(ast)+'\nexports.suspend=suspendMiniAudioSources;',{},
    {useMiniAudioPlayerStore:{getState:()=>state}});api.suspend();
  assert.equal(payload.tracks.length,0);assert.equal(payload.currentTrackId,null);assert.equal(payload.isPlaying,false);
  assert.equal(payload.currentTime,12);assert.equal(payload.duration,90);assert.equal(payload.playbackRate,1.25);
});
test('literal closure includes reexports/dynamic imports/require and refuses computed imports',()=>{
  const sources=new Map([['entry.ts',"export {x} from './a'; import('./b.ts'); require('./c');"],
    ['a.ts','export const x=1;'],['b.ts','export const y=2;'],['c.ts','export const z=3;']]);
  const read=file=>{assert(sources.has(file),'missing');return sources.get(file);};
  const result=moduleClosure(['entry.ts'],read);
  assert.equal(result.files.length,4);assert.equal(result.imports.length,3);
  assert.throws(()=>moduleClosure(['entry.ts'],()=>"const moduleName='./a'; import(moduleName);"),/Nonliteral dependency/);
});
