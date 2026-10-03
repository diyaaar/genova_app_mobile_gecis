// P1 source inventory only: read immutable Git objects; never materialize/deploy a runtime.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { moduleClosure } from '../supabase/test-support/090_candidate_source.mjs';
import { pinnedFiles } from '../supabase/test-support/090_candidate_native_cache.mjs';
import { withFileMetadata, withDeferredNativeProbe } from '../supabase/test-support/090_candidate_native_interactive.mjs';
const ts = createRequire(import.meta.url)('typescript');
const sha = x => createHash('sha256').update(x).digest('hex');
const git = (...args) => execFileSync('git', args, { stdio:['ignore','pipe','pipe'], maxBuffer:32*1024*1024 });
const text = (...args) => git(...args).toString().trim();
const source = 'c2ec9b09a44c048c7c6a0c31f0ac99566c4643f0';
const remote = 'a13f696da8c731e9af2a2bce473d4f4ae4a81587';
const entry = '3fb3a2c7698bf80134860ade50f7e5713b5308f7';
const out = 'docs/reports/090/2026-10-03-p1-beta-candidate.json';
const cache = new Map();
const read = file => { if (!cache.has(file)) cache.set(file,git('show',`${source}:${file}`)); return cache.get(file); };
const names = text('ls-tree','-r','--name-only',source).split('\n');
const roots = ['app/','components/','hooks/','lib/','store/','public/','scripts/','apps/mobile/','supabase/functions/','supabase/migrations/'];
const config = ['package.json','pnpm-lock.yaml','pnpm-workspace.yaml','next.config.ts','next-env.d.ts','tsconfig.json','postcss.config.mjs','eslint.config.mjs','.eslintrc.json','.env.example','capacitor.config.ts','supabase/config.toml'];
const selected = names.filter(file => roots.some(root=>file.startsWith(root)) || config.includes(file));
assert(config.every(file=>selected.includes(file)),'Required configuration file missing');
const pin = file => ({path:file,bytes:read(file).length,sha256:sha(read(file))});
const changed = text('diff','--name-only',remote,source,'--',...roots,...config).split('\n').filter(Boolean);
assert.equal(text('diff','--name-only',source,entry,'--',...roots,...config),'','Product identity drift');
const runtime = selected.filter(file=>/\.(?:ts|tsx|mjs|js)$/u.test(file) && !/(?:\.test\.|\/__tests__\/|\/acceptance\/|\/test\/|^scripts\/)/u.test(file));
const calls=[]; const localImports=[]; const external=new Set(); const dynamicImports=[];
for(const file of runtime){
  const ast=ts.createSourceFile(file,read(file).toString(),ts.ScriptTarget.Latest,true);
  function visit(node){
    let spec;
    if(ts.isImportDeclaration(node)||ts.isExportDeclaration(node))spec=node.moduleSpecifier?.text;
    if(ts.isCallExpression(node)){
      const expr=node.expression.getText(ast),first=node.arguments[0];
      if(node.expression.kind===ts.SyntaxKind.ImportKeyword){
        if(first && ts.isStringLiteral(first))spec=first.text;else dynamicImports.push({file,line:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1});
      }
      if(/(?:\.rpc|\.from|\.functions\.invoke)$/u.test(expr) && !/^(?:Array|Buffer|Uint8Array)\.from$/u.test(expr))calls.push({file,line:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1,
        kind:expr.endsWith('.rpc')?'rpc':expr.endsWith('.from')?'table':'edge',name:first&&ts.isStringLiteral(first)?first.text:null});
    }
    if(spec){
      const mobile=file.startsWith('apps/mobile/');
      const local=spec.startsWith('.') || spec.startsWith('@/') || spec.startsWith('@shared/');
      if(local){
        const base=spec.startsWith('@shared/')?'lib/'+spec.slice(8):spec.startsWith('@/')?(mobile?'apps/mobile/src/':'')+spec.slice(2):path.posix.normalize(path.posix.join(path.posix.dirname(file),spec));
        const target=[base,base+'.ts',base+'.tsx',base+'.mjs',base+'.js',base+'.json',base+'/index.ts',base+'/index.tsx'].find(x=>names.includes(x));
        assert(target,'Unresolved source import: '+file+' '+spec);
        assert(selected.includes(target),'Dependency outside pinned scope: '+target);
        localImports.push({from:file,to:target});
      }else external.add(spec);
    }
    ts.forEachChild(node,visit);
  }visit(ast);
}
const sql=selected.filter(file=>file.startsWith('supabase/migrations/'));
const definitions=new Map();
for(const file of sql)for(const m of read(file).toString().matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?([a-z_0-9]+)/giu)){
  const name=m[1].toLowerCase();definitions.set(name,[...(definitions.get(name)??[]),file]);
}
const declaredRpc=[{file:'apps/mobile/src/chat/supabase-chat-message-action-transport.ts',names:['edit_chat_message','delete_chat_message_for_everyone','hide_chat_message_for_self']},
  {file:'supabase/functions/repertoire-upload/index.ts',names:['repertoire_cover_upload_056','repertoire_upload_054']}];
