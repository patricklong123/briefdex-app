import { useEffect, useState } from 'react';
import { useProgress } from 'react-native-track-player';
import { audioService } from '../services/audioService';
import { Episode, PlaybackRate } from '../types';

export function useAudioPlayer() {
  const [state, setState] = useState({
    episode: null as Episode | null,
    isPlaying: false,
    positionSec: 0,
    durationSec: 0,
    rate: 1.0 as PlaybackRate,
  });
  // Poll TrackPlayer directly so the UI keeps ticking even if the
  // PlaybackProgressUpdated event stream stalls.
  const { position, duration } = useProgress(1000);

  useEffect(() => {
    const unsub = audioService.subscribe(setState);
    return unsub;
  }, []);

  // Mock mode (no audioUrl) leaves TrackPlayer empty, so useProgress reports
  // 0/0 — fall back to the audioService counter which the JS timer drives.
  const hasAudio = !!state.episode?.audioUrl;
  const positionSec = hasAudio ? position : state.positionSec;
  const durationSec = hasAudio
    ? duration || state.durationSec || state.episode?.duration || 0
    : state.durationSec;

  return {
    episode: state.episode,
    isPlaying: state.isPlaying,
    rate: state.rate,
    positionSec,
    durationSec,
    progress: durationSec > 0 ? positionSec / durationSec : 0,
    load: (e: Episode) => audioService.load(e),
    play: () => audioService.play(),
    pause: () => audioService.pause(),
    toggle: () => audioService.toggle(),
    skipForward: (seconds?: number) => audioService.skipForward(seconds),
    skipBack: (seconds?: number) => audioService.skipBack(seconds),
    seekTo: (sec: number) => audioService.seekTo(sec),
    cycleRate: () => audioService.cycleRate(),
  };
}
