// Pin the tested source closure; optionally preserve the exact candidate as a
// local Git branch with a private temporary index, never touching the main index.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {BASE,ROOT,CANDIDATE,overlays,moduleClosure,hash} from './090_candidate_source.mjs';
assert.equal(process.cwd(),ROOT);
assert.equal(process.argv.length,3);
assert(['--verify-owned','--pin-local-owned','--pin-forward-owned'].includes(process.argv[2]));
const forward=process.argv[2]==='--pin-forward-owned';
const suffix=forward?'-v2':'';
const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8',stdio:['pipe','pipe','pipe']});
const {files,closure,slugs}=overlays();
const state=JSON.parse(fs.readFileSync(CANDIDATE+'/candidate-source.json','utf8'));
assert.equal(state.baseline,BASE);
for(const [file,source]of files)assert.equal(hash(fs.readFileSync(CANDIDATE+'/'+file)),hash(source),'Generated source mismatch: '+file);
const baselinePaths=git('ls-tree','-r','--name-only',BASE).trim().split('\n');
const runtimePaths=baselinePaths.filter(file=>!file.endsWith('AGENTS.md')&&!/^(docs|memory-bank|spike|apps)\//u.test(file)&&!['KARARLAR.md','MIGRATION.md'].includes(file));
const unchanged=[];
for(const file of runtimePaths)if(!files.has(file)){
  const original=execFileSync('git',['show',`${BASE}:${file}`],{cwd:ROOT});
  const actual=fs.readFileSync(CANDIDATE+'/'+file);assert.equal(hash(actual),hash(original),'Unrelated runtime source changed: '+file);
  unchanged.push({path:file,sha256:hash(actual),bytes:actual.length});
}
const read=file=>fs.readFileSync(CANDIDATE+'/'+file,'utf8');
const runtimeSources=[...new Set([...runtimePaths,...files.keys()])].filter(p=>/\.(tsx?|mjs)$/u.test(p)&&!p.includes('.test.')&&!p.startsWith('supabase/'));
const callerEntries=runtimeSources.filter(file=>/getProtectedDriveFileUrl|useProtectedDriveFileUrl|\/api\/drive-file/u.test(read(file)));
const client=moduleClosure([...new Set([...callerEntries,'app/layout.tsx','app/(main)/layout.tsx','components/AuthProvider.tsx','components/FloatingMiniPlayer.tsx','components/repertuvar/RepertoireWorkspace.tsx'])],read);
const require=createRequire(import.meta.url);
function version(specifier){
  const name=specifier.startsWith('@')?specifier.split('/').slice(0,2).join('/'):specifier.split('/')[0];
  let directory=path.dirname(require.resolve(name));
  while(directory!==path.dirname(directory)){
    const file=path.join(directory,'package.json');if(fs.existsSync(file)){
      const pkg=JSON.parse(fs.readFileSync(file,'utf8'));if(pkg.name===name)return {name,version:pkg.version};
    }directory=path.dirname(directory);
  }throw Error('Unresolved installed dependency '+name);
}
const packages=[...new Map(client.external.filter(p=>!p.startsWith('node:')).map(p=>{const v=version(p);return [v.name,v];})).values()];
const orderedSql=['supabase/migrations/20260928140000_active_membership_revocation_078.sql',
'supabase/migrations/20260930080046_private_file_ticket_authority_090.sql','supabase/migrations/20261002154343_legacy_file_authority_090.sql'];
const result={date:new Date().toISOString(),baseline:BASE,acceptedSourceReference:git('rev-parse','HEAD').trim(),
purpose:'LOCAL narrow production-baseline candidate only; NOT deployment authority or independent release approval.',
sourceFactory:{path:'supabase/test-support/090_candidate_source.mjs',sha256:hash(fs.readFileSync(ROOT+'/supabase/test-support/090_candidate_source.mjs'))},
changed:[...files].map(([file,source])=>({path:file,bytes:Buffer.byteLength(source),sha256:hash(source)})),
runtimeBaselinePaths:runtimePaths.length,unchangedRuntimePaths:unchanged,edge:{slugs,literalDependencyClosure:closure},
clients:{callerEntries,literalDependencyClosure:client,installedVersions:packages},
orderedSql:orderedSql.map(file=>({path:file,sha256:hash(read(file))})),
runtimeConfig:{path:'supabase/config.toml',sha256:hash(read('supabase/config.toml')),change:'Only six reader verify_jwt=false sections, application Auth remains enforced by handlers.'},
locks:['package.json','pnpm-lock.yaml'].map(file=>({path:file,sha256:hash(read(file)),identicalToBaseline:true})),
unexecuted:['hosted SQL/Edge/Next/Auth/provider','native WebView for this exact candidate','independent release review','publication/refresh procedure']};
if(process.argv[2]!=='--verify-owned'){
  const accepted=JSON.parse(fs.readFileSync(ROOT+'/docs/reports/090/2026-10-03-candidate-next.json','utf8'));assert.equal(accepted.status,'PASS');
  assert.deepEqual(accepted.candidateChanged,state.changed);
  const branch='codex/090-private-reader-candidate-20261003';
  const prior=forward?JSON.parse(fs.readFileSync(ROOT+'/docs/reports/090/2026-10-03-candidate-source-manifest.json','utf8')):null;
  if(forward){assert.equal(prior.localBranch,branch);assert.equal(prior.baseline,BASE);assert.equal(git('rev-parse',branch).trim(),prior.localCommit);
    assert.notEqual(git('branch','--show-current').trim(),branch);result.supersedes=prior.localCommit;
  }else assert.equal(git('branch','--list',branch).trim(),'','Do not overwrite an existing candidate branch');
  const originalIndex=git('diff','--cached','--binary');
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'genova-090-index-'));
  const env={...process.env,GIT_INDEX_FILE:path.join(temp,'index')};
  const isolated=(args,input)=>execFileSync('git',args,{cwd:ROOT,env,input,encoding:'utf8',stdio:['pipe','pipe','pipe']});
  try{
    isolated(['read-tree',BASE]);
    for(const [file,source]of files){const blob=isolated(['hash-object','-w','--stdin'],source).trim();isolated(['update-index','--add','--cacheinfo',`100644,${blob},${file}`]);}
    result.gitTree=isolated(['write-tree']).trim();
    const commit=isolated(['commit-tree',result.gitTree,'-p',prior?.localCommit??BASE],
      '090: pin locally verified minimal private-reader candidate\n\nLocal synthetic acceptance only. No hosted publication approval.\n').trim();
    result.localBranch=branch;result.localCommit=commit;
    const patch=git('diff','--binary',BASE,commit);
    // The final delivery diff is a gate too, not merely a patch storage action.
    git('diff','--check',BASE,commit);
    if(forward)git('update-ref','refs/heads/'+branch,commit,prior.localCommit);else git('branch',branch,commit);
    assert.equal(git('diff','--cached','--binary'),originalIndex);
    // Unified diff context blank lines carry spaces by design. Encode the exact
    // patch artifact so document whitespace gates do not need a global exception.
    result.patchEncoding='base64';result.patchPath='docs/reports/090/2026-10-03-candidate-source'+suffix+'.patch.b64';
    fs.writeFileSync(ROOT+'/'+result.patchPath,Buffer.from(patch).toString('base64')+'\n',{flag:'wx'});
    result.patchSha256=hash(patch);
  }finally{fs.rmSync(temp,{recursive:true});}
  fs.writeFileSync(ROOT+'/docs/reports/090/2026-10-03-candidate-source-manifest'+suffix+'.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
}
console.log(JSON.stringify({baseline:BASE,changed:result.changed.length,unchanged:unchanged.length,edgeModules:closure.files.length,clientModules:client.files.length,
clientImports:client.imports.length,localCommit:result.localCommit,localBranch:result.localBranch}));
