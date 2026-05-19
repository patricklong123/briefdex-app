import { Channel, Episode } from '../types';

export const DAILY_WRAP: Episode = {
  id: 'daily-wrap-2026-05-13',
  title: 'The Daily Wrap',
  subtitle: 'Markets before your first coffee.',
  date: new Date(),
  duration: 420,
  channel: 'Daily Wrap',
  audioUrl: '',
  tickerData: 'NZX 13,271 · OCR 2.25% · Brent $100.06',
};

export const CHANNELS: Channel[] = [
  {
    id: 'nz-markets',
    name: 'NZ Markets',
    letter: 'N',
    category: 'Local',
    duration: '5 min',
    description: 'NZX moves, earnings, sectors',
    progress: 0,
  },
  {
    id: 'macro-rbnz',
    name: 'Macro & RBNZ',
    letter: 'M',
    category: 'Policy',
    duration: '1–4 min',
    description: 'OCR, inflation, Stats NZ data',
    progress: 0.6,
  },
  {
    id: 'global-markets',
    name: 'Global Markets',
    letter: 'G',
    category: 'Global',
    duration: '4 min',
    description: 'Wall Street, oil, gold, FX',
    done: true,
    progress: 1,
  },
  {
    id: 'trans-tasman',
    name: 'Trans-Tasman',
    letter: 'T',
    category: 'Regional',
    duration: '3 min',
    description: 'ASX, RBA, AU economic data',
    progress: 0,
  },
];
