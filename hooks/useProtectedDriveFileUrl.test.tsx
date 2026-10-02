import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedFileRequestError } from '@/lib/repertuvar/protected-file-client';

const mocks = vi.hoisted(() => ({
  getUrl: vi.fn(),
  authorizeOnline: vi.fn(),
  getStatus: vi.fn(),
  cacheRuntime: vi.fn(),
  clearCaches: vi.fn(),
  clearUrls: vi.fn(),
}));
vi.mock('@/lib/drive-file-url', () => ({
  clearProtectedDriveFileUrlCache: mocks.clearUrls,
  getOnlineAuthorizedPrivateFileUrl: mocks.authorizeOnline,
  getProtectedRepertoireFileUrl: mocks.getUrl,
  getProtectedAssignmentFileUrl: vi.fn(),
  getProtectedAssignmentReviewFileUrl: vi.fn(),
  getProtectedRepertoireCommentFileUrl: vi.fn(),
  getProtectedDriveFileUrl: mocks.getUrl,
}));
vi.mock('@/lib/repertuvar/offline', () => ({
  buildRuntimeDriveFileVersion: () => 'v1',
  cacheRuntimeDriveFile: mocks.cacheRuntime,
  clearProtectedDriveFileCaches: mocks.clearCaches,
  getOfflineDriveFileUrl: () => '/offline/score.pdf',
  getRuntimeDriveFileCacheStatus: mocks.getStatus,
  isRepertoireRuntimeCacheSupported: () => true,
}));

import { useProtectedDriveFileUrl } from './useProtectedDriveFileUrl';

const file = {
  id: '11111111-1111-4111-8111-111111111111',
  drive_file_id: 'drive-id',
  file_name: 'score.pdf',
  mime_type: 'application/pdf',
};

describe('private file hook authority versus offline cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    mocks.getUrl.mockResolvedValue('https://example.test/fresh-v2');
    mocks.authorizeOnline.mockImplementation((load: () => Promise<string>) => load());
    mocks.getStatus.mockResolvedValue({ cached: true, stale: false });
    mocks.cacheRuntime.mockResolvedValue({ cached: true, stale: false });
    mocks.clearCaches.mockResolvedValue({ removedCount: 1 });
  });

  it('does not bypass online authority with a fresh-looking local PDF', async () => {
    const { result } = renderHook(() => useProtectedDriveFileUrl(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.url).toBe('https://example.test/fresh-v2');
    expect(result.current.isLocal).toBe(false);
    expect(mocks.authorizeOnline).toHaveBeenCalledTimes(1);
    expect(mocks.getStatus).not.toHaveBeenCalled();
  });

  it('also checks non-versioned legacy files before selecting an online local copy', async () => {
    const { result } = renderHook(() => useProtectedDriveFileUrl(file));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.url).toBe('https://example.test/fresh-v2');
    expect(result.current.isLocal).toBe(false);
    expect(mocks.authorizeOnline).toHaveBeenCalledTimes(1);
    expect(mocks.getStatus).not.toHaveBeenCalled();
  });

  it('refuses legacy cached bytes after denial even when cache cleanup fails', async () => {
    mocks.authorizeOnline.mockRejectedValue(new ProtectedFileRequestError('Denied', 403));
    mocks.clearCaches.mockRejectedValue(new Error('Storage unavailable'));
    const { result } = renderHook(() => useProtectedDriveFileUrl(file));
    await waitFor(() => expect(result.current.error).toBe('Denied'));
    expect(result.current.url).toBeNull();
    expect(result.current.isLocal).toBe(false);
    expect(mocks.clearCaches).toHaveBeenCalledTimes(1);
  });

  it('drops a legacy offline copy on reconnect and checks current authority', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const { result } = renderHook(() => useProtectedDriveFileUrl(file));
    await waitFor(() => expect(result.current.url).toBe('/offline/score.pdf'));
    mocks.authorizeOnline.mockRejectedValue(new ProtectedFileRequestError('Revoked', 403));
    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(result.current.error).toBe('Revoked'));
    expect(result.current.url).toBeNull();
    expect(mocks.authorizeOnline).toHaveBeenCalledTimes(1);
  });

  it('hides the old offline source while reconnect authority is still pending', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const { result } = renderHook(() => useProtectedDriveFileUrl(file));
    await waitFor(() => expect(result.current.isLocal).toBe(true));
    let finish!: (url: string) => void;
    mocks.authorizeOnline.mockImplementation(() => new Promise<string>((resolve) => { finish = resolve; }));
    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
      window.dispatchEvent(new Event('online'));
    });
    await waitFor(() => expect(mocks.authorizeOnline).toHaveBeenCalledTimes(1));
    expect(result.current.url).toBeNull();
    await act(async () => { finish('https://example.test/current'); });
    expect(result.current.url).toBe('https://example.test/current');
  });

  it('bounds non-versioned legacy body failure recovery to one attempt', async () => {
    const { result } = renderHook(() => useProtectedDriveFileUrl(file));
    await waitFor(() => expect(result.current.url).toBe('https://example.test/fresh-v2'));
    act(() => result.current.onBodyError());
    await waitFor(() => expect(mocks.authorizeOnline).toHaveBeenCalledTimes(2));
    act(() => result.current.onBodyError());
    expect(result.current.url).toBeNull();
    expect(mocks.authorizeOnline).toHaveBeenCalledTimes(2);
  });

  it('purges private local bytes and refuses fallback after confirmed online denial', async () => {
    mocks.authorizeOnline.mockRejectedValue(new ProtectedFileRequestError('Denied', 403));
    const { result } = renderHook(() => useProtectedDriveFileUrl(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.error).toBe('Denied'));
    expect(result.current.url).toBeNull();
    expect(result.current.isLocal).toBe(false);
    expect(mocks.clearUrls).toHaveBeenCalled();
    expect(mocks.clearCaches).toHaveBeenCalled();
  });

  it('can still show an already-downloaded local PDF while actually offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const { result } = renderHook(() => useProtectedDriveFileUrl(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.url).toBe('/offline/score.pdf');
    expect(result.current.isLocal).toBe(true);
    expect(mocks.authorizeOnline).not.toHaveBeenCalled();
  });

  it('refreshes a failed online body once, then stops', async () => {
    const { result } = renderHook(() => useProtectedDriveFileUrl(file, { repertoireFile: true }));
    await waitFor(() => expect(result.current.url).toBe('https://example.test/fresh-v2'));
    act(() => result.current.onBodyError());
    await waitFor(() => expect(mocks.authorizeOnline).toHaveBeenCalledTimes(2));
    expect(mocks.clearUrls).toHaveBeenCalledTimes(1);
    act(() => result.current.onBodyError());
    expect(result.current.url).toBeNull();
    expect(mocks.authorizeOnline).toHaveBeenCalledTimes(2);
  });
});
