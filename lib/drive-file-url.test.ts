import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
    },
  },
}));

import { clearProtectedDriveFileUrlCache, getProtectedDriveFileUrl, getOnlineAuthorizedPrivateFileUrl } from '@/lib/drive-file-url';

const file = {
  drive_file_id: 'drive-file-1',
  file_name: 'partisyon.pdf',
  mime_type: 'application/pdf',
};

function session(userId: string, token: string) {
  return { data: { session: { access_token: token, user: { id: userId } } } };
}

describe('protected Drive URL cache', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    clearProtectedDriveFileUrlCache();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      url: '/api/drive-file/drive-file-1?token=fresh',
      expiresAt: Date.now() + 60_000,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })));
  });

  it('does not return a previous user’s cached signed URL', async () => {
    mocks.getSession.mockResolvedValueOnce(session('user-a', 'token-a')).mockResolvedValueOnce(session('user-b', 'token-b'));

    const first = await getProtectedDriveFileUrl(file);
    const second = await getProtectedDriveFileUrl(file);

    expect(first).toBe('/api/drive-file/drive-file-1?token=fresh');
    expect(second).toBe('/api/drive-file/drive-file-1?token=fresh');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe('Bearer token-a');
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('Authorization')).toBe('Bearer token-b');
  });

  it('checks for a current session before consulting the cache', async () => {
    mocks.getSession.mockResolvedValueOnce(session('user-a', 'token-a')).mockResolvedValueOnce({ data: { session: null } });

    await getProtectedDriveFileUrl(file);

    await expect(getProtectedDriveFileUrl(file)).rejects.toThrow('Oturum bulunamadı');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('can purge every cached signed URL on auth changes', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    await getProtectedDriveFileUrl(file);
    clearProtectedDriveFileUrlCache();
    await getProtectedDriveFileUrl(file);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
it('coalesces same-session same-file issuance without bypassing the session check', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'session-a'));
    let finish!: (response: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const first = getProtectedDriveFileUrl(file);
    const second = getProtectedDriveFileUrl(file);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(mocks.getSession).toHaveBeenCalledTimes(2);
    finish(Response.json({ url: 'coalesced', expiresAt: Date.now() + 60_000 }));
    expect(await Promise.all([first, second])).toEqual(['coalesced', 'coalesced']);
  });

it('renews a 401 URL without cancelling another file in flight', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'session-a'));
    await getProtectedDriveFileUrl(file);
    let finish!: (response: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const other = getProtectedDriveFileUrl({ ...file, drive_file_id: 'drive-file-other' });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const probe = vi.fn().mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    await getOnlineAuthorizedPrivateFileUrl(() => getProtectedDriveFileUrl(file), probe);
    finish(Response.json({ url: 'other-file', expiresAt: Date.now() + 60_000 }));
    await expect(other).resolves.toBe('other-file');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(probe).toHaveBeenCalledTimes(2);
  });
});
