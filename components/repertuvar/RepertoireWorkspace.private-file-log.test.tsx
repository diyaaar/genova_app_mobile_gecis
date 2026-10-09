import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSharedAudioElement } from '@/lib/shared-audio';
import { useMiniAudioPlayerStore } from '@/store/useMiniAudioPlayerStore';
import { useRepertoireWorkspaceStore } from '@/store/useRepertoireWorkspaceStore';
import type { RepertoireSong } from '@/lib/supabase';

const mocks = vi.hoisted(() => ({ bodyError: vi.fn(), toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('react-pdf', () => ({ Document: () => null, Page: () => null, pdfjs: { GlobalWorkerOptions: {}, version: 'synthetic' } }));
vi.mock('@/lib/repertuvar/pdf-worker', () => ({ getRepertoirePdfWorker: () => undefined }));
vi.mock('@/components/repertuvar/AnnotationStage', () => ({ AnnotationStage: () => null }));
vi.mock('@/components/repertuvar/ChefCommentSection', () => ({ ChefCommentSection: () => null }));
vi.mock('@/components/ToastProvider', () => ({ useToast: () => mocks.toast }));
vi.mock('@/hooks/useProtectedDriveFileUrl', () => ({ useProtectedDriveFileUrl: (file: { drive_file_id: string } | null) => ({
  url: file ? 'https://synthetic.invalid/audio?ticket=synthetic-private-ticket-eyJ-test' : null,
  isStaleLocal: false, onBodyError: mocks.bodyError,
}) }));
vi.mock('@/lib/drive-file-url', () => ({ getOnlineAuthorizedPrivateFileUrl: vi.fn(), getProtectedRepertoireFileUrl: vi.fn() }));
vi.mock('@/lib/repertuvar/annotations', () => ({ loadAnnotationReadResultForFile: vi.fn() }));
vi.mock('@/lib/repertuvar/annotation-save-runtime', () => ({ annotationSaveQueue: {
  subscribe: () => () => {}, getOwnerStatus: () => ({}), hasUnresolved: () => false,
  getContextSnapshot: () => null, isOwnerExiting: () => false,
} }));
import { RepertoireWorkspace } from './RepertoireWorkspace';

const marker = 'synthetic-private-ticket-eyJ-test';
const source = `https://synthetic.invalid/audio?ticket=${marker}`;
// The PDF renderer/annotation backend are outside this audio-event test. The
// actual workspace, AudioPanel effects, media event and stores remain unmocked.
const song = { id: marker, title: 'Synthetic', files: [{ id: marker, drive_file_id: 'synthetic-drive',
  file_name: 'synthetic.mp3', mime_type: 'audio/mpeg', file_type: 'audio', sort_order: 0 }] } as unknown as RepertoireSong;

describe('actual workspace audio error-event diagnostics', () => {
  beforeEach(() => {
    useMiniAudioPlayerStore.getState().reset();
    useRepertoireWorkspaceStore.getState().reset();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  it.each([1, 2, 3, 4, 3.5, 999, Infinity, NaN, marker, { token: marker }, null])('emits only whitelisted event/player/code for error code %s', code => {
    const sinks = [vi.spyOn(console, 'error').mockImplementation(() => {}),
      vi.spyOn(console, 'warn').mockImplementation(() => {}), vi.spyOn(console, 'log').mockImplementation(() => {}),
      vi.spyOn(console, 'info').mockImplementation(() => {}), vi.spyOn(console, 'debug').mockImplementation(() => {})];
    const audio = getSharedAudioElement()!;
    Object.defineProperty(audio, 'error', { configurable: true, value: { code, message: `${source} ${marker}` } });
    const { unmount } = render(<RepertoireWorkspace song={song} memberId={null} voiceGroup={null} isChef={false} isSectionLeader={false} />);
    act(() => audio.dispatchEvent(new Event('error')));
    expect(sinks[0]).toHaveBeenCalledWith('[AUDIO_PLAYER_ERROR]', {
      player: 'workspace', code: [1, 2, 3, 4].includes(code as number) ? code : null,
    });
    const serialized = JSON.stringify(sinks.flatMap(sink => sink.mock.calls));
    expect(serialized).not.toContain(marker);
    expect(serialized).not.toContain('https://');
    expect(serialized).not.toContain('ticket=');
    expect(mocks.bodyError).toHaveBeenCalled();
    expect(useMiniAudioPlayerStore.getState().isPlaying).toBe(false);
    unmount();
  });
});
