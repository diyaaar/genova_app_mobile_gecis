// Minimum existing embedded bridge backport over the immutable browser v3 candidate.
// Source extraction is fail-closed; no second Auth implementation or refresh token.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {ROOT,hash,moduleClosure} from './090_candidate_source.mjs';
import {CANDIDATE_REF,candidateSource,currentSource} from './090_candidate_native_preflight.mjs';
const ts=createRequire(import.meta.url)('typescript');
export const EMBEDDED_CANDIDATE=ROOT+'/spike/090-runtime/embedded-candidate';
// Unchanged runtime assets must never pass through a UTF-8 decoder.
export const browserCandidateBytes=file=>execFileSync('git',['show',CANDIDATE_REF+':'+file],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
export function replaceOnce(source,before,after){
  assert.equal(source.split(before).length,2,'Ambiguous/missing embedded backport boundary: '+before.slice(0,90));
  return source.replace(before,after);
}
function ast(source){return ts.createSourceFile('source.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);}
function nodeNamed(source,name){
  const tree=ast(source),found=[];
  function visit(n){if(n.name?.text===name && (ts.isFunctionDeclaration(n)||ts.isInterfaceDeclaration(n)))found.push(n);
    if(ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(tree)===name))found.push(n);
    ts.forEachChild(n,visit);}
  visit(tree);assert.equal(found.length,1,name);return found[0].getText(tree);
}
function withoutAnnotationQueue(source){
  return source.split('\n').filter(line=>!line.includes("from '@/lib/repertuvar/annotation-save-runtime'")
    &&!line.includes("from '@/lib/repertuvar/annotation-tenant-transition'")
    &&!line.includes('annotationSaveQueue.discardAll();')).join('\n');
}
function authSource(){
  let source=withoutAnnotationQueue(currentSource('components/AuthProvider.tsx'));
  // Baseline writes have no annotation queue. Preserve exact browser switch/signout
  // logic rather than transplanting the newer annotation lifecycle and write graph.
  const old=candidateSource('components/AuthProvider.tsx');
  let select=nodeNamed(old,'selectChoir');
  select=replaceOnce(select,'    if (!user ||',`    if (embeddedBridge.isEmbedded) {
      setContextError('Koro değişikliği mobil uygulamadan yapılır.');
      return;
    }
    if (!user ||`);
  select=replaceOnce(select,'clearTenantData, fetchMemberData, user]','clearTenantData, embeddedBridge.isEmbedded, fetchMemberData, user]');
  source=replaceOnce(source,nodeNamed(source,'selectChoir'),select);
  let signOut=nodeNamed(source,'signOut');
  const tree=ast(signOut),calls=[];
  function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(tree)==='commitAnnotationTenantTransition')calls.push(n);ts.forEachChild(n,visit);}
  visit(tree);assert.equal(calls.length,1);
  // Retain existing failure-before-clear behavior, without inventing a baseline queue.
  signOut=replaceOnce(signOut,calls[0].getText(tree),'('+calls[0].arguments[2].getText(tree)+')()');
  return replaceOnce(source,nodeNamed(source,'signOut'),signOut);
}
function removeUnusedQueueMocks(source){
  // No assertions removed: only mocks of modules absent from the baseline.
  const tree=ast(source),nodes=tree.statements.filter(n=>ts.isExpressionStatement(n)&&ts.isCallExpression(n.expression)
    &&n.expression.expression.getText(tree)==='vi.mock'
    &&['@/lib/repertuvar/annotation-save-runtime','@/lib/repertuvar/annotation-tenant-transition'].includes(n.expression.arguments[0]?.text));
  for(const n of nodes)source=replaceOnce(source,n.getText(tree),'');
  return source;
}
export function embeddedOverlays(){
  const files=new Map();
  for(const file of ['components/AppProviders.tsx','app/(main)/layout.tsx','app/(main)/profil/page.tsx',
    'components/ProfileChangeRequestNotifier.tsx','lib/embedded-web-runtime.ts','lib/mobile-webview-bridge.ts',
    'lib/web-auth-capability.ts','lib/invite-token-store.ts','lib/choir-context-core.ts'])files.set(file,currentSource(file));
  files.set('components/AuthProvider.tsx',authSource());
  files.set('components/EmbeddedWebBridgeProvider.tsx',replaceOnce(
    withoutAnnotationQueue(currentSource('components/EmbeddedWebBridgeProvider.tsx')),
    '    setDetection(result);',`    // Post-hydration bootstrap detection must publish the locked browser/embedded mode.
    // This existing bridge effect cannot be evaluated on the SSR window.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetection(result);`));
  const latest=currentSource('lib/supabase.ts'),baseline=candidateSource('lib/supabase.ts');
  const prefix=latest.slice(0,latest.indexOf('// Supabase Edge Function helper'));
  const exportBlock=prefix.slice(prefix.indexOf('export {'),prefix.indexOf('const supabaseUrl'));
  files.set('lib/supabase.ts',replaceOnce(prefix,exportBlock,'')+baseline.slice(baseline.indexOf('// Supabase Edge Function helper')));
  files.set('lib/realtime.ts',candidateSource('lib/realtime.ts')+'\n'+nodeNamed(currentSource('lib/realtime.ts'),'RealtimeAuthPort')+'\n'+nodeNamed(currentSource('lib/realtime.ts'),'authorizeRealtimeBeforeJoin')+'\n');
  const loader=candidateSource('lib/drive-file-url.ts');
  files.set('lib/drive-file-url.ts',"import type { RepertoireFile } from '@/lib/supabase';\nimport { ProtectedFileRequestError } from '@/lib/repertuvar/protected-file-client';\nimport { requireCurrentWebAccess, authenticatedWebFetch } from '@/lib/web-auth-capability';\n"+loader.slice(loader.indexOf('interface CachedDriveUrl')));
  for(const file of ['components/AuthProvider.embedded.test.tsx','components/EmbeddedWebBridgeProvider.test.tsx',
    'lib/embedded-web-runtime.test.ts','lib/mobile-webview-bridge.test.ts','lib/supabase-embedded.test.ts',
    'lib/web-auth-capability.test.ts'])files.set(file,removeUnusedQueueMocks(currentSource(file)));
  // Existing loader tests mock the old live binding. Its browser capability now
  // explicitly uses browserSupabase; point both names at that same fixture.
  const loaderTests=candidateSource('lib/drive-file-url.test.ts');
  files.set('lib/drive-file-url.test.ts',replaceOnce(loaderTests,'  supabase: {',`  getEmbeddedLeaseSnapshot: () => ({ mode: 'browser', phase: 'browser' }),
  notifyEmbeddedUnauthorized: vi.fn(),
  requireEmbeddedAccess: vi.fn(),
  browserSupabase: {`));
  for(const [file,source]of files){try{if(candidateSource(file)===source)files.delete(file);}catch{/* new */}}
  const read=file=>files.get(file)??candidateSource(file);
  const entries=['components/AppProviders.tsx','components/AuthProvider.tsx','app/(main)/layout.tsx',
    'app/(main)/profil/page.tsx','lib/web-auth-capability.ts','lib/drive-file-url.ts'];
  return {files,closure:moduleClosure(entries,read)};
}
export function materializeEmbedded(refresh=false){
  assert.equal(process.cwd(),ROOT);
  if(refresh){assert.equal(fs.realpathSync(EMBEDDED_CANDIDATE),EMBEDDED_CANDIDATE);
    const prior=JSON.parse(fs.readFileSync(EMBEDDED_CANDIDATE+'/embedded-source.json','utf8'));
    assert.equal(prior.baseline,CANDIDATE_REF);
    for(const pin of prior.pins)assert.equal(hash(fs.readFileSync(EMBEDDED_CANDIDATE+'/'+pin.path)),pin.sha256,'Refuse external edits');
  }else assert(!fs.existsSync(EMBEDDED_CANDIDATE),'Refuse existing candidate');
  const parent=path.dirname(EMBEDDED_CANDIDATE);fs.mkdirSync(parent,{recursive:true});assert.equal(fs.realpathSync(parent),parent);
  if(!refresh)fs.mkdirSync(EMBEDDED_CANDIDATE);
  const baseline=execFileSync('git',['ls-tree','-r','--name-only',CANDIDATE_REF],{encoding:'utf8'}).trim().split('\n')
    .filter(p=>!p.endsWith('AGENTS.md')&&!/^(docs|memory-bank|spike|apps)\//u.test(p)&&!['KARARLAR.md','MIGRATION.md'].includes(p));
  const {files,closure}=embeddedOverlays(),pins=[];
  for(const file of new Set([...baseline,...files.keys()])){
    const source=files.get(file)??browserCandidateBytes(file),destination=EMBEDDED_CANDIDATE+'/'+file;
    fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,source,{flag:refresh?'w':'wx'});
    pins.push({path:file,sha256:hash(source),bytes:Buffer.byteLength(source),changed:files.has(file)});
  }
  if(!refresh)fs.symlinkSync(ROOT+'/node_modules',EMBEDDED_CANDIDATE+'/node_modules','dir');
  for(const file of baseline)if(!files.has(file))assert.equal(hash(fs.readFileSync(EMBEDDED_CANDIDATE+'/'+file)),hash(browserCandidateBytes(file)),file);
  for(const file of ['package.json','pnpm-lock.yaml'])assert.equal(hash(fs.readFileSync(EMBEDDED_CANDIDATE+'/'+file)),hash(browserCandidateBytes(file)));
  const record={baseline:CANDIDATE_REF,sourceRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    factorySha256:hash(fs.readFileSync(import.meta.filename)),pins,closure};
  fs.writeFileSync(EMBEDDED_CANDIDATE+'/embedded-source.json',JSON.stringify(record,null,2)+'\n',{flag:refresh?'w':'wx'});
  return record;
}
if(process.argv[1]===import.meta.filename){assert.equal(process.argv.length,3);assert(['--materialize-owned','--refresh-owned-unaccepted'].includes(process.argv[2]));
  const r=materializeEmbedded(process.argv[2]==='--refresh-owned-unaccepted');console.log(JSON.stringify({baseline:r.baseline,delta:r.pins.filter(p=>p.changed).length,modules:r.closure.files.length,edges:r.closure.imports.length,path:EMBEDDED_CANDIDATE}));}
