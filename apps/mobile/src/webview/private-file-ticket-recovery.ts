import { ProtectedFileRequestError, requestProtectedRepertoireFileTicket } from '@shared/repertuvar/protected-file-client';
import type { NativeWebViewLease, NativeWebViewLeaseOptions } from '../auth/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const READERS = /^\/functions\/v1\/(?:repertoire-file|assignment-file|assignment-review-file|repertoire-comment-file|chat-media-file)$/;
const LEGACY_READER = /^\/api\/drive-file\/([A-Za-z0-9_-]{1,256})$/u;
const LEGACY_TICKET = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u;

function trustedOrigin(value: string | undefined, allowLoopback: boolean): URL {
  let origin: URL;
  try { origin = new URL(value ?? ''); } catch { throw new Error('Unsupported private-file issuer'); }
  const local = allowLoopback && origin.protocol === 'http:' && origin.hostname === '127.0.0.1' && Boolean(origin.port);
  if ((origin.protocol !== 'https:' && !local) || origin.username || origin.password
    || origin.pathname !== '/' || origin.search || origin.hash
    || ![origin.origin, origin.origin + '/'].includes(value ?? '')) throw new Error('Unsupported private-file issuer');
  return origin;
}

function legacyUrl(value: string, origin: URL): { url: URL; alias: string } {
  const url = new URL(value);
  const match = LEGACY_READER.exec(url.pathname);
  const token = url.searchParams.get('token') ?? '';
  if (value.length > 16_384 || /[\\\u0000-\u0020\u007f]/u.test(value) || value !== url.href
    || url.origin !== origin.origin || url.username || url.password || url.hash || !match
    || [...url.searchParams.keys()].join(',') !== 'token' || token.length > 2048 || !LEGACY_TICKET.test(token)) {
    throw new Error('Unsupported private-file issuer');
  }
  return { url, alias: match[1]! };
}

async function renewLegacyFile(
  old: URL, alias: string, lease: NativeWebViewLease, signal: AbortSignal, fetcher: typeof fetch,
): Promise<string> {
  const response = await fetcher(new URL('/api/drive-file-token', old.origin), {
    method: 'POST', headers: { Authorization: `Bearer ${lease.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ driveFileId: alias }), signal, redirect: 'error', credentials: 'omit',
  });
  requireActive(signal);
  if (!response.ok) throw new ProtectedFileRequestError('Private-file authority denied', response.status);
  const payload = await response.json() as { url?: unknown; expiresAt?: unknown };
  requireActive(signal);
  if (typeof payload.url !== 'string' || typeof payload.expiresAt !== 'number'
    || payload.url.length > 16_384 || /[\\\u0000-\u0020\u007f]/u.test(payload.url)
    || !Number.isSafeInteger(payload.expiresAt) || payload.expiresAt <= Date.now()
    || ![old.pathname, old.origin + old.pathname].includes(payload.url.split('?', 1)[0]!)) {
    throw new Error('Invalid private-file replacement');
  }
  const replacement = legacyUrl(new URL(payload.url, old.origin).href, new URL(old.origin));
  if (replacement.alias !== alias || replacement.url.href === old.href) throw new Error('Invalid private-file replacement');
  return replacement.url.href;
}

function requireActive(signal: AbortSignal) {
  if (signal.aborted) throw new Error('Private-file operation cleared');
}

/** Native-only, one-shot recovery. Never send the native token to a bridge-selected origin.
 * A confirmed authority denial is final; redirects and a tenant-clear abort fail closed.
 * DownloadTask hides HTTP status, so probe the old body before issuing one fresh ticket.
 */
export function createPrivateFileTicketRecovery({
  getIssuer, getAppOrigin, getLease, fetcher = fetch, allowLoopback = false,
}: {
  getIssuer: () => string | undefined;
  /** Native runtime configuration only, never a message/request-controlled origin. */
  getAppOrigin?: () => string | undefined;
  getLease: (options?: NativeWebViewLeaseOptions) => Promise<NativeWebViewLease>;
  fetcher?: typeof fetch;
  allowLoopback?: boolean;
}) {
  return async ({ url, signal }: { url: string; signal: AbortSignal }): Promise<string> => {
    requireActive(signal);
    const old = new URL(url);
    const legacy = LEGACY_READER.test(old.pathname);
    const issuer = trustedOrigin(legacy ? getAppOrigin?.() : getIssuer(), allowLoopback);
    const keys = [...old.searchParams.keys()].sort().join(',');
    if (legacy) legacyUrl(url, issuer);
    else if (
        old.origin !== issuer.origin || old.username || old.password || old.hash ||
        url.length > 16_384 || /[\u0000-\u0020\u007f]/u.test(url) ||
        !READERS.test(old.pathname) || keys !== 'fileId,ticket' ||
        !UUID.test(old.searchParams.get('fileId') ?? '') || !old.searchParams.get('ticket')) {
      throw new Error('Unsupported private-file issuer');
    }
    let status: number | undefined;
    try {
      status = (await fetcher(old, { method: 'HEAD', signal, redirect: 'error' })).status;
    } catch {
      // A transport failure has no authority verdict. Issuance still authenticates anew.
      requireActive(signal);
    }
    if (status !== undefined && status !== 200 && status !== 401) {
      throw new Error('Private-file authority denied');
    }
    requireActive(signal);
    const lease = await getLease({ forceRefresh: true });
    requireActive(signal);
    if (!lease.accessToken) throw new Error('Private-file lease unavailable');
    if (legacy) return renewLegacyFile(old, LEGACY_READER.exec(old.pathname)![1]!, lease, signal, fetcher);
    const ticket = await requestProtectedRepertoireFileTicket({
      endpoint: `${issuer.origin}${old.pathname}`, accessToken: lease.accessToken,
      fileId: old.searchParams.get('fileId')!, signal,
      fetcher: (input, options) => fetcher(input, { ...options, redirect: 'error' }),
    });
    requireActive(signal);
    return ticket.url;
  };
}
