import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const context = vi.hoisted(() => ({ memberChoir: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  activeChoir: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }));
vi.mock('./AuthProvider', () => ({ useAuth: () => ({
  member: context.memberChoir ? { choir_id: context.memberChoir } : null,
  activeChoir: context.activeChoir ? { choir_id: context.activeChoir } : null,
}) }));
import { useFormOriginChoir } from './useFormOriginChoir';

const choirA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const choirB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
describe('creation form origin choir', () => {
  beforeEach(() => { context.memberChoir = choirA; context.activeChoir = choirA; });

  it('freezes A on open and refuses silent retargeting to B', async () => {
    const { result, rerender } = renderHook(({ open }) => useFormOriginChoir(open), {
      initialProps: { open: true },
    });
    await waitFor(() => expect(result.current.originChoirId).toBe(choirA));
    expect(result.current.isOriginCurrent).toBe(true);
    context.memberChoir = choirB; context.activeChoir = choirB; rerender({ open: true });
    expect(result.current.originChoirId).toBe(choirA);
    expect(result.current.isOriginCurrent).toBe(false);
    rerender({ open: false });
    expect(result.current.originChoirId).toBeNull();
    rerender({ open: true });
    await waitFor(() => expect(result.current.originChoirId).toBe(choirB));
    expect(result.current.isOriginCurrent).toBe(true);
  });

  it('does not acquire an origin until member and active choir agree', async () => {
    context.activeChoir = choirB;
    const { result, rerender } = renderHook(() => useFormOriginChoir(true));
    expect(result.current.originChoirId).toBeNull();
    context.memberChoir = choirB; rerender();
    await waitFor(() => expect(result.current.originChoirId).toBe(choirB));
  });
});
