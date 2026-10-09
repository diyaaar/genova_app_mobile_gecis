import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Only the Auth/lease and network boundaries are synthetic. The hook, ticket
// helper, authenticated fetch, cache generations and embedded signal are real.
const mocks = vi.hoisted(() => ({
  mode: 'browser', phase: 'active', token: 'synthetic-session-a',
  getSession: vi.fn(), requireAccess: vi.fn(), fetch: vi.fn(),
  cacheRuntime: vi.fn(), cacheStatus: vi.fn(), clearBytes: vi.fn(),
}));
vi.mock('@/lib/supabase', () => ({
  browserSupabase: { auth: { getSession: mocks.getSession } },
  getEmbeddedLeaseSnapshot: () => ({ mode: mocks.mode, phase: mocks.phase }),
  requireEmbeddedAccess: mocks.requireAccess,
  notifyEmbeddedUnauthorized: vi.fn(),
}));
vi.mock('@/lib/repertuvar/offline', () => ({
  buildRuntimeDriveFileVersion: () => 'synthetic-v1',
  getOfflineDriveFileUrl: () => '/synthetic-offline.pdf',
  // Deliberately permissive: the hook must not rely on an incidental cache guard.
  isRepertoireRuntimeCacheSupported: () => true,
  getRuntimeDriveFileCacheStatus: mocks.cacheStatus,
  cacheRuntimeDriveFile: mocks.cacheRuntime,
  clearProtectedDriveFileCaches: mocks.clearBytes,
}));

const file = { id: '11111111-1111-4111-8111-111111111111',
  drive_file_id: 'synthetic-drive', file_name: 'synthetic.pdf', mime_type: 'application/pdf' };
