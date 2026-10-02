// Actual React hook/URL loader/SW/Next adapter/Edge handler. Synthetic identity,
// authority and media, NOT full Next workspace, SQL, hosted Auth or native WebView.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
// Reuse the existing build dependency; no installation or repository copy.
const { build } = createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
const root = process.cwd();
assert(root.endsWith('/Antigravity/genovakorist'));
assert(['--owned-loopback', '--owned-loopback-final'].includes(process.argv[2]));
assert.equal(process.argv.length, 3);
const baseline = 'a13f696da8c731e9af2a2bce473d4f4ae4a81587';
const paths = ['hooks/useProtectedDriveFileUrl.ts', 'lib/drive-file-url.ts',
  'lib/repertuvar/offline.ts', 'public/sw.js'];
const historical = path => execFileSync('git', ['show', `${baseline}:${path}`], { encoding: 'utf8' });
const current = path => readFileSync(resolve(root, path), 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
assert.equal(sha(historical('public/sw.js')), sha(current('public/sw.js')));
const pins = paths.map(path => ({ path, old: sha(historical(path)), current: sha(current(path)) }));
const origin = 'http://127.0.0.1:18196';
const edge = 'https://legacy-090.invalid/functions/v1/legacy-file';
const out = `docs/reports/090/2026-10-02-legacy-browser-transition${process.argv[2].endsWith('-final') ? '-final' : ''}.json`;
const backend = await build({ stdin: { contents: `
  export {issueLegacyFileUrl,readLegacyFile} from './lib/server/legacy-file-adapter.ts';
  export {createLegacyFileHandler} from './supabase/functions/legacy-file/handler.ts';
  export {createLegacyTicket,verifyLegacyTicket} from './supabase/functions/legacy-file/ticket.ts';
`, resolveDir: root }, bundle: true, platform: 'node', format: 'esm', write: false });
const impl = await import('data:text/javascript;base64,' + Buffer.from(backend.outputFiles[0].text).toString('base64'));
const actorId = '09000000-0000-4000-8000-000000000001';
const sessionId = '09000000-0000-4000-8000-000000000002';
const choirId = '09000000-0000-4000-8000-000000000003';
const counters = { posts: 0, heads: 0, gets: 0, providers: 0, outside: 0 };
let denied = false, expireNext = false, selectedBundle = 'old';
const statuses = [];
const files = {
  '090-audio': { alias: '090-audio', fileName: 'synthetic.wav', mimeType: 'audio/wav',
    resourceId: '09000000-0000-4000-8000-000000000004', kind: 'comment', choirId, sourceLink: null },
  '090-score': { alias: '090-score', fileName: 'synthetic.pdf', mimeType: 'application/pdf',
    resourceId: '09000000-0000-4000-8000-000000000005', kind: 'repertoire', choirId, sourceLink: null },
};
function wave() {
  const rate = 8000, samples = rate * 2, b = Buffer.alloc(44 + samples * 2);
  b.write('RIFF'); b.writeUInt32LE(b.length - 8, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) b.writeInt16LE(Math.round(800 * Math.sin(i * 2 * Math.PI * 440 / rate)), 44 + i * 2);
  return b;
}
function pdf() {
  const stream = 'BT /F1 18 Tf 30 100 Td (090 Synthetic score) Tj ET';
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 240 140] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let body = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(body)); body += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(body);
  body += 'xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('');
  return Buffer.from(body + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
}
const media = { '090-audio': wave(), '090-score': pdf() };
const secret = '090-synthetic-ephemeral-signing-key';
const handler = impl.createLegacyFileHandler({
  authenticate: async (_authorization, token) => token === '090-session-a' ? { actorId, sessionId, choirId } : null,
  resolve: async input => !denied && files[input.alias] && input.choirId === choirId
    && (!input.resourceId || input.resourceId === files[input.alias].resourceId) ? files[input.alias] : null,
  createTicket: input => impl.createLegacyTicket(input, secret),
  verifyTicket: async token => {
    if (expireNext) { expireNext = false; return null; }
    return impl.verifyLegacyTicket(token, secret);
  },
  fetchDrive: async alias => { counters.providers++; return new Response(media[alias], { headers: { 'Content-Type': files[alias].mimeType } }); },
  fetchStorage: async () => { throw Error('Unexpected Storage fixture'); },
});
const originalFetch = globalThis.fetch;
const oldEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
process.env.NEXT_PUBLIC_SUPABASE_URL = new URL(edge).origin;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '090-synthetic-public';
globalThis.fetch = async (input, init) => {
  assert.equal(new URL(String(input)).origin, new URL(edge).origin, 'No remote fallback');
  return handler(new Request(input, init));
};
const entry = version => `
  import React from 'react';
  import {createRoot} from 'react-dom/client';
  import {useProtectedDriveFileUrl} from '@/hooks/useProtectedDriveFileUrl';
  import * as urls from '@/lib/drive-file-url';
  import * as offline from '@/lib/repertuvar/offline';
  import {getDocument} from 'pdfjs-dist/build/pdf.mjs';
  import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';
  globalThis.pdfjsWorker = pdfjsWorker;
  globalThis.session = '090-session-a';
  const file = {drive_file_id:'090-audio',file_name:'synthetic.wav',mime_type:'audio/wav'};
  const root = createRoot(document.getElementById('root'));
  let version = 0;
  function View() {
    const state = useProtectedDriveFileUrl(file);
    globalThis.state = state;
    return React.createElement('div', null,
      React.createElement('output',{id:'status'},state.error || state.url || 'pending'),
      state.url ? React.createElement('audio',{id:'audio',controls:true,src:state.url,preload:'metadata',onError:()=>state.onBodyError?.()}) : null);
  }
  globalThis.mount = () => root.render(React.createElement(View,{key:++version}));
  globalThis.seed = async () => {
    const url = await urls.getProtectedDriveFileUrl(file);
    await offline.cacheRuntimeDriveFile({driveFileId:file.drive_file_id,url,
      version:offline.buildRuntimeDriveFileVersion(file),fileName:file.file_name,mimeType:file.mime_type});
  };
  globalThis.probeScore = async () => {
    const file={drive_file_id:'090-score',file_name:'synthetic.pdf',mime_type:'application/pdf'};
    const url=await ${version === 'old' ? 'urls.getProtectedDriveFileUrl(file)' : 'urls.getOnlineAuthorizedPrivateFileUrl(()=>urls.getProtectedDriveFileUrl(file))'};
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) throw Error('Body denied');
    const document=await getDocument({data:new Uint8Array(await response.arrayBuffer()),useSystemFonts:true}).promise;
    const page=await document.getPage(1),canvas=globalThis.document.createElement('canvas'),viewport=page.getViewport({scale:1});
    canvas.width=viewport.width;canvas.height=viewport.height;
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    globalThis.document.body.appendChild(canvas);
    const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    const result={pages:document.numPages,ink:Array.from(pixels).filter((v,i)=>i%4!==3&&v<100).length};
    await document.destroy();return result;
  };
`;
async function bundle(version) {
  const result = await build({ stdin: { contents: entry(version), loader: 'tsx', resolveDir: root },
    bundle: true, platform: 'browser', format: 'iife', write: false,
    define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_SUPABASE_URL': '"https://legacy-090.invalid"' },
    plugins: [{ name: 'bounded-source-and-synthetic-auth', setup(plugin) {
      plugin.onResolve({ filter: /^@\// }, args => ({ path: args.path.slice(2), namespace: 'source' }));
      plugin.onLoad({ filter: /.*/, namespace: 'source' }, args => {
        if (args.path === 'lib/supabase') return { contents: `export const supabase={auth:{getSession:async()=>({data:{session:{access_token:globalThis.session,user:{id:'${actorId}'}}}})}};`, loader: 'ts' };
        if (args.path === 'lib/web-auth-capability') return { contents: `
          export async function requireCurrentWebAccess(){return {userId:'${actorId}',accessToken:globalThis.session};}
          export async function authenticatedWebFetch(input,init,access){return fetch(input,{...init,headers:{...init.headers,Authorization:'Bearer '+access.accessToken}});}`, loader: 'ts' };
        if (args.path === 'lib/embedded-web-runtime') return { contents: 'export const isEmbeddedRuntimeActive=()=>false;', loader: 'ts' };
        const path = args.path + '.ts';
        assert(['hooks/useProtectedDriveFileUrl.ts', 'lib/drive-file-url.ts', 'lib/repertuvar/offline.ts', 'lib/repertuvar/protected-file-client.ts'].includes(path), path);
        return { contents: version === 'old' ? historical(path) : current(path), loader: 'ts', resolveDir: root };
      });
    } }],
  });
  return result.outputFiles[0].text;
}
const bundles = { old: await bundle('old'), current: await bundle('current') };
let browser, server;
const record = { date: new Date().toISOString(), baseline, pins,
  harnessSha256: sha(current('supabase/test-support/090_legacy_browser_transition.mjs')),
  adapterSha256: sha(current('lib/server/legacy-file-adapter.ts')),
  handlerSha256: sha(current('supabase/functions/legacy-file/handler.ts')),
  ticketSha256: sha(current('supabase/functions/legacy-file/ticket.ts')),
  reactVersion: require('react/package.json').version, bundlerVersion: createRequire(require.resolve('@vitejs/plugin-react'))('esbuild').version,
  scenarios: [],
  boundary: 'Actual React hook/loader/SW/Next adapter/legacy handler/HMAC and browser PDF/WAV; synthetic Auth/access/provider. Not whole Next workspace, candidate, SQL, PostgREST, native WebView or hosted proof.' };
try {
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, origin);
      if (url.pathname === '/') { res.setHeader('Cache-Control', 'no-store'); res.end('<div id="root"></div><script src="/bundle.js"></script>'); return; }
      if (url.pathname === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); res.setHeader('Cache-Control', 'no-store'); res.end(bundles[selectedBundle]); return; }
      if (url.pathname === '/sw.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(current('public/sw.js')); return; }
      if (url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
      const method = req.method;
      let response;
      if (url.pathname === '/api/drive-file-token' && method === 'POST') {
        counters.posts++; const chunks = []; for await (const chunk of req) chunks.push(chunk);
        response = await impl.issueLegacyFileUrl(new Request(url, { method, headers: req.headers, body: Buffer.concat(chunks) }));
      } else if (url.pathname.startsWith('/api/drive-file/') && ['GET', 'HEAD'].includes(method)) {
        counters[method === 'GET' ? 'gets' : 'heads']++;
        response = await impl.readLegacyFile(new Request(url, { method, headers: req.headers }), url.pathname.split('/').at(-1), method);
      } else { throw Error('Unexpected loopback request path'); }
      statuses.push({ method, status: response.status });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch { res.writeHead(500); res.end('Synthetic harness error'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(18196, '127.0.0.1', resolve); });
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--autoplay-policy=no-user-gesture-required'], headless: true });
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin !== origin) { counters.outside++; return route.abort(); }
    return route.continue();
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin);
  await page.waitForFunction(() => typeof globalThis.seed === 'function');
  await page.evaluate(async () => { await navigator.serviceWorker.register('/sw.js'); await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.evaluate(() => globalThis.seed());
  denied = true;
  const beforeOld = { ...counters };
  await page.evaluate(() => globalThis.mount());
  await page.waitForFunction(() => globalThis.state?.isLocal === true);
  await page.locator('#audio').evaluate(audio => audio.play());
  await page.waitForFunction(() => document.querySelector('audio')?.currentTime > 0.1);
  assert.equal(counters.posts, beforeOld.posts); assert.equal(counters.heads, beforeOld.heads);
  record.scenarios.push({ name: 'already-open-old-bundle-online-cache', contract: 'FAIL_REPRODUCED',
    actuallyPlayed: true, newAuthorityRequests: 0,
    limit: 'Previously downloaded bytes; not server/provided-online-byte leakage. Old code remains unsafe until refreshed.' });
  // Deploying server code does not replace an already-running bundle. A real reload
  // is deliberately required; neither a v1 grace nor an automatic update is claimed.
  selectedBundle = 'current';
  const beforeRefresh = counters.providers;
  await page.reload(); await page.waitForFunction(() => typeof globalThis.mount === 'function');
  await page.evaluate(() => globalThis.mount());
  await page.waitForFunction(() => !!globalThis.state?.error);
  assert.equal(await page.locator('#audio').count(), 0);
  assert.equal(counters.providers, beforeRefresh);
  record.scenarios.push({ name: 'explicit-refresh-online-denied-cache', status: 'PASS', providerDelta: 0 });

  denied = false;
  await page.evaluate(() => globalThis.mount());
  await page.waitForFunction(() => !!globalThis.state?.url);
  await page.locator('#audio').evaluate(async audio => { await audio.play(); audio.currentTime = 0.5; });
  await page.waitForFunction(() => document.querySelector('audio')?.currentTime > 0.55);
  const score = await page.evaluate(() => globalThis.probeScore());
  assert.equal(score.pages, 1); assert(score.ink > 0);
  record.scenarios.push({ name: 'refreshed-audio-play-seek-and-pdf-canvas', status: 'PASS', score });

  const beforeRenew = counters.posts;
  expireNext = true;
  await page.evaluate(() => globalThis.mount());
  await page.waitForFunction(() => !!globalThis.state?.url);
  assert.equal(counters.posts - beforeRenew, 1);
  assert(statuses.some(item => item.method === 'HEAD' && item.status === 401));
  record.scenarios.push({ name: 'cached-ticket-401-one-renewal', status: 'PASS', newPosts: 1 });

  // Wait for the actual SW's detached cache write before going offline.
  await page.waitForFunction(async () => (await caches.open('genova-runtime-drive-files-v1')).match(location.origin + '/__runtime__/drive/files/090-audio'));
  await context.setOffline(true);
  await page.waitForFunction(() => !navigator.onLine && globalThis.state?.isLocal);
  await page.locator('#audio').evaluate(audio => audio.play());
  await page.waitForFunction(() => document.querySelector('audio')?.currentTime > 0.1);
  record.scenarios.push({ name: 'actually-offline-cached-playback', status: 'PASS' });
  denied = true;
  const beforeReconnect = { ...counters };
  await context.setOffline(false);
  await page.waitForFunction(() => !!globalThis.state?.error);
  assert.equal(await page.locator('#audio').count(), 0);
  assert.equal(counters.providers, beforeReconnect.providers);
  assert.equal(counters.posts, beforeReconnect.posts, '403 HEAD must not mint another ticket');
  assert.equal(counters.heads - beforeReconnect.heads, 1);
  record.scenarios.push({ name: 'reconnect-cached-v2-403-stop', status: 'PASS',
    headDelta: 1, postDelta: 0, providerDelta: 0 });

  denied = false;
  await page.evaluate(() => globalThis.mount());
  await page.waitForFunction(() => !!globalThis.state?.url);
  const beforeSession = { ...counters };
  await page.evaluate(() => { globalThis.session = '090-session-b-invalid'; globalThis.mount(); });
  await page.waitForFunction(() => !!globalThis.state?.error);
  assert.equal(await page.locator('#audio').count(), 0);
  assert.equal(counters.providers, beforeSession.providers);
  assert.equal(counters.posts - beforeSession.posts, 1);
  record.scenarios.push({ name: 'same-user-new-invalid-session-refuses-old-cache', status: 'PASS',
    postDelta: 1, providerDelta: 0 });
  assert.equal(counters.outside, 0); assert.deepEqual(errors, []);
  record.counters = counters; record.statuses = statuses;
  record.browser = await browser.version();
  record.status = 'LOCAL_BROWSER_CHECKPOINT_PASS_WITH_OLD_BUNDLE_FAILURE_REPRODUCED';
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  globalThis.fetch = originalFetch;
  if (oldEnv === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldEnv;
  if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey;
}
record.cleanup = 'browser/context closed, loopback server closed; no repository/runtime copy or downloaded media';
writeFileSync(out, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ status: record.status, scenarios: record.scenarios.length, counters, evidence: out }));
