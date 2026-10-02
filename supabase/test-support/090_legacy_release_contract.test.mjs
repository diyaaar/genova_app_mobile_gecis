// Exact current production-source compatibility probe. Synthetic key/body only;
// no live Auth/DB/provider, no blanket acceptance of current legacy behavior.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const REVISION = 'a13f696da8c731e9af2a2bce473d4f4ae4a81587';
const routePath = 'app/api/drive-file/[id]/route.ts';
const tokenPath = 'lib/server/drive-file-token.ts';
const source = file => execFileSync('git', ['show', `${REVISION}:${file}`], { encoding: 'utf8' });
function load(body, deps, extra = {}) {
  const exports = {};
  const script = ts.transpileModule(body, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  vm.runInNewContext(script, { exports, require: name => {
    if (!(name in deps)) throw Error('Unexpected dependency: ' + name);
    return deps[name];
  }, Buffer, Response, Headers, URL, Date, console: { log() {}, error() {}, warn() {} },
  process: { env: { SUPABASE_SERVICE_ROLE_KEY: '090-only-synthetic-signing-secret' } }, ...extra });
  return exports;
}
test('current production legacy Next GET/HEAD has no current authority dependency', async () => {
  const tokenSource = source(tokenPath), routeSource = source(routePath);
  const token = load(tokenSource, { 'node:crypto': require('node:crypto') });
  let providerCalls = 0, authorityCalls = 0;
  const route = load(routeSource, {
    '@/lib/server/drive-file-token': token,
    '@/lib/server/drive-file-content': { isActiveDriveFileContent: () => false },
    '@/lib/server/supabase-auth': { createSupabaseServiceClient() {
      authorityCalls++; throw Error('Unexpected storage branch');
    } },
  }, { fetch: async url => {
    assert.equal(url.hostname, 'drive.google.com'); providerCalls++;
    return new Response(new Uint8Array(16), { headers: {
      'Content-Type': 'application/pdf', 'Content-Length': '16',
    } });
  } });
  const signed = token.createDriveFileToken({ driveFileId: '090-synthetic',
    fileName: 'score.pdf', mimeType: 'application/pdf' });
  const expiry = signed.expiresAt;
  // No live user is revoked. The route receives no current authority input and
  // has no applicable DB read on this path; a current denied state cannot affect it.
  const observations = [];
  for (const method of ['GET', 'HEAD']) {
    const request = new Request('http://127.0.0.1/api/drive-file/090-synthetic?token=' + encodeURIComponent(signed.token), { method });
    request.nextUrl = new URL(request.url);
    const response = await route[method](request, { params: Promise.resolve({ id: '090-synthetic' }) });
    observations.push({ method, status: response.status });
  }
  assert.deepEqual(observations, [{ method: 'GET', status: 200 }, { method: 'HEAD', status: 200 }]);
  assert.equal(authorityCalls, 0); assert.equal(providerCalls, 2);
  assert.ok(expiry > Date.now());
  console.log(JSON.stringify({ revision: REVISION, finding: 'LEGACY_NEXT_SIGNATURE_ONLY_GAP',
    paths: [routePath, tokenPath], sha256: [routeSource, tokenSource].map(s => createHash('sha256').update(s).digest('hex')),
    observations, providerCalls, authorityCalls,
    limits: 'Actual production Git source/transpiled code with synthetic signature and injected upstream response; no live HTTP/Auth/RLS or DB mutation. Not proof of an exploited production leak or full client compatibility.' }));
});
