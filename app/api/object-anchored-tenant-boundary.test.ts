// Real routes + tenant-client + supabase-js. HTTP/Auth/provider responses are synthetic;
// actual RPC/RLS acceptance lives in 085_two_choir_connected.sql, not this transport test.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), profilePush: vi.fn() }));
vi.mock('@/lib/server/supabase-auth', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/server/supabase-auth')>(),
  requireAuthenticatedUser: mocks.auth,
}));
vi.mock('@/lib/server/push-notifications', () => ({ sendProfileDecisionPush: mocks.profilePush }));

import { POST as deleteRehearsal } from './rehearsals/delete/route';
import { POST as deleteAssignment } from './assignments/delete/route';
import { POST as reviewProfile } from './profile-change-requests/review/route';

const base = 'https://fixture-085.invalid';
const choirB = 'b8500000-0000-4000-8000-000000000001';
const memberB = 'b8500000-0000-4000-8000-000000000002';
const objectA = 'a8500000-0000-4000-8000-000000000003';
const objectB = 'b8500000-0000-4000-8000-000000000003';
const targetB = 'b8500000-0000-4000-8000-000000000004';
const authUser = '85000000-0000-4000-8000-000000000001';
const routes = [
  { name: 'rehearsal delete', table: 'rehearsals', post: deleteRehearsal,
    body: (id: string) => ({ rehearsal_id: id }) },
  { name: 'assignment delete', table: 'assignments', post: deleteAssignment,
    body: (id: string) => ({ assignment_id: id }) },
  { name: 'profile review', table: 'profile_change_requests', post: reviewProfile,
    body: (id: string) => ({ requestId: id, action: 'approve' }) },
];

type Captured = { request: Request; url: URL; body: Record<string, unknown> | null };
let captured: Captured[];
let activeChoir: string | null;
let membershipActive: boolean;
let roleName: string;
let objectPresent: boolean;
let failureTable: string | null;

