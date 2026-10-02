/** Fixed-origin adapter only. Auth, tenant policy and provider reads belong to Edge. */
const ALIAS = /^[A-Za-z0-9_-]{1,256}$/u;
const RESPONSE_HEADERS = ['content-type', 'content-length', 'content-range', 'content-disposition', 'accept-ranges'];
function baseHeaders() {
  return new Headers({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer' });
}
function error(status: number, head = false) {
  return new Response(head ? null : 'Dosya erişimi kullanılamıyor.', { status, headers: baseHeaders() });
}
function endpoint() {
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '');
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid file origin');
  url.pathname = '/functions/v1/legacy-file';
  url.search = '';
  url.hash = '';
  return url;
}
function requestHeaders() {
  const headers = new Headers();
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (publicKey) headers.set('apikey', publicKey);
  return headers;
}
export async function issueLegacyFileUrl(request: Request): Promise<Response> {
  const authorization = request.headers.get('authorization') ?? '';
  if (!/^Bearer\s+\S+$/iu.test(authorization)) return error(401);
  try {
    const url = endpoint();
    const headers = requestHeaders();
    headers.set('Authorization', authorization);
    headers.set('Content-Type', 'application/json');
    // Stream the old body contract. Edge, not Next, bounds/parses it and resolves metadata.
    const upstream = await fetch(url, {
      method: 'POST', headers, body: request.body, duplex: 'half',
      redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(30_000),
    } as RequestInit);
    if (!upstream.ok) {
      await upstream.body?.cancel();
      return error(upstream.status >= 400 && upstream.status <= 599 ? upstream.status : 502);
    }
    const result = await upstream.json() as { url?: unknown; expiresAt?: unknown };
    if (typeof result.url !== 'string' || typeof result.expiresAt !== 'number'
      || !Number.isSafeInteger(result.expiresAt) || result.expiresAt <= Date.now()) return error(502);
    const ticketUrl = new URL(result.url);
    const alias = ticketUrl.searchParams.get('alias') ?? '';
    const ticket = ticketUrl.searchParams.get('ticket') ?? '';
    if (ticketUrl.origin !== url.origin || ticketUrl.pathname !== url.pathname
      || ticketUrl.username || ticketUrl.password || !ALIAS.test(alias)
      || !ticket || ticket.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u.test(ticket)) return error(502);
    return Response.json({ url: `/api/drive-file/${alias}?token=${encodeURIComponent(ticket)}`,
      expiresAt: result.expiresAt }, { headers: baseHeaders() });
  } catch { return error(503); }
}
export async function readLegacyFile(request: Request, alias: string, method: 'GET' | 'HEAD'): Promise<Response> {
  const head = method === 'HEAD';
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!ALIAS.test(alias) || !token || token.length > 2048) return error(401, head);
  try {
    const url = endpoint();
    url.searchParams.set('alias', alias);
    url.searchParams.set('ticket', token);
    const headers = requestHeaders();
    const range = request.headers.get('range');
    if (range) headers.set('Range', range);
    const upstream = await fetch(url, { method, headers, redirect: 'manual', cache: 'no-store',
      signal: AbortSignal.timeout(30_000) });
    if (upstream.status >= 300 && upstream.status < 400) {
      await upstream.body?.cancel(); return error(502, head);
    }
    const output = baseHeaders();
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) output.set(name, value);
    }
    if (head) await upstream.body?.cancel();
    return new Response(head ? null : upstream.body, { status: upstream.status, headers: output });
  } catch { return error(503, head); }
}
