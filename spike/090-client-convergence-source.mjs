// Child source evidence only. No fixture overlays, runtime construction or release.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { moduleClosure } from '../supabase/test-support/090_candidate_source.mjs';

const ts = createRequire(import.meta.url)('typescript');
const sha = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 });
const source = '071465fc8ccb33877341c85bb4c62e38aee4ca1c';
const parentPath = 'docs/reports/090/2026-10-03-p1-beta-candidate.json';
const output = 'docs/reports/090/2026-10-09-p3-client-convergence-source.json';
const parent = JSON.parse(fs.readFileSync(parentPath));
const changes = ['components/FloatingMiniPlayer.tsx', 'components/repertuvar/RepertoireWorkspace.tsx',
  'hooks/useProtectedDriveFileUrl.ts', 'lib/drive-file-url.ts'].sort();
const additions = ['components/FloatingMiniPlayer.private-file-log.test.tsx',
  'components/repertuvar/RepertoireWorkspace.private-file-log.test.tsx',
  'hooks/useProtectedDriveFileUrl.integration.test.tsx'].sort();
const roots = ['app/', 'components/', 'hooks/', 'lib/', 'store/', 'public/', 'scripts/',
  'apps/mobile/', 'supabase/functions/', 'supabase/migrations/'];
const configs = parent.pins.map(pin => pin.path).filter(file => !roots.some(root => file.startsWith(root)));
const names = git('ls-tree', '-r', '--name-only', source).toString().trim().split('\n');
const selected = [...parent.pins.map(pin => pin.path), ...additions];
const bodies = new Map();
const read = file => {
  if (!bodies.has(file)) bodies.set(file, git('show', `${source}:${file}`));
  return bodies.get(file);
};
const pin = file => ({ path: file, bytes: read(file).length, sha256: sha(read(file)) });
assert.deepEqual(git('diff', '--name-only', parent.source, source, '--', ...roots, ...configs)
  .toString().trim().split('\n').sort(), [...changes, ...additions].sort(), 'Unexpected product delta');
for (const p of parent.pins) {
  assert.equal(sha(git('show', `${parent.source}:${p.path}`)), p.sha256, 'Immutable parent drift');
}
const changed = parent.pins.filter(p => p.sha256 !== sha(read(p.path))).map(p => p.path).sort();
assert.deepEqual(changed, changes);
for (const file of selected) assert.equal(sha(fs.readFileSync(file)), sha(read(file)), 'Working/source identity mismatch: ' + file);

