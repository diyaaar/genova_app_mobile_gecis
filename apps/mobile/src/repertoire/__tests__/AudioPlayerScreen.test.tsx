import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { RepertoireFile } from '@shared/repertuvar/catalog-core';
import { clearTenantCaches } from '../../auth/tenant-cache';
import { AudioPlaybackProvider, useAudioPlayback } from '../AudioPlaybackProvider';
import { AudioPlayerScreen } from '../AudioPlayerScreen';
import type { NativeAudioSession, NativeAudioTrack } from '../audio-contract';
import type { NativeAudioSourceGateway } from '../audio-source-gateway';

const audioMock = jest.requireMock('expo-audio') as {
  useAudioPlayer: jest.Mock;
  __emitStatus: (event: Record<string, unknown>) => void;
  __mockPlayer: {
    play: jest.Mock;
    pause: jest.Mock;
    replace: jest.Mock;
    seekTo: jest.Mock;
    setPlaybackRate: jest.Mock;
    addListener: jest.Mock;
  };
  __mockStatus: {
    currentTime: number;
    duration: number;
    playing: boolean;
    isBuffering: boolean;
    isLoaded: boolean;
    playbackRate: number;
    error: string | null;
  };
};

function file(id: string, fileName: string): RepertoireFile {
  return {
    id,
    song_id: 'song-a',
    file_name: fileName,
    file_type: 'audio',
    partition_label: '',
    drive_file_id: 'provider-id',
    drive_web_view_link: null,
    drive_download_link: null,
    mime_type: fileName.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg',
    file_size_bytes: 1_000,
    uploaded_by: null,
    created_at: '2026-09-10T10:00:00Z',
    updated_at: '2026-09-10T10:00:00Z',
  };
}

const tracks: NativeAudioTrack[] = [
  { file: file('11111111-1111-4111-8111-111111111111', 'soprano.mp3'), label: 'Soprano', supported: true },
  { file: file('22222222-2222-4222-8222-222222222222', 'alto.wav'), label: 'Alto', supported: true },
  { file: file('33333333-3333-4333-8333-333333333333', 'tenor.ogg'), label: 'Tenor', supported: false },
];

const session: NativeAudioSession = { songId: 'song-a', songTitle: 'Mavi Nota', tracks };

function gateway(open: NativeAudioSourceGateway['open']): NativeAudioSourceGateway & {
  open: jest.Mock;
  clear: jest.Mock;
} {
  return { open: jest.fn(open), clear: jest.fn() };
}

function PlayerHarness({ onBack }: { onBack: () => void }) {
  const playback = useAudioPlayback();
  useEffect(() => { void playback.openSession(session); }, [playback.openSession]);
  return playback.session ? <AudioPlayerScreen onBack={onBack} /> : null;
}

function playerElement(
  source: NativeAudioSourceGateway,
  onBack = jest.fn(),
  probePrivateSource?: (url: string) => Promise<Response>,
) {
  return (
    <AudioPlaybackProvider gateway={source} probePrivateSource={probePrivateSource}>
      <PlayerHarness onBack={onBack} />
    </AudioPlaybackProvider>
  );
}