for(const group of declaredRpc)for(const name of group.names)assert(read(group.file).toString().includes("'"+name+"'"));
const rpc=[...new Set([...calls.filter(x=>x.kind==='rpc'&&x.name).map(x=>x.name),...declaredRpc.flatMap(x=>x.names)])].sort().map(name=>({name,definitions:definitions.get(name)??[],
  adaptationSources:name==='get_member_continuity_info'?['supabase/migrations/20260903214901_tenant_schema_003.sql']:[],
  boundary:definitions.has(name)?'Tracked SQL source; actual applied definitions are P3 verification':'Existing DB function adapted by 003; original body comes from restored baseline, not fresh bootstrap. Protected 2 Oct dump SHA256 9b73831cda2809273e3f671031b35ab990707c3613f2c3ffb30ddba143f15cd2; fresh catalog/recovery P3.'}));
assert(rpc.every(x=>x.definitions.length||x.adaptationSources.length),'Unknown RPC source');
const edgeEntries=selected.filter(file=>/^supabase\/functions\/[^/]+\/index\.ts$/u.test(file));
const edge=edgeEntries.map(file=>{const closure=moduleClosure([file],x=>read(x).toString());
  const slug=file.split('/')[2],section=read('supabase/config.toml').toString().match(new RegExp('\\[functions\\.'+slug+'\\]([\\s\\S]*?)(?=\\n\\[|$)'))?.[1];
  return {slug,entry:file,verifyJwt:section?.match(/verify_jwt\s*=\s*(true|false)/u)?.[1]??'default / P3 verify hosted config',...closure};});
