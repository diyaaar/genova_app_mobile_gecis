// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ token: 'session-a' }));
vi.mock('@/lib/supabase', () => ({
  browserSupabase: { auth: { getSession: async () => ({ data: { session: {
    access_token: auth.token, user: { id: '11111111-1111-4111-8111-111111111111' },
  } } }) } },
  getEmbeddedLeaseSnapshot: () => ({ mode: 'browser' }), notifyEmbeddedUnauthorized: vi.fn(), requireEmbeddedAccess: vi.fn(),
}));
import { issueLegacyFileUrl, readLegacyFile } from '@/lib/server/legacy-file-adapter';
import { createDriveFileToken } from '@/lib/server/drive-file-token';
import { createLegacyFileHandler, type LegacyFileRecord } from '@/supabase/functions/legacy-file/handler';
import { createLegacyTicket, verifyLegacyTicket } from '@/supabase/functions/legacy-file/ticket';
import { clearProtectedDriveFileUrlCache, getOnlineAuthorizedPrivateFileUrl, getProtectedDriveFileUrl } from '@/lib/drive-file-url';

const identity = { actorId: '11111111-1111-4111-8111-111111111111',
  sessionId: '22222222-2222-4222-8222-222222222222', choirId: '33333333-3333-4333-8333-333333333333' };
const initial: LegacyFileRecord = { ...identity, kind: 'repertoire',
  resourceId: '44444444-4444-4444-8444-444444444444', alias: 'file_1', fileName: 'score.pdf',
  mimeType: 'application/pdf', sourceLink: null };
const file = { drive_file_id: 'file_1', file_name: 'score.pdf', mime_type: 'application/pdf' };
const secret = 'synthetic-legacy-integration-secret';

describe('actual client → Next adapter → Edge handler composition (synthetic Auth/SQL/provider)', () => {
  let current: LegacyFileRecord | null;
  const provider = vi.fn();
  const posts = vi.fn();
  beforeEach(() => {
    current = { ...initial }; auth.token = 'session-a'; clearProtectedDriveFileUrlCache();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://project.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', secret);
    provider.mockReset().mockImplementation(async () => new Response('abcdef', { headers: { 'Content-Type': 'application/pdf' } }));
    posts.mockReset();
    const handler = createLegacyFileHandler({
      authenticate: async () => identity, resolve: async () => current,
      createTicket: (input) => createLegacyTicket(input, secret),
      verifyTicket: (token) => verifyLegacyTicket(token, secret), fetchDrive: provider, fetchStorage: provider,
    });
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(new URL(String(input), 'https://web.test'), { ...init, duplex: 'half' } as RequestInit);
      const url = new URL(request.url);
      if (url.origin === 'https://project.supabase.co' && url.pathname === '/functions/v1/legacy-file') return handler(request);
      if (url.origin === 'https://web.test' && url.pathname === '/api/drive-file-token') {
        posts(); return issueLegacyFileUrl(request);
      }
      if (url.origin === 'https://web.test' && url.pathname === '/api/drive-file/file_1') {
        return readLegacyFile(request, 'file_1', request.method === 'HEAD' ? 'HEAD' : 'GET');
      }
      throw new Error('Unexpected network destination');
    });
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('rejects an actual valid actorless token from the old signing module on GET and HEAD, provider zero', async () => {
    const old = createDriveFileToken({ driveFileId: 'file_1', fileName: 'score.pdf', mimeType: 'application/pdf', kind: 'repertoire' });
    for (const method of ['GET', 'HEAD'] as const) {
      const response = await readLegacyFile(new Request(`https://web.test/api/drive-file/file_1?token=${old.token}`), 'file_1', method);
      expect(response.status).toBe(401);
    }
    expect(provider).not.toHaveBeenCalled();
  });
  it('preserves old POST shape, relative URL, PDF/Range and revocation with no provider retry', async () => {
    const url = await getOnlineAuthorizedPrivateFileUrl(() => getProtectedDriveFileUrl(file));
    expect(url).toMatch(/^\/api\/drive-file\/file_1\?token=/u);
    const get = await fetch(url!, { headers: { Range: 'bytes=1-3' } });
    expect(get.status).toBe(206); expect(await get.text()).toBe('bcd');
    expect(provider).toHaveBeenCalledTimes(2); expect(posts).toHaveBeenCalledTimes(1);
    current = null;
    await expect(getOnlineAuthorizedPrivateFileUrl(() => getProtectedDriveFileUrl(file))).rejects.toMatchObject({ status: 403 });
    expect(provider).toHaveBeenCalledTimes(2); expect(posts).toHaveBeenCalledTimes(1);
  });
  it('renews an expired cached URL once using the real adapter/handler, then stops on denial', async () => {
    const first = await getProtectedDriveFileUrl(file);
    const deniedToken = createDriveFileToken({ driveFileId: 'file_1', kind: 'repertoire', fileName: 'score.pdf', mimeType: 'application/pdf' }).token;
    let attempts = 0;
    const url = await getOnlineAuthorizedPrivateFileUrl(async () => {
      attempts++;
      return attempts === 1 ? `/api/drive-file/file_1?token=${deniedToken}` : getProtectedDriveFileUrl(file);
    });
    expect(attempts).toBe(2); expect(posts).toHaveBeenCalledTimes(2);
    expect(url).not.toBeNull(); expect(first).toContain('/api/drive-file/');
    expect(provider).toHaveBeenCalledTimes(1);
  });
});
