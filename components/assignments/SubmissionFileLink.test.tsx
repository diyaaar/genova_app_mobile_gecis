import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProtectedFileRequestError } from '@/lib/repertuvar/protected-file-client';

const mocks = vi.hoisted(() => ({
  auth: { user: { id: 'user-a' }, member: { id: 'member-a' }, activeChoir: { choir_id: 'choir-a' },
    isLoading: false, isSwitchingChoir: false },
  assignment: vi.fn(), drive: vi.fn(), authorize: vi.fn(), clear: vi.fn(), cacheStatus: vi.fn(),
}));
vi.mock('@/components/AuthProvider', () => ({ useAuth: () => mocks.auth }));
vi.mock('@/lib/drive-file-url', () => ({
  getProtectedAssignmentFileUrl: mocks.assignment,
  getProtectedDriveFileUrl: mocks.drive,
  getOnlineAuthorizedPrivateFileUrl: mocks.authorize,
  clearProtectedDriveFileUrlCache: mocks.clear,
  getProtectedRepertoireFileUrl: vi.fn(), getProtectedAssignmentReviewFileUrl: vi.fn(),
  getProtectedRepertoireCommentFileUrl: vi.fn(),
}));
vi.mock('@/lib/repertuvar/offline', () => ({
  buildRuntimeDriveFileVersion: () => 'version', getOfflineDriveFileUrl: () => '/cached-old-file',
  isRepertoireRuntimeCacheSupported: () => true,
  getRuntimeDriveFileCacheStatus: mocks.cacheStatus,
  cacheRuntimeDriveFile: vi.fn().mockResolvedValue(undefined),
  clearProtectedDriveFileCaches: vi.fn().mockResolvedValue(undefined),
}));
import { SubmissionFileLink } from './SubmissionFileLink';

const versionA = '11111111-1111-4111-8111-111111111111';
const versionB = '22222222-2222-4222-8222-222222222222';
const submission = { current_file_version_id: versionA, drive_file_id: 'old-drive-id',
  drive_web_view_link: 'https://drive.google.com/old-file', file_name: 'recording.wav', mime_type: 'audio/wav' };
const link = (value: Omit<typeof submission, 'current_file_version_id'> & { current_file_version_id?: string } = submission) =>
  <SubmissionFileLink submission={value} className="file">Dosyayı Aç</SubmissionFileLink>;

describe('submission version-first link with the real private-file hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.user.id = 'user-a'; mocks.auth.member.id = 'member-a';
    mocks.auth.activeChoir.choir_id = 'choir-a';
    mocks.auth.isLoading = false; mocks.auth.isSwitchingChoir = false;
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    mocks.assignment.mockResolvedValue('https://files.example.invalid/current');
    mocks.drive.mockResolvedValue('https://files.example.invalid/legacy');
    mocks.authorize.mockImplementation((load: () => Promise<string>) => load());
    mocks.cacheStatus.mockResolvedValue({ cached: true, stale: false });
  });

  it('selects the immutable version over a stale Drive URL and retains bridge metadata', async () => {
    render(link());
    const anchor = await screen.findByRole('link');
    expect(anchor).toHaveAttribute('href', 'https://files.example.invalid/current');
    expect(anchor).toHaveAttribute('data-genova-file-name', 'recording.wav');
    expect(anchor).toHaveAttribute('data-genova-mime-type', 'audio/wav');
    expect(mocks.assignment).toHaveBeenCalledWith(versionA, { file_name: 'recording.wav', mime_type: 'audio/wav' });
    expect(mocks.authorize).toHaveBeenCalledTimes(1);
    expect(mocks.drive).not.toHaveBeenCalled();
  });

  it('reads a version even without any legacy Drive ID', async () => {
    render(link({ ...submission, drive_file_id: '', drive_web_view_link: '' }));
    expect(await screen.findByRole('link')).toHaveAttribute('href', 'https://files.example.invalid/current');
    expect(mocks.assignment).toHaveBeenCalledTimes(1);
  });

  it.each([401, 403, 500])('does not fall back to Drive or cached bytes after online %s', async (status) => {
    mocks.authorize.mockRejectedValue(new ProtectedFileRequestError('Denied', status));
    render(link());
    await screen.findByText('Dosyaya erişilemiyor.');
    expect(screen.queryByRole('link')).toBeNull();
    expect(mocks.drive).not.toHaveBeenCalled();
  });

  it.each(['', 'not-a-version'])('fails closed for malformed pointer %j', (pointer) => {
    render(link({ ...submission, current_file_version_id: pointer }));
    expect(screen.getByText('Dosyaya erişilemiyor.')).toBeVisible();
    expect(screen.queryByRole('link')).toBeNull();
    expect(mocks.assignment).not.toHaveBeenCalled();
    expect(mocks.drive).not.toHaveBeenCalled();
  });

  it('keeps legacy-only Drive compatibility without unnecessary protected requests', () => {
    render(link({ ...submission, current_file_version_id: undefined }));
    expect(screen.getByRole('link')).toHaveAttribute('href', submission.drive_web_view_link);
    expect(mocks.assignment).not.toHaveBeenCalled();
    expect(mocks.drive).not.toHaveBeenCalled();
  });

  it('retains protected legacy reads when no Drive web link exists', async () => {
    mocks.cacheStatus.mockResolvedValue({ cached: false, stale: false });
    render(link({ ...submission, current_file_version_id: undefined, drive_web_view_link: '' }));
    expect(await screen.findByRole('link')).toHaveAttribute('href', 'https://files.example.invalid/legacy');
    expect(mocks.assignment).not.toHaveBeenCalled();
  });

  it('removes the old link immediately on version replacement and ignores late completion', async () => {
    let finishOld!: (url: string) => void;
    mocks.assignment.mockImplementationOnce(() => new Promise<string>((resolve) => { finishOld = resolve; }));
    const view = render(link());
    await waitFor(() => expect(mocks.assignment).toHaveBeenCalledTimes(1));
    view.rerender(link({ ...submission, current_file_version_id: versionB }));
    expect(screen.queryByRole('link')).toBeNull();
    expect(await screen.findByRole('link')).toHaveAttribute('href', 'https://files.example.invalid/current');
    await act(async () => finishOld('https://files.example.invalid/old'));
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://files.example.invalid/current');
  });

  it('does not retain a resolved link while the replacement version is pending', async () => {
    const view = render(link());
    await screen.findByRole('link');
    mocks.assignment.mockImplementation(() => new Promise(() => {}));
    view.rerender(link({ ...submission, current_file_version_id: versionB }));
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Dosya hazırlanıyor...')).toBeVisible();
  });

  it('tears down on choir switch and cannot publish an old identity request', async () => {
    let finishOld!: (url: string) => void;
    mocks.assignment.mockImplementationOnce(() => new Promise<string>((resolve) => { finishOld = resolve; }));
    const view = render(link());
    await waitFor(() => expect(mocks.assignment).toHaveBeenCalledTimes(1));
    mocks.auth.isSwitchingChoir = true;
    view.rerender(link());
    expect(screen.queryByRole('link')).toBeNull();
    mocks.auth.isSwitchingChoir = false; mocks.auth.activeChoir.choir_id = 'choir-b';
    mocks.authorize.mockRejectedValue(new ProtectedFileRequestError('Denied', 403));
    view.rerender(link());
    await screen.findByText('Dosyaya erişilemiyor.');
    await act(async () => finishOld('https://files.example.invalid/old-choir'));
    expect(screen.queryByRole('link')).toBeNull();
  });
});
