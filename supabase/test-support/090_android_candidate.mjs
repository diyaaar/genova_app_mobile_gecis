// Owned Android SDK boundary, synthetic Auth/REST/authority/provider. No hosted operation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';

export const ROOT = '/Users/alidiyarduran/Antigravity/genovakorist';
export const WEB_REF = '7cd8d460c68465055049dbf30192f7f5478bcf64';
export const CANDIDATE = ROOT + '/spike/090-runtime/android-candidate';
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const CORS_HEADERS = 'authorization,apikey,content-type,x-client-info,x-supabase-api-version,accept-profile,content-profile';
export const hasAuthorizedInitialProfile = requests => requests.some(item => item.path === '/rest/v1/choir_members'
  && item.method === 'GET' && item.status === 200 && item.authorized && ['profile', 'renewal'].includes(item.phase));
const require = createRequire(import.meta.url);
const app = 'http://127.0.0.1:31090', nextOrigin = 'http://127.0.0.1:31095';
const authOrigin = 'http://127.0.0.1:54491', fixture = 'http://127.0.0.1:18092';
const edgeOrigin = 'https://example.supabase.co', edgePath = '/functions/v1/legacy-file';
const sdk = '/opt/homebrew/share/android-commandlinetools';
const jdk = '/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home';
const anon = 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({ iss: 'supabase-demo', role: 'anon' })).toString('base64url') + '.synthetic-public';
const gitBytes = file => execFileSync('git', ['show', WEB_REF + ':' + file], { cwd: ROOT });
export function validatePinnedSource(entries, read = gitBytes) {
  assert.equal(entries.length, 426);
  return entries.map(entry => {
    assert(!path.isAbsolute(entry.path) && !entry.path.split('/').includes('..'));
    const body = read(entry.path); assert.equal(hash(body), entry.sha256, entry.path);
    return { ...entry, body };
  });
}
export function materialize() {
  assert.equal(process.cwd(), ROOT); assert(!fs.existsSync(CANDIDATE), 'Refuse existing runtime');
  const pin = JSON.parse(fs.readFileSync(ROOT + '/docs/reports/090/2026-10-03-embedded-profile-source-manifest.json'));
  assert.equal(pin.localCommit, WEB_REF);
  const entries = pin.pins;
  // Validate all bytes before allocating the copy; never re-run the semantic factory on newer main.
  const bytes = validatePinnedSource(entries);
  fs.mkdirSync(CANDIDATE); assert.equal(fs.realpathSync(CANDIDATE), CANDIDATE);
  for (const entry of bytes) {
    const file = CANDIDATE + '/' + entry.path; fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, entry.body, { flag: 'wx' });
  }
  fs.symlinkSync(ROOT + '/node_modules', CANDIDATE + '/node_modules', 'dir');
  return { webRef: WEB_REF, files: bytes.length, bytes: bytes.reduce((total, entry) => total + entry.body.length, 0) };
}
export function buildEnv(interactive = false) {
  // Public synthetic anon only; never forward the user's dotenv/credential environment.
  return { PATH: process.env.PATH, HOME: process.env.HOME, LANG: process.env.LANG,
    JAVA_HOME: jdk, ANDROID_HOME: sdk, ANDROID_SDK_ROOT: sdk, EXPO_NO_DOTENV: '1',
    EXPO_NO_TELEMETRY: '1', NEXT_TELEMETRY_DISABLED: '1',
    GENOVA_090_ANDROID_WEBVIEW_LOOPBACK: '1', EXPO_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE: '1',
    NEXT_PUBLIC_GENOVA_090_WEBVIEW_ACCEPTANCE: '1', NEXT_PUBLIC_GENOVA_090_APP_ORIGIN: app,
    EXPO_PUBLIC_GENOVA_090_WEBVIEW_FAMILY: 'legacy-next', EXPO_PUBLIC_SUPABASE_URL: authOrigin,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: anon, NEXT_PUBLIC_SUPABASE_URL: authOrigin,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    ...(interactive ? { EXPO_PUBLIC_GENOVA_090_WEBVIEW_INTERACTIVE: '1' } : {}) };
}
async function run(command, args, cwd, env = buildEnv()) {
  const child = spawn(command, args, { cwd, env, stdio: 'inherit' });
  const [code] = await once(child, 'exit'); assert.equal(code, 0, 'Owned command failed');
}
async function serve(interactive = false) {
  const { interactiveRows, assertInteractiveCancel, assertInlinePreviewEvent, assertCompletedInteractiveFlow } = await import('./090_android_interactive.mjs');
  const candidate = interactive ? ROOT + '/spike/090-runtime/android-interactive-candidate' : CANDIDATE;
  const out = ROOT + '/docs/reports/090/' + (interactive
    ? '2026-10-03-android-candidate-full-share-http-v5.json' : '2026-10-03-android-candidate-sdk-http-v4.json');
  assert(!fs.existsSync(out), 'Preserve earlier attempt');
  const candidatePins = interactive ? JSON.parse(fs.readFileSync(candidate + '/native-cache-source.json')) : null;
  if (interactive) {
    assert.equal(candidatePins.parentRef, WEB_REF); assert.equal(candidatePins.pins.length, 426);
    for (const pin of candidatePins.pins) assert.equal(hash(fs.readFileSync(candidate + '/' + pin.path)), pin.sha256);
  }
  const { build } = createRequire(require.resolve('@vitejs/plugin-react'))('esbuild');
  const compiled = await build({ stdin: { contents: `export {issueLegacyFileUrl,readLegacyFile} from './lib/server/legacy-file-adapter.ts';
export {createLegacyFileHandler} from './supabase/functions/legacy-file/handler.ts';
export {createLegacyTicket,verifyLegacyTicket,legacySourceDigest} from './supabase/functions/legacy-file/ticket.ts';`, resolveDir: ROOT },
    bundle: true, platform: 'node', format: 'esm', write: false, metafile: true, alias: { '@': ROOT } });
  const serverApi = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputFiles[0].text).toString('base64'));
  const uuid = n => `09000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  const actor = uuid(1), choirA = uuid(2), memberA = uuid(3), choirB = uuid(4), session = uuid(5), fileId = uuid(6), memberB = uuid(7);
  const user = { id: actor, email: `shared-091-${randomBytes(8).toString('hex')}@example.invalid`,
    aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-10-03T00:00:00Z' };
  const password = randomBytes(24).toString('base64url'); let consumed = false, currentChoir = choirA, revoked = false, phase = 'profile', sequence = 0;
  const tokens = new Set(); const requests = [], native = [], outside = [], unknown = [], failures = [];
  const providerReads = { renewal: 0, revoked: 0, switched: 0 }, refreshes = { profile: 0, renewal: 0, revoked: 0, switched: 0 };
  const bytes = fs.readFileSync(ROOT + '/apps/mobile/src/repertoire/__fixtures__/score_40p.pdf'); assert.equal(bytes.length, 65905);
  const file = { kind: 'submission', resourceId: uuid(8), choirId: choirA, alias: fileId,
    fileName: '090-synthetic.pdf', mimeType: 'application/pdf', sourceLink: 'storage://synthetic/score.pdf' };
  const secret = randomBytes(32).toString('hex');
  const claims = { actorId: actor, sessionId: session, choirId: choirA, kind: file.kind, resourceId: file.resourceId,
    alias: fileId, sourceDigest: await serverApi.legacySourceDigest(file) };
  const expired = await serverApi.createLegacyTicket(claims, secret, Date.now() - 7_200_000);
  const ticketUrl = token => `${app}/api/drive-file/${fileId}?token=${token}`;
  const targetMember = interactive ? uuid(9) : memberA;
  const ids = { actor, choirA, memberA, targetMember, assignmentId: uuid(10), submissionId: uuid(8), fileId };
  const metadata = { userId: actor, choirA, choirB, targetMember, fileId, pdfSha256: hash(bytes), legacyUrl: ticketUrl(expired.token) };
  const record = { date: new Date().toISOString(), status: 'RUNNING', webRef: WEB_REF,
    entryCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    harnessSha256: hash(fs.readFileSync(import.meta.filename)),
    serverSourcePins: Object.keys(compiled.metafile.inputs).filter(file => file !== '<stdin>')
      .map(file => ({ path: file, sha256: hash(fs.readFileSync(ROOT + '/' + file)) })),
    nativeSourcePins: execFileSync('git', ['ls-files', 'apps/mobile', 'lib/choir-context-core.ts', 'lib/mobile-webview-bridge.ts', 'lib/repertuvar/protected-file-client.ts'], { encoding: 'utf8' })
      .trim().split('\n').map(file => ({ path: file, sha256: hash(fs.readFileSync(ROOT + '/' + file)) })),
    ...(interactive ? { candidatePins, interactiveFixtureSha256: hash(fs.readFileSync(ROOT + '/supabase/test-support/090_android_interactive.mjs')) } : {}),
    boundary: interactive ? 'Guarded pinned chorister-detail UI with actual native consent/capability/share gateway. UI observation required separately; synthetic Auth/REST/authority/provider, NOT hosted RLS/Next file routing/middleware/iOS.'
      : 'Actual Android AuthStore/Supabase SDK/SecureStore/WebView/controller/Expo filesystem; exact pinned production Next profile via local dispatcher. Actual adapter/handler/HMAC file dispatch, NOT production Next file routing/middleware. Synthetic Auth/REST/current authority/provider; inspection share port, NOT actual consent/share/visual/iOS/hosted RLS proof.' };
  const handler = serverApi.createLegacyFileHandler({
    authenticate: async (_header, token) => tokens.has(token) ? { actorId: actor, sessionId: session, choirId: currentChoir } : null,
    resolve: async input => !revoked && currentChoir === choirA && input.choirId === choirA
      && input.actorId === actor && input.sessionId === session && input.alias === fileId ? file : null,
    createTicket: input => serverApi.createLegacyTicket(input, secret), verifyTicket: token => serverApi.verifyLegacyTicket(token, secret),
    fetchDrive: async () => { throw Error('Unexpected Drive'); }, fetchStorage: async (bucket, source) => {
      assert.equal(bucket, 'synthetic'); assert.equal(source, 'score.pdf'); providerReads[phase]++;
      return new Response(bytes, { headers: { 'Content-Type': 'application/pdf' } });
    },
  });
  const originalFetch = globalThis.fetch;
  const priorEnv = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
  globalThis.fetch = async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    if (url.origin === edgeOrigin && url.pathname === edgePath) return handler(new Request(url, init));
    if ([app, nextOrigin, authOrigin, fixture].includes(url.origin)) return originalFetch(input, init);
    outside.push({ origin: url.origin, path: url.pathname }); throw Error('Remote network blocked');
  };
  process.env.NEXT_PUBLIC_SUPABASE_URL = edgeOrigin; process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
  const membership = (choir, member) => ({ choir_id: choir, member_id: member, choir_name: choir === choirA ? 'Synthetic A' : 'Synthetic B',
    choir_slug: choir === choirA ? 'synthetic-a' : 'synthetic-b', member_is_active: true, is_current: currentChoir === choir });
  function newSession() {
    const exp = Math.floor(Date.now() / 1000) + 7200;
    const token = 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({ sub: actor, role: 'authenticated', exp, session_id: session, sequence: ++sequence })).toString('base64url') + '.synthetic-signature';
    tokens.add(token); return { access_token: token, refresh_token: '090-synthetic-native-refresh', token_type: 'bearer', expires_in: 7200, expires_at: exp, user };
  }
  function evidence(input) {
    if (interactive) {
      assert.deepEqual(input, { platform: 'android', switched: true, cacheEmpty: true });
      assertCompletedInteractiveFlow(native.map(item => item.event), providerReads);
      assert(native.some(item => item.event === 'cancel-observed'));
      for (const event of ['preview-page-1', 'preview-page-2', 'preview-closed']) assert(native.some(item => item.event === event));
      assert(native.some(item => item.event === 'file-removed'));
      assert.equal(providerReads.renewal, 1); assert.equal(providerReads.revoked, 0); assert.equal(providerReads.switched, 0);
      assert.deepEqual(requests.filter(item => item.phase === 'switched' && item.path.startsWith('/api/drive-file/'))
        .map(item => `${item.method}:${item.status}`), ['GET:403', 'HEAD:403']);
      assert.deepEqual(unknown, []); assert.deepEqual(outside, []); assert.deepEqual(failures, []);
      record.status = 'PASS_HTTP_NATIVE'; record.nativeAssertion = input; persist(); return;
    }
    assert.deepEqual(input, { platform: 'android', profileBridge: true, renewal: true, revoked: true, switched: true, cacheEmpty: true, actualShare: false, actualConsent: false });
    for (const [part, expected] of Object.entries({ renewal: ['GET:401', 'HEAD:401', 'POST:200', 'GET:200'],
      revoked: ['GET:403', 'HEAD:403'], switched: ['GET:403', 'HEAD:403', 'GET:401', 'HEAD:401', 'POST:403'] })) {
      assert.deepEqual(requests.filter(item => item.phase === part && item.path.startsWith('/api/drive-file')).map(item => `${item.method}:${item.status}`), expected, part);
    }
    assert.deepEqual(providerReads, { renewal: 1, revoked: 0, switched: 0 });
    assert.equal(refreshes.renewal, 1); assert.equal(refreshes.revoked, 0); assert.equal(refreshes.switched, 1);
    // Profile's actual authorized data read can complete after running starts file inspection.
    // route() independently asserts exact actor/member/current A query scope before returning200.
    assert(consumed); assert(hasAuthorizedInitialProfile(requests));
    assert.deepEqual(unknown, []); assert.deepEqual(outside, []); assert.deepEqual(failures, []);
    record.status = 'PASS'; record.nativeAssertion = input; persist();
  }
  const servers = []; let next;
  function persist() {
    const result = { ...record, requests, native, providerReads, refreshes, unknown, outside, failures,
      pdf: { bytes: bytes.length, sha256: hash(bytes) },
      actualConsent: interactive ? 'UI_REVIEW_IN_PAIRED_RECORD' : 'NOT RUN',
      actualShare: interactive && native.some(item => item.event === 'share-returned')
        ? 'NATIVE_RETURN_UI_REVIEW_IN_PAIRED_RECORD' : 'NOT RUN' };
    // First authoritative report only. Failed/unfinished attempts use a separate file on stop.
    fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
    console.log(JSON.stringify({ status: result.status, report: out }));
  }
  async function route(incoming, outgoing, origin) {
    const url = new URL(incoming.url, origin); let body = Buffer.alloc(0);
    for await (const chunk of incoming) { body = Buffer.concat([body, chunk]); assert(body.length <= 4096); }
    const authorization = incoming.headers.authorization ?? '';
    const authorized = tokens.has(authorization.replace(/^Bearer /u, ''));
    const finish = async response => {
      requests.push({ phase, method: incoming.method, path: url.pathname, status: response.status, authorized,
        ...(incoming.method === 'OPTIONS' ? { requestedHeaders: incoming.headers['access-control-request-headers'] ?? '' } : {}) });
      const headers = Object.fromEntries(response.headers); headers['access-control-allow-origin'] = app;
      headers['access-control-allow-headers'] = CORS_HEADERS;
      headers['access-control-allow-methods'] = 'GET,HEAD,POST,OPTIONS';
      outgoing.writeHead(response.status, headers);
      outgoing.end(incoming.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
    };
    const json = (status, value) => finish(Response.json(value, { status }));
    if (incoming.method === 'OPTIONS') return finish(new Response(null, { status: 204 }));
    if (origin === fixture) {
      if (url.pathname === '/090/webview-fixture' && incoming.method === 'POST') {
        if (consumed) return json(410, {}); consumed = true; return json(200, { email: user.email, password });
      }
      if (url.pathname === '/090/webview-metadata') return json(200, metadata);
      if (interactive && url.pathname === '/090/read-observation' && incoming.method === 'GET') {
        return json(200, { phase, inChoirA: currentChoir === choirA,
          fileGets: requests.filter(item => item.path.startsWith('/api/drive-file/') && item.method === 'GET').length,
          fileHeads: requests.filter(item => item.path.startsWith('/api/drive-file/') && item.method === 'HEAD').length,
          providerReads, events: native.map(item => item.event), failures: failures.length, unknown: unknown.length });
      }
      if (interactive && url.pathname === '/090/ui-event' && incoming.method === 'POST') {
        const input = JSON.parse(body);
        assert.deepEqual(Object.keys(input), ['event']);
        assert(['cancel-observed', 'share-returned', 'preview-page-1', 'preview-page-2', 'preview-closed', 'file-removed'].includes(input.event));
        assert(!native.some(item => item.event === input.event), 'Duplicate UI event');
        if (input.event === 'cancel-observed') assertInteractiveCancel(requests, providerReads);
        else assertInlinePreviewEvent(input.event, native.map(item => item.event), providerReads);
        native.push({ event: input.event, origin: input.event === 'cancel-observed' ? 'operator observation'
          : input.event === 'file-removed' ? 'actual Expo File.exists false after removal'
            : input.event.startsWith('preview-') ? 'actual native Image.onLoad or renderer close callback' : 'actual native share promise returned' });
        return json(200, {});
      }
      if (url.pathname === '/090/native-mode' && incoming.method === 'POST') {
        const input = JSON.parse(body); assert(['revoke', 'restore'].includes(input.mode));
        assert.equal(currentChoir, choirA); revoked = input.mode === 'revoke'; phase = revoked ? 'revoked' : 'switched';
        const valid = await serverApi.createLegacyTicket(claims, secret); return json(200, { url: ticketUrl(valid.token) });
      }
      if (url.pathname === '/090/native-evidence' && incoming.method === 'POST') { evidence(JSON.parse(body)); return json(200, {}); }
    }
    if (origin === authOrigin) {
      if (url.pathname === '/auth/v1/token' && incoming.method === 'POST') {
        const input = JSON.parse(body);
        if (url.searchParams.get('grant_type') === 'password') {
          assert.equal(input.email, user.email); assert.equal(input.password, password); return json(200, newSession());
        }
        assert.equal(url.searchParams.get('grant_type'), 'refresh_token'); assert.equal(input.refresh_token, '090-synthetic-native-refresh');
        refreshes[phase]++; return json(200, newSession());
      }
      if (!authorized) return json(401, { message: 'Synthetic unauthorized' });
      if (url.pathname === '/auth/v1/user') return json(200, user);
      if (url.pathname === '/rest/v1/rpc/list_my_choirs') return json(200, [membership(choirA, memberA), membership(choirB, memberB)]);
      if (url.pathname === '/rest/v1/rpc/set_active_choir') {
        const input = JSON.parse(body); assert([choirA, choirB].includes(input.p_choir_id)); currentChoir = input.p_choir_id; return json(200, currentChoir);
      }
      if (url.pathname === '/rest/v1/choir_members') {
        if (interactive && !url.searchParams.has('id')) return json(200, interactiveRows(url, ids, currentChoir));
        const member = currentChoir === choirA ? memberA : memberB;
        assert.equal(url.searchParams.get('id'), 'eq.' + member); assert.equal(url.searchParams.get('choir_id'), 'eq.' + currentChoir);
        assert.equal(url.searchParams.get('auth_user_id'), 'eq.' + actor);
        return json(200, { id: member, choir_id: currentChoir, auth_user_id: actor, first_name: 'Synthetic', last_name: 'Profile', voice_group: 'Soprano', email: user.email, is_active: true });
      }
      if (url.pathname === '/rest/v1/choir_member_roles' && !url.searchParams.get('member_id')?.startsWith('in.')) {
        return json(200, [{ roles: { name: interactive && currentChoir === choirA ? 'Şef' : 'Korist' } }]);
      }
      if (interactive && incoming.method === 'GET') {
        const rows = interactiveRows(url, ids, currentChoir); if (rows !== null) return json(200, rows);
      }
    }
    if (origin === app) {
      const isRead = url.pathname === '/api/drive-file/' + fileId && ['GET', 'HEAD'].includes(incoming.method);
      if (isRead || url.pathname === '/api/drive-file-token') {
        if (phase === 'profile') phase = 'renewal';
        const request = new Request(url, { method: incoming.method, headers: incoming.headers,
          ...(incoming.method === 'POST' ? { body } : {}) });
        if (isRead) { assert.equal(authorization, ''); return finish(await serverApi.readLegacyFile(request, fileId, incoming.method)); }
        assert.equal(incoming.method, 'POST');
        assert.deepEqual(JSON.parse(body), interactive ? { driveFileId: fileId, fileName: file.fileName, mimeType: file.mimeType } : { driveFileId: fileId });
        return finish(await serverApi.issueLegacyFileUrl(request));
      }
      assert(['GET', 'HEAD'].includes(incoming.method), 'Unexpected product mutation');
      const response = await originalFetch(nextOrigin + url.pathname + url.search, {
        method: incoming.method, redirect: 'manual', headers: { 'Accept-Encoding': 'identity' } });
      // Streaming proxy keeps binary source intact, no HTML/script/credential injection.
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      outgoing.end(incoming.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer())); return;
    }
    unknown.push({ phase, method: incoming.method, path: url.pathname }); return json(500, { message: 'Unknown fixture' });
  }
  async function close() {
    if (next && next.exitCode === null) { const ended = once(next, 'exit'); next.kill('SIGTERM'); const force = setTimeout(() => next.kill('SIGKILL'), 5000); await ended; clearTimeout(force); }
    for (const server of servers) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    globalThis.fetch = originalFetch;
    for (const [key, value] of [['NEXT_PUBLIC_SUPABASE_URL', priorEnv.url], ['NEXT_PUBLIC_SUPABASE_ANON_KEY', priorEnv.key]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    if (!fs.existsSync(out)) { record.status = failures.length ? 'FAIL' : 'NOT RUN'; persist(); }
    console.log(JSON.stringify({ cleanup: 'owned Next/fixtures stopped', status: record.status }));
  }
  try {
    for (const origin of [app, authOrigin, fixture]) {
      const server = createServer((req, res) => void route(req, res, origin).catch(error => {
        failures.push(String(error.message).replace(/Bearer\s+\S+|[?&](?:token|ticket)=[^&\s]+/g, '[redacted]').slice(0, 200));
        res.writeHead(500); res.end();
      })); servers.push(server);
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(Number(new URL(origin).port), '127.0.0.1', resolve); });
    }
    next = spawn(process.execPath, [ROOT + '/node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', '31095'],
      { cwd: candidate, env: buildEnv(interactive), stdio: ['ignore', 'ignore', 'ignore'] });
    console.log(JSON.stringify({ listening: [app, authOrigin, fixture], webRef: WEB_REF, authority: 'synthetic only' }));
    await new Promise(resolve => { process.once('SIGTERM', resolve); process.once('SIGINT', resolve); });
  } finally { await close(); }
}
if (process.argv[1] === import.meta.filename) {
  assert.equal(process.cwd(), ROOT); const args = process.argv.slice(2); assert.equal(args.length, 1);
  if (args[0] === '--materialize-owned') console.log(JSON.stringify(materialize()));
  else if (args[0] === '--build-web') await run(process.execPath, [ROOT + '/node_modules/next/dist/bin/next', 'build'], CANDIDATE);
  else if (['--prebuild-mobile', '--prebuild-interactive-mobile'].includes(args[0])) await run(process.execPath, [ROOT + '/apps/mobile/node_modules/expo/bin/cli', 'prebuild', '--platform', 'android', '--no-install'], ROOT + '/apps/mobile', buildEnv(args[0].includes('interactive')));
  else if (['--build-mobile', '--build-interactive-mobile'].includes(args[0])) await run('./gradlew', ['assembleRelease', '--offline', '--no-daemon', '--max-workers=2', '-PreactNativeArchitectures=arm64-v8a'], ROOT + '/apps/mobile/android', buildEnv(args[0].includes('interactive')));
  else { assert(['--serve-owned', '--serve-interactive-owned'].includes(args[0])); await serve(args[0].includes('interactive')); }
}
