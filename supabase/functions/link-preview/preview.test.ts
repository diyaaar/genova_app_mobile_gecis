// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import sanitizeHtml from 'sanitize-html';
import { abortable, normalizePreviewUrl, isPublicAddress, resolveTarget } from './policy';
import { createPreviewParser, fetchPublicHtml, MAX_HTML_BYTES, readBoundedBody } from './preview';

const publicDns = vi.fn(async () => [{ address: '93.184.216.34', family: 4 }]);
const signal = () => new AbortController().signal;
const htmlResponse = (text: string) => new Response(text, { headers: { 'content-type': 'text/html; charset=utf-8' } });

describe('080 public destination policy', () => {
  it.each([
    'http://localhost', 'http://sub.localhost', 'https://printer.local', 'http://router.internal',
    'http://a.lan', 'http://a.arpa', 'http://a.test', 'http://a.invalid', 'http://a.example',
    'http://127.0.0.1', 'http://127.1', 'http://2130706433', 'http://0x7f000001', 'http://0177.0.0.1',
    'http://10.1.2.3', 'http://169.254.169.254', 'http://172.16.0.1', 'http://192.168.1.1',
    'http://0.0.0.0', 'http://100.64.1.1', 'http://192.0.2.1', 'http://198.18.0.1',
    'http://198.51.100.2', 'http://203.0.113.2', 'http://224.1.1.1', 'http://255.255.255.255',
    'http://[::1]', 'http://[::ffff:127.0.0.1]', 'http://[fc00::1]', 'http://[fe80::1]',
    'http://[64:ff9b::7f00:1]', 'http://[2002:7f00:1::1]', 'http://[2001:db8::1]', 'http://[3fff::1]',
    'https://user:password@www.public-site.com', 'https://www.public-site.com:8080',
    'https://www.public-site.com\\@127.0.0.1', 'https://www.public-site.com/\nsecret',
    'javascript:alert(1)', 'file:///etc/passwd', '', 'a'.repeat(2049),
  ])('refuses %s without networking', raw => expect(() => normalizePreviewUrl(raw)).toThrow());
  it.each(['www.public-site.com/path', 'https://www.public-site.com:443/path',
    'http://www.public-site.com:80', 'https://8.8.8.8', 'https://[2606:4700:4700::1111]',
    'https://www.public-site.com./path#fragment', 'https://bücher.de'])('allows public web spelling %s', raw => {
    expect(normalizePreviewUrl(raw).hash).toBe('');
  });
  it('classifies malformed and special IPv6 conservatively', () => {
    for (const ip of ['not-an-ip', '::', 'ff00::1', '2001::1', '2001:20::1']) expect(isPublicAddress(ip)).toBe(false);
    expect(isPublicAddress('2606:4700:4700::1111')).toBe(true);
  });
  it.each([
    [{ address: '93.184.216.34', family: 4 }, { address: '127.0.0.1', family: 4 }],
    [{ address: '93.184.216.34', family: 6 }], [{ address: 'invalid', family: 4 }], [],
    Array.from({ length: 17 }, () => ({ address: '8.8.8.8', family: 4 })),
  ])('rejects unsafe DNS result %#', async entries => {
    await expect(resolveTarget(normalizePreviewUrl('https://www.public-site.com'), async () => entries, signal())).rejects.toThrow();
  });
  it('pins exactly the validated address and never resolves a literal', async () => {
    const target = await resolveTarget(normalizePreviewUrl('https://www.public-site.com'), publicDns, signal());
    expect(target.address).toBe('93.184.216.34');
    const dns = vi.fn();
    expect((await resolveTarget(normalizePreviewUrl('https://8.8.8.8'), dns, signal())).address).toBe('8.8.8.8');
    expect(dns).not.toHaveBeenCalled();
  });
  it('does not start DNS on pre-aborted work, nor leave a rejected IO promise unhandled', async () => {
    const controller = new AbortController(); controller.abort(); const dns = vi.fn();
    await expect(resolveTarget(normalizePreviewUrl('https://www.public-site.com'), dns, controller.signal)).rejects.toThrow('timeout');
    expect(dns).not.toHaveBeenCalled();
    await expect(abortable(Promise.reject(new Error('already aborted IO')), controller.signal)).rejects.toThrow('timeout');
  });
});

