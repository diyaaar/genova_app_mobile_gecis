// Pin only the tested generated candidate, with a private index and new local ref.
// Main index, browser v3 branch and all historical evidence remain unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT,hash} from './090_candidate_source.mjs';
import {EMBEDDED_CANDIDATE,embeddedOverlays,browserCandidateBytes} from './090_candidate_embedded_source.mjs';
import {CANDIDATE_REF,currentSource} from './090_candidate_native_preflight.mjs';
assert.equal(process.cwd(),ROOT);assert.deepEqual(process.argv.slice(2),['--pin-local-owned']);
assert.equal(fs.realpathSync(EMBEDDED_CANDIDATE),EMBEDDED_CANDIDATE);
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8',stdio:['pipe','pipe','pipe']});
const branch='codex/090-embedded-profile-candidate-20261003';
assert.equal(git('branch','--list',branch).trim(),'','Never overwrite an existing pin');
const manifestPath=ROOT+'/docs/reports/090/2026-10-03-embedded-profile-source-manifest.json';
assert(!fs.existsSync(manifestPath));
const state=JSON.parse(fs.readFileSync(EMBEDDED_CANDIDATE+'/embedded-source.json','utf8'));
const acceptance=JSON.parse(fs.readFileSync(ROOT+'/docs/reports/090/2026-10-03-embedded-profile-runtime.json','utf8'));
assert.equal(acceptance.status,'PASS');assert.deepEqual(acceptance.candidatePins,state.pins);
const {files,closure}=embeddedOverlays();assert.deepEqual(state.closure,closure);
for(const p of state.pins){assert.equal(hash(fs.readFileSync(EMBEDDED_CANDIDATE+'/'+p.path)),p.sha256,p.path);
  assert.equal(p.sha256,hash(files.get(p.path)??browserCandidateBytes(p.path)));}
assert.equal(state.factorySha256,hash(fs.readFileSync(ROOT+'/supabase/test-support/090_candidate_embedded_source.mjs')));
assert.equal(git('rev-parse',CANDIDATE_REF).trim(),CANDIDATE_REF);
const indexBefore=git('diff','--cached','--binary');
const scratch=fs.mkdtempSync(path.join(ROOT,'spike/090-runtime/embedded-pin-'));
const isolated=(args,input)=>execFileSync('git',args,{cwd:ROOT,env:{...process.env,GIT_INDEX_FILE:scratch+'/index'},input,encoding:'utf8',stdio:['pipe','pipe','pipe']});
try{
  isolated(['read-tree',CANDIDATE_REF]);
  for(const [file,source]of files){const blob=isolated(['hash-object','-w','--stdin'],source).trim();isolated(['update-index','--add','--cacheinfo',`100644,${blob},${file}`]);}
  const tree=isolated(['write-tree']).trim();
  const commit=isolated(['commit-tree',tree,'-p',CANDIDATE_REF],
    '090: pin minimum embedded profile candidate\n\nLocal synthetic Next/controller acceptance only; no native or hosted release approval.\n').trim();
  git('diff','--check',CANDIDATE_REF,commit);
  for(const p of state.pins)assert.equal(hash(execFileSync('git',['show',commit+':'+p.path],{cwd:ROOT})),p.sha256,p.path);
  const patch=git('diff','--binary','--full-index',CANDIDATE_REF,commit);
  const patchPath='docs/reports/090/2026-10-03-embedded-profile-source.patch.b64';
  fs.writeFileSync(ROOT+'/'+patchPath,Buffer.from(patch).toString('base64')+'\n',{flag:'wx'});
  const sourceInputs=[...new Set([...[...files.keys()].filter(p=>fs.existsSync(ROOT+'/'+p)),
    'components/AuthProvider.tsx','lib/supabase.ts','lib/realtime.ts'])].map(file=>({path:file,sha256:hash(currentSource(file))}));
  const record={date:new Date().toISOString(),...state,acceptedSourceReference:git('rev-parse','HEAD').trim(),
    localBranch:branch,localCommit:commit,gitTree:tree,patchPath,patchEncoding:'base64',patchSha256:hash(patch),sourceInputs,
    nativeBundleSources:acceptance.nativeBundleSources,
    scope:'Minimum access-only embedded profile over immutable browser v3. Not full permanent-route/file/native/hosted readiness.',
    unchangedBrowserV3Paths:state.pins.filter(p=>!p.changed).length,changedBrowserV3Paths:files.size,
    deferred:['trusted-origin legacy Next native renewal','other permanent route write/read adapter audit','exact Android/iOS renderer/navigation/platform','independent review','fresh hosted preflight/R1 and deployment authority']};
  git('update-ref','refs/heads/'+branch,commit,'0000000000000000000000000000000000000000');
  assert.equal(git('diff','--cached','--binary'),indexBefore);
  fs.writeFileSync(manifestPath,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({branch,commit,tree,delta:files.size,unchanged:record.unchangedBrowserV3Paths,manifest:manifestPath}));
}finally{assert(scratch.startsWith(ROOT+'/spike/090-runtime/embedded-pin-'));fs.rmSync(scratch,{recursive:true});}
