import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  browserSupabase: {
    auth: {
      getSession: mocks.getSession,
    },
  },
  getEmbeddedLeaseSnapshot: () => ({ mode: 'browser', phase: 'browser' }),
  notifyEmbeddedUnauthorized: vi.fn(),
  requireEmbeddedAccess: vi.fn(),
}));

import {
  clearProtectedDriveFileUrlCache,
  getProtectedAssignmentFileUrl,
  getProtectedAssignmentReviewFileUrl,
  getProtectedChatMediaFileUrl,
  getProtectedDriveFileUrl,
  getOnlineAuthorizedPrivateFileUrl,
  getProtectedRepertoireCommentFileUrl,
  getProtectedRepertoireFileUrl,
} from '@/lib/drive-file-url';

const file = {
  id: '11111111-1111-4111-8111-111111111111',
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
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
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

  afterEach(() => vi.unstubAllEnvs());

  it('does not return a previous user’s cached signed URL', async () => {
    mocks.getSession.mockResolvedValueOnce(session('user-a', 'token-a')).mockResolvedValueOnce(session('user-b', 'token-b'));

    const first = await getProtectedDriveFileUrl(file);
    const second = await getProtectedDriveFileUrl(file);

    expect(first).toBe('/api/drive-file/drive-file-1?token=fresh');
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls[0]?.[1]?.headers as Headers).get('Authorization')).toBe('Bearer token-a');
    expect((fetchMock.mock.calls[1]?.[1]?.headers as Headers).get('Authorization')).toBe('Bearer token-b');
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({
      driveFileId: file.drive_file_id,
      fileName: file.file_name,
      mimeType: file.mime_type,
    }));
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

  it('does not reuse a same-user ticket after the bearer/session changes', async () => {
    mocks.getSession.mockResolvedValueOnce(session('user-a', 'session-a'))
      .mockResolvedValueOnce(session('user-a', 'session-b'));
    await getProtectedDriveFileUrl(file);
    await getProtectedDriveFileUrl(file);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers.get('Authorization')).toBe('Bearer session-b');
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

  it('invalidates an older in-flight result when a same-user new session is observed', async () => {
    mocks.getSession.mockResolvedValueOnce(session('user-a', 'session-a'))
      .mockResolvedValueOnce(session('user-a', 'session-b'));
    let finish!: (response: Response) => void;
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const first = getProtectedDriveFileUrl(file);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await getProtectedDriveFileUrl(file);
    finish(Response.json({ url: 'old-session-a', expiresAt: Date.now() + 60_000 }));
    await expect(first).rejects.toThrow('Koro oturumu değişti');
  });

  it('rejects a stale session lookup that completes after the new session lookup', async () => {
    let finish!: (value: ReturnType<typeof session>) => void;
    mocks.getSession.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }))
      .mockResolvedValueOnce(session('user-a', 'session-b'));
    const old = getProtectedDriveFileUrl(file);
    await getProtectedDriveFileUrl(file);
    finish(session('user-a', 'session-a'));
    await expect(old).rejects.toThrow('Koro oturumu değişti');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer session-b');
  });

  it('preserves a legacy POST 403 as a non-retriable typed denial', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'session-a'));
    fetchMock.mockResolvedValueOnce(new Response('denied', { status: 403 }));
    await expect(getOnlineAuthorizedPrivateFileUrl(() => getProtectedDriveFileUrl(file)))
      .rejects.toMatchObject({ status: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('checks a cached private URL online and renews exactly once after legacy 401', async () => {
    const load = vi.fn().mockResolvedValueOnce('https://example.test/old-v1')
      .mockResolvedValueOnce('https://example.test/new-v2');
    const probe = vi.fn().mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    expect(await getOnlineAuthorizedPrivateFileUrl(load, probe)).toBe('https://example.test/new-v2');
    expect(load).toHaveBeenCalledTimes(2);
    expect(probe).toHaveBeenCalledWith('https://example.test/old-v1', { method: 'HEAD', cache: 'no-store' });
  });

  it('fails closed on 403 and never reuses a denied private URL', async () => {
    const load = vi.fn().mockResolvedValue('https://example.test/revoked');
    const probe = vi.fn().mockResolvedValue(new Response(null, { status: 403 }));
    await expect(getOnlineAuthorizedPrivateFileUrl(load, probe)).rejects.toMatchObject({ status: 403 });
    expect(load).toHaveBeenCalledTimes(1);
    expect(probe).toHaveBeenCalledTimes(1);
  });

  it('retries an opaque transport failure once but does not retry abort', async () => {
    const load = vi.fn().mockResolvedValue('https://example.test/file');
    const probe = vi.fn().mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    expect(await getOnlineAuthorizedPrivateFileUrl(load, probe)).toBe('https://example.test/file');
    expect(load).toHaveBeenCalledTimes(2);

    const aborted = vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    await expect(getOnlineAuthorizedPrivateFileUrl(load, aborted)).rejects.toMatchObject({ name: 'AbortError' });
    expect(aborted).toHaveBeenCalledTimes(1);
  });

  it('refreshes a ticket inside the thirty-second expiry margin', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    fetchMock.mockImplementation(() => Promise.resolve(Response.json({
      url: 'https://project.supabase.co/functions/v1/repertoire-file?fileId=11111111-1111-4111-8111-111111111111&ticket=short',
      expiresAt: Date.now() + 20_000,
    })));

    await getProtectedRepertoireFileUrl(file);
    await getProtectedRepertoireFileUrl(file);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL(
      'https://project.supabase.co/functions/v1/repertoire-file',
    ));
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ fileId: file.id }));
  });

  it('keeps Edge repertoire tickets user-scoped and checks the session before cache use', async () => {
    fetchMock.mockImplementation((_input, init) => Promise.resolve(Response.json({
      url: `https://project.supabase.co/functions/v1/repertoire-file?fileId=${file.id}&ticket=${(init?.headers as Headers).get('Authorization')?.slice(-1)}`,
      expiresAt: Date.now() + 60_000,
    })));
    mocks.getSession
      .mockResolvedValueOnce(session('user-a', 'token-a'))
      .mockResolvedValueOnce(session('user-b', 'token-b'))
      .mockResolvedValueOnce({ data: { session: null } });

    const first = await getProtectedRepertoireFileUrl(file);
    const second = await getProtectedRepertoireFileUrl(file);
    await expect(getProtectedRepertoireFileUrl(file)).rejects.toThrow('Oturum bulunamadı');

    expect(first).toContain('ticket=a');
    expect(second).toContain('ticket=b');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects an in-flight repertoire ticket that resolves after tenant cache clear', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    let releaseFirst!: (response: Response) => void;
    fetchMock
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { releaseFirst = resolve; }))
      .mockImplementation(() => Promise.resolve(Response.json({
        url: `https://project.supabase.co/functions/v1/repertoire-file?fileId=${file.id}&ticket=fresh`,
        expiresAt: Date.now() + 60_000,
      })));

    const pending = getProtectedRepertoireFileUrl(file);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    clearProtectedDriveFileUrlCache();
    releaseFirst(Response.json({
      url: `https://project.supabase.co/functions/v1/repertoire-file?fileId=${file.id}&ticket=old-a`,
      expiresAt: Date.now() + 60_000,
    }));

    await expect(pending).rejects.toThrow('Koro oturumu değişti');
    expect(await getProtectedRepertoireFileUrl(file)).toContain('ticket=fresh');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['legacy', () => getProtectedDriveFileUrl(file), '/api/drive-file/drive-file-1?token='],
    ['assignment', () => getProtectedAssignmentFileUrl(file.id, file),
      `https://project.supabase.co/functions/v1/assignment-file?fileId=${file.id}&ticket=`],
    ['assignment review', () => getProtectedAssignmentReviewFileUrl(file.id, file),
      `https://project.supabase.co/functions/v1/assignment-review-file?fileId=${file.id}&ticket=`],
    ['repertoire comment', () => getProtectedRepertoireCommentFileUrl(file.id, file),
      `https://project.supabase.co/functions/v1/repertoire-comment-file?fileId=${file.id}&ticket=`],
    ['chat media', () => getProtectedChatMediaFileUrl(file.id, file),
      `https://project.supabase.co/functions/v1/chat-media-file?fileId=${file.id}&ticket=`],
  ] as const)('rejects a late %s ticket after tenant cache clear', async (_family, load, prefix) => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    let releaseFirst!: (response: Response) => void;
    fetchMock
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { releaseFirst = resolve; }))
      .mockImplementation(() => Promise.resolve(Response.json({
        url: `${prefix}fresh`, expiresAt: Date.now() + 60_000,
      })));

    const pending = load();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    clearProtectedDriveFileUrlCache();
    releaseFirst(Response.json({ url: `${prefix}old-a`, expiresAt: Date.now() + 60_000 }));

    await expect(pending).rejects.toThrow('Koro oturumu değişti');
    expect(await load()).toBe(`${prefix}fresh`);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('invalidates a ticket request still waiting for the session when the tenant clears', async () => {
    let releaseSession!: (value: ReturnType<typeof session>) => void;
    mocks.getSession.mockImplementationOnce(() => new Promise((resolve) => { releaseSession = resolve; }));

    const pending = getProtectedRepertoireFileUrl(file);
    clearProtectedDriveFileUrlCache();
    releaseSession(session('user-a', 'token-a'));

    await expect(pending).rejects.toThrow('Koro oturumu değişti');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests an assignment version ticket from the assignment-only Edge boundary', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    const versionId = '22222222-2222-4222-8222-222222222222';
    fetchMock.mockImplementation(() => Promise.resolve(Response.json({
      url: `https://project.supabase.co/functions/v1/assignment-file?fileId=${versionId}&ticket=private`,
      expiresAt: Date.now() + 60_000,
    })));

    const url = await getProtectedAssignmentFileUrl(versionId, file);

    expect(url).toContain('/functions/v1/assignment-file?');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL(
      'https://project.supabase.co/functions/v1/assignment-file',
    ));
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ fileId: versionId }));
  });

  it('requests a review version ticket from the review-only Edge boundary', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    const versionId = '33333333-3333-4333-8333-333333333333';
    fetchMock.mockImplementation(() => Promise.resolve(Response.json({
      url: `https://project.supabase.co/functions/v1/assignment-review-file?fileId=${versionId}&ticket=private`,
      expiresAt: Date.now() + 60_000,
    })));

    const url = await getProtectedAssignmentReviewFileUrl(versionId, file);

    expect(url).toContain('/functions/v1/assignment-review-file?');
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL(
      'https://project.supabase.co/functions/v1/assignment-review-file',
    ));
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ fileId: versionId }));
  });

  it('requests a comment version ticket from the comment-only Edge boundary', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    const versionId = '44444444-4444-4444-8444-444444444444';
    fetchMock.mockImplementation(() => Promise.resolve(Response.json({
      url: `https://project.supabase.co/functions/v1/repertoire-comment-file?fileId=${versionId}&ticket=private`,
      expiresAt: Date.now() + 60_000,
    })));

    const url = await getProtectedRepertoireCommentFileUrl(versionId, file);

    expect(url).toContain('/functions/v1/repertoire-comment-file?');
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL(
      'https://project.supabase.co/functions/v1/repertoire-comment-file',
    ));
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ fileId: versionId }));
  });

  it('requests a chat media ticket from the room-authorized Edge boundary', async () => {
    mocks.getSession.mockResolvedValue(session('user-a', 'token-a'));
    const versionId = '55555555-5555-4555-8555-555555555555';
    fetchMock.mockImplementation(() => Promise.resolve(Response.json({
      url: `https://project.supabase.co/functions/v1/chat-media-file?fileId=${versionId}&ticket=private`,
      expiresAt: Date.now() + 60_000,
    })));

    const url = await getProtectedChatMediaFileUrl(versionId, file);

    expect(url).toContain('/functions/v1/chat-media-file?');
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(new URL(
      'https://project.supabase.co/functions/v1/chat-media-file',
    ));
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ fileId: versionId }));
  });
});
