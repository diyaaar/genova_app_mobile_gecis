// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => ({ rpc: vi.fn(), access: vi.fn(), from: vi.fn(), select: vi.fn(), eq: vi.fn(), single: vi.fn(), insert: vi.fn(), upload: vi.fn() }));
vi.mock('../supabase', () => ({ supabase: { rpc: mock.rpc, from: mock.from } }));
vi.mock('../web-auth-capability', () => ({ requireCurrentWebAccess: mock.access }));
vi.mock('./upload', () => ({ uploadPrivateRepertoireFile: mock.upload, REPERTOIRE_UPLOAD_MAX_BYTES: 104857600 }));
import { createLegacyRepertoireSong, createPrivateRepertoireSong, loadPendingRepertoireSong } from './create-song';

const file = () => new File(['%PDF-1.4\nsynthetic'], 'score.pdf', { type: 'application/pdf' });
const choirA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const choirB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let savedRow: { id: string; title: string; choir_id: string; composer: string | null } | null;
beforeEach(() => {
  vi.resetAllMocks(); savedRow = null;
  const values = new Map<string, string>();
  vi.stubGlobal('sessionStorage', { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
  mock.access.mockResolvedValue({ userId: 'user-a', accessToken: 'token-a' });
  mock.rpc.mockResolvedValue({ data: choirA, error: null });
  mock.from.mockReturnValue({ select: mock.select, insert: mock.insert });
  mock.select.mockReturnValue({ eq: mock.eq }); mock.eq.mockReturnValue({ maybeSingle: mock.single });
  mock.single.mockImplementation(async () => ({ data: savedRow, error: null }));
  mock.insert.mockImplementation(async row => { savedRow = row; return { error: null }; });
  mock.upload.mockResolvedValue({ id: 'file-a' });
});
describe('new song with first private file', () => {
  it.each(['23505', '23502', '23503', '23514', '42501'])('allows correction after a fresh insert is rejected with %s', async code => {
    mock.insert.mockResolvedValueOnce({ error: { code, message: 'Rejected' } });
    await expect(createPrivateRepertoireSong('Rejected song', '', file(), choirA)).rejects.toThrow();
    expect(await loadPendingRepertoireSong()).toBeNull();
    expect(mock.upload).not.toHaveBeenCalled();
    await createPrivateRepertoireSong('Corrected song', '', file(), choirA);
    expect(savedRow?.title).toBe('Corrected song');
  });
  it('preserves an older uncertain draft even if a later insert is definitively rejected', async () => {
    mock.insert.mockResolvedValueOnce({ error: { message: 'Response lost' } });
    await expect(createPrivateRepertoireSong('Uncertain', '', file(), choirA)).rejects.toThrow();
    const draft = await loadPendingRepertoireSong();
    mock.insert.mockResolvedValueOnce({ error: { code: '42501', message: 'Denied' } });
    await expect(createPrivateRepertoireSong('Uncertain', '', file(), choirA)).rejects.toThrow();
    expect(await loadPendingRepertoireSong()).toEqual(draft);
  });
  it('rejects concurrent submission before a second insert and releases the guard after failure', async () => {
    let rejectUpload!: (reason: Error) => void;
    mock.upload.mockImplementationOnce(() => new Promise((_, reject) => { rejectUpload = reject; }));
    const first = createPrivateRepertoireSong('New song', '', file(), choirA);
    const firstRejected = expect(first).rejects.toThrow('Response lost');
    await vi.waitFor(() => expect(mock.upload).toHaveBeenCalledOnce());
    await expect(createPrivateRepertoireSong('New song', '', file(), choirA)).rejects.toThrow('devam ediyor');
    expect(mock.upload).toHaveBeenCalledOnce();
    rejectUpload(new Error('Response lost'));
    await firstRejected;
    await createPrivateRepertoireSong('New song', '', file(), choirA);
    expect(mock.insert).toHaveBeenCalledOnce();
    expect(await loadPendingRepertoireSong()).toBeNull();
  });
  it('creates a provider-neutral song and clears its draft only after file acceptance', async () => {
    await createPrivateRepertoireSong(' New song ', ' Composer ', file(), choirA);
    expect(mock.insert).toHaveBeenCalledWith(expect.objectContaining({ title: 'New song', composer: 'Composer', choir_id: choirA }));
    expect(mock.insert.mock.calls[0][0]).not.toHaveProperty('drive_folder_id');
    expect(mock.upload).toHaveBeenCalledWith(expect.objectContaining({ songId: savedRow?.id, fileType: 'sheet' }));
    expect(await loadPendingRepertoireSong()).toBeNull();
  });
  it('preserves row and retry identity after response loss and a reselected File', async () => {
    mock.upload.mockRejectedValueOnce(new Error('Response lost'));
    await expect(createPrivateRepertoireSong('New song', '', file(), choirA)).rejects.toThrow('Response lost');
    const draft = await loadPendingRepertoireSong(); expect(draft?.fileName).toBe('score.pdf');
    await createPrivateRepertoireSong('New song', '', file(), choirA);
    expect(mock.insert).toHaveBeenCalledTimes(1);
    expect(mock.upload.mock.calls[1][0].retryKey).toBe(mock.upload.mock.calls[0][0].retryKey);
    expect(await loadPendingRepertoireSong()).toBeNull();
  });
  it('keeps draft state on an ambiguous row insert and does not duplicate it on retry', async () => {
    mock.insert.mockImplementationOnce(async row => { savedRow = row; return { error: { message: 'Response lost' } }; });
    await expect(createPrivateRepertoireSong('New song', '', file(), choirA)).rejects.toThrow('Şarkı kaydı doğrulanamadı');
    expect(mock.upload).not.toHaveBeenCalled();
    await createPrivateRepertoireSong('New song', '', file(), choirA);
    expect(mock.insert).toHaveBeenCalledTimes(1);
    expect(mock.upload.mock.calls[0][0].songId).toBe(savedRow?.id);
  });
  it('does not reuse another choir draft and refuses replacing a pending song implicitly', async () => {
    mock.upload.mockRejectedValueOnce(new Error('Uncertain'));
    await expect(createPrivateRepertoireSong('First', '', file(), choirA)).rejects.toThrow();
    await expect(createPrivateRepertoireSong('Different', '', file(), choirA)).rejects.toThrow('Önce bekleyen');
    mock.rpc.mockResolvedValue({ data: choirB, error: null });
    expect(await loadPendingRepertoireSong()).toBeNull();
  });
  it('refuses an old A form under B before creating a private draft or row', async () => {
    mock.rpc.mockResolvedValue({ data: choirB, error: null });
    await expect(createPrivateRepertoireSong('A form song', '', file(), choirA)).rejects.toThrow('Koro seçimi değişti');
    expect(mock.insert).not.toHaveBeenCalled();
    expect(mock.upload).not.toHaveBeenCalled();
  });
  it('refuses an old A legacy form under B before a database insert', async () => {
    mock.rpc.mockResolvedValue({ data: choirB, error: null });
    await expect(createLegacyRepertoireSong('A form song', '', choirA)).rejects.toThrow('Koro seçimi değişti');
    expect(mock.insert).not.toHaveBeenCalled();
  });
  it('uses explicit A tenant for a same-choir legacy song insert', async () => {
    mock.insert.mockReturnValue({ select: () => ({ single: () => Promise.resolve({
      data: { id: 'song-a', title: 'A song' }, error: null,
    }) }) });
    await expect(createLegacyRepertoireSong(' A song ', '', choirA)).resolves.toEqual({ id: 'song-a', title: 'A song' });
    expect(mock.insert).toHaveBeenCalledWith({ choir_id: choirA, title: 'A song', composer: null, is_visible: true });
  });
});
