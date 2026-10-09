// Reproducible, minimal BACKPORT candidate, not a second production implementation.
// Actual accepted source nodes supply cache/authority behavior; refuse changed baseline.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const ts = require('typescript');
export const BASE = 'a13f696da8c731e9af2a2bce473d4f4ae4a81587';
export const ROOT = '/Users/alidiyarduran/Antigravity/genovakorist';
export const CANDIDATE = ROOT + '/spike/090-runtime/candidate';
export const BASELINE_RUNTIME = ROOT + '/spike/090-runtime/baseline';
export const hash = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio:['ignore','pipe','pipe'] });
export const oldSource = file => git('show', `${BASE}:${file}`);
const current = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
function tree(source, file = 'source.tsx') { return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); }
function oneReplace(source, before, after) {
  assert.equal(source.split(before).length, 2, 'Refuse ambiguous/missing backport boundary: ' + before.slice(0, 90));
  return source.replace(before, after);
}
function named(source, name) {
  const ast = tree(source);
  const nodes = ast.statements.filter(node => node.name?.text === name ||
    (ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText(ast) === name)));
  assert.equal(nodes.length, 1, name);
  return nodes[0].getText(ast);
}
function callback(source, predicate) {
  const ast = tree(source), nodes = [];
  function visit(node) { if (ts.isArrowFunction(node) && ts.isCallExpression(node.parent) &&
    node.parent.expression.getText(ast) === 'audioFiles.map' && predicate(node.getText(ast))) nodes.push(node);
  ts.forEachChild(node, visit); }
  visit(ast); assert.equal(nodes.length, 1);
  return nodes[0].getText(ast);
}
function legacyLoaderTests() {
  let source=oldSource('lib/drive-file-url.test.ts');
  source=oneReplace(source,'clearProtectedDriveFileUrlCache, getProtectedDriveFileUrl',
    'clearProtectedDriveFileUrlCache, getProtectedDriveFileUrl, getOnlineAuthorizedPrivateFileUrl');
  for(const token of ['a','b'])source=oneReplace(source,
    `expect(fetchMock.mock.calls[${token==='a'?0:1}]?.[1]?.headers).toMatchObject({ Authorization: 'Bearer token-${token}' });`,
    `expect(new Headers(fetchMock.mock.calls[${token==='a'?0:1}]?.[1]?.headers).get('Authorization')).toBe('Bearer token-${token}');`);
  const latest=current('lib/drive-file-url.test.ts'),ast=tree(latest),tests=[];
  const names=['coalesces same-session same-file issuance without bypassing the session check',
    'renews a 401 URL without cancelling another file in flight'];
  function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='it'&&names.includes(node.arguments[0]?.text))tests.push(node.parent.getText(ast));ts.forEachChild(node,visit);}
  visit(ast);assert.equal(tests.length,names.length);assert(source.endsWith('});\n'));
  return source.slice(0,-4)+tests.join('\n\n')+'\n});\n';
}
function legacyLoader() {
  const source = current('lib/drive-file-url.ts');
  const names = ['CachedDriveUrl', 'driveUrlCache', 'driveUrlLoads', 'cacheGeneration', 'cacheIdentity',
    'sessionRequestSequence', 'lastResolvedSessionRequest', 'resolveCachedUrl', 'invalidateProtectedFileUrl', 'getCacheKey',
    'clearProtectedDriveFileUrlCache', 'getOnlineAuthorizedPrivateFileUrl', 'requireCurrentSession',
    'getProtectedDriveFileUrl'];
  // Baseline has browser Auth only. Preserve its bearer source rather than dragging
  // current main's embedded runtime/native/five-family feature graph into this backport.
  return `import {supabase, type RepertoireFile} from '@/lib/supabase';
import {ProtectedFileRequestError} from '@/lib/repertuvar/protected-file-client';
async function requireCurrentWebAccess() {
  const {data,error}=await supabase.auth.getSession();
  if(error || !data.session?.access_token || !data.session.user?.id) throw new Error('Oturum bulunamadı.');
  return {accessToken:data.session.access_token,userId:data.session.user.id};
}
async function authenticatedWebFetch(input:RequestInfo | URL,init:RequestInit,access:{accessToken:string;userId:string}) {
  const headers=new Headers(init.headers);headers.set('Authorization','Bearer '+access.accessToken);
  return fetch(input,{...init,headers});
}
` + names.map(name => named(source, name)).join('\n\n') + '\n';
}
function legacyHook() {
  let source = current('hooks/useProtectedDriveFileUrl.ts');
  source = oneReplace(source, "import { isEmbeddedRuntimeActive } from '@/lib/embedded-web-runtime';\n", '');
  source = oneReplace(source, `        // Embedded resolution may issue a scoped ticket, never read bytes. Native
        // confirmation owns the first download/probe and its server authorization.
        // Ordinary browsers must retain the fresh HEAD decision.
        const nextUrl = isEmbeddedRuntimeActive()
          ? await loadTicketUrl() : await getOnlineAuthorizedPrivateFileUrl(loadTicketUrl);`,
    `        // This backport serves ordinary browsers only; retain the fresh HEAD decision.
        const nextUrl = await getOnlineAuthorizedPrivateFileUrl(loadTicketUrl);`);
  source = oneReplace(source, 'runtimeSupported && !isEmbeddedRuntimeActive() && nextUrl && runtimeVersion',
    'runtimeSupported && nextUrl && runtimeVersion');
  const ast = tree(source), fn = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === 'useProtectedDriveFileUrl');
  assert.equal(fn.parameters.length, 2);
  source = oneReplace(source, '  ' + fn.parameters[1].getText(ast) + ',\n', '');
  source = oneReplace(source, source.split('\n').find(line => line.startsWith('import { clearProtectedDriveFileUrlCache')),
    "import { clearProtectedDriveFileUrlCache, getOnlineAuthorizedPrivateFileUrl, getProtectedDriveFileUrl } from '@/lib/drive-file-url';");
  source = oneReplace(source, source.split('\n').find(line => line.includes('const fileKey =')),
    "  const fileKey = `${repositoryFileId ?? ''}:${driveFileId ?? ''}`;");
  source = oneReplace(source, source.split('\n').find(line => line.includes('const runtimeSupported =')),
    '      const runtimeSupported = isRepertoireRuntimeCacheSupported();');
  source = oneReplace(source, `        if (options.repertoireFile && !repositoryFileId) {
          throw new Error('Dosya kimliği geçersiz.');
        }
`, '');
  const nextTree = tree(source); let ticketDeclaration;
  function visit(node) { if (ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText(nextTree) === 'loadTicketUrl')) ticketDeclaration = node; ts.forEachChild(node, visit); }
  visit(nextTree); assert(ticketDeclaration);
  source = oneReplace(source, ticketDeclaration.getText(nextTree), 'const loadTicketUrl = async () => getProtectedDriveFileUrl(fileDescriptor);');
  source = source.replace(/options\.\w+,\s*/gu, '');
  assert(!source.includes('options.'));
  assert(!source.includes('isEmbeddedRuntimeActive'), 'No native-mode dependency in an old-browser backport');
  return source;
}
function mediaErrorPrefix(source) {
  const ast = tree(source), nodes = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'handleError') nodes.push(node.initializer);
    ts.forEachChild(node, visit);
  }
  visit(ast); assert.equal(nodes.length, 1, 'Ambiguous media error handler');
  const statements = nodes[0].body.statements;
  assert(ts.isVariableStatement(statements[0]) && ts.isExpressionStatement(statements[1]));
  assert(statements[1].getText(ast).startsWith('console.error('));
  return source.slice(statements[0].getStart(ast), statements[1].end);
}
function miniPlayer() {
  const source = oldSource('components/FloatingMiniPlayer.tsx');
  return oneReplace(source, mediaErrorPrefix(source), mediaErrorPrefix(current('components/FloatingMiniPlayer.tsx')));
}
function workspace() {
  let source = oldSource('components/repertuvar/RepertoireWorkspace.tsx');
  const latest = current('components/repertuvar/RepertoireWorkspace.tsx');
  source=oneReplace(source,'// ─── AudioPanel ──────────────────────────────────────────────────────────────',
    '// ─── AudioPanel ──────────────────────────────────────────────────────────────\n'+named(latest,'suspendMiniAudioSources'));
  const latestAst=tree(latest),guards=[];
  function findGuard(node){if(ts.isIfStatement(node)&&node.expression.getText(latestAst)==='!allowOfflineFallback && !selectedAudioSource')guards.push(node.getText(latestAst));ts.forEachChild(node,findGuard);}
  findGuard(latestAst);assert.equal(guards.length,1);
  source=oneReplace(source,'async function buildAndSetTracks() {','async function buildAndSetTracks() {\n      '+guards[0]);
  source=oneReplace(source,"import { Document, Page, pdfjs } from 'react-pdf';",
    "import { Document, Page, pdfjs } from 'react-pdf';\nimport { getRepertoirePdfWorker } from '@/lib/repertuvar/pdf-worker';");
  source=oneReplace(source,'const memoizedPdfOptions = useMemo(() => ({',
    'const memoizedPdfOptions = useMemo(() => ({\n    worker: getRepertoirePdfWorker(),');
  source = oneReplace(source, named(source, 'getInlineFileSource'), named(latest, 'getInlineFileSource'));
  source = oneReplace(source, callback(source, text => text.includes('getProtectedDriveFileUrl')),
    callback(latest, text => text.includes('getProtectedRepertoireFileUrl')).replaceAll('getProtectedRepertoireFileUrl', 'getProtectedDriveFileUrl'));
  source = oneReplace(source, "import { getProtectedDriveFileUrl } from '@/lib/drive-file-url';",
    "import { getProtectedDriveFileUrl, getOnlineAuthorizedPrivateFileUrl } from '@/lib/drive-file-url';");
  source = oneReplace(source, '  const hasFreshOfflineSnapshot = offlineEnabled && offlineSyncedVersion === offlineSongVersion;\n', '');
  source = oneReplace(source, 'const allowOfflineFallback = offlineEnabled && (!isOnline || hasFreshOfflineSnapshot);',
    'const allowOfflineFallback = offlineEnabled && !isOnline;');
  source = oneReplace(source, '  renderUi?: boolean;', '  renderUi?: boolean;\n  onSelectedAudioBodyError: () => void;');
  source = oneReplace(source, '  renderUi = true,', '  renderUi = true,\n  onSelectedAudioBodyError,');
  source = oneReplace(source, '      setMiniPlaybackState({ isPlaying: false });\n    };\n\n    el.addEventListener',
    '      setMiniPlaybackState({ isPlaying: false });\n      onSelectedAudioBodyError();\n    };\n\n    el.addEventListener');
  source = oneReplace(source, '[isDragging, playbackRate, selectedAudioSource, setAudioState, setMiniPlaybackState]',
    '[isDragging, playbackRate, selectedAudioSource, setAudioState, setMiniPlaybackState, onSelectedAudioBodyError]');
  for(const family of ['Pdf','Audio']) source=oneReplace(source,
    `const { url: protectedSelected${family}Source, isStaleLocal: selected${family}IsStaleLocal }`,
    `const { url: protectedSelected${family}Source, isStaleLocal: selected${family}IsStaleLocal, onBodyError: onSelected${family}BodyError }`);
  source=oneReplace(source,'        selectedAudioSource={selectedAudioSource}',
    '        selectedAudioSource={selectedAudioSource}\n        onSelectedAudioBodyError={onSelectedAudioBodyError}');
  source=oneReplace(source,'                  onLoadError={(error) => {',
    '                  onLoadError={(error) => {\n                    onSelectedPdfBodyError();');
  source=oneReplace(source,mediaErrorPrefix(source),mediaErrorPrefix(latest));
  return source;
}
export function moduleClosure(entries, read = current) {
  const files = new Map(), imports = [], external = new Set();
  function visit(file) {
    if (files.has(file)) return;
    const source = read(file); files.set(file, {path:file,bytes:Buffer.byteLength(source),sha256:hash(source)});
    const ast = tree(source, file);
    function scan(node) {
      let specifier;
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) specifier = node.moduleSpecifier.text;
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(ast) === 'require')) {
        assert(node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]), 'Nonliteral dependency: ' + file);
        specifier = node.arguments[0].text;
      }
      if (specifier) {
        if (specifier.startsWith('.') || specifier.startsWith('@/')) {
          const start = specifier.startsWith('@/') ? specifier.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
          assert(!start.startsWith('../'));
          const choices = [start, start + '.ts', start + '.tsx', start + '.mjs', start + '/index.ts', start + '/index.tsx'];
          const target = choices.find(candidate => {try {read(candidate);return true;}catch{return false;}});
          assert(target, 'Missing dependency: ' + file + ' ' + specifier);
          imports.push({from:file,to:target,specifier}); visit(target);
        } else external.add(specifier);
      }
      ts.forEachChild(node, scan);
    }
    scan(ast);
  }
  entries.forEach(visit);
  return {files:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)),imports,external:[...external].sort()};
}
export function overlays() {
  const files = new Map([
    ['components/FloatingMiniPlayer.tsx', miniPlayer()],
    ['lib/drive-file-url.ts', legacyLoader()],
    ['hooks/useProtectedDriveFileUrl.ts', legacyHook()],
    ['components/repertuvar/RepertoireWorkspace.tsx', workspace()],
    ['lib/repertuvar/protected-file-client.ts', named(current('lib/repertuvar/protected-file-client.ts'), 'ProtectedFileRequestError') + '\n'],
    ['hooks/useProtectedDriveFileUrl.test.tsx', current('hooks/useProtectedDriveFileUrl.test.tsx').replaceAll(', { repertoireFile: true }', '')],
    ['lib/drive-file-url.test.ts',legacyLoaderTests()],
    ['lib/repertuvar/pdf-worker.ts',current('lib/repertuvar/pdf-worker.ts')],
    ['lib/repertuvar/pdf-worker.test.ts',current('lib/repertuvar/pdf-worker.test.ts')],
  ]);
  const slugs = ['repertoire-file','assignment-file','assignment-review-file','repertoire-comment-file','chat-media-file','legacy-file'];
  const closure = moduleClosure(slugs.map(slug => `supabase/functions/${slug}/index.ts`));
  for (const {path:file} of closure.files) files.set(file, current(file));
  for (const file of ['app/api/drive-file-token/route.ts','app/api/drive-file/[id]/route.ts',
    'lib/server/legacy-file-adapter.ts','app/api/drive-file-token/route.test.ts',
    'app/api/drive-file/[id]/route.test.ts',
    'supabase/migrations/20260928140000_active_membership_revocation_078.sql',
    'supabase/migrations/20260930080046_private_file_ticket_authority_090.sql',
    'supabase/migrations/20261002154343_legacy_file_authority_090.sql',
    'supabase/migrations/20261009190611_private_file_session_expiry_090.sql']) files.set(file, current(file));
  let config = oldSource('supabase/config.toml');
  for (const slug of slugs) {
    assert(!config.includes(`[functions.${slug}]`));
    config += `\n[functions.${slug}]\nverify_jwt = false\n`;
  }
  files.set('supabase/config.toml',config);
  // Store only actual delta paths, not unchanged baseline dependencies.
  for (const [file,source] of files) {try {if(oldSource(file)===source) files.delete(file);}catch{/* New path */}}
  return {files,closure,slugs};
}
export function materialize(refresh = false) {
  assert.equal(process.cwd(),ROOT);
  if(refresh){
    assert.equal(fs.realpathSync(CANDIDATE),CANDIDATE);
    const prior=JSON.parse(fs.readFileSync(CANDIDATE+'/candidate-source.json','utf8'));
    assert.equal(prior.baseline,BASE);
    for(const pin of prior.changed) assert.equal(hash(fs.readFileSync(CANDIDATE+'/'+pin.path)),pin.sha256,'Refuse external candidate source edit');
  }else assert(!fs.existsSync(CANDIDATE),'Refuse replacing an existing candidate');
  const parent=path.dirname(CANDIDATE);fs.mkdirSync(parent,{recursive:true});
  assert.equal(fs.realpathSync(parent),parent);
  if(!refresh) fs.mkdirSync(CANDIDATE);
  const baselinePaths=git('ls-tree','-r','--name-only',BASE).trim().split('\n');
  // Source/runtime only; do not replay historical agent instructions in a child directory.
  const runtimePaths=baselinePaths.filter(file=>!file.endsWith('AGENTS.md') &&
    !/^(docs|memory-bank|spike|apps)\//u.test(file) && !['KARARLAR.md','MIGRATION.md'].includes(file));
  for(const file of refresh?[]:runtimePaths){const destination=path.join(CANDIDATE,file);fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.writeFileSync(destination,execFileSync('git',['show',`${BASE}:${file}`],{cwd:ROOT}),{flag:'wx'});}
  const {files,closure,slugs}=overlays();
  for(const [file,source]of files){const destination=path.join(CANDIDATE,file);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,source);}
  if(!refresh) fs.symlinkSync(ROOT+'/node_modules',CANDIDATE+'/node_modules','dir');
  for(const file of runtimePaths)if(!files.has(file))assert.equal(hash(fs.readFileSync(CANDIDATE+'/'+file)),hash(execFileSync('git',['show',`${BASE}:${file}`],{cwd:ROOT})),file);
  assert.equal(hash(fs.readFileSync(CANDIDATE+'/pnpm-lock.yaml')),hash(oldSource('pnpm-lock.yaml')));
  assert.equal(hash(fs.readFileSync(CANDIDATE+'/package.json')),hash(oldSource('package.json')));
  return {baseline:BASE,sourceRevision:git('rev-parse','HEAD').trim(),runtimeBaselinePaths:runtimePaths.length,
    unchangedRuntimePaths:runtimePaths.length-[...files.keys()].filter(file=>runtimePaths.includes(file)).length,
    changed:[...files].map(([file,source])=>({path:file,bytes:Buffer.byteLength(source),sha256:hash(source)})),closure,slugs};
}
export function materializeBaseline() {
  assert.equal(process.cwd(),ROOT);assert(!fs.existsSync(BASELINE_RUNTIME));
  fs.mkdirSync(BASELINE_RUNTIME,{recursive:true});assert.equal(fs.realpathSync(BASELINE_RUNTIME),BASELINE_RUNTIME);
  const paths=git('ls-tree','-r','--name-only',BASE).trim().split('\n').filter(file=>!file.endsWith('AGENTS.md')&& !/^(docs|memory-bank|spike|apps)\//u.test(file)&& !['KARARLAR.md','MIGRATION.md'].includes(file));
  for(const file of paths){const target=path.join(BASELINE_RUNTIME,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,execFileSync('git',['show',`${BASE}:${file}`],{cwd:ROOT}),{flag:'wx'});}
  fs.symlinkSync(ROOT+'/node_modules',BASELINE_RUNTIME+'/node_modules','dir');
  return {baseline:BASE,paths:paths.length,path:BASELINE_RUNTIME};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
  assert.equal(process.argv.length,3);
  assert(['--materialize-owned','--refresh-owned-unaccepted','--materialize-baseline-owned'].includes(process.argv[2]));
  if(process.argv[2]==='--materialize-baseline-owned'){console.log(JSON.stringify(materializeBaseline()));process.exit(0);}
  const refresh=process.argv[2]==='--refresh-owned-unaccepted';
  const result=materialize(refresh);
  fs.writeFileSync(CANDIDATE+'/candidate-source.json',JSON.stringify(result,null,2)+'\n',{flag:refresh?'w':'wx'});
  console.log(JSON.stringify({baseline:result.baseline,changed:result.changed.length,unchanged:result.unchangedRuntimePaths,edgeModules:result.closure.files.length,path:CANDIDATE}));
}
