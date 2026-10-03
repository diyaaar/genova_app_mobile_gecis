import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { overlays, named, sourceAt, pinnedFiles, replaceOnce } from './090_candidate_native_cache.mjs';
import { WEB_REF, hash } from './090_android_candidate.mjs';
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
const catalog = { version: 1, versionUpdatedAt: null, cachedAt: 1, songs: [], tags: [], userParts: {}, assignedSongIds: [] };
async function actualModules(patched) {
  const delta = patched ? overlays() : new Map();
  const result = await build({ stdin: { contents: `export * from '@/lib/repertuvar/cache';
export * from '@/lib/repertuvar/offline'; export {activateEmbeddedRuntime} from '@/lib/embedded-web-runtime';` },
    bundle: true, platform: 'node', format: 'esm', write: false, define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'exact-pinned-git-modules', setup(plugin) {
      plugin.onResolve({ filter: /^(?:@\/|\.\/)/ }, args => {
        const file = args.path.startsWith('@/') ? args.path.slice(2) : path.posix.join(path.posix.dirname(args.importer), args.path);
        return { path: file.endsWith('.ts') ? file : file + '.ts', namespace: 'pinned' };
      });
      plugin.onLoad({ filter: /.*/, namespace: 'pinned' }, args => ({ contents: delta.get(args.path) ?? sourceAt(WEB_REF, args.path).toString(), loader: 'ts' }));
    } }] });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64') + '#' + randomUUID());
}
function browserPorts() {
  const store = new Map(), calls = { reads: 0, writes: 0, registers: 0, messages: 0, deleted: [] };
  const saved = new Map(['window', 'navigator'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const storage = { getItem(key) { calls.reads++; return store.get(key) ?? null; },
    setItem(key, value) { calls.writes++; store.set(key, value); }, removeItem: key => store.delete(key),
    key: index => [...store.keys()][index], get length() { return store.size; } };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: storage,
    caches: { async delete(key) { calls.deleted.push(key); return true; } } } });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { serviceWorker: {
    async register() { calls.registers++; throw Error('synthetic browser worker reached'); },
    controller: { postMessage() { calls.messages++; } } } } });
  return { calls, store, close() { for (const [key, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  } } };
}
test('negative control: exact7cd8d46 persists private catalog and reaches worker registration after embedded activation', async () => {
  const api = await actualModules(false), ports = browserPorts();
  try {
    api.activateEmbeddedRuntime(); assert(api.isRepertoireRuntimeCacheSupported());
    api.writeRepertoireCatalogCache('synthetic-a', catalog);
    assert.deepEqual(api.readRepertoireCatalogCache('synthetic-a'), catalog);
    await assert.rejects(api.cacheRuntimeDriveFile({ driveFileId: 'synthetic', url: 'https://example.invalid/score', version: '1' }), /synthetic browser worker reached/);
    assert.equal(ports.calls.registers, 1); assert.equal(ports.calls.writes, 1);
  } finally { ports.close(); }
});
test('patched embedded guard refuses catalog read/write/update and all worker entry points before side effects; cleanup survives', async () => {
  const api = await actualModules(true), ports = browserPorts();
  try {
    ports.store.set('genova.repertoire.catalog.v2:old-a', JSON.stringify(catalog));
    ports.store.set('unrelated-preference', 'preserve'); api.activateEmbeddedRuntime();
    assert.equal(api.isRepertoireRuntimeCacheSupported(), false);
    assert.equal(api.readRepertoireCatalogCache('old-a'), null);
    api.writeRepertoireCatalogCache('new-a', catalog);
    api.updateRepertoireCatalogCache('new-a', current => { assert.equal(current, null); return catalog; });
    for (const task of [() => api.cacheRuntimeDriveFile({}), () => api.getRuntimeDriveFileCacheStatus('a', '1'),
      () => api.syncSongFilesForOffline('a', []), () => api.removeOfflineSongFiles('a')]) {
      await assert.rejects(task(), /offline repertuvar desteğini/);
    }
    assert.equal(ports.calls.reads, 0); assert.equal(ports.calls.writes, 0);
    assert.equal(ports.calls.registers, 0); assert.equal(ports.calls.messages, 0);
    assert(!ports.store.has('genova.repertoire.catalog.v2:new-a'));
    api.clearRepertoireMetadataCaches(); await api.clearProtectedDriveFileCaches();
    assert(!ports.store.has('genova.repertoire.catalog.v2:old-a'));
    assert.equal(ports.store.get('unrelated-preference'), 'preserve'); assert.equal(ports.calls.deleted.length, 4);
    assert.equal(ports.calls.registers, 0);
  } finally { ports.close(); }
});
test('ordinary browser catalog read/write/update and offline registration behavior remain intact', async () => {
  const api = await actualModules(true), ports = browserPorts();
  try {
    assert(api.isRepertoireRuntimeCacheSupported()); api.writeRepertoireCatalogCache('a', catalog);
    assert.deepEqual(api.readRepertoireCatalogCache('a'), catalog);
    const updated = api.updateRepertoireCatalogCache('a', current => ({ ...current, version: 2 }));
    assert.equal(updated.version, 2); assert.equal(api.readRepertoireCatalogCache('a').version, 2);
    await assert.rejects(api.cacheRuntimeDriveFile({}), /synthetic browser worker reached/);
    assert.equal(ports.calls.registers, 1);
  } finally { ports.close(); }
});
test('only two guarded modules differ;424 raw parent files including PNG remain exact', () => {
  const files = pinnedFiles(), changed = files.filter(file => hash(file.body) !== file.sha256);
  assert.deepEqual(changed.map(file => file.path).sort(), ['lib/repertuvar/cache.ts', 'lib/repertuvar/offline.ts']);
  assert.equal(files.length - changed.length, 424);
  assert.equal(files.find(file => file.path === 'public/login.png').body.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});
test('missing, ambiguous and unrelated borrowed changes fail closed; catalog cleanup function is unchanged', () => {
  assert.throws(() => replaceOnce('none', 'guard', 'new'));
  assert.throws(() => replaceOnce('guard guard', 'guard', 'new'));
  assert.throws(() => named('function wrong(){}', 'isRepertoireOfflineSupported'));
  assert.throws(() => overlays((ref, file) => Buffer.from(sourceAt(ref, file).toString().replace('IS_DEVELOPMENT || isEmbeddedRuntimeActive()', 'true || isEmbeddedRuntimeActive()'))));
  assert.equal(named(overlays().get('lib/repertuvar/cache.ts'), 'clearRepertoireMetadataCaches'),
    named(sourceAt(WEB_REF, 'lib/repertuvar/cache.ts').toString(), 'clearRepertoireMetadataCaches'));
});
