import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ rpc: vi.fn(), access: vi.fn(), from: vi.fn(), insert: vi.fn(), read: vi.fn(), upload: vi.fn() }));
const choirId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
vi.mock('./AuthProvider', () => ({ useAuth: () => ({
  member: { id: 'user-a', choir_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
  activeChoir: { choir_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
}) }));
vi.mock('@/store/useMiniAudioPlayerStore', () => ({
  useMiniAudioPlayerStore: (selector: (state: { isActive: boolean }) => unknown) => selector({ isActive: false }),
}));
vi.mock('./LottieIcon', () => ({ LottieIcon: () => null }));
vi.mock('@/lib/drive', () => ({ initSongFolder: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabase: { rpc: mock.rpc, from: mock.from } }));
vi.mock('@/lib/web-auth-capability', () => ({ requireCurrentWebAccess: mock.access }));
vi.mock('@/lib/repertuvar/upload', () => ({
  isPrivateRepertoireUploadEnabled: () => true,
  uploadPrivateRepertoireFile: mock.upload, REPERTOIRE_UPLOAD_MAX_BYTES: 104857600,
}));
import { AddSongModal } from './AddSongModal';
import { loadPendingRepertoireSong } from '@/lib/repertuvar/create-song';

beforeEach(() => {
  vi.resetAllMocks();
  sessionStorage.clear();
  mock.rpc.mockResolvedValue({ data: choirId, error: null });
  mock.access.mockResolvedValue({ userId: 'user-a', accessToken: 'token-a' });
  mock.from.mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: mock.read }) }), insert: mock.insert });
  mock.read.mockResolvedValue({ data: null, error: null });
  mock.insert.mockResolvedValue({ error: null });
  mock.upload.mockResolvedValue({ id: 'file-a' });
});
async function fill() {
  const title = screen.getByLabelText('Şarkı Adı *');
  await waitFor(() => expect(title).toBeEnabled());
  fireEvent.change(title, { target: { value: 'First song' } });
  fireEvent.change(screen.getByLabelText('Besteci'), { target: { value: 'Composer' } });
  fireEvent.change(screen.getByLabelText('İlk PDF veya ses dosyası *'), {
    target: { files: [new File(['synthetic'], 'score.pdf', { type: 'application/pdf' })] },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Şarkı Ekle' }));
  return title;
}
describe('private song recovery in the actual form and service', () => {
  it('lets the user correct a rejected title and successfully submit without closing the form', async () => {
    mock.insert.mockResolvedValueOnce({ error: { code: '23505', message: 'Duplicate' } });
    const onSuccess = vi.fn();
    render(<AddSongModal isOpen onClose={vi.fn()} onSuccess={onSuccess} />);
    const title = await fill();
    await screen.findByText('Bu şarkı kaydı zaten mevcut. Şarkı adını kontrol edip tekrar deneyin.');
    expect(title).toBeEnabled();
    expect(screen.getByLabelText('Besteci')).toBeEnabled();
    expect(await loadPendingRepertoireSong()).toBeNull();
    fireEvent.change(title, { target: { value: 'Corrected song' } });
    fireEvent.click(screen.getByRole('button', { name: 'Şarkı Ekle' }));
    await screen.findByText('Şarkı eklendi!');
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(mock.insert.mock.calls[1][0].title).toBe('Corrected song');
  });
  it.each(['insert', 'upload'])('locks uncertain %s metadata immediately and resumes the same draft on reopening', async failure => {
    if (failure === 'insert') mock.insert.mockResolvedValueOnce({ error: { message: 'Response lost' } });
    else mock.upload.mockRejectedValueOnce(new Error('Response lost'));
    const view = render(<AddSongModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);
    const title = await fill();
    await screen.findByText(/Bekleyen yüklemeyi tamamlamak için/);
    expect(title).toBeDisabled();
    expect(screen.getByLabelText('Besteci')).toBeDisabled();
    const draft = await loadPendingRepertoireSong();
    expect(draft?.title).toBe('First song');
    fireEvent.click(screen.getByRole('button', { name: 'Kapat' }));
    view.unmount();
    render(<AddSongModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);
    await screen.findByDisplayValue('First song');
    expect(screen.getByLabelText('Şarkı Adı *')).toBeDisabled();
    expect(await loadPendingRepertoireSong()).toEqual(draft);
    expect(mock.insert).toHaveBeenCalledOnce();
  });
});
