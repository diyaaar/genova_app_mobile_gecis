// Standalone entry point avoids the candidate harness/factory CLI import cycle.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pinnedFiles, replaceOnce } from './090_candidate_native_cache.mjs';
import { ROOT, WEB_REF, hash, buildEnv } from './090_android_candidate.mjs';
export const INTERACTIVE_CANDIDATE = ROOT + '/spike/090-runtime/android-interactive-candidate';
export const DETAIL_PAGE = 'app/(main)/koristler/[id]/page.tsx';
export const FILE_HOOK = 'hooks/useProtectedDriveFileUrl.ts';
export function withDeferredNativeProbe(source) {
  assert(!source.includes("import { isEmbeddedRuntimeActive }"), 'Refuse existing embedded probe guard');
  const imported = replaceOnce(source, "'use client';", "'use client';\n\nimport { isEmbeddedRuntimeActive } from '@/lib/embedded-web-runtime';");
  return replaceOnce(imported,
    'const nextUrl = await getOnlineAuthorizedPrivateFileUrl(loadTicketUrl);',
    `// Native consent owns the first body/probe; issuing a scoped ticket is not a byte read.
        const nextUrl = isEmbeddedRuntimeActive()
          ? await loadTicketUrl() : await getOnlineAuthorizedPrivateFileUrl(loadTicketUrl);`);
}
export function withFileMetadata(source) {
  assert(!source.includes('data-genova-file-name=') && !source.includes('data-genova-mime-type='), 'Refuse already-patched/changed anchor');
  return replaceOnce(source, '                  href={submissionUrl}', `                  href={submissionUrl}
                  data-genova-file-name={item.submission?.file_name}
                  data-genova-mime-type={item.submission?.mime_type ?? undefined}`);
}
export function materializeInteractive() {
  assert.equal(process.cwd(), ROOT); assert(!fs.existsSync(INTERACTIVE_CANDIDATE));
  const files = pinnedFiles().map(entry => entry.path === DETAIL_PAGE
    ? { ...entry, body: Buffer.from(withFileMetadata(entry.body.toString())) }
    : entry.path === FILE_HOOK ? { ...entry, body: Buffer.from(withDeferredNativeProbe(entry.body.toString())) } : entry);
  fs.mkdirSync(INTERACTIVE_CANDIDATE);
  for (const entry of files) {
    const target = INTERACTIVE_CANDIDATE + '/' + entry.path;
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, entry.body, { flag: 'wx' });
  }
  fs.symlinkSync(ROOT + '/node_modules', INTERACTIVE_CANDIDATE + '/node_modules', 'dir');
  const manifest = { parentRef: WEB_REF, factorySha256: hash(fs.readFileSync(import.meta.filename)),
    cacheFactorySha256: hash(fs.readFileSync(ROOT + '/supabase/test-support/090_candidate_native_cache.mjs')),
    delta: ['lib/repertuvar/cache.ts', 'lib/repertuvar/offline.ts', DETAIL_PAGE, FILE_HOOK],
    pins: files.map(entry => ({ path: entry.path, sha256: hash(entry.body) })),
    boundary: 'Two cache guards + passive anchor metadata + embedded deferred probe;422 raw parent files unchanged. Native/server read authorization unchanged; no browser-session seeding.' };
  fs.writeFileSync(INTERACTIVE_CANDIDATE + '/native-cache-source.json', JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  return { files: files.length, delta: manifest.delta };
}
if (process.argv[1] === import.meta.filename) {
  assert.equal(process.cwd(), ROOT); assert.equal(process.argv.length, 3);
  if (process.argv[2] === '--materialize-owned') console.log(JSON.stringify(materializeInteractive()));
  else {
    assert.equal(process.argv[2], '--build-owned');
    const manifest = JSON.parse(fs.readFileSync(INTERACTIVE_CANDIDATE + '/native-cache-source.json'));
    for (const pin of manifest.pins) assert.equal(hash(fs.readFileSync(INTERACTIVE_CANDIDATE + '/' + pin.path)), pin.sha256);
    const child = spawn(process.execPath, [ROOT + '/node_modules/next/dist/bin/next', 'build'],
      { cwd: INTERACTIVE_CANDIDATE, env: buildEnv(true), stdio: 'inherit' });
    const [code] = await once(child, 'exit'); assert.equal(code, 0);
  }
}
