// Actual Next handler + supabase-js, simulated HTTP/Auth/push. Real SQL is separate.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), push: vi.fn() }));
vi.mock('@/lib/server/supabase-auth', async original => ({
  ...await original<typeof import('@/lib/server/supabase-auth')>(), requireAuthenticatedUser: mocks.auth,
}));
vi.mock('@/lib/server/push-notifications', () => ({ sendProfileDecisionPush: mocks.push }));
import { POST } from './route';
const id = 'b8800000-0000-4000-8000-000000000007', foreign = 'a8800000-0000-4000-8000-000000000007';
const memberId = 'b8700000-0000-4000-8000-000000000002', reviewedBy = 'b8800000-0000-4000-8000-000000000010';
const origin = 'https://fixture-088.invalid';
const success = { id, memberId, reviewedBy, status: 'approved', rejectReason: null,
  reviewedAt: '2026-09-29T01:01:00Z', reviewerName: 'Chef B' };
let captures: Request[], backend: unknown, httpStatus: number;
function request(body: unknown = { requestId: id, action: 'approve' }) {
  return new Request('http://localhost/api/profile-change-requests/review', { method: 'POST',
    headers: { authorization: 'Bearer verified-088', 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
describe('088 caller-JWT atomic profile review transport', () => {
  beforeEach(() => {
    captures = []; backend = { ...success }; httpStatus = 200;
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', origin); vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '088-anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '088-service-must-never-be-used');
    mocks.auth.mockResolvedValue({ user: { id: 'verified-user' }, accessToken: 'verified-088' });
    mocks.push.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn<typeof fetch>(async (input, init) => {
      const req = input instanceof Request ? input : new Request(input, init);
      expect(new URL(req.url).origin).toBe(origin); captures.push(req);
      expect(mocks.push).not.toHaveBeenCalled();
      return new Response(JSON.stringify(backend), { status: httpStatus, headers: { 'content-type': 'application/json' } });
    }));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
  it('own B object: exactly one caller-JWT RPC, ignores forged authority and returns old UI contract', async () => {
    const result = await POST(request({ requestId: id, action: 'approve', memberId: 'forged', reviewerId: 'forged', choirId: 'forged' }));
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ id, status: 'approved', rejectReason: null, reviewedAt: success.reviewedAt, reviewedBy });
    expect(captures).toHaveLength(1);
    expect(new URL(captures[0].url).pathname).toBe('/rest/v1/rpc/review_profile_change_request');
    expect(captures[0].headers.get('authorization')).toBe('Bearer verified-088');
    expect(await captures[0].json()).toEqual({ p_request_id: id, p_action: 'approve', p_reject_reason: null });
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith({ memberId, status: 'approved', rejectReason: null, reviewerName: 'Chef B' });
  });
  it('old A request under B selection: RPC 404, no service table access or push', async () => {
    backend = { code: 'PT404', message: 'foreign' }; httpStatus = 400;
    expect((await POST(request({ requestId: foreign, action: 'approve' }))).status).toBe(404);
    expect(await captures[0].json()).toEqual({ p_request_id: foreign, p_action: 'approve', p_reject_reason: null });
    expect(captures).toHaveLength(1); expect(mocks.push).not.toHaveBeenCalled();
  });
  it('canonicalizes uppercase UUID before matching committed response', async () => {
    expect((await POST(request({ requestId: ` ${id.toUpperCase()} `, action: 'approve' }))).status).toBe(200);
    expect((await captures[0].json()).p_request_id).toBe(id);
    expect(mocks.push).toHaveBeenCalledTimes(1);
  });
  it('reject preserves trimmed reason, committed target and response', async () => {
    backend = { ...success, status: 'rejected', rejectReason: 'reason' };
    const result = await POST(request({ requestId: id, action: 'reject', rejectReason: ' reason ' }));
    expect(result.status).toBe(200); expect((await result.json()).rejectReason).toBe('reason');
    expect(await captures[0].json()).toEqual({ p_request_id: id, p_action: 'reject', p_reject_reason: 'reason' });
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith({ memberId, status: 'rejected', rejectReason: 'reason', reviewerName: 'Chef B' });
  });
  it('postcommit push failure does not turn committed decision into failed mutation', async () => {
    mocks.push.mockRejectedValue(new Error('private provider diagnostic'));
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await POST(request())).status).toBe(200); expect(captures).toHaveLength(1);
    expect(logged).toHaveBeenCalledExactlyOnceWith('Profile review push send failed after committed decision.');
  });
  it.each([['28000',401],['42501',403],['PT404',404],['PT409',409],['40001',409],['40P01',409],
    ['22023',400],['22P02',400],['22007',400],['22008',400],['23503',400],['23514',400],
    ['42883',503],['PGRST202',503],['XX000',500]] as const)(
    '%s => %s (role/membership/context/object/database failures), no privileged fallback or push', async (code, status) => {
      backend = { code, message: 'private backend diagnostic' }; httpStatus = 400;
      const result = await POST(request()); expect(result.status).toBe(status);
      expect(await result.text()).not.toContain('private backend diagnostic');
      expect(captures).toHaveLength(1); expect(captures[0].headers.get('authorization')).toBe('Bearer verified-088');
      expect(mocks.push).not.toHaveBeenCalled();
    });
  it.each([null,{}, { ...success, id: foreign }, { ...success, status: 'rejected' },
    { ...success, memberId: 'bad' }, { ...success, reviewedBy: null }, { ...success, reviewedAt: 'bad' },
    { ...success, reviewerName: 42 }, { ...success, rejectReason: {} }])('rejects malformed backend %j before push', async value => {
      backend = value; expect((await POST(request())).status).toBe(502); expect(mocks.push).not.toHaveBeenCalled();
    });
  it.each([null,[],{}, { requestId: 42, action: 'approve' }, { requestId: id, action: 'bad' },
    { requestId: id, action: 'reject', rejectReason: 42 }, { requestId: id, action: 'reject', rejectReason: 'x'.repeat(1201) },
    { requestId: id, action: 'reject', rejectReason: '😀'.repeat(601) }])('invalid body rejected before RPC %j', async value => {
      expect((await POST(request(value))).status).toBe(400); expect(captures).toHaveLength(0); expect(mocks.push).not.toHaveBeenCalled();
    });
  it('invalid JSON is 400, failed Auth is 401, transport failure is generic 500 without push', async () => {
    expect((await POST(new Request('http://localhost', { method: 'POST', body: '{' }))).status).toBe(400);
    expect(captures).toHaveLength(0);
    mocks.auth.mockRejectedValueOnce(new Error('Unauthorized'));
    expect((await POST(request())).status).toBe(401); expect(captures).toHaveLength(0);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network detail')));
    const result = await POST(request()); expect(result.status).toBe(500); expect(await result.text()).not.toContain('network detail');
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
