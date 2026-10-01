import { requestProtectedRepertoireFileTicket } from '@shared/repertuvar/protected-file-client';
import type { NativeWebViewLease, NativeWebViewLeaseOptions } from '../auth/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const READERS = /^\/functions\/v1\/(?:repertoire-file|assignment-file|assignment-review-file|repertoire-comment-file|chat-media-file)$/;

function requireActive(signal: AbortSignal) {
  if (signal.aborted) throw new Error('Private-file operation cleared');
}

/** Native-only, one-shot recovery. Never send the native token to a bridge-selected origin.
 * A confirmed authority denial is final; redirects and a tenant-clear abort fail closed.
 * DownloadTask hides HTTP status, so probe the old body before issuing one fresh ticket.
 */
export function createPrivateFileTicketRecovery({
  getIssuer, getLease, fetcher = fetch, allowLoopback = false,
}: {
  getIssuer: () => string | undefined;
  getLease: (options?: NativeWebViewLeaseOptions) => Promise<NativeWebViewLease>;
  fetcher?: typeof fetch;
  allowLoopback?: boolean;
}) {
  return async ({ url, signal }: { url: string; signal: AbortSignal }): Promise<string> => {
    requireActive(signal);
    const issuer = new URL(getIssuer() ?? '');
    const old = new URL(url);
    const local = allowLoopback && issuer.protocol === 'http:' && issuer.hostname === '127.0.0.1';
    const keys = [...old.searchParams.keys()].sort().join(',');
    if ((issuer.protocol !== 'https:' && !local) || issuer.username || issuer.password ||
        issuer.search || issuer.hash || (issuer.pathname !== '/' && issuer.pathname !== '') ||
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
    const ticket = await requestProtectedRepertoireFileTicket({
      endpoint: `${issuer.origin}${old.pathname}`, accessToken: lease.accessToken,
      fileId: old.searchParams.get('fileId')!, signal,
      fetcher: (input, options) => fetcher(input, { ...options, redirect: 'error' }),
    });
    requireActive(signal);
    return ticket.url;
  };
}
