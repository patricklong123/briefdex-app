import { useEffect, useState } from 'react';
import { EMPTY_STATS, Stats, statsService } from '../services/statsService';

export function useStats(): Stats {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  useEffect(() => statsService.subscribe(setStats), []);
  return stats;
}
