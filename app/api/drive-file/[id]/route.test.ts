// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, HEAD } from './route';
describe('legacy GET/HEAD Edge adapter', () => {
  const fetcher = vi.fn();
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubGlobal('fetch', fetcher); fetcher.mockReset();
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  const context = { params: Promise.resolve({ id: 'file_1' }) };
  const request = () => new Request('https://web.test/api/drive-file/file_1?token=old.actorless', { headers: { Range: 'bytes=1-3', Cookie: 'private-cookie', Authorization: 'Bearer unrelated' } });
  it.each([GET, HEAD])('passes old-token rejection through Edge, never to a provider', async (read) => {
    fetcher.mockResolvedValueOnce(new Response(null, { status: 401 }));
    const response = await read(request(), context);
    expect(response.status).toBe(401);
    const [url, init] = fetcher.mock.calls[0];
    expect(url.origin).toBe('https://project.supabase.co');
    expect(url.pathname).toBe('/functions/v1/legacy-file');
    expect(url.searchParams.get('ticket')).toBe('old.actorless');
    expect(init.headers.get('range')).toBe('bytes=1-3');
    expect(init.headers.has('cookie')).toBe(false);
    expect(init.headers.has('authorization')).toBe(false);
    expect(init.redirect).toBe('manual');
  });
  it('preserves Range/MIME/no-store and strips upstream cookies or redirects', async () => {
    fetcher.mockResolvedValueOnce(new Response('abc', { status: 206, headers: {
      'Content-Type': 'application/pdf', 'Content-Length': '3', 'Content-Range': 'bytes 1-3/6',
      'Set-Cookie': 'private=secret', 'Cache-Control': 'public,max-age=999', Location: 'https://attacker.test',
    } }));
    const response = await GET(request(), context);
    expect(response.status).toBe(206); expect(await response.text()).toBe('abc');
    expect(response.headers.get('content-range')).toBe('bytes 1-3/6');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.has('set-cookie')).toBe(false);
    expect(response.headers.has('location')).toBe(false);
  });
  it('never follows an Edge redirect and makes HEAD errors bodyless', async () => {
    fetcher.mockResolvedValueOnce(new Response(null, { status: 302, headers: { Location: 'https://attacker.test' } }));
    expect((await GET(request(), context)).status).toBe(502);
    fetcher.mockRejectedValueOnce(new Error('transport'));
    const head = await HEAD(request(), context);
    expect(head.status).toBe(503); expect(await head.text()).toBe('');
  });
  it('rejects missing/oversized tokens and invalid aliases without network', async () => {
    expect((await GET(new Request('https://web.test/api/file'), context)).status).toBe(401);
    expect((await GET(request(), { params: Promise.resolve({ id: '../../path' }) })).status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
