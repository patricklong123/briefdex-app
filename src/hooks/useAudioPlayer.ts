import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const unsub = audioService.subscribe(setState);
    return unsub;
  }, []);

  return {
    ...state,
    progress: state.durationSec > 0 ? state.positionSec / state.durationSec : 0,
    load: (e: Episode) => audioService.load(e),
    play: () => audioService.play(),
    pause: () => audioService.pause(),
    toggle: () => audioService.toggle(),
    skipForward: () => audioService.skipForward(15),
    skipBack: () => audioService.skipBack(15),
    seekTo: (sec: number) => audioService.seekTo(sec),
    cycleRate: () => audioService.cycleRate(),
  };
}