const envNames=[...new Set(runtime.flatMap(file=>[...read(file).toString().matchAll(/(?:process\.env\.([A-Z0-9_]+)|(?:Deno\.env\.get|env|requiredEnv)\(['"]([A-Z0-9_]+)['"]\))/gu)].map(m=>m[1]??m[2])))].sort();
const full=JSON.parse(fs.readFileSync('docs/reports/090/2026-10-03-android-candidate-full-share-http-v5.json'));
for(const p of [...full.nativeSourcePins,...full.serverSourcePins])assert.equal(sha(read(p.path)),p.sha256,p.path);
const fixture=pinnedFiles().map(p=>({...p,body:Buffer.from(p.path==='app/(main)/koristler/[id]/page.tsx'?withFileMetadata(p.body.toString()):p.path==='hooks/useProtectedDriveFileUrl.ts'?withDeferredNativeProbe(p.body.toString()):p.body)}));
assert.equal(fixture.length,full.candidatePins.pins.length);
for(const p of full.candidatePins.pins)assert.equal(sha(fixture.find(x=>x.path===p.path).body),p.sha256,p.path);
for(const [file,expected]of [['supabase/test-support/090_candidate_native_interactive.mjs',full.candidatePins.factorySha256],['supabase/test-support/090_candidate_native_cache.mjs',full.candidatePins.cacheFactorySha256]])assert.equal(sha(fs.readFileSync(file)),expected,file);
const refs=[source,entry,remote,'1a014c4e1927a03a7c67dd666a91a6006a28b6f8','7cd8d460c68465055049dbf30192f7f5478bcf64'].map(ref=>({ref,tree:text('rev-parse',ref+'^{tree}')}));
const excludedSql=sql.filter(file=>!/^supabase\/migrations\/\d{14}_/u.test(file));
const result={candidateId:'GENOVA-BETA-20261003-P1',date:'2026-10-03',status:'SOURCE_FROZEN_RUNTIME_NOT_ACCEPTED',source,entry,refs,
  target:{supabaseProject:'hievmwwctjjlhmssoxsu',webOrigin:'https://app.genesinovachoir.com',applicationId:'com.genesinovachoir.genova',channel:'First controlled Android beta; distribution not authorized by this manifest',observedGitHubMain:remote,servedWebRevision:'NOT VERIFIED',hostedSqlEdgeConfig:'NOT VERIFIED'},
  construction:'git show <source>:<path> for every pin; git archive <source> for a clean full source checkout if later resources/authority allow. Do NOT apply all SQL or deploy every Edge from this inventory. Existing DB is a prerequisite, not a fresh bootstrap.',
  productEquivalentEntry:true,pins:selected.map(pin),changedVsRemote:changed,
  routes:selected.filter(file=>/^app\/.+\/(?:page|route)\.tsx?$/u.test(file)&&!file.includes('.test.')),
  dependencyInventory:{literalCalls:calls,callInventoryBoundary:'AST lexical candidates, not full execution/data-flow proof; nested relation selects, storage buckets, helper-mediated calls and runtime configuration require P3 API/DB integration audit.',declaredRpc,rpcDefinitions:rpc,dynamicImports,localImports,external:[...external].sort(),edge,environmentNamesOnly:envNames},
  sql:{baselinePrerequisites:sql.filter(file=>!changed.includes(file)).map(pin),
    sourceUpgradeSequence:sql.filter(file=>changed.includes(file)&&/^supabase\/migrations\/\d{14}_/u.test(file)).sort().map(pin),
    excludedFromAutomaticMigration:excludedSql.map(pin),
    rule:'Inspect applied IDs/checksums and recovery first. Install only missing reviewed forward SQL in this sequence; historical eight-digit and undated scripts are not replay instructions. Never run delete_bulk_songs_keep_zartzurt.sql. 078 -> 090 actor tickets -> legacy 090 required before their readers.'},
  androidReuse:{date:full.date,record:'docs/reports/090/2026-10-03-android-candidate-full-share-http-v5.json',nativePinsMatched:full.nativeSourcePins.length,serverPinsMatched:full.serverSourcePins.length,fixturePinsReconstructed:fixture.length,
    productionWebClaim:'NONE: profile fixture is not the complete frozen production web',scope:'Dated synthetic Android consent/PDF pages/share-dismissal/cleanup/AuthStore choir switch/online revocation/persistence only. No iOS/hostedRLS/fullNext/physical/recipient-delivery proof.'},
  helperSha256:sha(fs.readFileSync(import.meta.filename)),review:'Self-review only; independent package review P3'};
const serialized=JSON.stringify(result,null,2)+'\n';
assert(Buffer.byteLength(serialized)<2*1024*1024);
assert(!/apikey_[a-f0-9]{20}|eyJ[A-Za-z0-9_-]+\./u.test(serialized));
if(process.argv[2]==='--write'){assert(!fs.existsSync(out),'Do not overwrite accepted manifest');fs.writeFileSync(out,serialized,{flag:'wx'});}
else{assert.equal(process.argv[2],'--verify');assert.equal(fs.readFileSync(out,'utf8'),serialized,'Manifest drift');}
console.log(JSON.stringify({candidateId:result.candidateId,pins:result.pins.length,edges:edge.length,imports:localImports.length,calls:calls.length,rpc:rpc.length,baselineRpcPrerequisites:rpc.filter(x=>!x.definitions.length).map(x=>x.name),dynamicRpcCalls:calls.filter(x=>x.kind==='rpc'&&!x.name),dynamicImports,sqlDeltaCount:result.sql.sourceUpgradeSequence.length,excludedSqlCount:excludedSql.length,android:result.androidReuse,bytes:Buffer.byteLength(serialized)}));
