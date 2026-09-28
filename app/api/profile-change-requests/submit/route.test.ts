import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(), createTenantServiceClient: vi.fn(),
  from: vi.fn(), insert: vi.fn(), reference: null as null | { id: string },
}));
vi.mock('@/lib/server/supabase-auth', () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
}));
vi.mock('@/lib/server/tenant-client', () => ({
  createTenantServiceClient: mocks.createTenantServiceClient,
  TenantContextMismatchError: class TenantContextMismatchError extends Error {
    constructor() { super('Koro seçimi değişti. Sayfayı yenileyip tekrar deneyin.'); }
  },
}));

import { TenantContextMismatchError } from '@/lib/server/tenant-client';
import { POST } from './route';

const choirA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const schoolA = 'a1000000-0000-4000-8000-000000000001';
const schoolB = 'b1000000-0000-4000-8000-000000000001';
function request(body: unknown) {
  return new Request('http://localhost/api/profile-change-requests/submit', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}
function query(result: unknown) {
  const q = {
    select: () => q, eq: () => q, order: () => Promise.resolve({ data: result, error: null }),
    maybeSingle: () => Promise.resolve({ data: result, error: null }),
    insert: mocks.insert,
  };
  return q;
}

describe('083 profile request tenant precondition', () => {
  beforeEach(() => {
    mocks.reference = null;
    mocks.requireAuthenticatedUser.mockResolvedValue({ user: { id: 'verified-user' }, accessToken: 'verified-jwt' });
    mocks.insert.mockImplementation(() => query({ id: 'request-a' }));
    mocks.from.mockImplementation((table: string) => {
      if (table === 'choir_members') return query({ id: 'member-a', about_text: null });
      if (table === 'profile_change_requests') {
        const q = query([]);
        return { ...q, insert: mocks.insert };
      }
      if (['schools', 'departments', 'repertoire'].includes(table)) return query(mocks.reference);
      throw new Error(`Unexpected table ${table}`);
    });
    mocks.createTenantServiceClient.mockResolvedValue({ from: mocks.from });
  });

  it.each([undefined, null, 'not-a-uuid'])('rejects missing/invalid expected choir %s before privileged work', async expected => {
    const response = await POST(request({ expected_choir_id: expected, changes: { about_text: 'Hello' } }));
    expect(response.status).toBe(400);
    expect(mocks.createTenantServiceClient).not.toHaveBeenCalled();
  });

  it('passes the rendered choir to the verified session resolver before writing', async () => {
    const response = await POST(request({ expected_choir_id: choirA, changes: { about_text: 'Hello' } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'request-a', mode: 'created' });
    expect(mocks.createTenantServiceClient).toHaveBeenCalledWith('verified-user', 'verified-jwt', choirA);
    expect(mocks.insert).toHaveBeenCalledOnce();
  });

  it('rejects an old A tab after the same session switches to B, without writing', async () => {
    mocks.createTenantServiceClient.mockRejectedValue(new TenantContextMismatchError());
    const response = await POST(request({ expected_choir_id: choirA, changes: { about_text: 'Hello' } }));
    expect(response.status).toBe(409);
    expect(await response.text()).toContain('Koro seçimi değişti');
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it.each([
    ['school_id', 'schools'],
    ['department_id', 'departments'],
    ['favorite_song_id', 'repertoire'],
  ] as const)('refuses a foreign %s ID before creating a pending request', async (field, table) => {
    const response = await POST(request({ expected_choir_id: choirA, changes: { [field]: schoolB } }));
    expect(response.status).toBe(400);
    expect(mocks.from).toHaveBeenCalledWith(table);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('keeps a same-choir school request valid', async () => {
    mocks.reference = { id: schoolA };
    const response = await POST(request({ expected_choir_id: choirA, changes: { school_id: schoolA } }));
    expect(response.status).toBe(200);
    expect(mocks.insert).toHaveBeenCalledOnce();
  });
});
