import { Channel } from '../types';

export const CHANNELS: Channel[] = [
  {
    id: 'nz-markets',
    name: 'NZ Markets',
    letter: 'N',
    category: 'Local',
    duration: '5 min',
    description: 'NZX moves, earnings, sectors',
  },
  {
    id: 'macro-rbnz',
    name: 'Macro & RBNZ',
    letter: 'M',
    category: 'Policy',
    duration: '1–4 min',
    description: 'OCR, inflation, Stats NZ data',
  },
  {
    id: 'global-markets',
    name: 'Global Markets',
    letter: 'G',
    category: 'Global',
    duration: '4 min',
    description: 'Wall Street, oil, gold, FX',
  },
  {
    id: 'trans-tasman',
    name: 'Trans-Tasman',
    letter: 'T',
    category: 'Regional',
    duration: '3 min',
    description: 'ASX, RBA, AU economic data',
  },
];
