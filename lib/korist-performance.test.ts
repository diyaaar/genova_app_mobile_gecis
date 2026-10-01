import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChoirMember } from './supabase';

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: { from: db.from } }));
import { loadPerformanceMemberDetail } from './korist-performance';

const actor = { id: 'chef', first_name: 'Test', last_name: 'Chef', voice_group: 'Alto', is_active: true } as ChoirMember;
const member = { ...actor, id: 'chorist', first_name: 'Test', last_name: 'Member' };
const assignment = { id: 'homework', title: 'Practice', target_voice_group: 'Alto', is_active: true,
  deadline: '2099-10-01', created_at: '2026-10-01T00:00:00Z' };
const version = '11111111-1111-4111-8111-111111111111';

describe('performance assignment-version projection', () => {
  const projections = new Map<string, string>();
  const filters = new Map<string, Array<[string, unknown]>>();
  let submissionError: Error | null;

  beforeEach(() => {
    projections.clear(); filters.clear(); submissionError = null;
    db.from.mockImplementation((table: string) => {
      let fields = '';
      const query = {
        select: vi.fn((value: string) => { fields = value; projections.set(table, value); return query; }),
        eq: vi.fn(() => query), order: vi.fn(() => query),
        in: vi.fn((field: string, values: unknown) => {
          filters.set(table, [...(filters.get(table) ?? []), [field, values]]); return query;
        }),
        then: (resolve: (value: unknown) => unknown) => {
          const rows: Record<string, unknown[]> = {
            choir_members: [actor, member], assignments: [assignment],
            assignment_targets: [{ assignment_id: assignment.id, member_id: member.id }],
            assignment_submissions: [{ id: 'submission', assignment_id: assignment.id, member_id: member.id,
              status: 'pending', updated_at: '2026-10-01T00:00:00Z', drive_file_id: 'old-drive',
              ...(fields.split(',').map((field) => field.trim()).includes('current_file_version_id')
                ? { current_file_version_id: version } : {}) }],
          };
          return Promise.resolve(resolve({ data: rows[table] ?? [],
            error: table === 'assignment_submissions' ? submissionError : null }));
        },
      };
      return query;
    });
  });

  it('loads the real member-detail flow with the version pointer and existing query filters', async () => {
    const result = await loadPerformanceMemberDetail(actor, member.id, true, false);
    expect(result?.homework[0]?.submission?.current_file_version_id).toBe(version);
    expect(projections.get('assignment_submissions')?.split(',').map((field) => field.trim()))
      .toContain('current_file_version_id');
    expect(filters.get('assignment_submissions')).toEqual([
      ['assignment_id', [assignment.id]], ['member_id', [actor.id, member.id]],
    ]);
  });

  it('returns no detail for a target absent from the RLS-scoped dataset', async () => {
    expect(await loadPerformanceMemberDetail(actor, 'other-choir-member', true, false)).toBeNull();
  });

  it('propagates a submission query failure instead of silently showing legacy data', async () => {
    submissionError = new Error('permission denied');
    await expect(loadPerformanceMemberDetail(actor, member.id, true, false)).rejects.toThrow('permission denied');
  });
});