describe('AudioPlayerScreen', () => {
  beforeEach(() => {
    Object.assign(audioMock.__mockStatus, {
      currentTime: 0,
      duration: 0,
      playing: false,
      isBuffering: false,
      isLoaded: false,
      playbackRate: 1,
      error: null,
    });
    for (const method of Object.values(audioMock.__mockPlayer)) method.mockClear();
    audioMock.useAudioPlayer.mockClear();
  });

  it('masks stale native playing/loaded/buffering ticks after tenant clear', async () => {
    const source = gateway(async () => ({ url: 'https://project.invalid/audio', expiresAt: 9_999_999_999_999 }));
    const observed = { value: null as ReturnType<typeof useAudioPlayback> | null };
    function Observer() {
      const playback = useAudioPlayback(); observed.value = playback;
      useEffect(() => { void playback.openSession(session); }, [playback.openSession]);
      return null;
    }
    const element = () => <AudioPlaybackProvider gateway={source}><Observer /></AudioPlaybackProvider>;
    const view = await render(element());
    await waitFor(() => expect(typeof observed.value?.ticketExpiresAt).toBe('number'));
    Object.assign(audioMock.__mockStatus, { playing: true, isLoaded: true, isBuffering: true, currentTime: 2, duration: 10 });
    await view.rerender(element());
    expect(observed.value?.playing).toBe(true);
    await act(async () => { await clearTenantCaches(); });
    expect(audioMock.__mockPlayer.pause).toHaveBeenCalled();
    expect(observed.value).toMatchObject({ session: null, ticketExpiresAt: null, currentTime: 0, duration: 0,
      playing: false, loaded: false, buffering: false, canControl: false });
    // A late native tick must not restore the old tenant's outward playback state.
    await act(async () => { audioMock.__emitStatus({ playing: true, isLoaded: true, isBuffering: true, currentTime: 3 }); });
    expect(observed.value).toMatchObject({ session: null, playing: false, loaded: false, buffering: false });
  });

  it('loads a protected source and exposes play, seek, rate and track controls', async () => {
    const source = gateway(async (fileId) => ({
      url: `https://project.invalid/audio?fileId=${fileId}`,
      expiresAt: 9_999_999_999_999,
    }));
    const view = await render(playerElement(source));

    await waitFor(() => expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith({
      uri: expect.stringContaining(tracks[0]!.file.id),
      name: 'Soprano',
    }, { updateInterval: 250 }));
    Object.assign(audioMock.__mockStatus, { isLoaded: true, duration: 90, currentTime: 20 });
    await view.rerender(playerElement(source));

    await fireEvent.press(screen.getByTestId('audio-play-pause'));
    expect(audioMock.__mockPlayer.play).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByTestId('audio-forward-10'));
    expect(audioMock.__mockPlayer.seekTo).toHaveBeenCalledWith(30);
    await fireEvent(screen.getByTestId('audio-seek'), 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    });
    expect(audioMock.__mockPlayer.seekTo).toHaveBeenCalledWith(10);
    await fireEvent.press(screen.getByTestId('audio-speed'));
    expect(audioMock.__mockPlayer.setPlaybackRate).toHaveBeenLastCalledWith(1.25);

    await fireEvent.press(screen.getByTestId(`audio-track-${tracks[1]!.file.id}`));
    await waitFor(() => expect(source.open).toHaveBeenLastCalledWith(tracks[1]!.file.id));
    await waitFor(() => expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith({
      uri: expect.stringContaining(tracks[1]!.file.id),
      name: 'Alto',
    }, { updateInterval: 250 }));
    expect(audioMock.__mockPlayer.replace).not.toHaveBeenCalled();
  });

  it('shows denied and unsupported errors and retries with a fresh ticket', async () => {
    const source = gateway(jest.fn()
      .mockRejectedValueOnce(new Error('Bu dosyaya erişim yetkiniz yok.'))
      .mockResolvedValueOnce({ url: 'https://project.invalid/fresh', expiresAt: 9_999_999_999_999 }));
    await render(playerElement(source));

    expect(await screen.findByText('Bu dosyaya erişim yetkiniz yok.')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('audio-retry'));
    await waitFor(() => expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith({
      uri: 'https://project.invalid/fresh',
      name: 'Soprano',
    }, { updateInterval: 250 }));
    expect(source.open).toHaveBeenCalledTimes(2);

    await fireEvent.press(screen.getByTestId(`audio-track-${tracks[2]!.file.id}`));
    expect(await screen.findByText('Bu ses biçimi mobil oynatıcıda desteklenmiyor.')).toBeTruthy();
    expect(screen.queryByTestId('audio-retry')).toBeNull();
    expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith(null, { updateInterval: 250 });
    expect(source.open).toHaveBeenCalledTimes(2);
  });

  it('renews an expired ticket before play and removes the shell session at the tenant boundary', async () => {
    const source = gateway(jest.fn()
      .mockResolvedValueOnce({ url: 'https://project.invalid/expired', expiresAt: 1 })
      .mockResolvedValueOnce({ url: 'https://project.invalid/renewed', expiresAt: 9_999_999_999_999 }));
    const view = await render(playerElement(source));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    Object.assign(audioMock.__mockStatus, { isLoaded: true, duration: 90, currentTime: 35 });
    await view.rerender(playerElement(source));

    await fireEvent.press(screen.getByTestId('audio-play-pause'));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(audioMock.__mockPlayer.seekTo).toHaveBeenCalledWith(35));
    expect(audioMock.__mockPlayer.play).toHaveBeenCalledTimes(1);

    await act(async () => { await clearTenantCaches(); });
    expect(source.clear).toHaveBeenCalledTimes(1);
    expect(audioMock.__mockPlayer.pause).toHaveBeenCalled();
    expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith(null, { updateInterval: 250 });
    expect(audioMock.__mockPlayer.replace).not.toHaveBeenCalled();
    expect(screen.queryByTestId('audio-player-screen')).toBeNull();
  });

  it('invalidates the private source without calling a hook-owned released player on unmount', async () => {
    const source = gateway(async () => ({
      url: 'https://project.invalid/private',
      expiresAt: 9_999_999_999_999,
    }));
    const view = await render(playerElement(source));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    audioMock.__mockPlayer.pause.mockClear();

    await act(async () => { view.unmount(); });

    expect(source.clear).toHaveBeenCalledTimes(1);
    expect(audioMock.__mockPlayer.pause).not.toHaveBeenCalled();
  });

  it('does not pause a source-less player during tenant clear', async () => {
    const source = gateway(() => new Promise(() => {}));
    await render(playerElement(source));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    audioMock.__mockPlayer.pause.mockClear();
    await act(async () => { await clearTenantCaches(); });
    expect(source.clear).toHaveBeenCalledTimes(1);
    expect(audioMock.__mockPlayer.pause).not.toHaveBeenCalled();
  });

  it('surfaces native media errors with a bounded retry action', async () => {
    const source = gateway(async () => ({ url: 'https://project.invalid/corrupt', expiresAt: 9_999_999_999_999 }));
    const probe = jest.fn(async () => new Response(null, { status: 200 }));
    const view = await render(playerElement(source, jest.fn(), probe));
    await waitFor(() => expect(source.open).toHaveBeenCalled());
    Object.assign(audioMock.__mockStatus, { error: 'decoder failed', isLoaded: false });
    await view.rerender(playerElement(source, jest.fn(), probe));
    expect(await screen.findByText('Ses dosyası oynatılamadı. Yeniden deneyin.')).toBeTruthy();
    expect(screen.getByLabelText('Ses dosyasını yeniden yükle')).toBeTruthy();
    expect(source.open).toHaveBeenCalledTimes(1);
  });

  it('renews once after an opaque native body 401 and does not bypass 403', async () => {
    const source = gateway(jest.fn()
      .mockResolvedValueOnce({ url: 'https://project.invalid/old', expiresAt: 9_999_999_999_999 })
      .mockResolvedValueOnce({ url: 'https://project.invalid/fresh', expiresAt: 9_999_999_999_999 }));
    const probe = jest.fn(async () => new Response(null, { status: 401 }));
    const view = await render(playerElement(source, jest.fn(), probe));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    Object.assign(audioMock.__mockStatus, { error: 'body failed', isLoaded: false });
    await view.rerender(playerElement(source, jest.fn(), probe));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(2));
    expect(probe).toHaveBeenCalledWith('https://project.invalid/old');
    Object.assign(audioMock.__mockStatus, { error: null, isLoaded: true });
    await view.rerender(playerElement(source, jest.fn(), probe));
    expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith({
      uri: 'https://project.invalid/fresh', name: 'Soprano',
    }, { updateInterval: 250 });

    const denied = gateway(async () => ({ url: 'https://project.invalid/denied', expiresAt: 9_999_999_999_999 }));
    const deniedProbe = jest.fn(async () => new Response(null, { status: 403 }));
    Object.assign(audioMock.__mockStatus, { error: null, isLoaded: false });
    const deniedView = await render(playerElement(denied, jest.fn(), deniedProbe));
    await waitFor(() => expect(denied.open).toHaveBeenCalledTimes(1));
    Object.assign(audioMock.__mockStatus, { error: 'forbidden' });
    await deniedView.rerender(playerElement(denied, jest.fn(), deniedProbe));
    expect(await screen.findByText('Ses dosyasına erişim yetkisi sona erdi.')).toBeTruthy();
    expect(denied.open).toHaveBeenCalledTimes(1);
    expect(denied.clear).toHaveBeenCalled();
  });

  it('retains a native error event even when the next status tick clears error before render', async () => {
    const source = gateway(jest.fn()
      .mockResolvedValueOnce({ url: 'https://project.invalid/old', expiresAt: 9_999_999_999_999 })
      .mockResolvedValueOnce({ url: 'https://project.invalid/fresh', expiresAt: 9_999_999_999_999 }));
    const probe = jest.fn(async () => new Response(null, { status: 401 }));
    await render(playerElement(source, jest.fn(), probe));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    await act(async () => {
      audioMock.__emitStatus({ error: 'Source error', currentTime: 0, playing: false });
      audioMock.__emitStatus({ error: null, currentTime: 0, playing: false });
    });
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(2));
    expect(probe).toHaveBeenCalledTimes(1);
    expect(probe).toHaveBeenCalledWith('https://project.invalid/old');
  });

  it('fails closed on a transient native 403 without issuing another ticket', async () => {
    const source = gateway(async () => ({
      url: 'https://project.invalid/denied', expiresAt: 9_999_999_999_999,
    }));
    const probe = jest.fn(async () => new Response(null, { status: 403 }));
    await render(playerElement(source, jest.fn(), probe));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    await act(async () => {
      audioMock.__emitStatus({ error: 'Source denied' });
      audioMock.__emitStatus({ error: null });
    });
    expect(await screen.findByText('Ses dosyasına erişim yetkisi sona erdi.')).toBeTruthy();
    expect(source.open).toHaveBeenCalledTimes(1);
    expect(probe).toHaveBeenCalledTimes(1);
    expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith(null, { updateInterval: 250 });
  });

  it('does not resume from an async seek completing after tenant clear', async () => {
    const source = gateway(jest.fn()
      .mockResolvedValueOnce({ url: 'https://project.invalid/expired', expiresAt: 1 })
      .mockResolvedValueOnce({ url: 'https://project.invalid/fresh', expiresAt: 9_999_999_999_999 }));
    const view = await render(playerElement(source));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    Object.assign(audioMock.__mockStatus, { isLoaded: true, duration: 90, currentTime: 35 });
    await view.rerender(playerElement(source));
    let finishSeek!: () => void;
    audioMock.__mockPlayer.seekTo.mockImplementationOnce(() => new Promise<void>(resolve => {
      finishSeek = resolve;
    }));
    await fireEvent.press(screen.getByTestId('audio-play-pause'));
    await waitFor(() => expect(audioMock.__mockPlayer.seekTo).toHaveBeenCalledWith(35));
    await act(async () => { await clearTenantCaches(); });
    await act(async () => { finishSeek(); });
    expect(audioMock.__mockPlayer.play).not.toHaveBeenCalled();
    expect(screen.queryByTestId('audio-player-screen')).toBeNull();
  });

  it('stops after a second native body failure rather than looping new tickets', async () => {
    const source = gateway(jest.fn()
      .mockResolvedValueOnce({ url: 'https://project.invalid/old', expiresAt: 9_999_999_999_999 })
      .mockResolvedValueOnce({ url: 'https://project.invalid/fresh', expiresAt: 9_999_999_999_999 }));
    const probe = jest.fn(async () => new Response(null, { status: 401 }));
    await render(playerElement(source, jest.fn(), probe));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    await act(async () => { audioMock.__emitStatus({ error: 'First body failure' }); });
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(audioMock.useAudioPlayer).toHaveBeenLastCalledWith({
      uri: 'https://project.invalid/fresh', name: 'Soprano',
    }, { updateInterval: 250 }));
    await act(async () => { audioMock.__emitStatus({ error: 'Second body failure' }); });
    expect(await screen.findByText('Ses dosyası oynatılamadı. Yeniden deneyin.')).toBeTruthy();
    expect(source.open).toHaveBeenCalledTimes(2);
    expect(probe).toHaveBeenCalledTimes(1);
  });

  it('ignores a captured old-source native event after tenant clear', async () => {
    const source = gateway(async () => ({
      url: 'https://project.invalid/old', expiresAt: 9_999_999_999_999,
    }));
    const probe = jest.fn(async () => new Response(null, { status: 401 }));
    await render(playerElement(source, jest.fn(), probe));
    await waitFor(() => expect(source.open).toHaveBeenCalledTimes(1));
    const oldListener = audioMock.__mockPlayer.addListener.mock.calls.at(-1)![1];
    await act(async () => { await clearTenantCaches(); });
    await act(async () => { oldListener({ error: 'Late old-source error' }); });
    expect(probe).not.toHaveBeenCalled();
    expect(source.open).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('audio-player-screen')).toBeNull();
  });

  it('turns a missing native error event into a bounded visible load failure', async () => {
    jest.useFakeTimers();
    try {
      const source = gateway(async () => ({ url: 'https://project.invalid/corrupt', expiresAt: 9_999_999_999_999 }));
      await render(playerElement(source));
      await waitFor(() => expect(source.open).toHaveBeenCalled());

      await fireEvent.press(screen.getByTestId('audio-play-pause'));
      await act(async () => { jest.advanceTimersByTime(8_000); });

      expect(await screen.findByText('Ses dosyası oynatılamadı. Yeniden deneyin.')).toBeTruthy();
      expect(audioMock.__mockPlayer.pause).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});
