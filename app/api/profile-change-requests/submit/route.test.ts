// Real Next handler + supabase-js transport; mocked HTTP/Auth, not browser/DB acceptance.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock('@/lib/server/supabase-auth', async original => ({
  ...await original<typeof import('@/lib/server/supabase-auth')>(), requireAuthenticatedUser: mocks.auth,
}));
import { POST } from './route';
const choir = 'a8700000-0000-4000-8000-000000000001', id = 'a8700000-0000-4000-8000-000000000007';
const origin = 'https://fixture-087.invalid';
let captures: Request[], backend: unknown, status: number;
function request(body: unknown) { return new Request('http://localhost/api/profile-change-requests/submit', {
  method: 'POST', headers: { authorization: 'Bearer verified-087', 'content-type': 'application/json' }, body: JSON.stringify(body),
}); }
describe('087 atomic profile submit caller-JWT transport', () => {
  beforeEach(() => {
    captures = []; backend = { id, mode: 'created' }; status = 200;
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', origin); vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '087-anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '087-service-must-never-be-used');
    mocks.auth.mockResolvedValue({ user: { id: 'verified-user' }, accessToken: 'verified-087' });
    vi.stubGlobal('fetch', vi.fn<typeof fetch>(async (input, init) => {
      const req = input instanceof Request ? input : new Request(input, init);
      expect(new URL(req.url).origin).toBe(origin); captures.push(req);
      return new Response(JSON.stringify(backend), { status, headers: { 'content-type': 'application/json' } });
    }));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it.each([undefined,null,'bad'])('refuses expected choir %s before SDK request', async expected => {
    expect((await POST(request({ expected_choir_id: expected, changes: { about_text: 'Hello' } }))).status).toBe(400);
    expect(captures).toHaveLength(0);
  });
  it('calls exactly one RPC using verified user token, normalized fields and no payload identity', async () => {
    const response = await POST(request({ expected_choir_id: choir, auth_user_id: 'forged', member_id: 'forged',
      changes: { about_text: ' Hello ', phone: 42, school_id: null, unknown: 'discard' }, note: ' note ' }));
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ id, mode: 'created' });
    expect(captures).toHaveLength(1);
    expect(new URL(captures[0].url).pathname).toBe('/rest/v1/rpc/submit_profile_change_request');
    expect(captures[0].headers.get('authorization')).toBe('Bearer verified-087');
    expect(await captures[0].json()).toEqual({ p_expected_choir_id: choir,
      p_changes: { about_text: 'Hello', school_id: null }, p_note: 'note' });
  });
  it.each(['created','updated','unchanged'])('preserves %s response contract', async mode => {
    backend = mode === 'unchanged' ? { mode } : { id, mode };
    const response = await POST(request({ expected_choir_id: choir, changes: { phone: 'x' } }));
    expect(response.status).toBe(200); expect(await response.json()).toEqual(backend);
  });
  it.each([['28000',401],['42501',403],['PT409',409],['40001',409],['40P01',409],
    ['22023',400],['22P02',400],['42883',503],['PGRST202',503],['XX000',500]] as const)(
    'maps %s to %s with no privileged fallback or internal error leak', async (code, expected) => {
      backend = { code, message: 'private backend diagnostic' }; status = 400;
      const response = await POST(request({ expected_choir_id: choir, changes: { school_id: 'foreign' } }));
      expect(response.status).toBe(expected); expect(await response.text()).not.toContain('private backend diagnostic');
      expect(captures).toHaveLength(1);
    });
  it.each([null,{}, { mode: 'wrong' }, { mode: 'created', id: 'not-a-uuid' }])('rejects malformed backend success %j', async value => {
    backend = value;
    expect((await POST(request({ expected_choir_id: choir, changes: { phone: 'x' } }))).status).toBe(502);
  });
  it('rejects invalid JSON and empty changes or long note without RPC', async () => {
    expect((await POST(new Request('http://localhost', { method: 'POST', body: '{' }))).status).toBe(400);
    expect((await POST(request({ expected_choir_id: choir, changes: { unknown: 'x' } }))).status).toBe(400);
    expect((await POST(request({ expected_choir_id: choir, changes: { phone: 'x' }, note: 'n'.repeat(1201) }))).status).toBe(400);
    expect(captures).toHaveLength(0);
  });
  it('rejects failed Auth before SDK', async () => {
    mocks.auth.mockRejectedValue(new Error('Unauthorized'));
    expect((await POST(request({ expected_choir_id: choir, changes: { phone: 'x' } }))).status).toBe(401);
    expect(captures).toHaveLength(0);
  });
});
