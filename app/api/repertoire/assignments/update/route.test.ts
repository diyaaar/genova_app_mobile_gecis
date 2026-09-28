import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(), createSupabaseUserClient: vi.fn(), rpc: vi.fn(),
  sendRepertoireAssignmentPush: vi.fn(),
}));
vi.mock('@/lib/server/supabase-auth', () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
  createSupabaseUserClient: mocks.createSupabaseUserClient,
}));
vi.mock('@/lib/server/push-notifications', () => ({
  sendRepertoireAssignmentPush: mocks.sendRepertoireAssignmentPush,
}));

import { POST } from './route';

const song = 'a2000000-0000-4000-8000-000000000001';
const one = 'a0000000-0000-4000-8000-000000000002';
const two = 'a0000000-0000-4000-8000-000000000003';
function request(body: unknown) {
  return new Request('http://localhost/api/repertoire/assignments/update', {
    method: 'POST', headers: { authorization: 'Bearer fixture', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
const valid = () => ({ song_id: song, part_name: 'Alto', member_ids: [one, two], expected_member_ids: [one] });

describe('082 web assignment adapter', () => {
  beforeEach(() => {
    mocks.requireAuthenticatedUser.mockResolvedValue({ user: { id: 'verified' }, accessToken: 'verified-token' });
    mocks.createSupabaseUserClient.mockReturnValue({ rpc: mocks.rpc });
    mocks.rpc.mockResolvedValue({ data: [{ song_title: 'Fixture song', added_member_ids: [two] }], error: null });
    mocks.sendRepertoireAssignmentPush.mockResolvedValue(undefined);
  });

  it('uses caller JWT, one RPC, and pushes only new members after success', async () => {
    const response = await POST(request(valid()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, song_id: song, part_name: 'Alto' });
    expect(mocks.createSupabaseUserClient).toHaveBeenCalledWith('verified-token');
    expect(mocks.rpc).toHaveBeenCalledOnce();
    expect(mocks.rpc).toHaveBeenCalledWith('replace_repertoire_assignments', {
      p_song_id: song, p_part_name: 'Alto', p_member_ids: [one, two], p_expected_member_ids: [one],
    });
    expect(mocks.sendRepertoireAssignmentPush).toHaveBeenCalledWith({
      songId: song, songTitle: 'Fixture song', partName: 'Alto', targetMemberIds: [two],
    });
    expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(mocks.sendRepertoireAssignmentPush.mock.invocationCallOrder[0]);
  });
  it('returns 401 before any DB work when the token is invalid', async () => {
    mocks.requireAuthenticatedUser.mockRejectedValue(new Error('Unauthorized'));
    expect((await POST(request(valid()))).status).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each([
    { ...valid(), expected_member_ids: undefined },
    { ...valid(), member_ids: [one, one] },
    { ...valid(), member_ids: ['not-a-uuid'] },
    { ...valid(), part_name: ' ' },
    { ...valid(), song_id: 'not-a-uuid' },
  ])('rejects malformed/stale-unspecified input before RPC %#', async body => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each([
    ['42501', 403], ['22023', 400], ['P0002', 404], ['40001', 409], ['23505', 409], ['XX000', 500],
  ])('maps DB refusal %s to %s without sending push', async (code, status) => {
    mocks.rpc.mockResolvedValue({ data: null, error: { code, message: 'secret details' } });
    const response = await POST(request(valid()));
    expect(response.status).toBe(status);
    expect(await response.text()).not.toContain('secret details');
    expect(mocks.sendRepertoireAssignmentPush).not.toHaveBeenCalled();
  });
  it('treats a retry with no newly added IDs as push-free success', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ song_title: 'Fixture song', added_member_ids: [] }], error: null });
    expect((await POST(request(valid()))).status).toBe(200);
    expect(mocks.sendRepertoireAssignmentPush).not.toHaveBeenCalled();
  });
  it('does not report success for malformed RPC output', async () => {
    mocks.rpc.mockResolvedValue({ data: [], error: null });
    expect((await POST(request(valid()))).status).toBe(500);
    expect(mocks.sendRepertoireAssignmentPush).not.toHaveBeenCalled();
  });
  it('keeps the committed result when best-effort push fails', async () => {
    mocks.sendRepertoireAssignmentPush.mockRejectedValue(new Error('provider unavailable'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await POST(request(valid()))).status).toBe(200);
    expect(log).toHaveBeenCalledOnce();
  });
});
