// Test-only transport front door: actual local Auth/REST remain behind Kong.
// The one selected file route reaches the actual assignment Deno handler via
// the existing observer. It is explicitly not unmodified Kong Edge routing.
import assert from 'node:assert/strict';
import { createServer, request as upstreamRequest } from 'node:http';

assert.equal(process.env.GENOVA_090_LOOPBACK_API_RELAY, '1');
const server = createServer((request, response) => {
  try {
    assert.equal(request.headers.host, '127.0.0.1:54491');
    const url = new URL(request.url ?? '/', 'http://127.0.0.1:54491');
    assert.equal(url.origin, 'http://127.0.0.1:54491');
    assert.equal(url.username, ''); assert.equal(url.password, '');
    const file = url.pathname === '/functions/v1/assignment-file';
    if (!file && !url.pathname.startsWith('/auth/v1/') && !url.pathname.startsWith('/rest/v1/')) {
      response.writeHead(404); response.end(); return;
    }
    const port = file ? 18092 : 54493;
    const upstream = upstreamRequest({ hostname: '127.0.0.1', port,
      path: `${url.pathname}${url.search}`, method: request.method,
      headers: { ...request.headers, host: `127.0.0.1:${port}` } }, actual => {
      response.writeHead(actual.statusCode ?? 502, actual.headers);
      actual.pipe(response);
    });
    upstream.setTimeout(10_000, () => upstream.destroy());
    upstream.on('error', () => { if (!response.headersSent) response.writeHead(502); response.end(); });
    request.on('aborted', () => upstream.destroy());
    request.pipe(upstream);
  } catch { response.writeHead(400); response.end(); }
});
server.listen(54491, '127.0.0.1', () => console.log('READY 090 loopback API transport relay (no authority replacement)'));
process.once('SIGTERM', () => server.close());
