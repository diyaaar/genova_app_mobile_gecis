import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), tenant: vi.fn(), from: vi.fn(), insertedTables: [] as string[], push: vi.fn(),
  role: 'Şef' as string | null, targetActive: true,
}));
vi.mock('@/lib/server/supabase-auth', () => ({ requireAuthenticatedUser: mocks.auth }));
vi.mock('@/lib/server/tenant-client', () => ({
  createTenantServiceClient: mocks.tenant,
  TenantContextMismatchError: class TenantContextMismatchError extends Error {
    constructor() { super('Koro seçimi değişti. Sayfayı yenileyip tekrar deneyin.'); }
  },
}));
vi.mock('@/lib/server/push-notifications', () => ({
  sendAnnouncementPublishedPush: mocks.push, sendAssignmentCreatedPush: mocks.push,
}));

import { TenantContextMismatchError } from '@/lib/server/tenant-client';
import { POST as publishAnnouncement } from './announcements/publish/route';
import { POST as createAssignment } from './assignments/create/route';

const choirA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const choirB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const cases = [
  { name: 'announcement', table: 'announcements', path: 'announcements/publish', post: publishAnnouncement,
    payload: { title: 'A form notice', description: '<p>Test</p>', target_users: ['member-b'] } },
  { name: 'assignment', table: 'assignments', path: 'assignments/create', post: createAssignment,
    payload: { title: 'A form task', target_member_ids: ['member-b'] } },
];
function request(path: string, payload: Record<string, unknown>, expected?: unknown) {
  return new Request(`http://localhost/api/${path}`, { method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...payload, expected_choir_id: expected }) });
}
function result(data: unknown) { return { data, error: null }; }
function query(table: string) {
  const row = table === 'announcements' ? { id: 'notice-b', title: 'A form notice', description: '<p>Test</p>' }
    : table === 'assignments' ? { id: 'assignment-b', title: 'A form task', deadline: null } : null;
  const q = {
    select: () => q,
    eq: () => table === 'choir_member_roles'
      ? Promise.resolve(result(mocks.role ? [{ roles: { name: mocks.role } }] : [])) : q,
    in: () => Promise.resolve(result(table === 'choir_member_roles' ? []
      : [
        { id: 'member-a', voice_group: 'Alto', is_active: true },
        { id: 'member-b', voice_group: 'Alto', is_active: mocks.targetActive },
      ])),
    maybeSingle: () => Promise.resolve(result(table === 'choir_members'
      ? { id: 'member-a', voice_group: 'Alto', first_name: 'A', last_name: 'User' } : row)),
    insert: () => { mocks.insertedTables.push(table); return q; },
  };
  return q;
}

describe('084 new-row privileged create context', () => {
  beforeEach(() => {
    vi.resetAllMocks(); mocks.insertedTables = [];
    mocks.role = 'Şef'; mocks.targetActive = true;
    mocks.auth.mockResolvedValue({ user: { id: 'shared-user' }, accessToken: 'verified-jwt' });
    mocks.from.mockImplementation((table: string) => query(table));
    mocks.tenant.mockImplementation(async (_user: string, _token: string, expected?: string) => {
      if (expected && expected !== choirB) throw new TenantContextMismatchError();
      return { from: mocks.from };
    });
  });

  it.each(cases)('$name refuses an A form in B before all privileged reads and writes', async testCase => {
    const response = await testCase.post(request(testCase.path, testCase.payload, choirA));
    expect(response.status).toBe(409);
    expect(mocks.tenant).toHaveBeenCalledWith('shared-user', 'verified-jwt', choirA);
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.insertedTables).toEqual([]);
  });

  it.each(cases)('$name refuses missing/invalid context before privileged work', async testCase => {
    for (const expected of [undefined, 'bad-id']) {
      const response = await testCase.post(request(testCase.path, testCase.payload, expected));
      expect(response.status).toBe(400);
    }
    expect(mocks.tenant).not.toHaveBeenCalled();
  });

  it.each(cases)('$name still creates for a B form in B with its existing target checks', async testCase => {
    const response = await testCase.post(request(testCase.path, testCase.payload, choirB));
    expect(response.status).toBe(200);
    expect(mocks.insertedTables).toContain(testCase.table);
    expect(mocks.tenant).toHaveBeenCalledWith('shared-user', 'verified-jwt', choirB);
  });

  it.each(cases)('$name still refuses a same-choir actor with no management role', async testCase => {
    mocks.role = null;
    const response = await testCase.post(request(testCase.path, testCase.payload, choirB));
    expect(response.status).toBe(403);
    expect(mocks.insertedTables).toEqual([]);
  });

  it.each(cases)('$name still refuses inactive same-choir targets', async testCase => {
    mocks.targetActive = false;
    const response = await testCase.post(request(testCase.path, testCase.payload, choirB));
    expect(response.status).toBe(400);
    expect(mocks.insertedTables).toEqual([]);
  });
});