const ticketUrl = `https://synthetic.invalid/functions/v1/repertoire-file?fileId=${file.id}&ticket=synthetic-private-capability`;
type Hook = typeof import('./useProtectedDriveFileUrl').useProtectedDriveFileUrl;
let useHook: Hook;
let clearTickets: () => void;
let activateEmbedded: () => void;
const reads = () => mocks.fetch.mock.calls.filter(([, init]) => ['GET', 'HEAD'].includes(init?.method ?? 'GET'));
const reply = (url = ticketUrl, fileId = file.id) => Response.json({
  url: url.replace(file.id, fileId), expiresAt: Date.now() + 60_000,
});

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://synthetic.invalid');
  vi.stubGlobal('fetch', mocks.fetch);
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  mocks.mode = 'browser'; mocks.phase = 'active'; mocks.token = 'synthetic-session-a';
  mocks.getSession.mockImplementation(async () => ({ data: { session: {
    access_token: mocks.token, user: { id: 'synthetic-user' },
  } } }));
  mocks.requireAccess.mockImplementation(() => {
    if (mocks.phase !== 'active') throw new Error('embedded-lease-unavailable');
    return { accessToken: mocks.token, userId: 'synthetic-user' };
  });
  mocks.fetch.mockImplementation(async (_input, init) => init?.method === 'POST'
    ? reply(ticketUrl, JSON.parse(init.body).fileId) : new Response(null, { status: 200 }));
  mocks.cacheRuntime.mockResolvedValue({ cached: true, stale: false });
  mocks.cacheStatus.mockResolvedValue({ cached: true, stale: false });
  mocks.clearBytes.mockResolvedValue({ removedCount: 1 });
  ({ useProtectedDriveFileUrl: useHook } = await import('./useProtectedDriveFileUrl'));
  ({ clearProtectedDriveFileUrlCache: clearTickets } = await import('@/lib/drive-file-url'));
  ({ activateEmbeddedRuntime: activateEmbedded } = await import('@/lib/embedded-web-runtime'));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('real protected-file hook → ticket helper → fetch', () => {
  it('preserves a normal browser HEAD decision before background caching', async () => {
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.url).toBe(ticketUrl));
    expect(mocks.fetch.mock.calls.map(([, init]) => init.method)).toEqual(['POST', 'HEAD']);
    expect(mocks.cacheRuntime).toHaveBeenCalledTimes(1);
  });

  it('renews one browser 401 with a new ticket and another HEAD', async () => {
    let heads = 0;
    mocks.fetch.mockImplementation(async (_input, init) => init.method === 'POST'
      ? reply() : new Response(null, { status: ++heads === 1 ? 401 : 200 }));
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.url).toBe(ticketUrl));
    expect(mocks.fetch.mock.calls.map(([, init]) => init.method)).toEqual(['POST', 'HEAD', 'POST', 'HEAD']);
  });

  it('accepts a fresh browser resolution when the issuer rotates a same-user session', async () => {
    const first = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(first.result.current.url).toBe(ticketUrl));
    first.unmount();
    mocks.token = 'synthetic-session-b';
    const second = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(second.result.current.url).toBe(ticketUrl));
    expect(reads()).toHaveLength(2);
    expect(mocks.fetch.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer synthetic-session-b');
  });

  it.each([401, 403])('refuses terminal browser %s without offline fallback', async (status) => {
    mocks.fetch.mockImplementation(async (_input, init) => init.method === 'POST' ? reply() : new Response(null, { status }));
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.url).toBeNull();
    expect(reads()).toHaveLength(status === 403 ? 1 : 2);
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
    expect(mocks.cacheStatus).not.toHaveBeenCalled();
    expect(mocks.clearBytes).toHaveBeenCalled();
  });

  it('embedded active issuance is authorized, but performs no read or cache', async () => {
    activateEmbedded(); mocks.mode = 'embedded';
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.url).toBe(ticketUrl));
    expect(mocks.requireAccess).toHaveBeenCalled();
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.fetch.mock.calls).toHaveLength(1);
    expect(mocks.fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer synthetic-session-a');
    expect(reads()).toHaveLength(0);
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
  });

  it.each([
    ['legacy', {}], ['assignment', { assignmentFileVersionId: file.id }],
    ['review', { assignmentReviewFileVersionId: file.id }],
    ['comment', { repertoireCommentFileVersionId: file.id }],
  ])('embedded %s issuance also defers all byte access', async (_name, options) => {
    activateEmbedded(); mocks.mode = 'embedded';
    mocks.fetch.mockImplementation(async (input, init) => {
      const endpoint = new URL(String(input), 'https://synthetic.invalid');
      const url = endpoint.pathname === '/api/drive-file-token' ? ticketUrl
        : `${endpoint.origin}${endpoint.pathname}?fileId=${JSON.parse(init.body).fileId}&ticket=synthetic-private-capability`;
      return reply(url);
    });
    const { result } = renderHook(() => useHook(file, options));
    await waitFor(() => expect(result.current.url).not.toBeNull());
    expect(reads()).toHaveLength(0);
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
    expect(mocks.requireAccess).toHaveBeenCalled();
  });

  it.each(['locked', 'expired'])('embedded %s lease cannot issue or read', async (phase) => {
    activateEmbedded(); mocks.mode = 'embedded'; mocks.phase = phase;
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.error).toBe('embedded-lease-unavailable'));
    expect(result.current.url).toBeNull();
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
  });

  it('embedded offline rendering never selects a browser local copy', async () => {
    activateEmbedded(); mocks.mode = 'embedded';
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.url).toBeNull();
    expect(mocks.cacheStatus).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('embedded reconnect issues only a ticket, without a pre-consent probe/cache', async () => {
    activateEmbedded(); mocks.mode = 'embedded';
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(result.current.url).toBe(ticketUrl));
    expect(reads()).toHaveLength(0);
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
  });

  it('drops a late embedded ticket after choir/logout invalidation', async () => {
    activateEmbedded(); mocks.mode = 'embedded';
    let finish!: (response: Response) => void;
    mocks.fetch.mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
    clearTickets();
    await act(async () => finish(reply()));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.url).toBeNull();
    expect(reads()).toHaveLength(0);
  });

  it('does not publish a browser HEAD response after choir/logout invalidation', async () => {
    let finish!: (response: Response) => void;
    mocks.fetch.mockImplementation(async (_input, init) => init.method === 'POST'
      ? reply() : new Promise<Response>(resolve => { finish = resolve; }));
    const { result } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(reads()).toHaveLength(1));
    clearTickets();
    await act(async () => finish(new Response(null, { status: 200 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.url).toBeNull();
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
  });

  it('ignores a previous embedded file completion', async () => {
    activateEmbedded(); mocks.mode = 'embedded';
    let finish!: (response: Response) => void;
    mocks.fetch.mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
    const { result, rerender } = renderHook(({ descriptor }) => useHook(descriptor, { repertoireFile: true }), {
      initialProps: { descriptor: file },
    });
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
    rerender({ descriptor: { ...file, id: '22222222-2222-4222-8222-222222222222' } });
    await waitFor(() => expect(result.current.url).toBe(ticketUrl.replace(file.id, '22222222-2222-4222-8222-222222222222')));
    await act(async () => finish(reply()));
    expect(result.current.url).toBe(ticketUrl.replace(file.id, '22222222-2222-4222-8222-222222222222'));
    expect(reads()).toHaveLength(0);
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
  });

  it('unmount during embedded issuance cannot start reading or caching', async () => {
    activateEmbedded(); mocks.mode = 'embedded';
    let finish!: (response: Response) => void;
    mocks.fetch.mockImplementationOnce(() => new Promise<Response>(resolve => { finish = resolve; }));
    const { unmount } = renderHook(() => useHook(file, { repertoireFile: true }));
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
    unmount();
    await act(async () => finish(reply()));
    expect(reads()).toHaveLength(0);
    expect(mocks.cacheRuntime).not.toHaveBeenCalled();
  });
});
