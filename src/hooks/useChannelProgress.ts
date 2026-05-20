import { useEffect, useState } from 'react';
import { audioService } from '../services/audioService';
import { EMPTY_PROGRESS, ProgressEntry, progressService } from '../services/progressService';

interface LiveSnapshot {
  positionSec: number;
  durationSec: number;
}

export function useChannelProgress(
  channel: string | undefined,
  date: string | undefined,
): ProgressEntry {
  const [persisted, setPersisted] = useState<ProgressEntry>(() => {
    if (!channel || !date) return EMPTY_PROGRESS;
    return progressService.getCached(channel, date) ?? EMPTY_PROGRESS;
  });
  const [live, setLive] = useState<LiveSnapshot | null>(null);

  useEffect(() => {
    if (!channel || !date) {
      setPersisted(EMPTY_PROGRESS);
      return;
    }
    let cancelled = false;
    progressService.getProgress(channel, date).then((e) => {
      if (!cancelled) setPersisted(e);
    });
    const unsub = progressService.subscribe(channel, date, (e) => {
      if (!cancelled) setPersisted(e);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [channel, date]);

  // While audioService is playing the matching episode it emits ~once per
  // second; mirror that into local state so the bar can update between the
  // 5-second progressService saves.
  useEffect(() => {
    if (!channel || !date) {
      setLive(null);
      return;
    }
    const unsub = audioService.subscribe((s) => {
      if (s.episode?.channel === channel && s.episode.dateKey === date) {
        setLive({ positionSec: s.positionSec, durationSec: s.durationSec });
      } else {
        setLive(null);
      }
    });
    return unsub;
  }, [channel, date]);

  if (live && !persisted.complete) {
    const duration = live.durationSec || persisted.durationSeconds;
    const percent = duration > 0 ? Math.min(1, live.positionSec / duration) : 0;
    return {
      positionSeconds: live.positionSec,
      durationSeconds: duration,
      percentComplete: percent,
      complete: false,
      updatedAt: persisted.updatedAt,
    };
  }
  return persisted;
}
