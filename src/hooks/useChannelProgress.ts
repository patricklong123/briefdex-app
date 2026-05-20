import { useEffect, useState } from 'react';
import { EMPTY_PROGRESS, ProgressEntry, progressService } from '../services/progressService';

export function useChannelProgress(
  channel: string | undefined,
  date: string | undefined,
): ProgressEntry {
  const [entry, setEntry] = useState<ProgressEntry>(() => {
    if (!channel || !date) return EMPTY_PROGRESS;
    return progressService.getCached(channel, date) ?? EMPTY_PROGRESS;
  });

  useEffect(() => {
    if (!channel || !date) {
      setEntry(EMPTY_PROGRESS);
      return;
    }
    let cancelled = false;
    progressService.getProgress(channel, date).then((e) => {
      if (!cancelled) setEntry(e);
    });
    const unsub = progressService.subscribe(channel, date, (e) => {
      if (!cancelled) setEntry(e);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [channel, date]);

  return entry;
}
