import { abortable, normalizePreviewUrl, PreviewError } from './policy.ts';
import { fallbackPreview, fetchPublicHtml, readBoundedBody, type LinkPreviewResponse } from './preview.ts';
import type { PinnedTarget, ResolveAddresses } from './policy.ts';

export interface PreviewActor { userId: string; choirId: string; memberId: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const messages: Record<string, string> = {
  'invalid-url': 'Geçerli bir web bağlantısı gönderin.', 'forbidden-target': 'Bu bağlantının önizlemesine izin verilmiyor.',
  'invalid-body': 'Geçerli bir URL gönderin.', 'body-too-large': 'Önizleme boyut sınırını aşıyor.',
  'unauthorized': 'Geçersiz oturum.', 'forbidden': 'Aktif koro üyeliği gerekli.',
  'timeout': 'Bağlantı zaman aşımına uğradı.', 'rate-limit': 'Çok fazla önizleme isteği. Daha sonra tekrar deneyin.',
};

/** Pre-auth admission bounds slow body/auth work too, without retaining unauthenticated IDs. */
export function createPreviewAdmission(now = Date.now, limits = { requests: 300, concurrent: 16 }) {
  let start = now(); let count = 0; let inflight = 0;
  return (): (() => void) => {
    const time = now();
    if (time - start >= 60_000) { start = time; count = 0; }
    if (count >= limits.requests || inflight >= limits.concurrent) throw new PreviewError('rate-limit', 429);
    count++; inflight++; let released = false;
    return () => { if (!released) { inflight--; released = true; } };
  };
}

/** Warm-worker abuse guard, not a distributed commercial quota. No URL/token/body stored. */
export function createPreviewBudget(now = Date.now, limits = { actor: 12, choir: 120, concurrent: 8, buckets: 1_024, worker: 300 }) {
  const buckets = new Map<string, { start: number; count: number }>(); let inflight = 0;
  return (actor: PreviewActor): (() => void) => {
    const time = now();
    for (const [key, entry] of buckets) if (time - entry.start >= 60_000) buckets.delete(key);
    if (inflight >= limits.concurrent) throw new PreviewError('rate-limit', 429);
    const keys = [`actor:${actor.choirId}:${actor.userId}`, `choir:${actor.choirId}`, 'worker'];
    const caps = [limits.actor, limits.choir, limits.worker];
    if (buckets.size + keys.filter(key => !buckets.has(key)).length > limits.buckets
      || keys.some((key, index) => (buckets.get(key)?.count ?? 0) >= caps[index])) throw new PreviewError('rate-limit', 429);
    keys.forEach(key => {
      const entry = buckets.get(key) ?? { start: time, count: 0 }; entry.count++; buckets.set(key, entry);
    });
    inflight++;
    let released = false;
    return () => { if (!released) { inflight--; released = true; } };
  };
}

export function createLinkPreviewHandler(dependencies: {
  authorize: (token: string, signal: AbortSignal) => Promise<PreviewActor>;
  resolve: ResolveAddresses; request: (target: PinnedTarget, signal: AbortSignal) => Promise<Response>;
  parse: (html: string, url: URL) => LinkPreviewResponse;
  reserve?: ReturnType<typeof createPreviewBudget>;
  admit?: ReturnType<typeof createPreviewAdmission>;
}) {
  const reserve = dependencies.reserve ?? createPreviewBudget();
  const admit = dependencies.admit ?? createPreviewAdmission();
  return async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers });
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST gerekli.' }), { status: 405, headers: { ...headers, Allow: 'POST, OPTIONS' } });
    const controller = new AbortController(); const abort = () => controller.abort();
    req.signal.addEventListener('abort', abort, { once: true });
    if (req.signal.aborted) abort();
    const timer = setTimeout(abort, 5_000); let release: (() => void) | undefined;
    let releaseAdmission: (() => void) | undefined;
    try {
      releaseAdmission = admit();
      const token = req.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9._-]{1,8192})$/i)?.[1];
      if (!token) throw new PreviewError('unauthorized', 401);
      const length = req.headers.get('content-length');
      if (length !== null && (!/^\d+$/.test(length) || Number(length) > 4_096)) throw new PreviewError('body-too-large', 413);
      let body: unknown;
      try { body = JSON.parse(await readBoundedBody(req.body, 4_096, controller.signal)); }
      catch (error) { if (error instanceof PreviewError) throw error; throw new PreviewError('invalid-body', 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)
        || Object.keys(body).length !== 1 || !('url' in body) || typeof body.url !== 'string') throw new PreviewError('invalid-body', 400);
      const url = normalizePreviewUrl(body.url);
      const actor = await abortable(dependencies.authorize(token, controller.signal), controller.signal);
      if (![actor?.userId, actor?.choirId, actor?.memberId].every(value => typeof value === 'string' && uuid.test(value))) throw new PreviewError('forbidden', 403);
      release = reserve(actor);
      const result = await fetchPublicHtml(url.href, dependencies, controller.signal);
      const preview = result.html === null ? fallbackPreview(result.url) : dependencies.parse(result.html, result.url);
      return new Response(JSON.stringify(preview), { headers });
    } catch (error) {
      const known = controller.signal.aborted ? new PreviewError('timeout', 504)
        : error instanceof PreviewError ? error : new PreviewError('upstream-unavailable', 502);
      return new Response(JSON.stringify({ error: messages[known.code] ?? 'Bağlantı önizlemesi şu anda alınamıyor.' }), { status: known.status, headers });
    } finally { release?.(); releaseAdmission?.(); controller.abort(); clearTimeout(timer); req.signal.removeEventListener('abort', abort); }
  };
}
