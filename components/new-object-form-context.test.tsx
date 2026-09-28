import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  member: { id: 'creator-a', choir_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', voice_group: 'Alto' },
  choirId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  isAdmin: () => true, isSectionLeader: () => false,
  fetch: vi.fn(), song: vi.fn(), folder: vi.fn(), toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('./AuthProvider', () => ({ useAuth: () => ({
  member: mocks.member, activeChoir: { choir_id: mocks.choirId },
  isAdmin: mocks.isAdmin, isSectionLeader: mocks.isSectionLeader,
}) }));
vi.mock('./ToastProvider', () => ({ useToast: () => mocks.toast }));
vi.mock('@/store/useMiniAudioPlayerStore', () => ({
  useMiniAudioPlayerStore: (selector: (state: { isActive: boolean }) => unknown) => selector({ isActive: false }),
}));
vi.mock('./RichTextEditor', () => ({ RichTextEditor: ({ content, onChange }: {
  content: string; onChange: (value: string) => void;
}) => <textarea aria-label="Fixture rich text" value={content} onChange={event => onChange(event.target.value)} /> }));
vi.mock('./LottieIcon', () => ({ LottieIcon: () => null }));
vi.mock('@/lib/web-auth-capability', () => ({ authenticatedWebFetch: mocks.fetch }));
vi.mock('@/lib/drive', () => ({ initSongFolder: mocks.folder, initAssignmentFolder: mocks.folder }));
vi.mock('@/lib/repertuvar/upload', () => ({ isPrivateRepertoireUploadEnabled: () => false }));
vi.mock('@/lib/repertuvar/create-song', () => ({ createLegacyRepertoireSong: mocks.song,
  createPrivateRepertoireSong: vi.fn(), loadPendingRepertoireSong: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: {
  from(table: string) {
    const data = table === 'choir_members' ? [{ id: 'target-a', choir_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      first_name: 'Target', last_name: 'Fixture', voice_group: 'Alto', is_active: true }] : [];
    const q = { select: () => q, eq: () => q, order: () => q, in: () => q,
      then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve, reject) };
    return q;
  },
} }));

import { AddSongModal } from './AddSongModal';
import { EventFormModal } from './EventFormModal';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';

const choirA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const choirB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const cases = [
  { name: 'rehearsal', form: '#event-form', path: '/api/rehearsals/create',
    element: () => <EventFormModal open onClose={vi.fn()} onSaved={vi.fn()} defaultDate="2026-10-01" /> },
  { name: 'assignment', form: '#assignment-form', path: '/api/assignments/create',
    element: () => <CreateAssignmentModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} isChef creatorVoiceGroup="Alto" /> },
  { name: 'announcement', form: '#announcement-form', path: '/api/announcements/publish',
    element: () => <CreateAnnouncementModal open onClose={vi.fn()} onCreated={vi.fn()} /> },
  { name: 'song', form: '#add-song-form', path: null,
    element: () => <AddSongModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} /> },
];

async function fill(name: string, container: HTMLElement, formSelector: string) {
  const form = container.querySelector(formSelector)!;
  const title = form.querySelector('input[type="text"]')!;
  fireEvent.change(title, { target: { value: 'Fixture create' } });
  if (name === 'announcement' || name === 'assignment') {
    await screen.findByText('Target Fixture');
    fireEvent.click(screen.getByRole('button', { name: /Target Fixture/ }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Fixture rich text' }), {
      target: { value: '<p>Fixture details</p>' },
    });
  }
  return form;
}

describe('084 form-to-create choir binding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.member = { id: 'creator-a', choir_id: choirA, voice_group: 'Alto' };
    mocks.choirId = choirA;
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ id: 'created-a', title: 'Fixture create' }) });
    mocks.song.mockResolvedValue({ id: 'song-a', title: 'Fixture create' });
    mocks.folder.mockResolvedValue(undefined);
  });

  it.each(cases)('$name sends the opening A choir on a valid A form', async testCase => {
    const view = render(testCase.element());
    const form = await fill(testCase.name, view.container, testCase.form);
    fireEvent.submit(form);
    if (testCase.path) {
      await waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce());
      const [path, options] = mocks.fetch.mock.calls[0];
      expect(path).toBe(testCase.path);
      expect(JSON.parse(options.body).expected_choir_id).toBe(choirA);
    } else {
      await waitFor(() => expect(mocks.song).toHaveBeenCalledWith('Fixture create', '', choirA));
    }
  });

  it.each(cases)('$name refuses the still-open A form after local context changes to B', async testCase => {
    const view = render(testCase.element());
    await fill(testCase.name, view.container, testCase.form);
    mocks.member = { id: 'creator-b', choir_id: choirB, voice_group: 'Alto' };
    mocks.choirId = choirB;
    view.rerender(testCase.element());
    fireEvent.submit(view.container.querySelector(testCase.form)!);
    await screen.findByText('Koro seçimi değişti. Formu yeniden açıp tekrar deneyin.');
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.song).not.toHaveBeenCalled();
    expect(mocks.folder).not.toHaveBeenCalled();
  });
});
