import { useEffect, useState } from 'react';
import { useProgress } from 'react-native-track-player';
import { audioService } from '../services/audioService';
import { EMPTY_PROGRESS, ProgressEntry, progressService } from '../services/progressService';
import { Episode } from '../types';

export function useChannelProgress(
  channel: string | undefined,
  date: string | undefined,
): ProgressEntry {
  const [persisted, setPersisted] = useState<ProgressEntry>(() => {
    if (!channel || !date) return EMPTY_PROGRESS;
    return progressService.getCached(channel, date) ?? EMPTY_PROGRESS;
  });
  const [loadedEpisode, setLoadedEpisode] = useState<Episode | null>(
    audioService.currentEpisode,
  );
  const [mockSnapshot, setMockSnapshot] = useState<{
    positionSec: number;
    durationSec: number;
  } | null>(null);
  // Polls TrackPlayer for live playback position. Returns 0/0 when nothing is
  // loaded (e.g. mock-mode episodes with no audioUrl).
  const { position, duration } = useProgress(1000);

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

  // Keep the currently-loaded episode (and mock-mode position) in sync so we
  // know when the live progress reading applies to *this* channel/date.
  useEffect(() => {
    return audioService.subscribe((s) => {
      setLoadedEpisode(s.episode);
      if (s.episode && !s.episode.audioUrl) {
        setMockSnapshot({ positionSec: s.positionSec, durationSec: s.durationSec });
      } else {
        setMockSnapshot(null);
      }
    });
  }, []);

  const isCurrent =
    !!loadedEpisode &&
    loadedEpisode.channel === channel &&
    loadedEpisode.dateKey === date;

  if (isCurrent && !persisted.complete) {
    const hasAudio = !!loadedEpisode!.audioUrl;
    const livePos = hasAudio ? position : mockSnapshot?.positionSec ?? 0;
    const liveDur = hasAudio
      ? duration || loadedEpisode!.duration || persisted.durationSeconds
      : mockSnapshot?.durationSec || loadedEpisode!.duration || persisted.durationSeconds;
    const pct = liveDur > 0 ? Math.min(1, livePos / liveDur) : 0;
    return {
      positionSeconds: livePos,
      durationSeconds: liveDur,
      percentComplete: pct,
      complete: false,
      updatedAt: persisted.updatedAt,
    };
  }
  return persisted;
}
