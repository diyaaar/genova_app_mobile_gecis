// Minimal pinned cache backport, not a new runtime or an authorization policy.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { once } from 'node:events';
import { ROOT, WEB_REF, hash, validatePinnedSource, buildEnv } from './090_android_candidate.mjs';
const ts = createRequire(import.meta.url)('typescript');
export const ACCEPTED_REF = 'd298229939bafaf881273e485eb2174c19e67fd0';
export const CACHE_CANDIDATE = ROOT + '/spike/090-runtime/native-cache-candidate';
export const sourceAt = (ref, file) => execFileSync('git', ['show', ref + ':' + file], { cwd: ROOT });
export function named(source, name) {
  const tree = ts.createSourceFile('source.ts', source, ts.ScriptTarget.Latest, true);
  const nodes = tree.statements.filter(node => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.equal(nodes.length, 1, 'Refuse missing/ambiguous function: ' + name);
  return nodes[0].getText(tree);
}
export function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, 'Refuse changed/ambiguous source boundary');
  return source.replace(before, after);
}
export function overlays(read = sourceAt) {
  const files = new Map();
  const imported = "import { isEmbeddedRuntimeActive } from '@/lib/embedded-web-runtime';\n";
  const offlineFile = 'lib/repertuvar/offline.ts', catalogFile = 'lib/repertuvar/cache.ts';
  const oldOffline = read(WEB_REF, offlineFile).toString(), newOffline = read(ACCEPTED_REF, offlineFile).toString();
  const oldGuard = named(oldOffline, 'isRepertoireOfflineSupported'), newGuard = named(newOffline, 'isRepertoireOfflineSupported');
  assert.equal(newGuard.replace(' || isEmbeddedRuntimeActive()', ''), oldGuard, 'Only the accepted embedded guard may differ');
  files.set(offlineFile, imported + replaceOnce(oldOffline, oldGuard, newGuard));
  let catalog = read(WEB_REF, catalogFile).toString();
  const accepted = read(ACCEPTED_REF, catalogFile).toString();
  const browser = named(catalog, 'isBrowserEnvironment');
  catalog = replaceOnce(catalog, browser, browser + '\n\n' + named(accepted, 'canUsePersistentCatalogCache'));
  for (const name of ['readRepertoireCatalogCache', 'writeRepertoireCatalogCache', 'updateRepertoireCatalogCache']) {
    const before = named(catalog, name), after = named(accepted, name);
    assert.equal(after.replace('canUsePersistentCatalogCache()', 'isBrowserEnvironment()'), before,
      'Only the persistence predicate may differ: ' + name);
    catalog = replaceOnce(catalog, before, after);
  }
  files.set(catalogFile, imported + catalog);
  return files;
}
export function pinnedFiles() {
  const manifest = JSON.parse(fs.readFileSync(ROOT + '/docs/reports/090/2026-10-03-embedded-profile-source-manifest.json'));
  assert.equal(manifest.localCommit, WEB_REF);
  const delta = overlays();
  return validatePinnedSource(manifest.pins).map(entry => ({ ...entry,
    body: delta.has(entry.path) ? Buffer.from(delta.get(entry.path)) : entry.body }));
}
export function materializeCache() {
  assert.equal(process.cwd(), ROOT); assert(!fs.existsSync(CACHE_CANDIDATE), 'Refuse existing runtime');
  const files = pinnedFiles();
  fs.mkdirSync(CACHE_CANDIDATE); assert.equal(fs.realpathSync(CACHE_CANDIDATE), CACHE_CANDIDATE);
  for (const entry of files) {
    const target = CACHE_CANDIDATE + '/' + entry.path; fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, entry.body, { flag: 'wx' });
  }
  fs.symlinkSync(ROOT + '/node_modules', CACHE_CANDIDATE + '/node_modules', 'dir');
  const manifest = { parentRef: WEB_REF, acceptedGuardRef: ACCEPTED_REF, factorySha256: hash(fs.readFileSync(import.meta.filename)),
    delta: [...overlays().keys()], pins: files.map(entry => ({ path: entry.path, sha256: hash(entry.body) })),
    borrowed: ['lib/repertuvar/offline.ts', 'lib/repertuvar/cache.ts'].map(file => ({ path: file, sha256: hash(sourceAt(ACCEPTED_REF, file)) })),
    boundary: 'Two guard-only deltas;424 parent files byte-identical. Native/platform/consent/share/hosted not accepted by this factory.' };
  fs.writeFileSync(CACHE_CANDIDATE + '/native-cache-source.json', JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  return manifest;
}
if (process.argv[1] === import.meta.filename) {
  assert.equal(process.cwd(), ROOT); assert.equal(process.argv.length, 3);
  if (process.argv[2] === '--materialize-owned') {
    const manifest = materializeCache(); console.log(JSON.stringify({ parentRef: manifest.parentRef, files: manifest.pins.length, delta: manifest.delta }));
  } else {
    assert.equal(process.argv[2], '--build-owned');
    const manifest = JSON.parse(fs.readFileSync(CACHE_CANDIDATE + '/native-cache-source.json'));
    for (const pin of manifest.pins) assert.equal(hash(fs.readFileSync(CACHE_CANDIDATE + '/' + pin.path)), pin.sha256);
    const child = spawn(process.execPath, [ROOT + '/node_modules/next/dist/bin/next', 'build'],
      { cwd: CACHE_CANDIDATE, env: buildEnv(), stdio: 'inherit' });
    const [code] = await once(child, 'exit'); assert.equal(code, 0);
  }
}
