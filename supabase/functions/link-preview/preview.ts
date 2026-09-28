import { abortable, normalizePreviewUrl, PreviewError, resolveTarget, type PinnedTarget, type ResolveAddresses } from './policy.ts';

export interface LinkPreviewResponse {
  url: string; title: string | null; description: string | null;
  image: string | null; favicon: string | null; domain: string;
}
export function fallbackPreview(url: URL): LinkPreviewResponse {
  return { url: url.href, title: null, description: null, image: null, favicon: null,
    domain: url.hostname.replace(/^www\./i, '') };
}

export const MAX_HTML_BYTES = 300_000;
export async function readBoundedBody(body: ReadableStream<Uint8Array> | null, max: number, signal: AbortSignal): Promise<string> {
  if (!body) return '';
  const reader = body.getReader(); const decoder = new TextDecoder();
  let bytes = 0; let text = ''; let complete = false;
  try {
    for (;;) {
      const next = await abortable(reader.read(), signal);
      if (next.done) { complete = true; return text + decoder.decode(); }
      bytes += next.value.byteLength;
      if (bytes > max) throw new PreviewError('body-too-large', 413);
      text += decoder.decode(next.value, { stream: true });
    }
  } finally {
    if (!complete) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** One total DNS/connect/redirect/body deadline. A refused response is always cancelled. */
export async function fetchPublicHtml(raw: string, dependencies: {
  resolve: ResolveAddresses; request: (target: PinnedTarget, signal: AbortSignal) => Promise<Response>;
}, parent: AbortSignal, timeoutMs = 3_000): Promise<{ url: URL; html: string | null }> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parent.addEventListener('abort', abort, { once: true });
  if (parent.aborted) abort();
  const timer = setTimeout(abort, timeoutMs);
  let response: Response | null = null;
  try {
    let url = normalizePreviewUrl(raw);
    for (let redirects = 0; ; redirects++) {
      const target = await resolveTarget(url, dependencies.resolve, controller.signal);
      response = await abortable(dependencies.request(target, controller.signal), controller.signal);
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        if (redirects >= 3) throw new PreviewError('redirect-limit', 502);
        const location = response.headers.get('location');
        if (!location || location.length > 2_048) throw new PreviewError('invalid-redirect', 502);
        let destination: URL;
        try { destination = new URL(location, url); } catch { throw new PreviewError('invalid-redirect', 502); }
        const next = normalizePreviewUrl(destination.href);
        if (url.protocol === 'https:' && next.protocol !== 'https:') throw new PreviewError('invalid-redirect', 502);
        void response.body?.cancel().catch(() => {}); response = null; url = next; continue;
      }
      const encoding = response.headers.get('content-encoding')?.trim().toLowerCase();
      if (!response.ok || !response.body || !/^text\/html(?:;|$)/i.test(response.headers.get('content-type') ?? '')
        || (encoding && encoding !== 'identity')) return { url, html: null };
      const length = response.headers.get('content-length');
      if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_HTML_BYTES)) {
        throw new PreviewError('body-too-large', 413);
      }
      const html = await readBoundedBody(response.body, MAX_HTML_BYTES, controller.signal);
      response = null;
      return { url, html };
    }
  } catch (error) {
    if (controller.signal.aborted) throw new PreviewError('timeout', 504);
    if (error instanceof PreviewError) throw error;
    throw new PreviewError('upstream-unavailable', 502);
  } finally {
    void response?.body?.cancel().catch(() => {});
    controller.abort(); clearTimeout(timer); parent.removeEventListener('abort', abort);
  }
}

// Structural dependency permits the same existing sanitize-html parser in Node tests and Deno.
export type TokenizeHtml = (html: string, options: {
  allowedTags: string[]; allowedAttributes: Record<string, string[]>; parseStyleAttributes: boolean;
  transformTags: Record<string, (tag: string, attrs: Record<string, string>) => { tagName: string; attribs: Record<string, string> }>;
  textFilter: (text: string, tag: string) => string;
}) => string;

export function createPreviewParser(tokenize: TokenizeHtml) {
  return (html: string, url: URL): LinkPreviewResponse => {
    const meta = new Map<string, string>(); let title = ''; let favicon: string | null = null;
    tokenize(html, {
      allowedTags: ['title'], allowedAttributes: {}, parseStyleAttributes: false,
      transformTags: {
        meta: (tag, attrs) => {
          const key = (attrs.property ?? attrs.name ?? '').trim().toLowerCase();
          if (!meta.has(key) && attrs.content?.trim()) meta.set(key, attrs.content.trim().slice(0, 2_048));
          return { tagName: tag, attribs: attrs };
        },
        link: (tag, attrs) => {
          if (!favicon && /(?:^|\s)icon(?:\s|$)/i.test(attrs.rel ?? '')) favicon = attrs.href ?? null;
          return { tagName: tag, attribs: attrs };
        },
      },
      textFilter: (text, tag) => {
        if (tag === 'title') title = (title + text).slice(0, 1_000);
        return text;
      },
    });
    const safeAsset = (value: string | null | undefined): string | null => {
      if (!value || value.length > 2_048) return null;
      try { return normalizePreviewUrl(new URL(value, url).href).href; } catch { return null; }
    };
    // sanitize-html textFilter receives escaped text, while metadata attributes are decoded.
    const displayTitle = title.replace(/&(amp|lt|gt|quot);/g, (entity) =>
      ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"' }[entity] ?? entity)).trim();
    return { ...fallbackPreview(url),
      title: (meta.get('og:title') ?? meta.get('twitter:title') ?? displayTitle).slice(0, 1_000) || null,
      description: (meta.get('og:description') ?? meta.get('description') ?? meta.get('twitter:description'))?.slice(0, 2_000) ?? null,
      image: safeAsset(meta.get('og:image') ?? meta.get('twitter:image')),
      favicon: safeAsset(favicon ?? '/favicon.ico'),
    };
  };
}
