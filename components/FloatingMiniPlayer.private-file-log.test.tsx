import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMiniAudioPlayerStore } from '@/store/useMiniAudioPlayerStore';
import { getSharedAudioElement } from '@/lib/shared-audio';

vi.mock('next/navigation', () => ({ usePathname: () => '/koristler' }));
import { FloatingMiniPlayer } from './FloatingMiniPlayer';

const marker = 'synthetic-private-ticket-eyJ-test';
const source = `https://synthetic.invalid/audio?ticket=${marker}`;

describe('actual mini-player error-event diagnostics', () => {
  beforeEach(() => {
    useMiniAudioPlayerStore.getState().reset();
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    useMiniAudioPlayerStore.getState().setSession({ songId: marker, songTitle: 'Synthetic', coverSource: null,
      tracks: [{ id: marker, label: 'Synthetic', source }], currentTrackId: marker,
      currentTime: 0, duration: 0, isPlaying: true, playbackRate: 1 });
  });

  it.each([1, 2, 3, 4, 3.5, 999, Infinity, NaN, marker, { token: marker }, null])('emits only whitelisted event/player/code for error code %s', code => {
    const sinks = [vi.spyOn(console, 'error').mockImplementation(() => {}),
      vi.spyOn(console, 'warn').mockImplementation(() => {}), vi.spyOn(console, 'log').mockImplementation(() => {}),
      vi.spyOn(console, 'info').mockImplementation(() => {}), vi.spyOn(console, 'debug').mockImplementation(() => {})];
    const audio = getSharedAudioElement()!;
    Object.defineProperty(audio, 'error', { configurable: true, value: { code, message: `${source} ${marker}` } });
    const { unmount } = render(<FloatingMiniPlayer hasBottomNav={false} />);
    act(() => audio.dispatchEvent(new Event('error')));
    expect(sinks[0]).toHaveBeenCalledWith('[AUDIO_PLAYER_ERROR]', {
      player: 'mini', code: [1, 2, 3, 4].includes(code as number) ? code : null,
    });
    const serialized = JSON.stringify(sinks.flatMap(sink => sink.mock.calls));
    expect(serialized).not.toContain(marker);
    expect(serialized).not.toContain('https://');
    expect(serialized).not.toContain('ticket=');
    expect(useMiniAudioPlayerStore.getState().isPlaying).toBe(false);
    unmount();
  });
});
