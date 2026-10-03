// Actual native capability/recovery + Next adapter + Edge handler/HMAC over owned HTTP.
// Auth/current-authority/provider/file-store/share are synthetic ports, NOT device or RLS proof.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ROOT = '/Users/alidiyarduran/Antigravity/genovakorist';
assert.equal(process.cwd(), ROOT);
assert.deepEqual(process.argv.slice(2), ['--owned-loopback']);
const out = ROOT + '/docs/reports/090/2026-10-03-native-legacy-recovery-http-v2.json';
assert(!fs.existsSync(out), 'Preserve prior attempt; never overwrite evidence');
const hash = value => createHash('sha256').update(value).digest('hex');
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
const origin = 'http://127.0.0.1:18196';
const edgeOrigin = 'https://example.supabase.co';
const edgePath = '/functions/v1/legacy-file';
const record = {
  date: new Date().toISOString(), status: 'RUNNING',
  entryCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  harnessSha256: hash(fs.readFileSync(import.meta.filename)), scenarios: [],
  boundary: 'Actual compiled native capability/recovery, Next adapter functions and Edge handler/HMAC over real loopback HTTP. Not Next routing/middleware, RN renderer or Expo filesystem/share; Auth/current-authority/provider and in-memory file/share ports synthetic. No hosted RLS/provider/device acceptance.',
};
const originalFetch = globalThis.fetch;
const originalEnv = Object.fromEntries(['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
  .map(key => [key, process.env[key]]));
let server, stage = 'compile', state;
const outside = [], serverErrors = [];
const fixtureSource = `const refuse=()=>{throw Error('Platform fixture must not be invoked');};
export const setStringAsync=refuse,isAvailableAsync=refuse,shareAsync=refuse,randomUUID=refuse,getRandomBytes=refuse;
export class Directory{constructor(){refuse();}} export class DownloadTask{constructor(){refuse();}}
export class File{constructor(){refuse();}} export const FileMode={},Paths={};`;
try {
  const bundle = await build({
    stdin: { contents: `export {createPrivateFileTicketRecovery} from './apps/mobile/src/webview/private-file-ticket-recovery.ts';
export {ProtectedFileCapability,ProtectedFileValidationError,prepareProtectedFileRequest,hasExpectedPassiveFileSignature} from './apps/mobile/src/webview/platform-capabilities.ts';
export {issueLegacyFileUrl,readLegacyFile} from './lib/server/legacy-file-adapter.ts';
export {createLegacyFileHandler} from './supabase/functions/legacy-file/handler.ts';
export {createLegacyTicket,verifyLegacyTicket,legacySourceDigest} from './supabase/functions/legacy-file/ticket.ts';`, resolveDir: ROOT },
    bundle: true, platform: 'node', format: 'esm', write: false, metafile: true,
    alias: { '@shared': ROOT + '/lib', '@': ROOT },
    plugins: [{ name: 'explicit-platform-ports', setup(builder) {
      builder.onResolve({ filter: /^expo-(clipboard|file-system|sharing|crypto)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: fixtureSource }));
    } }],
  });
  record.sourcePins = Object.keys(bundle.metafile.inputs).filter(path => path !== '<stdin>' && !path.startsWith('fixture:'))
    .sort().map(path => ({ path, sha256: hash(fs.readFileSync(ROOT + '/' + path)) }));
  record.wiringAndTestPins = ['apps/mobile/src/webview/NativeWebViewScreen.tsx',
    'apps/mobile/src/webview/__tests__/private-file-ticket-recovery.test.ts',
    'apps/mobile/src/webview/__tests__/NativeWebViewScreen.test.tsx',
    'apps/mobile/src/webview/__tests__/platform-capabilities.test.ts']
    .map(path => ({ path, sha256: hash(fs.readFileSync(ROOT + '/' + path)) }));
  const native = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  const identity = { actorId: id(1), sessionId: id(2), choirId: id(3) };
  const choirB = id(4), alias = '090_synthetic_score';
  const file = { kind: 'repertoire', resourceId: id(5), choirId: identity.choirId, alias,
    fileName: '090-synthetic.pdf', mimeType: 'application/pdf', sourceLink: 'storage://synthetic/090-score.pdf' };
  const bytes = Buffer.from('%PDF-1.4\n% synthetic HTTP acceptance, not renderer acceptance\n%%EOF\n');
  const expectedHash = hash(bytes);
  const secret = '090-ephemeral-synthetic-HMAC-not-a-provider-secret';
  const input = { ...identity, resourceId: file.resourceId, kind: file.kind, alias,
    sourceDigest: await native.legacySourceDigest(file) };
  const expired = await native.createLegacyTicket(input, secret, Date.now() - 7_200_000);
  const valid = await native.createLegacyTicket(input, secret);
  assert.equal(await native.verifyLegacyTicket(expired.token, secret), null);
  const oldUrl = ticket => `${origin}/api/drive-file/${alias}?token=${ticket.token}`;
  const handler = native.createLegacyFileHandler({
    authenticate: async (authorization, token) => {
      assert.equal(authorization, 'Bearer 090-fresh-native-access');
      assert.equal(token, '090-fresh-native-access');
      state.authentications++;
      return { ...identity, choirId: state.choir };
    },
    resolve: async request => {
      state.resolves++;
      if (state.revoked || request.choirId !== identity.choirId || state.choir !== identity.choirId
        || request.actorId !== identity.actorId || request.sessionId !== identity.sessionId || request.alias !== alias) return null;
      return file;
    },
    createTicket: ticket => native.createLegacyTicket(ticket, secret),
    verifyTicket: token => native.verifyLegacyTicket(token, secret),
    fetchDrive: async () => { throw Error('Unexpected Drive read'); },
    fetchStorage: async (bucket, path) => {
      assert.equal(bucket, 'synthetic'); assert.equal(path, '090-score.pdf'); state.providerReads++;
      return new Response(bytes, { headers: { 'Content-Type': 'application/pdf' } });
    },
  });
  globalThis.fetch = async (value, options) => {
    const url = new URL(value instanceof Request ? value.url : value.toString());
    if (url.origin === edgeOrigin && url.pathname === edgePath) {
      // The adapter still sees and validates its fixed HTTPS issuer; only this explicit
      // fixture transport redirects the server-side request to our owned HTTP listener.
      const local = new URL(url.pathname + url.search, origin);
      return originalFetch(local, options);
    }
    if (url.origin === origin) return originalFetch(value, options);
    outside.push({ origin: url.origin, path: url.pathname });
    throw Error('External network blocked');
  };
  process.env.NEXT_PUBLIC_SUPABASE_URL = edgeOrigin;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '090-synthetic-public';
  server = createServer(async (incoming, outgoing) => {
    try {
      const local = new URL(incoming.url, origin);
      const chunks = []; let size = 0;
      for await (const chunk of incoming) { size += chunk.length; assert(size <= 4096); chunks.push(chunk); }
      const requestUrl = local.pathname === edgePath ? edgeOrigin + local.pathname + local.search : local.href;
      const request = new Request(requestUrl, { method: incoming.method, headers: incoming.headers,
        ...(['GET', 'HEAD'].includes(incoming.method) ? {} : { body: Buffer.concat(chunks) }) });
      let response;
      if (local.pathname === edgePath) response = await handler(request);
      else if (local.pathname === '/api/drive-file-token' && incoming.method === 'POST') {
        state.posts++;
        assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), { driveFileId: alias });
        if (state.redirect) response = new Response(null, { status: 307, headers: { Location: origin + '/credential-trap' } });
        else response = await native.issueLegacyFileUrl(request);
        if (state.revokeAfterIssue && response.ok) state.revoked = true;
      } else if (local.pathname === '/api/drive-file/' + alias && ['GET', 'HEAD'].includes(incoming.method)) {
        assert.equal(request.headers.get('authorization'), null, 'No bearer on body reads');
        response = await native.readLegacyFile(request, alias, incoming.method);
      } else { state.unknown++; response = new Response(null, { status: 404 }); }
      state.http.push({ method: incoming.method, path: local.pathname, status: response.status });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(incoming.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      serverErrors.push(error.message); outgoing.writeHead(500); outgoing.end();
    }
  });
  stage = 'owned-listener';
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(18196, '127.0.0.1', resolve); });
  async function scenario(name, configuration, expected) {
    stage = name;
    state = { choir: identity.choirId, revoked: false, posts: 0, leases: 0, downloads: 0, shares: 0,
      removals: 0, clears: 0, providerReads: 0, authentications: 0, resolves: 0, unknown: 0, http: [], hashes: [], ...configuration };
    let capability;
    const recovery = native.createPrivateFileTicketRecovery({ getIssuer: () => edgeOrigin, getAppOrigin: () => origin,
      allowLoopback: true, fetcher: globalThis.fetch, getLease: async options => {
        assert.deepEqual(options, { forceRefresh: true }); state.leases++;
        if (state.switchDuringLease) state.choir = choirB;
        if (state.clearDuringLease) await capability.clear();
        return { accessToken: '090-fresh-native-access', userId: identity.actorId, choirId: state.choir, expiresAt: Date.now() + 60_000 };
      } });
    capability = new native.ProtectedFileCapability({
      download: async ({ url, fileName, mimeType, signal }) => {
        state.downloads++;
        const response = await globalThis.fetch(url, { signal, redirect: 'error' });
        const actualBytes = new Uint8Array(await response.arrayBuffer());
        if (!response.ok) throw Error('HTTP private-file denied');
        assert.equal(response.headers.get('cache-control'), 'private, no-store');
        if (!native.hasExpectedPassiveFileSignature(actualBytes, mimeType, fileName)) throw new native.ProtectedFileValidationError();
        assert.equal(hash(actualBytes), expectedHash); state.hashes.push(expectedHash);
        return { uri: 'memory://090-synthetic-file', size: actualBytes.byteLength };
      },
      remove: async uri => { assert.equal(uri, 'memory://090-synthetic-file'); state.removals++; },
      clear: async () => { state.clears++; },
    }, { isAvailable: async () => true, share: async uri => {
      assert.equal(uri, 'memory://090-synthetic-file'); state.shares++;
    } }, recovery);
    const request = native.prepareProtectedFileRequest({ requestId: '090_synthetic_request',
      url: oldUrl(configuration.validOld ? valid : expired), disposition: 'view',
      fileName: file.fileName, mimeType: file.mimeType }, { appOrigin: origin, protectedFileOrigins: [] });
    assert(request, 'Actual route policy must admit the configured legacy file');
    const result = await capability.run(request);
    const nextStatuses = state.http.filter(item => item.path.startsWith('/api/')).map(item => `${item.method}:${item.status}`);
    for (const [key, value] of Object.entries(expected)) {
      assert.deepEqual(key === 'result' ? result : key === 'nextStatuses' ? nextStatuses : state[key], value, `${name}:${key}`);
    }
    assert.equal(state.unknown, 0); assert(state.downloads <= 2); assert(state.posts <= 1); assert(state.leases <= 1);
    record.scenarios.push({ name, status: 'PASS', result, ...state });
  }
  await scenario('expired-HMAC-renewal-bytes-hash', {},
    { result: true, downloads: 2, leases: 1, posts: 1, shares: 1, removals: 1, providerReads: 1, hashes: [expectedHash],
      nextStatuses: ['GET:401', 'HEAD:401', 'POST:200', 'GET:200'] });
  await scenario('valid-ticket-current-authority-revoked', { validOld: true, revoked: true },
    { result: false, downloads: 1, leases: 0, posts: 0, shares: 0, providerReads: 0, nextStatuses: ['GET:403', 'HEAD:403'] });
  await scenario('expired-A-ticket-current-B-lease', { switchDuringLease: true },
    { result: false, downloads: 1, leases: 1, posts: 1, shares: 0, providerReads: 0, nextStatuses: ['GET:401', 'HEAD:401', 'POST:403'] });
  await scenario('revoke-after-renewal-before-second-GET', { revokeAfterIssue: true },
    { result: false, downloads: 2, leases: 1, posts: 1, shares: 0, providerReads: 0,
      nextStatuses: ['GET:401', 'HEAD:401', 'POST:200', 'GET:403'] });
  await scenario('tenant-clear-during-fresh-lease', { clearDuringLease: true },
    { result: false, downloads: 1, leases: 1, posts: 0, shares: 0, providerReads: 0, clears: 1, nextStatuses: ['GET:401', 'HEAD:401'] });
  await scenario('POST-redirect-not-followed', { redirect: true },
    { result: false, downloads: 1, leases: 1, posts: 1, shares: 0, providerReads: 0, nextStatuses: ['GET:401', 'HEAD:401', 'POST:307'] });
  stage = 'foreign-origin-no-side-effect'; let foreignFetches = 0, foreignLeases = 0;
  const foreign = native.createPrivateFileTicketRecovery({ getIssuer: () => edgeOrigin, getAppOrigin: () => origin,
    allowLoopback: true, fetcher: async () => { foreignFetches++; throw Error('Unexpected network'); },
    getLease: async () => { foreignLeases++; throw Error('Unexpected lease'); } });
  await assert.rejects(foreign({ url: 'https://foreign.invalid/api/drive-file/' + alias + '?token=old.signature',
    signal: new AbortController().signal }), /Unsupported private-file issuer/);
  assert.equal(foreignFetches, 0); assert.equal(foreignLeases, 0);
  record.scenarios.push({ name: stage, status: 'PASS', networkCalls: foreignFetches, leaseCalls: foreignLeases });
  assert.deepEqual(outside, []); assert.deepEqual(serverErrors, []);
  record.pdf = { bytes: bytes.length, sha256: expectedHash, synthetic: true };
  record.status = 'PASS';
} catch (error) {
  record.status = 'FAIL'; record.failure = { stage, message: String(error.message)
    .replace(/([?&](?:token|ticket)=)[^&\s"']+/g, '$1[redacted]').replace(/Bearer\s+\S+/g, 'Bearer [redacted]').slice(0, 600) };
  process.exitCode = 1;
} finally {
  if (server?.listening) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  record.outsideRequests = outside; record.serverErrors = serverErrors;
  record.cleanup = { ownedListenerStopped: !server?.listening, globalFetchAndEnvRestored: true, diskFilesCreated: 0 };
  fs.writeFileSync(out, JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ status: record.status, stage, scenarios: record.scenarios.length, report: out }));
}
