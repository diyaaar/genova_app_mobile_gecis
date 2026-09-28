import { BlockList, isIP } from 'node:net';

export class PreviewError extends Error {
  constructor(public readonly code: string, public readonly status: number) { super(code); }
}

const denied = new BlockList();
const publicV6 = new BlockList();
publicV6.addSubnet('2000::', 3, 'ipv6');
for (const [address, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 3],
] as const) denied.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [
  ['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['3fff::', 20],
] as const) denied.addSubnet(address, prefix, 'ipv6');

/** Conservative global-unicast policy; mapped/NAT64/6to4/local/special ranges fail closed. */
export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  return family === 4 ? !denied.check(address, 'ipv4')
    : family === 6 && publicV6.check(address, 'ipv6') && !denied.check(address, 'ipv6');
}

export function normalizePreviewUrl(raw: string): URL {
  if (!raw || raw.length > 2_048 || /[\x00-\x20\x7f\\]/.test(raw.trim())) {
    throw new PreviewError('invalid-url', 400);
  }
  let url: URL;
  try {
    const value = raw.trim();
    url = new URL(/^https?:\/\//i.test(value) ? value : value.startsWith('//') ? `https:${value}` : `https://${value}`);
  } catch { throw new PreviewError('invalid-url', 400); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) {
    throw new PreviewError('invalid-url', 400);
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  if (isIP(hostname)) {
    if (!isPublicAddress(hostname)) throw new PreviewError('forbidden-target', 400);
  } else {
    if (hostname.length > 253 || !hostname.includes('.')
      || /(?:^|\.)(?:localhost|local|internal|lan|arpa|test|invalid|example)$/.test(hostname)
      || hostname.split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) {
      throw new PreviewError('forbidden-target', 400);
    }
  }
  // Strip DNS absolute-name spelling to keep Host/SNI/certificate identity consistent.
  if (!isIP(hostname)) url.hostname = hostname;
  url.hash = '';
  return url;
}

export interface PinnedTarget { url: URL; address: string; family: 4 | 6 }
export type ResolveAddresses = (hostname: string) => Promise<{ address: string; family: number }[]>;

/** Bound otherwise non-cancellable DNS/auth/read promises to the request deadline. */
export async function abortable<T>(work: PromiseLike<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    // The caller may already have created an immediately rejected IO promise.
    void Promise.resolve(work).catch(() => {});
    throw new PreviewError('timeout', 504);
  }
  let onAbort!: () => void;
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(new PreviewError('timeout', 504));
    signal.addEventListener('abort', onAbort, { once: true });
  });
  try { return await Promise.race([work, aborted]); }
  finally { signal.removeEventListener('abort', onAbort); }
}

export async function resolveTarget(url: URL, resolve: ResolveAddresses, signal: AbortSignal): Promise<PinnedTarget> {
  if (signal.aborted) throw new PreviewError('timeout', 504);
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const literal = isIP(hostname);
  const addresses = literal ? [{ address: hostname, family: literal }]
    : await abortable(resolve(hostname), signal);
  if (!addresses.length || addresses.length > 16) throw new PreviewError('upstream-unavailable', 502);
  if (addresses.some(entry => !isPublicAddress(entry.address) || isIP(entry.address) !== entry.family)) {
    throw new PreviewError('forbidden-target', 400);
  }
  const first = addresses[0];
  return { url, address: first.address, family: first.family as 4 | 6 };
}