describe('080 bounded fetching', () => {
  it('falls back for bodyless 205 responses', async () => {
    const result = await fetchPublicHtml('https://www.public-site.com', { resolve: publicDns,
      request: async () => new Response(null, { status: 205, headers: { 'content-type': 'text/html' } }),
    }, signal());
    expect(result.html).toBeNull();
  });
  it('revalidates relative redirects and passes only the vetted numeric address', async () => {
    const resolve = vi.fn().mockResolvedValueOnce([{ address: '8.8.8.8', family: 4 }])
      .mockResolvedValueOnce([{ address: '1.1.1.1', family: 4 }]);
    const request = vi.fn().mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: '/next' } }))
      .mockResolvedValueOnce(htmlResponse('<title>OK</title>'));
    const result = await fetchPublicHtml('https://www.public-site.com', { resolve, request }, signal());
    expect(result.url.pathname).toBe('/next');
    expect(request.mock.calls.map(call => call[0].address)).toEqual(['8.8.8.8', '1.1.1.1']);
  });
  it.each(['http://127.0.0.1', 'https://169.254.169.254', 'http://www.public-site.com'])('blocks forbidden redirect %s', async location => {
    const request = vi.fn(async () => new Response(null, { status: 302, headers: { location } }));
    await expect(fetchPublicHtml('https://www.public-site.com', { resolve: publicDns, request }, signal())).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('blocks a redirected DNS answer becoming private before any second connection', async () => {
    const resolve = vi.fn().mockResolvedValueOnce([{ address: '8.8.8.8', family: 4 }])
      .mockResolvedValueOnce([{ address: '10.0.0.1', family: 4 }]);
    const request = vi.fn(async () => new Response(null, { status: 302, headers: { location: '/next' } }));
    await expect(fetchPublicHtml('https://www.public-site.com', { resolve, request }, signal())).rejects.toThrow('forbidden-target');
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('stops after three followed redirects', async () => {
    const request = vi.fn(async () => new Response(null, { status: 302, headers: { location: '/next' } }));
    await expect(fetchPublicHtml('https://www.public-site.com', { resolve: publicDns, request }, signal())).rejects.toThrow('redirect-limit');
    expect(request).toHaveBeenCalledTimes(4);
  });
  it.each([{ 'content-type': 'application/pdf' }, { 'content-type': 'text/html', 'content-encoding': 'gzip' }])('cancels fallback body %#', async headers => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel });
    const result = await fetchPublicHtml('https://www.public-site.com', {
      resolve: publicDns, request: async () => new Response(body, { headers }),
    }, signal());
    expect(result.html).toBeNull(); expect(cancel).toHaveBeenCalledOnce();
  });
  it('rejects declared overflow without reading the body', async () => {
    const cancel = vi.fn();
    await expect(fetchPublicHtml('https://www.public-site.com', { resolve: publicDns,
      request: async () => new Response(new ReadableStream({ cancel }), {
        headers: { 'content-type': 'text/html', 'content-length': String(MAX_HTML_BYTES + 1) },
      }),
    }, signal())).rejects.toThrow('body-too-large');
    expect(cancel).toHaveBeenCalledOnce();
  });
  it('counts actual bytes (not UTF-16 chars) and cancels overflow', async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ start(c) {
      c.enqueue(new TextEncoder().encode('ü'.repeat(150_001)));
    }, cancel });
    await expect(readBoundedBody(stream, MAX_HTML_BYTES, signal())).rejects.toThrow('body-too-large');
    expect(cancel).toHaveBeenCalledOnce();
  });
  it('decodes split UTF-8 without corruption', async () => {
    const bytes = new TextEncoder().encode('şarkı');
    const stream = new ReadableStream<Uint8Array>({ start(c) {
      for (const byte of bytes) c.enqueue(new Uint8Array([byte])); c.close();
    } });
    expect(await readBoundedBody(stream, 20, signal())).toBe('şarkı');
  });
  it.each(['dns', 'headers', 'body'])('bounds stalled %s', async phase => {
    const never = () => new Promise<never>(() => {});
    const cancel = vi.fn();
    await expect(fetchPublicHtml('https://www.public-site.com', {
      resolve: phase === 'dns' ? never : publicDns,
      request: phase === 'headers' ? never : async () => new Response(new ReadableStream({ cancel }), { headers: { 'content-type': 'text/html' } }),
    }, signal(), 15)).rejects.toThrow('timeout');
    if (phase === 'body') expect(cancel).toHaveBeenCalledOnce();
  });
  it('redacts upstream errors', async () => {
    await expect(fetchPublicHtml('https://www.public-site.com', { resolve: publicDns,
      request: async () => { throw new Error('secret DNS internals'); },
    }, signal())).rejects.toThrow('upstream-unavailable');
  });
});

describe('080 actual HTML parser', () => {
  const parse = createPreviewParser(sanitizeHtml);
  const url = normalizePreviewUrl('https://www.public-site.com/path/page');
  it('preserves OG preference, entities and safe relative assets', () => {
    const result = parse('<title>fallback</title><meta property="og:title" content="Koro &amp; dünya">'
      + '<meta name="twitter:title" content="Twitter"><meta name="description" content="a &quot;b&quot;">'
      + '<meta property="og:image" content="../cover.png"><link rel="shortcut icon" href="/icon.png">', url);
    expect(result).toEqual({ url: url.href, title: 'Koro & dünya', description: 'a "b"',
      image: 'https://www.public-site.com/cover.png', favicon: 'https://www.public-site.com/icon.png', domain: 'public-site.com' });
  });
  it('uses Twitter and plain title fallbacks', () => {
    expect(parse('<meta name="twitter:title" content="Tweet"><meta name="twitter:image" content="/pic">', url).title).toBe('Tweet');
    expect(parse('<title>şarkı &amp; dünya &#39;x&#39;</title>', url).title).toBe("şarkı & dünya 'x'");
  });
  it('does not parse fake script/comment metadata', () => {
    expect(parse('<!-- <meta property="og:title" content="bad"> --><script>"<meta property=\"og:title\" content=\"evil\">"</script><title>OK</title>', url).title).toBe('OK');
  });
  it.each(['javascript:alert(1)', 'http://127.0.0.1/pic', 'https://user:pass@www.public-site.com/pic', 'https://www.public-site.com:8080/pic'])('refuses unsafe asset %s', asset => {
    const result = parse(`<meta property="og:image" content="${asset}"><link rel="icon" href="${asset}">`, url);
    expect(result.image).toBeNull(); expect(result.favicon).toBeNull();
  });
});