function request(body: unknown) {
  return new Request('http://localhost/api/fixture-085', {
    method: 'POST', headers: { authorization: 'Bearer fixture-085-user', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
function writes() { return captured.filter(x => ['POST', 'PATCH', 'DELETE'].includes(x.request.method)
  && !x.url.pathname.includes('/rpc/')); }
function assertScope() {
  const bootstrap = captured.find(x => x.url.searchParams.has('is_active'))!;
  expect(bootstrap.url.searchParams.get('auth_user_id')).toBe(`eq.${authUser}`);
  expect(bootstrap.url.searchParams.getAll('choir_id')).toEqual([`eq.${choirB}`]);
  expect(bootstrap.url.searchParams.get('is_active')).toBe('eq.true');
  for (const entry of captured.filter(x => !x.url.pathname.includes('/rpc/'))) {
    expect(entry.url.searchParams.getAll('choir_id')).toEqual([`eq.${choirB}`]);
    expect(entry.request.headers.get('authorization')).toBe('Bearer fixture-085-service');
  }
  expect(captured[0].request.headers.get('authorization')).toBe('Bearer fixture-085-user');
}

describe('085 representative object-anchored routes through actual tenant SDK transport', () => {
  beforeEach(() => {
    captured = []; activeChoir = choirB; membershipActive = true; roleName = 'Şef';
    objectPresent = false; failureTable = null;
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', base);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'fixture-085-anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'fixture-085-service');
    mocks.auth.mockResolvedValue({ user: { id: authUser }, accessToken: 'fixture-085-user' });
    mocks.profilePush.mockResolvedValue(undefined);
    vi.stubGlobal('fetch', vi.fn<typeof fetch>(async (input, init) => {
      const req = input instanceof Request ? input : new Request(input, init);
      const url = new URL(req.url);
      // No network fallback, even if a production environment value is present.
      if (url.origin !== base) throw new Error('085 unexpected network target');
      const body = ['POST', 'PATCH'].includes(req.method) ? await req.clone().json() : null;
      captured.push({ request: req, url, body });
      const table = url.pathname.slice('/rest/v1/'.length);
      if (table === 'rpc/current_choir_id') return response(activeChoir);
      if (table === failureTable) return response({ code: 'XX000', message: 'fixture query failure' }, 500);
      if (table === 'choir_members' && url.searchParams.has('is_active')) {
        return response([{ choir_id: activeChoir, is_active: membershipActive }]);
      }
      if (table === 'choir_members') {
        return response([{ id: url.searchParams.has('auth_user_id') ? memberB : targetB,
          first_name: 'Fixture', last_name: 'Reviewer', about_text: null }]);
      }
      if (table === 'choir_member_roles') return response([{ roles: { name: roleName } }]);
      if (['rehearsals', 'assignments'].includes(table)) {
        return response(objectPresent ? [{ id: objectB, created_by: memberB }] : []);
      }
      if (['attendance', 'rehearsal_invitees'].includes(table)) return response([]);
      if (table === 'profile_change_requests') {
        if (!url.searchParams.has('id')) return response([]); // older overlapping requests
        if (!objectPresent) return response([]);
        return response([{ id: objectB, member_id: targetB, changes_json: { about_text: 'Fixture profile' },
          status: req.method === 'PATCH' ? 'approved' : 'pending', created_at: '2026-09-28T10:00:00Z',
          reviewed_by: memberB, reviewed_at: '2026-09-28T11:00:00Z', reject_reason: null }]);
      }
      throw new Error(`085 unexpected endpoint ${table}`);
    }));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  for (const route of routes) {
    it(`${route.name}: old A object under same-session B selection is 404 before any write`, async () => {
      const result = await route.post(request(route.body(objectA)));
      expect(result.status).toBe(404);
      assertScope();
      const objectRead = captured.find(x => x.url.pathname === `/rest/v1/${route.table}`)!;
      expect(objectRead.url.searchParams.get('id')).toBe(`eq.${objectA}`);
      expect(writes()).toEqual([]);
      expect(mocks.profilePush).not.toHaveBeenCalled();
    });

    it(`${route.name}: own B object succeeds and every read/write remains B-scoped`, async () => {
      objectPresent = true;
      const result = await route.post(request(route.body(objectB)));
      expect(result.status).toBe(200);
      expect((await result.json()).id).toBe(objectB);
      assertScope();
      expect(writes().length).toBeGreaterThan(0);
      for (const entry of writes()) {
        if (entry.body) expect(entry.body.choir_id).toBe(choirB);
        const anchor = entry.url.searchParams.get('id') ?? entry.url.searchParams.get('rehearsal_id');
        expect([`eq.${objectB}`, `eq.${targetB}`]).toContain(anchor);
      }
    });

    it(`${route.name}: role removed before dispatch is 403 without object lookup/writes`, async () => {
      roleName = 'Korist'; objectPresent = true;
      expect((await route.post(request(route.body(objectB)))).status).toBe(403);
      assertScope();
      expect(captured.some(x => x.url.pathname === `/rest/v1/${route.table}`)).toBe(false);
      expect(writes()).toEqual([]);
      expect(mocks.profilePush).not.toHaveBeenCalled();
    });

    it(`${route.name}: inactive bootstrap membership fails closed before object lookup`, async () => {
      membershipActive = false; objectPresent = true;
      expect((await route.post(request(route.body(objectB)))).status).toBe(500);
      expect(captured).toHaveLength(2);
      expect(writes()).toEqual([]);
      expect(mocks.profilePush).not.toHaveBeenCalled();
    });

    it(`${route.name}: revoked selected choir cannot fall back to A or bootstrap service access`, async () => {
      activeChoir = null;
      expect((await route.post(request(route.body(objectA)))).status).toBe(500);
      expect(captured).toHaveLength(1);
      expect(writes()).toEqual([]);
    });

    it(`${route.name}: failed object query is not treated as successful mutation`, async () => {
      failureTable = route.table; objectPresent = true;
      expect((await route.post(request(route.body(objectB)))).status).toBe(500);
      assertScope();
      expect(writes()).toEqual([]);
      expect(mocks.profilePush).not.toHaveBeenCalled();
    });
  }

  it('invalid verified identity is 401 without any SDK transport', async () => {
    mocks.auth.mockRejectedValue(new Error('Unauthorized'));
    expect((await deleteRehearsal(request({ rehearsal_id: objectB }))).status).toBe(401);
    expect(captured).toEqual([]);
  });
});
