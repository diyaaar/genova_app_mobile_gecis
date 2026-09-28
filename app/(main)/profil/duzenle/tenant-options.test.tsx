import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const choirA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const choirB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const schoolA = 'a1000000-0000-4000-8000-000000000001';
const schoolB = 'b1000000-0000-4000-8000-000000000001';

const mocks = vi.hoisted(() => ({
  choirId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  member: { id: 'member-a', choir_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    first_name: 'Ada', last_name: 'Test', email: 'ada@example.invalid', voice_group: 'Alto',
    school_id: null, department_id: null, favorite_song_id: null, photo_url: null },
  failure: false,
  delayedChoirId: null as string | null,
  delayedLoad: null as Promise<void> | null,
  authenticatedWebFetch: vi.fn(),
  datasets: {} as Record<string, Record<string, Record<string, unknown>[]>>,
}));

vi.mock('next/link', () => ({ default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a> }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, initial: _initial, animate: _animate, transition: _transition, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, initial: _initial, animate: _animate, transition: _transition, ...props }: any) => <form {...props}>{children}</form>,
    section: ({ children, initial: _initial, animate: _animate, transition: _transition, ...props }: any) => <section {...props}>{children}</section>,
  },
}));
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    member: mocks.member,
    user: { id: 'user-a' }, roles: ['Korist'], activeChoir: { choir_id: mocks.choirId }, isLoading: false,
  }),
}));
vi.mock('@/components/EmbeddedWebBridgeProvider', () => ({
  useEmbeddedWebBridge: () => ({ isEmbedded: true, requestPasswordChange: vi.fn() }),
}));
vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ error: vi.fn(), success: vi.fn(), info: vi.fn() }),
}));
vi.mock('@/components/SwipeBack', () => ({ SwipeBack: ({ children }: any) => <>{children}</> }));
vi.mock('@/lib/web-auth-capability', () => ({ authenticatedWebFetch: mocks.authenticatedWebFetch }));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from(table: string) {
      let choirId = '';
      const query = {
        select: () => query,
        eq: (column: string, value: string) => { if (column === 'choir_id') choirId = value; return query; },
        order: async () => {
          if (choirId === mocks.delayedChoirId && mocks.delayedLoad) await mocks.delayedLoad;
          return { data: mocks.datasets[choirId]?.[table] ?? [],
            error: mocks.failure ? { code: 'synthetic_read_failure' } : null };
        },
      };
      return query;
    },
  },
  browserSupabase: { auth: { signInWithPassword: vi.fn(), updateUser: vi.fn() } },
}));

import ProfileEditPage from './page';

describe('083 tenant-scoped profile reference choices', () => {
  beforeEach(() => {
    mocks.choirId = choirA;
    mocks.member = { ...mocks.member, choir_id: choirA };
    mocks.failure = false;
    mocks.delayedChoirId = null;
    mocks.delayedLoad = null;
    mocks.datasets = {
      [choirA]: {
        schools: [{ id: schoolA, name: 'A School' }],
        departments: [{ id: 'a2000000-0000-4000-8000-000000000001', name: 'A Department' }],
        repertoire: [{ id: 'a3000000-0000-4000-8000-000000000001', title: 'A Song', composer: null }],
      },
      [choirB]: {
        schools: [{ id: schoolB, name: 'B School' }],
        departments: [{ id: 'b2000000-0000-4000-8000-000000000001', name: 'B Department' }],
        repertoire: [{ id: 'b3000000-0000-4000-8000-000000000001', title: 'B Song', composer: null }],
      },
    };
    mocks.authenticatedWebFetch.mockResolvedValue({ ok: true, json: async () => ({ mode: 'created' }) });
  });

  it('shows only A, then clears A immediately and loads B on choir change', async () => {
    const view = render(<ProfileEditPage />);
    await screen.findByRole('option', { name: 'A School' });
    expect(screen.queryByRole('option', { name: 'B School' })).toBeNull();
    mocks.choirId = choirB;
    mocks.member = { ...mocks.member, choir_id: choirB };
    view.rerender(<ProfileEditPage />);
    await screen.findByRole('option', { name: 'B School' });
    expect(screen.queryByRole('option', { name: 'A School' })).toBeNull();
    expect(screen.getByRole('option', { name: 'B Department' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'B Song' })).toBeInTheDocument();
  });

  it('shows an honest empty catalog without original-choir fallback', async () => {
    mocks.choirId = choirB;
    mocks.member = { ...mocks.member, choir_id: choirB };
    mocks.datasets[choirB] = { schools: [], departments: [], repertoire: [] };
    render(<ProfileEditPage />);
    await screen.findByText('Bu koroda henüz okul tanımlanmadı.');
    expect(screen.getByText('Bu koroda henüz bölüm tanımlanmadı.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Okul' })).toBeEnabled();
    expect(screen.queryByRole('option', { name: 'A School' })).toBeNull();
  });

  it('ignores a late A catalog response after switching to B', async () => {
    let releaseA: () => void = () => {};
    mocks.delayedChoirId = choirA;
    mocks.delayedLoad = new Promise<void>(resolve => { releaseA = resolve; });
    const view = render(<ProfileEditPage />);
    mocks.choirId = choirB;
    mocks.member = { ...mocks.member, choir_id: choirB };
    view.rerender(<ProfileEditPage />);
    await screen.findByRole('option', { name: 'B School' });
    await act(async () => { releaseA(); await mocks.delayedLoad; });
    expect(screen.queryByRole('option', { name: 'A School' })).toBeNull();
    expect(screen.getByRole('option', { name: 'B School' })).toBeInTheDocument();
  });

  it('does not enable reference editing or submission after a read failure', async () => {
    mocks.failure = true;
    render(<ProfileEditPage />);
    await screen.findByRole('alert');
    expect(screen.getByRole('combobox', { name: 'Okul' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Değişiklikleri Onaya Gönder' })).toBeDisabled();
    expect(mocks.authenticatedWebFetch).not.toHaveBeenCalled();
  });

  it('sends the displayed choir as a precondition with its own school', async () => {
    mocks.choirId = choirB;
    mocks.member = { ...mocks.member, choir_id: choirB };
    render(<ProfileEditPage />);
    const user = userEvent.setup();
    await screen.findByRole('option', { name: 'B School' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Okul' }), schoolB);
    await user.click(screen.getByRole('button', { name: 'Değişiklikleri Onaya Gönder' }));
    await waitFor(() => expect(mocks.authenticatedWebFetch).toHaveBeenCalledOnce());
    const [url, options] = mocks.authenticatedWebFetch.mock.calls[0] as [string, { body: string }];
    expect(url).toBe('/api/profile-change-requests/submit');
    expect(JSON.parse(options.body)).toMatchObject({
      expected_choir_id: choirB, changes: { school_id: schoolB },
    });
  });
});
