import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { checkServerIdentity } from 'node:tls';
import { Readable } from 'node:stream';
import { isIP } from 'node:net';
import type { PinnedTarget } from './policy.ts';

/** Numeric-address connection only: no second DNS lookup, proxy, pooling or automatic redirect.
 * Host and TLS certificate identity remain the original hostname. Never receives caller headers.
 * Optional CA/ports are constructor-only for owned fixtures; production supplies no overrides.
 * Caller must use resolveTarget first; this internal transport does not accept user-supplied URLs.
 */
export function createPinnedTransport(fixtures?: { ca?: string; httpPort?: number; httpsPort?: number }) {
  return (target: PinnedTarget, signal: AbortSignal): Promise<Response> => new Promise((resolve, reject) => {
    const hostname = target.url.hostname.replace(/^\[|\]$/g, '');
    const secure = target.url.protocol === 'https:';
    const send = secure ? httpsRequest : httpRequest;
    const request = send({
      hostname: target.address, family: target.family, port: secure ? fixtures?.httpsPort ?? 443 : fixtures?.httpPort ?? 80,
      path: `${target.url.pathname}${target.url.search}`, method: 'GET', signal,
      agent: false, maxHeaderSize: 16_384,
      headers: { Host: target.url.host, 'User-Agent': 'Genova-Link-Preview/2.0', 'Accept-Encoding': 'identity', Accept: 'text/html' },
      ...(secure ? { servername: isIP(hostname) ? '' : hostname, rejectUnauthorized: true,
        checkServerIdentity: (_name: string, certificate: Parameters<typeof checkServerIdentity>[1]) => checkServerIdentity(hostname, certificate),
        ...(fixtures?.ca ? { ca: fixtures.ca } : {}) } : {}),
    }, incoming => {
      try {
        const headers = new Headers();
        for (const [key, value] of Object.entries(incoming.headers)) {
          if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
        const status = incoming.statusCode ?? 502;
        if ([204, 205, 304].includes(status)) {
          incoming.destroy(); resolve(new Response(null, { status, headers })); return;
        }
        const body = Readable.toWeb(incoming, { strategy: {
          highWaterMark: 65_536, size: (chunk: Uint8Array) => chunk.byteLength,
        } }) as ReadableStream<Uint8Array>;
        resolve(new Response(body, { status, headers }));
      } catch (error) { incoming.destroy(); reject(error); }
    });
    request.once('error', reject);
    request.once('upgrade', (_response, socket) => { socket.destroy(); reject(new Error('Unsupported upstream upgrade')); });
    request.end();
  });
}
