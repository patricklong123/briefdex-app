import { Episode } from '../types';

const API_BASE = 'https://briefdex-api.onrender.com';

interface ApiEpisode {
  id: number;
  title: string;
  channel: string;
  audioUrl: string;
  durationSeconds: number;
  wordCount: number;
  date: string;
  publishedAt: string;
}

function cleanTitle(title: string): string {
  // The API currently returns "Briefdex Finance Daily Wrap" for the Daily Wrap
  // channel — strip the "Finance" word so the cover/hero reads "Briefdex Daily Wrap".
  return title.replace(/\bBriefdex Finance\b/g, 'Briefdex').replace(/\s+/g, ' ').trim();
}

function mapEpisode(api: ApiEpisode): Episode {
  return {
    id: `${api.channel}-${api.date}`,
    title: cleanTitle(api.title),
    subtitle: 'Markets before your first coffee.',
    date: new Date(api.publishedAt),
    duration: api.durationSeconds,
    channel: api.channel,
    audioUrl: api.audioUrl,
    tickerData: 'NZX 13,271 · OCR 2.25% · Brent $100.06',
  };
}

export async function fetchLatestEpisode(channel?: string): Promise<Episode> {
  const url = channel
    ? `${API_BASE}/api/episodes/latest?channel=${encodeURIComponent(channel)}`
    : `${API_BASE}/api/episodes/latest`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch latest episode (${res.status})`);
  }
  const data = (await res.json()) as ApiEpisode;
  return mapEpisode(data);
}
