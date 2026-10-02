// Actual current callback source, synthetic online decision. Not React/browser/playback proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const path='components/repertuvar/RepertoireWorkspace.tsx';
const source=fs.readFileSync(path,'utf8');
const tree=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const callbacks=[];
function visit(node) {
  if(ts.isArrowFunction(node)&&ts.isCallExpression(node.parent)&&
    node.parent.expression.getText(tree)==='audioFiles.map'&&
    node.getText(tree).includes('getProtectedRepertoireFileUrl'))callbacks.push(node);
  ts.forEachChild(node,visit);
}
visit(tree);
assert.equal(callbacks.length,1,'Refuse ambiguous current audio callback');
function resolver(selected,denied) {
  const exports={};let probes=0;
  const body=ts.transpileModule('export const resolveTrack = '+callbacks[0].getText(tree),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
  }).outputText;
  vm.runInNewContext(body,{exports,
    selectedAudio:selected?{id:'synthetic-file'}:null,
    selectedAudioSource:selected?'cached-denied-link':null,
    allowOfflineFallback:false,getAudioDisplayName:()=> 'Synthetic track',
    getProtectedRepertoireFileUrl:async()=> 'authorized-new-link',
    getOnlineAuthorizedPrivateFileUrl:async(load)=>{probes++;if(denied)throw Error('403');return load();},
    getOfflineDriveFileUrl:()=>{throw Error('Unexpected offline branch');},
    buildRuntimeDriveFileVersion:()=>{throw Error('Unexpected offline branch');},
  });
  return {run:exports.resolveTrack,probes:()=>probes};
}
const file={id:'synthetic-file',drive_download_link:'raw-provider-link'};
for(const selected of [false,true]) {
  test('current '+(selected?'selected':'other')+' online track denies without raw/cached fallback',async()=>{
    const h=resolver(selected,true);
    assert.equal(await h.run(file),null);assert.equal(h.probes(),1);
  });
  test('current '+(selected?'selected':'other')+' online track requires fresh decision',async()=>{
    const h=resolver(selected,false);
    assert.equal((await h.run(file)).source,'authorized-new-link');assert.equal(h.probes(),1);
  });
}
