// Component/state proof with mocked reads, separate from 089 real-browser acceptance.
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  member: { id: 'actor-A' },
  datasets: {} as Record<string, Record<string, Record<string, unknown>[]>>,
  gates: {} as Record<string, Promise<void>>,
  failures: [] as string[], calls: [] as { owner: string; table: string; ids: string[] }[],
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('next/link', () => ({ default: ({ children, href }: any) => <a href={href}>{children}</a> }));
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: { div: ({ children, initial: _i, animate: _a, exit: _e, transition: _t, layout: _l, ...props }: any) => <div {...props}>{children}</div> },
}));
vi.mock('@/components/AuthProvider', () => ({ useAuth: () => ({ member: mocks.member, isAdmin: () => true, isLoading: false }) }));
vi.mock('@/components/ToastProvider', () => ({ useToast: () => mocks.toast }));
vi.mock('@/lib/supabase', () => ({ supabase: {
  from(table: string) {
    const owner = mocks.member.id;
    let ids: string[] = [];
    const query = {
      select: () => query, order: () => query, in: (_column: string, values: string[]) => { ids = values; return query; },
      then(resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) {
        const rows = (mocks.datasets[owner]?.[table] ?? []).filter(row => !ids.length || ids.includes(row.id as string));
        const error = mocks.failures.includes(`${owner}:${table}`) ? { code: 'fixture-read-failure' } : null;
        mocks.calls.push({ owner, table, ids });
        return Promise.resolve(mocks.gates[`${owner}:${table}`]).then(() => ({ data: rows, error })).then(resolve, reject);
      },
    }; return query;
  },
  channel: () => { const channel = { on: () => channel, subscribe: () => channel }; return channel; },
  removeChannel: vi.fn(),
} }));
import ProfileRequests from './page';
function dataset(letter: string) {
  return {
    profile_change_requests: [{ id: `request-${letter}`, member_id: `person-${letter}`, status: 'pending',
      changes_json: { school_id: `school-${letter}`, department_id: `department-${letter}`, favorite_song_id: `song-${letter}` },
      previous_values_json: {}, reviewed_by: null, reviewed_at: null, created_at: '2026-09-29T01:00:00Z' }],
    choir_members: [{ id: `person-${letter}`, first_name: 'Member', last_name: letter, voice_group: 'Alto' }],
    schools: [{ id: `school-${letter}`, name: `${letter} School` }],
    departments: [{ id: `department-${letter}`, name: `${letter} Department` }],
    repertoire: [{ id: `song-${letter}`, title: `${letter} Song`, composer: `${letter} Composer` }],
  };
}
async function open(letter: string) {
  await userEvent.setup().click(await screen.findByRole('button', { name: new RegExp(`Member ${letter}.*değişiklik`) }));
}
describe('089 own-choir review labels and late-read publication', () => {
  beforeEach(() => {
    mocks.member = { id: 'actor-A' }; mocks.gates = {}; mocks.failures = []; mocks.calls = [];
    mocks.datasets = { 'actor-A': dataset('A'), 'actor-B': dataset('B') };
  });
  it('loads only referenced own catalog names, then clears A on B member/context change', async () => {
    const view = render(<ProfileRequests />); await open('A');
    expect(screen.getByText('A School')).toBeInTheDocument();
    expect(screen.getByText('A Department')).toBeInTheDocument();
    expect(screen.getByText('A Song - A Composer')).toBeInTheDocument();
    expect(mocks.calls.filter(x => ['schools','departments','repertoire'].includes(x.table))).toEqual([
      { owner: 'actor-A', table: 'schools', ids: ['school-A'] },
      { owner: 'actor-A', table: 'departments', ids: ['department-A'] },
      { owner: 'actor-A', table: 'repertoire', ids: ['song-A'] },
    ]);
    mocks.member = { id: 'actor-B' }; view.rerender(<ProfileRequests />);
    expect(screen.queryByText('A School')).toBeNull();
    await open('B'); expect(screen.getByText('B School')).toBeInTheDocument();
    expect(screen.queryByText('A School')).toBeNull();
  });
  it.each(['profile_change_requests','schools'])('late A %s cannot overwrite selected B data/labels', async table => {
    let release!: () => void;
    mocks.gates[`actor-A:${table}`] = new Promise<void>(r => { release = r; });
    const view = render(<ProfileRequests />);
    await waitFor(() => expect(mocks.calls.some(x => x.owner === 'actor-A' && x.table === table)).toBe(true));
    mocks.member = { id: 'actor-B' }; view.rerender(<ProfileRequests />);
    await open('B'); expect(screen.getByText('B School')).toBeInTheDocument();
    await act(async () => { release(); await mocks.gates[`actor-A:${table}`]; });
    expect(screen.queryByRole('button', { name: /Member A.*değişiklik/ })).toBeNull();
    expect(screen.queryByText('A School')).toBeNull(); expect(screen.getByText('B School')).toBeInTheDocument();
  });
  it('missing/failed catalog has honest raw fallback, never original-choir hardcoded name', async () => {
    const legacy = 'ecfbb198-9806-4754-8f21-8b076f44f345';
    mocks.datasets['actor-A'].profile_change_requests[0].changes_json = { school_id: legacy };
    mocks.failures = ['actor-A:schools'];
    render(<ProfileRequests />); await open('A');
    expect(screen.getByText(legacy)).toBeInTheDocument();
    expect(screen.queryByText('İstanbul Üniversitesi-Cerrahpaşa')).toBeNull();
    expect(mocks.toast.error).toHaveBeenCalledWith('Bazı seçimlerin adları yüklenemedi.', 'Profil talepleri');
  });
  it('failed B request read cannot retain visible A requests or catalog names', async () => {
    const view = render(<ProfileRequests />); await open('A');
    mocks.member = { id: 'actor-B' }; mocks.failures = ['actor-B:profile_change_requests'];
    view.rerender(<ProfileRequests />);
    await screen.findByText('Henüz profil değişiklik talebi yok.');
    expect(screen.queryByText('A School')).toBeNull();
    expect(screen.queryByRole('button', { name: /Member A.*değişiklik/ })).toBeNull();
  });
  it('corrupted reference names cannot resolve object-prototype properties or crash review', async () => {
    mocks.datasets['actor-A'].profile_change_requests[0].changes_json = {
      school_id: '__proto__', department_id: 'constructor', favorite_song_id: 'toString',
    };
    render(<ProfileRequests />); await open('A');
    expect(screen.getByText('__proto__')).toBeInTheDocument();
    expect(screen.getByText('constructor')).toBeInTheDocument();
    expect(screen.getByText('toString')).toBeInTheDocument();
  });
});
