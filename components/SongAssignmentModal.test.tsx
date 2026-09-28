import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  members: { data: [] as Record<string, unknown>[], error: null as unknown },
  assignments: { data: [] as { member_id: string }[], error: null as unknown },
  authenticatedWebFetch: vi.fn(),
}));

vi.mock('@/store/useMiniAudioPlayerStore', () => ({
  useMiniAudioPlayerStore: (selector: (state: { isActive: boolean }) => unknown) => selector({ isActive: false }),
}));
vi.mock('@/lib/web-auth-capability', () => ({ authenticatedWebFetch: mocks.authenticatedWebFetch }));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from(table: string) {
      const result = table === 'choir_members' ? mocks.members : mocks.assignments;
      const query = {
        select: () => query, eq: () => query, is: () => query, not: () => query, order: () => query,
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
          Promise.resolve(result).then(resolve, reject),
      };
      return query;
    },
  },
}));

import { SongAssignmentModal } from './SongAssignmentModal';

const songId = 'a2000000-0000-4000-8000-000000000001';
const one = 'a0000000-0000-4000-8000-000000000002';
const two = 'a0000000-0000-4000-8000-000000000003';
const member = (id: string, name: string) => ({
  id, choir_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', first_name: name,
  last_name: 'Fixture', voice_group: 'Alto', sub_voice_group: null, is_active: true,
});
function mount() {
  return render(<SongAssignmentModal isOpen onClose={vi.fn()} songId={songId}
    songTitle="Fixture song A" partName="Alto" />);
}

describe('082 song assignment load safety', () => {
  beforeEach(() => {
    mocks.members = { data: [member(one, 'One'), member(two, 'Two')], error: null };
    mocks.assignments = { data: [{ member_id: one }], error: null };
    mocks.authenticatedWebFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  });

  it.each(['members', 'assignments'] as const)('refuses save if %s query reports an error', async table => {
    mocks[table].error = { code: 'synthetic_read_failure' };
    mount();
    await screen.findByText('Atamalar yüklenemedi. Yeniden açıp deneyin.');
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
    expect(mocks.authenticatedWebFetch).not.toHaveBeenCalled();
  });

  it('sends the exact loaded snapshot with the desired IDs', async () => {
    mount();
    const user = userEvent.setup();
    await screen.findByText('Two Fixture');
    await user.click(screen.getByRole('button', { name: /Two Fixture/ }));
    await user.click(screen.getByRole('button', { name: 'Kaydet' }));
    await waitFor(() => expect(mocks.authenticatedWebFetch).toHaveBeenCalledOnce());
    const [url, options] = mocks.authenticatedWebFetch.mock.calls[0] as [string, { body: string }];
    expect(url).toBe('/api/repertoire/assignments/update');
    expect(JSON.parse(options.body)).toEqual({
      song_id: songId, part_name: 'Alto', member_ids: [one, two], expected_member_ids: [one],
    });
  });
});
