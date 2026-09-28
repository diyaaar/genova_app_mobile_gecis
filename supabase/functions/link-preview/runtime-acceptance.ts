// Actual installed Deno transport, parser and handler; ONLY owned loopback fixtures.
import { createServer as httpServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createServer as httpsServer } from 'node:https';
import type { Socket } from 'node:net';
import sanitizeHtml from 'npm:sanitize-html@2.17.7';
import { createPinnedTransport } from './transport.ts';
import { normalizePreviewUrl, resolveTarget, type PinnedTarget } from './policy.ts';
import { fetchPublicHtml, createPreviewParser } from './preview.ts';
import { createLinkPreviewHandler } from './handler.ts';

function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
async function rejects(work: Promise<unknown>, code?: string) {
  let rejected = false;
  try { await work; } catch (error) {
    rejected = true; if (code) assert(error instanceof Error && error.message === code, `Expected ${code}, got ${String(error)}`);
  }
  assert(rejected, 'Expected rejection');
}
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const cert = await Deno.readTextFile(Deno.args[0]);
const key = await Deno.readTextFile(Deno.args[1]);
const sockets = new Set<Socket>(); const requests: { host?: string; path?: string; authorization?: string; encoding?: string; servername?: string }[] = [];
const serve = (req: IncomingMessage, res: ServerResponse) => {
  requests.push({ host: req.headers.host, path: req.url, authorization: req.headers.authorization,
    encoding: req.headers['accept-encoding'], servername: (req.socket as Socket & { servername?: string }).servername });
  res.setHeader('Content-Type', 'text/html');
  switch (req.url) {
    case '/slow-headers': return;
    case '/slow-body': res.write('<title>'); return;
    case '/large-headers': res.setHeader('x-large', 'x'.repeat(20_000)); res.end('bad'); return;
    case '/chunked': res.write('x'.repeat(200_000)); res.end('x'.repeat(100_001)); return;
    case '/declared': res.setHeader('Content-Length', '300001'); res.end('short'); return;
    case '/compressed': res.setHeader('Content-Encoding', 'gzip'); res.end('not decoded'); return;
    case '/non-html': res.setHeader('Content-Type', 'application/pdf'); res.write('not HTML'); return;
    case '/private-redirect': res.writeHead(302, { location: 'http://169.254.169.254/' }); res.end(); return;
    case '/redirect': res.writeHead(302, { location: '/ok' }); res.end(); return;
    case '/empty': res.writeHead(205); res.end(); return;
    case '/reset': res.destroy(); return;
    default: res.end('<title>şarkı &amp; dünya</title><meta property="og:image" content="/cover.png">');
  }
};
const http = httpServer(serve); const https = httpsServer({ cert, key }, serve);
for (const server of [http, https]) server.on('connection', socket => {
  sockets.add(socket); socket.once('close', () => sockets.delete(socket));
});
const listen = (server: typeof http | typeof https) => new Promise<number>((resolve, reject) => {
  server.once('error', reject); server.listen(0, '127.0.0.1', () => {
    const address = server.address(); assert(address && typeof address !== 'string', 'Missing fixture port'); resolve(address.port);
  });
});
try {
  const httpPort = await listen(http); const httpsPort = await listen(https);
  const transport = createPinnedTransport({ ca: cert, httpPort, httpsPort });
  const pins: string[] = [];
  const deps = { resolve: async () => [{ address: '8.8.8.8', family: 4 }],
    request: (target: PinnedTarget, signal: AbortSignal) => {
      // Explicit fixture-only substitution AFTER policy; no production URL/config override.
      pins.push(target.address); return transport({ ...target, address: '127.0.0.1', family: 4 }, signal);
    } };
  const controller = () => new AbortController().signal;
  const fetchFixture = (path: string, ms = 3000) => fetchPublicHtml(`http://preview.fixture.com${path}`, deps, controller(), ms);
  const cleanupObserved = async () => {
    for (let attempt = 0; attempt < 50 && sockets.size; attempt++) await delay(10);
    assert(sockets.size === 0, `Transport left ${sockets.size} socket(s) open`);
  };
  const result = await fetchFixture('/ok');
  assert(result.html?.includes('şarkı'), 'Actual HTTP body unavailable');
  const preview = createPreviewParser(sanitizeHtml)(result.html!, result.url);
  assert(preview.title === 'şarkı & dünya' && preview.image === 'http://preview.fixture.com/cover.png', 'Actual Deno parser incorrect');
  assert(requests[0].host === 'preview.fixture.com' && requests[0].authorization === undefined && requests[0].encoding === 'identity', 'Host/credential/encoding boundary failed');
  assert(pins[0] === '8.8.8.8', 'Validated address not selected'); await cleanupObserved();
  console.log('PASS actual HTTP numeric transport, Host, credentials, parser and cleanup');

  const tls = await fetchPublicHtml('https://preview.fixture.com/ok', deps, controller());
  assert(tls.html?.includes('şarkı'), 'Actual TLS body unavailable');
  assert(requests.at(-1)?.servername === 'preview.fixture.com', 'TLS SNI changed to numeric address'); await cleanupObserved();
  await rejects(fetchPublicHtml('https://wrong.fixture.com/ok', deps, controller()), 'upstream-unavailable'); await cleanupObserved();
  console.log('PASS actual TLS original Host/SNI/certificate match and mismatched certificate rejection');

  const count = requests.length;
  await rejects(resolveTarget(normalizePreviewUrl('https://preview.fixture.com'), async () => [{ address: '127.0.0.1', family: 4 }], controller()), 'forbidden-target');
  assert(requests.length === count, 'Private DNS unexpectedly reached transport');
  await rejects(fetchFixture('/private-redirect'), 'forbidden-target');
  assert(requests.length === count + 1, 'Private redirect caused another connection'); await cleanupObserved();
  assert((await fetchFixture('/redirect')).url.pathname === '/ok', 'Relative redirect failed'); await cleanupObserved();
  console.log('PASS actual composition refuses private DNS/redirect without target probes; relative redirect works');

  for (const path of ['/chunked', '/declared']) { await rejects(fetchFixture(path), 'body-too-large'); await cleanupObserved(); }
  await rejects(fetchFixture('/large-headers'), 'upstream-unavailable'); await cleanupObserved();
  await rejects(fetchFixture('/reset'), 'upstream-unavailable'); await cleanupObserved();
  for (const path of ['/compressed', '/non-html', '/empty']) {
    assert((await fetchFixture(path)).html === null, `Expected fallback ${path}`); await cleanupObserved();
  }
  console.log('PASS actual chunked/declared/header bounds, reset errors, compressed/non-HTML/205 fallbacks and socket cancellation');
  for (const path of ['/slow-headers', '/slow-body']) {
    const start = performance.now(); await rejects(fetchFixture(path, 150), 'timeout');
    assert(performance.now() - start < 1200, `Deadline failed ${path}`); await cleanupObserved();
  }
  const start = performance.now(); await rejects(fetchFixture('/slow-body'), 'timeout');
  assert(performance.now() - start < 4000, 'Production three-second body deadline failed'); await cleanupObserved();
  console.log('PASS actual header/body deadline, production three-second deadline and cancelled sockets');

  const actor = { userId: '11111111-1111-4111-8111-111111111111', choirId: '22222222-2222-4222-8222-222222222222', memberId: '33333333-3333-4333-8333-333333333333' };
  const handler = createLinkPreviewHandler({ ...deps, authorize: async () => actor, parse: createPreviewParser(sanitizeHtml) });
  const req = () => new Request('https://edge.fixture.com', { method: 'POST', headers: { authorization: 'Bearer fixture-token' }, body: JSON.stringify({ url: 'http://preview.fixture.com/ok' }) });
  const response = await handler(req()); assert(response.status === 200, 'Actual handler failed');
  assert((await response.json()).title === 'şarkı & dünya', 'Actual handler schema/parser failed'); await cleanupObserved();
  const slowAuth = createLinkPreviewHandler({ ...deps, authorize: () => new Promise(() => {}), parse: createPreviewParser(sanitizeHtml) });
  const before = requests.length; const authStart = performance.now();
  assert((await slowAuth(req())).status === 504 && requests.length === before, 'Auth deadline/outbound boundary failed');
  assert(performance.now() - authStart < 6000, 'Production five-second handler deadline failed');
  console.log('PASS actual Deno handler composition and production five-second auth deadline (synthetic identity, not hosted Auth)');
} finally {
  for (const socket of sockets) socket.destroy();
  await Promise.all([http, https].map(server => new Promise<void>(resolve => server.close(() => resolve()))));
}
