// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
describe('legacy POST fixed-origin adapter', () => {
  const fetcher = vi.fn();
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubGlobal('fetch', fetcher);
    fetcher.mockReset();
    fetcher.mockResolvedValue(Response.json({ url: 'https://project.supabase.co/functions/v1/legacy-file?alias=file_1&ticket=body.signature', expiresAt: Date.now() + 60_000 }));
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  function request(auth = true) {
    return new Request('https://web.test/api/drive-file-token', { method: 'POST',
      headers: auth ? { Authorization: 'Bearer user-token' } : {},
      body: JSON.stringify({ driveFileId: 'file_1', fileName: 'caller.pdf', mimeType: 'application/pdf' }) });
  }
  it('requires bearer before contacting Edge', async () => {
    expect((await POST(request(false))).status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('preserves old response and request shape, without creating Next tokens', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: '/api/drive-file/file_1?token=body.signature', expiresAt: expect.any(Number) });
    expect(fetcher.mock.calls[0][0].toString()).toBe('https://project.supabase.co/functions/v1/legacy-file');
    const init = fetcher.mock.calls[0][1];
    expect(init.headers.get('Authorization')).toBe('Bearer user-token');
    expect(await new Response(init.body).json()).toEqual({ driveFileId: 'file_1', fileName: 'caller.pdf', mimeType: 'application/pdf' });
    expect(init.redirect).toBe('manual');
    expect(init.cache).toBe('no-store');
  });
  it.each([400, 401, 403, 415, 503])('preserves Edge refusal %s with no retry', async (status) => {
    fetcher.mockResolvedValueOnce(new Response(null, { status }));
    expect((await POST(request())).status).toBe(status);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it.each(['https://attacker.test/functions/v1/legacy-file?alias=file_1&ticket=a.b', 'https://project.supabase.co/storage/v1/object?alias=file_1&ticket=a.b'])('rejects foreign or different endpoint responses', async (url) => {
    fetcher.mockResolvedValueOnce(Response.json({ url, expiresAt: Date.now() + 60_000 }));
    expect((await POST(request())).status).toBe(502);
  });
  it('fails closed when configured origin is missing/insecure or Edge fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://attacker.test');
    expect((await POST(request())).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    fetcher.mockRejectedValueOnce(new Error('transport'));
    expect((await POST(request())).status).toBe(503);
  });
});
