import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), tenant: vi.fn(), from: vi.fn(), insert: vi.fn(), push: vi.fn(),
  role: 'Şef' as string | null,
}));
vi.mock('@/lib/server/supabase-auth', () => ({ requireAuthenticatedUser: mocks.auth }));
vi.mock('@/lib/server/tenant-client', () => ({
  createTenantServiceClient: mocks.tenant,
  TenantContextMismatchError: class TenantContextMismatchError extends Error {
    constructor() { super('Koro seçimi değişti. Sayfayı yenileyip tekrar deneyin.'); }
  },
}));
vi.mock('@/lib/server/push-notifications', () => ({ sendRehearsalCreatedPush: mocks.push }));

import { TenantContextMismatchError } from '@/lib/server/tenant-client';
import { POST } from './route';

const choirA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const choirB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function request(expected?: unknown) {
  return new Request('http://localhost/api/rehearsals/create', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ date: '2026-10-01', title: 'A form rehearsal', invitee_member_ids: [],
      expected_choir_id: expected }),
  });
}
function query(result: unknown) {
  const q = {
    select: () => q, eq: () => q,
    maybeSingle: () => Promise.resolve({ data: result, error: null }),
    insert: mocks.insert,
  };
  return q;
}

describe('084 rehearsal create context', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.role = 'Şef';
    mocks.auth.mockResolvedValue({ user: { id: 'shared-user' }, accessToken: 'verified-jwt' });
    mocks.insert.mockImplementation(() => query({ id: 'new-rehearsal', title: 'A form rehearsal',
      date: '2026-10-01', start_time: '19:30', end_time: null, location: 'Büyük Salon',
      notes: null, collect_attendance: true }));
    mocks.from.mockImplementation((table: string) => {
      if (table === 'choir_members') return query({ id: 'member-b', voice_group: null });
      if (table === 'choir_member_roles') return {
        select: () => ({ eq: () => Promise.resolve({ data: mocks.role
          ? [{ roles: { name: mocks.role } }] : [], error: null }) }),
      };
      if (table === 'rehearsals') return { insert: mocks.insert };
      throw new Error(`Unexpected ${table}`);
    });
    mocks.tenant.mockImplementation(async (_user: string, _token: string, expected?: string) => {
      if (expected && expected !== choirB) throw new TenantContextMismatchError();
      return { from: mocks.from };
    });
  });

  it('refuses an A form after the same server session selects B, before a B insert', async () => {
    const response = await POST(request(choirA));
    expect(response.status).toBe(409);
    expect(mocks.tenant).toHaveBeenCalledWith('shared-user', 'verified-jwt', choirA);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it.each([undefined, 'not-a-uuid'])('requires a valid expected choir %s', async expected => {
    const response = await POST(request(expected));
    expect(response.status).toBe(400);
    expect(mocks.tenant).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('still creates when the form and verified session are both B', async () => {
    const response = await POST(request(choirB));
    expect(response.status).toBe(200);
    expect(mocks.tenant).toHaveBeenCalledWith('shared-user', 'verified-jwt', choirB);
    expect(mocks.insert).toHaveBeenCalledOnce();
  });

  it('still refuses a same-choir actor without management authority', async () => {
    mocks.role = null;
    const response = await POST(request(choirB));
    expect(response.status).toBe(403);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
