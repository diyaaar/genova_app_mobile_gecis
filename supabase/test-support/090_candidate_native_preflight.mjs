// Rejection-oriented source preflight. Passing this inspection is NOT runtime,
// authorization or platform acceptance and never permits a deployment.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {ROOT,hash,moduleClosure} from './090_candidate_source.mjs';
const require=createRequire(import.meta.url);
const ts=require('typescript');
export const CANDIDATE_REF='1a014c4e1927a03a7c67dd666a91a6006a28b6f8';
export const NATIVE_ENTRIES=['components/AppProviders.tsx','components/AuthProvider.tsx',
  'app/(main)/layout.tsx','lib/web-auth-capability.ts'];
export const currentSource=file=>fs.readFileSync(ROOT+'/'+file,'utf8');
export function candidateSource(file){return execFileSync('git',['show',CANDIDATE_REF+':'+file],
  {cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']});}
function optional(read,file){try{return read(file);}catch{return null;}}
function syntax(source,file){return ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);}
function imported(source,file,name,from){return syntax(source,file).statements.some(n=>ts.isImportDeclaration(n)&&
  n.moduleSpecifier.text===from&&n.importClause?.namedBindings?.elements?.some(e=>e.name.text===name));}
function mounted(source,file,name){let found=false;function visit(n){if((ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))&&n.tagName.getText()===name)found=true;ts.forEachChild(n,visit);}visit(syntax(source,file));return found;}
export function inspectCandidate(read=candidateSource){
  const paths=['components/AppProviders.tsx','components/AuthProvider.tsx','app/(main)/layout.tsx',
    'components/EmbeddedWebBridgeProvider.tsx','lib/embedded-web-runtime.ts','lib/mobile-webview-bridge.ts',
    'lib/supabase.ts','lib/web-auth-capability.ts','lib/drive-file-url.ts'];
  const source=new Map(paths.map(p=>[p,optional(read,p)]));const blockers=[];
  const need=(code,files,condition)=>{if(!condition)blockers.push({code,paths:files});};
  for(const p of ['components/EmbeddedWebBridgeProvider.tsx','lib/embedded-web-runtime.ts','lib/mobile-webview-bridge.ts','lib/web-auth-capability.ts'])need('missing-module',[p],source.get(p)!==null);
  const provider=source.get(paths[0])??'';
  need('bridge-not-mounted',[paths[0]],imported(provider,paths[0],'EmbeddedWebBridgeProvider','@/components/EmbeddedWebBridgeProvider')&&mounted(provider,paths[0],'EmbeddedWebBridgeProvider'));
  const auth=source.get(paths[1])??'';
  need('browser-only-auth',[paths[1]],imported(auth,paths[1],'useEmbeddedWebBridge','@/components/EmbeddedWebBridgeProvider')&&auth.includes('expectedEmbeddedContext'));
  const layout=source.get(paths[2])??'';
  need('browser-only-layout',[paths[2]],imported(layout,paths[2],'useEmbeddedWebBridge','@/components/EmbeddedWebBridgeProvider')&&layout.includes("authMode === 'browser'"));
  const data=source.get('lib/supabase.ts')??'';
  need('browser-only-data-client',['lib/supabase.ts'],data.includes('function enterEmbeddedSupabaseMode')&&data.includes('function verifyEmbeddedSupabaseContext'));
  const loader=source.get('lib/drive-file-url.ts')??'';
  need('browser-only-private-ticket-issuer',['lib/drive-file-url.ts'],imported(loader,'lib/drive-file-url.ts','requireCurrentWebAccess','@/lib/web-auth-capability'));
  return {candidate:CANDIDATE_REF,sourcePreflightReady:blockers.length===0,blockers,
    evidence:paths.map(p=>({path:p,sha256:source.get(p)===null?null:hash(source.get(p))})),
    limit:'Rejection-oriented static signals only. No positive web/native/tenant/role/refresh/platform proof; runtime acceptance remains required.'};
}
export function compareProviderClosure(){
  const closure=moduleClosure(NATIVE_ENTRIES,currentSource);
  const differences=closure.files.map(f=>{const old=optional(candidateSource,f.path);return {...f,
    candidateSha256:old===null?null:hash(old),state:old===null?'MISSING':hash(old)===f.sha256?'IDENTICAL':'CHANGED'};}).filter(f=>f.state!=='IDENTICAL');
  return {entries:NATIVE_ENTRIES,...closure,differences,
    limit:'Current full-module transitive comparison, NOT a minimal backport or permission to transplant unrelated chat/write/cache features. Cut points require semantic review.'};
}
let nativeBoundary;
export async function loadNativeBoundary(){
  if(!nativeBoundary)nativeBoundary=(async()=>{
    const {build}=createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
    const output=await build({stdin:{contents:`export {NativeWebViewBridgeController} from './apps/mobile/src/webview/native-bridge-controller.ts';
export {createPrivateFileTicketRecovery} from './apps/mobile/src/webview/private-file-ticket-recovery.ts';`,resolveDir:ROOT},
      alias:{'@shared':ROOT+'/lib'},bundle:true,platform:'node',format:'esm',write:false,metafile:true});
    const api=await import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'));
    const sourcePins=Object.keys(output.metafile.inputs).filter(p=>p!=='<stdin>').map(p=>{
      assert(/^(apps\/mobile\/src\/webview\/|lib\/)/.test(p),'Unexpected native bundle dependency');
      return {path:p,sha256:hash(currentSource(p))};
    });
    return {...api,sourcePins};
  })();return nativeBoundary;
}
if(process.argv[1]===import.meta.filename){
  assert.equal(process.cwd(),ROOT);assert.deepEqual(process.argv.slice(2),['--inspect-pinned']);
  const inspection=inspectCandidate();console.log(JSON.stringify(inspection,null,2));
  // Exit1 is an intentional readiness refusal, not a passing platform test.
  if(!inspection.sourcePreflightReady)process.exitCode=1;
}
