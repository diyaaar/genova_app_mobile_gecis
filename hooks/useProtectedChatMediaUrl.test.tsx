import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUrl: vi.fn(),
  authorizeOnline: vi.fn(),
  clearUrls: vi.fn(),
}));
vi.mock('@/lib/chat-media', () => ({
  privateChatMediaVersionId: (value: string | null) => value?.startsWith('r2_chat_')
    ? value.slice('r2_chat_'.length) : null,
}));
vi.mock('@/lib/drive-file-url', () => ({
  getProtectedChatMediaFileUrl: mocks.getUrl,
  getOnlineAuthorizedPrivateFileUrl: mocks.authorizeOnline,
  clearProtectedDriveFileUrlCache: mocks.clearUrls,
}));
vi.mock('@/lib/drive', () => ({ getDriveImageUrl: (value: string) => value }));

import { useProtectedChatMediaUrl } from './useProtectedChatMediaUrl';

const alias = 'r2_chat_11111111-1111-4111-8111-111111111111';

describe('private chat image URL recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUrl.mockResolvedValue('https://example.test/private-image');
    mocks.authorizeOnline.mockImplementation((load: () => Promise<string>) => load());
  });

  it('validates an online URL before publishing it and refreshes an opaque body error once', async () => {
    const { result } = renderHook(() => useProtectedChatMediaUrl(alias));
    await waitFor(() => expect(result.current.url).toBe('https://example.test/private-image'));
    expect(mocks.authorizeOnline).toHaveBeenCalledTimes(1);
    act(() => result.current.onBodyError());
    await waitFor(() => expect(mocks.authorizeOnline).toHaveBeenCalledTimes(2));
    expect(mocks.clearUrls).toHaveBeenCalledTimes(1);
    act(() => result.current.onBodyError());
    expect(result.current.url).toBeNull();
    expect(mocks.authorizeOnline).toHaveBeenCalledTimes(2);
  });

  it('does not publish a URL when the fresh authority check denies it', async () => {
    mocks.authorizeOnline.mockRejectedValue(new Error('denied'));
    const { result } = renderHook(() => useProtectedChatMediaUrl(alias));
    await waitFor(() => expect(mocks.authorizeOnline).toHaveBeenCalledTimes(1));
    expect(result.current.url).toBeNull();
  });
});