// Same literal-import inventory semantics as P1, not a data-flow/runtime proof.
const imports = [], dynamic = [];
for (const file of selected.filter(file => /\.(?:ts|tsx|mjs|js)$/u.test(file)
  && !/(?:\.test\.|\/__tests__\/|\/acceptance\/|\/test\/|^scripts\/)/u.test(file))) {
  const ast = ts.createSourceFile(file, read(file).toString(), ts.ScriptTarget.Latest, true);
  function visit(node) {
    let spec;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) spec = node.moduleSpecifier?.text;
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const first = node.arguments[0];
      if (first && ts.isStringLiteral(first)) spec = first.text;
      else dynamic.push({ file, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1 });
    }
    if (spec && (spec.startsWith('.') || spec.startsWith('@/') || spec.startsWith('@shared/'))) {
      const base = spec.startsWith('@shared/') ? 'lib/' + spec.slice(8)
        : spec.startsWith('@/') ? (file.startsWith('apps/mobile/') ? 'apps/mobile/src/' : '') + spec.slice(2)
          : path.posix.normalize(path.posix.join(path.posix.dirname(file), spec));
      const target = [base, base + '.ts', base + '.tsx', base + '.mjs', base + '.js', base + '.json',
        base + '/index.ts', base + '/index.tsx'].find(candidate => names.includes(candidate));
      assert(target && selected.includes(target), 'Unpinned dependency: ' + file + ' ' + spec);
      imports.push({ from: file, to: target });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
const edgeKey = edge => JSON.stringify(edge);
const parentEdges = new Set(parent.dependencyInventory.localImports.map(edgeKey));
const currentEdges = new Set(imports.map(edgeKey));
const addedImports = imports.filter(edge => !parentEdges.has(edgeKey(edge)));
const removedImports = parent.dependencyInventory.localImports.filter(edge => !currentEdges.has(edgeKey(edge)));
assert.deepEqual(addedImports, [{ from: 'hooks/useProtectedDriveFileUrl.ts', to: 'lib/embedded-web-runtime.ts' }]);
assert.deepEqual(removedImports, []);
assert.deepEqual(dynamic, parent.dependencyInventory.dynamicImports);
for (const edge of parent.dependencyInventory.edge) {
  assert.deepEqual(moduleClosure([edge.entry], file => read(file).toString()), {
    files: edge.files, imports: edge.imports, external: edge.external,
  }, 'Unexpected Edge closure drift: ' + edge.slug);
}
const historical = [parentPath, 'docs/reports/2026-10-03-ios-p2-private-file-acceptance.md',
  'docs/reports/090/2026-10-03-android-candidate-full-share-http-v5.json'];
const result = {
  date: '2026-10-09', candidateId: 'GENOVA-BETA-20261003-P1-CLIENT-090-20261009',
  status: 'LOCAL_CLIENT_SOURCE_CHECKPOINT_ONLY_NOT_RELEASE_READY', source,
  sourceTree: git('rev-parse', `${source}^{tree}`).toString().trim(),
  parent: { candidateId: parent.candidateId, source: parent.source, path: parentPath, sha256: sha(fs.readFileSync(parentPath)) },
  immutableAcceptanceParents: historical.map(file => ({ path: file, sha256: sha(fs.readFileSync(file)) })),
  construction: 'Read this exact committed source without overlays; do not feed it to historical profile/backport factories.',
  pins: selected.map(pin), changedPins: changes.map(file => ({ ...pin(file), parentSha256: parent.pins.find(p => p.path === file).sha256 })),
  addedTests: additions.map(pin), unchangedParentPins: parent.pins.length - changes.length,
  closureComparison: { semantics: 'P1 AST literal imports only, not runtime authorization proof',
    parentImports: parent.dependencyInventory.localImports.length, currentImports: imports.length,
    addedImports, removedImports, dynamicImports: dynamic, unchangedEdgeClosures: parent.dependencyInventory.edge.length,
    routesUnchanged: parent.routes.length, annotationSchemaUnchanged: true, nativeAndSqlPinsUnchanged: true },
  pending: ['retained Auth not_after SQL/HTTP repair across all five families',
    'real current-source mixed-client/cache/server rehearsal', 'agent-owned integrated Android/iOS reacceptance',
    'independent review and separately authorized hosted promotion/provider activation/distribution'],
  helperSha256: sha(fs.readFileSync(import.meta.filename)),
  boundary: 'Source and local DOM/network regression evidence only; P1/P2 remain historical, no hosted/native/device/beta/store acceptance.',
};
const serialized = JSON.stringify(result, null, 2) + '\n';
assert(Buffer.byteLength(serialized) < 256 * 1024);
assert(!/apikey_[a-f0-9]{20}|eyJ[A-Za-z0-9_-]+\./u.test(serialized));
if (process.argv[2] === '--write') fs.writeFileSync(output, serialized, { flag: 'wx' });
else { assert.equal(process.argv[2], '--verify'); assert.equal(fs.readFileSync(output, 'utf8'), serialized, 'Child manifest drift'); }
console.log(JSON.stringify({ candidateId: result.candidateId, pins: result.pins.length, changed: changed.length,
  addedTests: additions.length, ...result.closureComparison, bytes: Buffer.byteLength(serialized) }));
