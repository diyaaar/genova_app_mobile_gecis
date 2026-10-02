// Production-source units only, synthetic adapters. No live browser/HTTP/provider.
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const revision='a13f696da8c731e9af2a2bce473d4f4ae4a81587';
const urlPath='lib/drive-file-url.ts';
const workspacePath='components/repertuvar/RepertoireWorkspace.tsx';
const source=path=>execFileSync('git',['show',revision+':'+path],{encoding:'utf8'});
const urlSource=source(urlPath), workspaceSource=source(workspacePath);
const hashes=[urlSource,workspaceSource].map(s=>createHash('sha256').update(s).digest('hex'));
function load(body,deps,extra={}) {
  const exports={};
  const compiled=ts.transpileModule(body,{compilerOptions:{module:ts.ModuleKind.CommonJS,
    target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(compiled,{exports,require:name=>{
    if(!(name in deps))throw Error('Unexpected dependency '+name);
    return deps[name];
  },Response,...extra});
  return exports;
}
function harness(status=200) {
  const clock={now:1790954400000};
  let accessToken='090-synthetic-session-a';
  const posts=[];
  class SyntheticDate extends Date {static now(){return clock.now;}}
  const api=load(urlSource,{'@/lib/supabase':{supabase:{auth:{getSession:async()=>({data:{session:{
    access_token:accessToken,user:{id:'090-synthetic-user'},
  }}})}}}},{Date:SyntheticDate,fetch:async(input,init)=>{
    assert.equal(input,'/api/drive-file-token');
    assert.equal(init.method,'POST');
    posts.push({authorization:init.headers.Authorization,body:JSON.parse(init.body)});
    return status===200?Response.json({url:'/api/drive-file/090-synthetic?token=issued-'+posts.length,
      expiresAt:clock.now+3600000}):new Response('Synthetic permission denied',{status});
  }});
  return {api,posts,clock,setSession(token){accessToken=token;}};
}
const file={id:'090-file',drive_file_id:'090-synthetic',file_name:'score.pdf',mime_type:'application/pdf',
  drive_download_link:'https://drive.google.com/uc?export=download&id=090-synthetic'};
test('production URL loader retains rejected cached URL; explicit clearing renews',async()=>{
  const h=harness();
  const first=await h.api.getProtectedDriveFileUrl(file);
  // Simulate the separately requested resource's rejection, NOT a live server.
  const strictReaderResponse=new Response(null,{status:401});
  assert.equal(strictReaderResponse.status,401);
  assert.equal(await h.api.getProtectedDriveFileUrl(file),first);
  assert.equal(h.posts.length,1);
  h.api.clearProtectedDriveFileUrlCache();
  assert.notEqual(await h.api.getProtectedDriveFileUrl(file),first);
  assert.equal(h.posts.length,2);
  console.log(JSON.stringify({revision,path:urlPath,sha256:hashes[0],finding:'NO_AUTOMATIC_LOADER_401_RECOVERY',
    postsAfterRejectedResourceAndReload:1,postsAfterExplicitCacheClear:2,
    limit:'Actual isolated loader source; test-injected resource401, not whole browser/PDF/audio recovery.'}));
});
test('production cache is reused across same-user Auth sessions until explicit clear',async()=>{
  const h=harness();
  const first=await h.api.getProtectedDriveFileUrl(file);
  h.setSession('090-synthetic-session-b');
  assert.equal(await h.api.getProtectedDriveFileUrl(file),first);
  assert.equal(h.posts.length,1);
  h.api.clearProtectedDriveFileUrlCache();
  assert.notEqual(await h.api.getProtectedDriveFileUrl(file),first);
  assert.equal(h.posts[1].authorization,'Bearer 090-synthetic-session-b');
  console.log(JSON.stringify({revision,path:urlPath,sha256:hashes[0],finding:'SAME_USER_SESSION_CACHE_REUSE',
    postsBeforeClear:1,postsAfterClear:2,limit:'Synthetic session switch, not a whole-client tenant-switch proof.'}));
});
// Select the actual async audioFiles.map callback, not a handwritten behavior mirror.
const tree=ts.createSourceFile(workspacePath,workspaceSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const callbacks=[];
function visit(node){
  if(ts.isArrowFunction(node)&&ts.isCallExpression(node.parent)&&
    node.parent.expression.getText(tree)==='audioFiles.map'&&
    node.getText(tree).includes('getProtectedDriveFileUrl'))callbacks.push(node);
  ts.forEachChild(node,visit);
}
visit(tree);
assert.equal(callbacks.length,1,'Refuse ambiguous actual production audio callback');
function trackResolver(api,selectedAudioSource=null) {
  return load('export const resolveTrack = '+callbacks[0].getText(tree),{}, {
    getProtectedDriveFileUrl:api.getProtectedDriveFileUrl,
    selectedAudio:null,selectedAudioSource,allowOfflineFallback:false,
    getAudioDisplayName:()=> 'Synthetic track',
    getOfflineDriveFileUrl:()=>{throw Error('Unexpected offline branch');},
    buildRuntimeDriveFileVersion:()=>{throw Error('Unexpected offline version branch');},
  }).resolveTrack;
}
test('production audio callback chooses raw direct-link fallback after denied POST',async()=>{
  const h=harness(403);
  const track=await trackResolver(h.api)(file);
  assert.equal(h.posts.length,1);
  assert.equal(track.source,file.drive_download_link);
  console.log(JSON.stringify({revision,path:workspacePath,sha256:hashes[1],finding:'DENIED_POST_RAW_AUDIO_FALLBACK',
    deniedPostStatus:403,rawFallbackSelected:true,providerRequests:0,
    limit:'Actual extracted audio callback + actual loader; synthetic POST403. No React render/playback/provider/Drive ACL proof.'}));
});
test('production cache renews within its expiry safety window',async()=>{
  const h=harness();
  const first=await h.api.getProtectedDriveFileUrl(file);
  h.clock.now+=3569999;
  assert.equal(await h.api.getProtectedDriveFileUrl(file),first);
  h.clock.now+=2;
  assert.notEqual(await h.api.getProtectedDriveFileUrl(file),first);
  assert.equal(h.posts.length,2);
});
