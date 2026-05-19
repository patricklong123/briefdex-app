// Briefdex design tokens — single source of truth for all styling.
// Never hardcode colors or fonts in components — always import from here.

export const colors = {
  // Green scale (backgrounds)
  g950: '#050d08',
  g900: '#0a1a10',
  g850: '#132418',
  g800: '#1a3a28',
  g700: '#1e4a2f',
  g600: '#2d6a42',
  g500: '#3d8a55',
  g200: '#a8d4b4',
  g100: '#d4e8d8',
  // Gold scale (accents)
  gold: '#c9a84c',
  goldLight: '#d4b86a',
  goldSoft: '#e8d4a0',
  cream: '#f5edd8',
  // Neutrals
  white: '#ffffff',
  black: '#0a0a0a',
  // Semantic
  red: '#e85c5c',
  redSoft: '#f08080',
  blue: '#5c9ee0',
  // Opacity variants
  textDim: 'rgba(255,255,255,0.5)',
  textFaint: 'rgba(255,255,255,0.3)',
  textGhost: 'rgba(255,255,255,0.2)',
  line: 'rgba(255,255,255,0.08)',
  // Gold opacity variants
  goldFaint: 'rgba(201,168,76,0.12)',
  goldBorder: 'rgba(201,168,76,0.25)',
  goldGlow: 'rgba(201,168,76,0.4)',
  goldSubtle: 'rgba(201,168,76,0.08)',
};

export const fonts = {
  heading: 'PlayfairDisplay_700Bold',
  headingBlack: 'PlayfairDisplay_900Black',
  headingItalic: 'PlayfairDisplay_400Regular_Italic',
  headingRegular: 'PlayfairDisplay_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_700Bold',
  bodyLight: 'DMSans_400Regular',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  xxxxl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  xxl: 22,
  pill: 20,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
  },
  goldGlow: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 8,
  },
  goldButton: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export type ChannelKey =
  | 'daily-wrap'
  | 'nz-markets'
  | 'macro-rbnz'
  | 'global-markets'
  | 'trans-tasman';

export interface ChannelTheme {
  /** Value sent as ?channel=... when fetching the episode. */
  apiChannel: string;
  /** Three-stop cover gradient (top-left → bottom-right). */
  gradient: [string, string, string];
  /** Primary accent (badges, time, controls). */
  accent: string;
  accentLight: string;
  /** Pill / chip background tint of the accent. */
  accentFaint: string;
  /** Border tint of the accent. */
  accentBorder: string;
  /** Shadow / glow color for the play button. */
  accentGlow: string;
  /** Dark ink color drawn on the accent button (play / pause). */
  accentInk: string;
  /** Decorative top-right cover overlay. */
  overlayTopRight: string;
  /** Decorative bottom-left cover overlay. */
  overlayBottomLeft: string;
  /** Single-letter brand glyph (matches the home tile). */
  letter: string;
  /** Pill badge text inside the cover. */
  badgeText: string;
  /** Italic eyebrow above the tagline. */
  italicTitle: string;
  /** Big bold title — the channel's tagline. */
  tagline: string;
  /** Static meta line (e.g. "LOCAL · 5 MIN"). When omitted, the cover renders the episode date + duration. */
  eyebrowText?: string;
  /** Secondary line under "NOW PLAYING" in the top bar. */
  channelLabel: string;
}

export const CHANNEL_THEMES: Record<ChannelKey, ChannelTheme> = {
  'daily-wrap': {
    apiChannel: 'daily-wrap',
    gradient: [colors.g800, colors.g700, colors.g850],
    accent: colors.gold,
    accentLight: colors.goldLight,
    accentFaint: colors.goldFaint,
    accentBorder: colors.goldBorder,
    accentGlow: colors.goldGlow,
    accentInk: '#1a1407',
    overlayTopRight: 'rgba(201,168,76,0.28)',
    overlayBottomLeft: 'rgba(45,106,66,0.4)',
    letter: 'D',
    badgeText: "TODAY'S BRIEFING",
    italicTitle: 'The Daily Wrap',
    tagline: 'Markets before your first coffee.',
    channelLabel: 'From All channels',
  },
  'nz-markets': {
    apiChannel: 'nz-markets',
    gradient: ['#0a1428', '#142038', '#1a2a4a'],
    accent: '#c9a84c',
    accentLight: '#d8b860',
    accentFaint: 'rgba(201,168,76,0.12)',
    accentBorder: 'rgba(201,168,76,0.32)',
    accentGlow: 'rgba(201,168,76,0.45)',
    accentInk: '#1a1407',
    overlayTopRight: 'rgba(201,168,76,0.26)',
    overlayBottomLeft: 'rgba(20,40,80,0.5)',
    letter: 'N',
    badgeText: 'NZ MARKETS',
    italicTitle: 'NZ Markets',
    tagline: 'The full picture on the NZX.',
    eyebrowText: 'LOCAL · 5 MIN',
    channelLabel: 'From NZ Markets',
  },
  'macro-rbnz': {
    apiChannel: 'macro-rbnz',
    gradient: ['#0a1a10', '#0c2017', '#0d2218'],
    accent: '#4a9e8a',
    accentLight: '#62b29e',
    accentFaint: 'rgba(74,158,138,0.14)',
    accentBorder: 'rgba(74,158,138,0.32)',
    accentGlow: 'rgba(74,158,138,0.45)',
    accentInk: '#08221c',
    overlayTopRight: 'rgba(74,158,138,0.28)',
    overlayBottomLeft: 'rgba(13,34,24,0.55)',
    letter: 'M',
    badgeText: 'MACRO & RBNZ',
    italicTitle: 'Macro & RBNZ',
    tagline: 'The OCR, inflation, and what the RBNZ is watching.',
    eyebrowText: 'POLICY · 1–4 MIN',
    channelLabel: 'From Macro & RBNZ',
  },
  'global-markets': {
    apiChannel: 'global-markets',
    gradient: ['#0f0f1a', '#151524', '#1a1a2e'],
    accent: '#4a7fe0',
    accentLight: '#6c97e8',
    accentFaint: 'rgba(74,127,224,0.14)',
    accentBorder: 'rgba(74,127,224,0.32)',
    accentGlow: 'rgba(74,127,224,0.45)',
    accentInk: '#0a0f1c',
    overlayTopRight: 'rgba(74,127,224,0.26)',
    overlayBottomLeft: 'rgba(26,26,46,0.55)',
    letter: 'G',
    badgeText: 'GLOBAL MARKETS',
    italicTitle: 'Global Markets',
    tagline: 'Wall Street, oil, gold, and the overnight moves.',
    eyebrowText: 'GLOBAL · 4 MIN',
    channelLabel: 'From Global Markets',
  },
  'trans-tasman': {
    apiChannel: 'trans-tasman',
    gradient: ['#1a0a0a', '#220e0e', '#2a1010'],
    accent: '#e07a4a',
    accentLight: '#e8946c',
    accentFaint: 'rgba(224,122,74,0.14)',
    accentBorder: 'rgba(224,122,74,0.32)',
    accentGlow: 'rgba(224,122,74,0.45)',
    accentInk: '#1a0a06',
    overlayTopRight: 'rgba(224,122,74,0.26)',
    overlayBottomLeft: 'rgba(42,16,16,0.55)',
    letter: 'T',
    badgeText: 'TRANS-TASMAN',
    italicTitle: 'Trans-Tasman',
    tagline: 'The ASX, RBA, and what Australia means for NZ.',
    eyebrowText: 'REGIONAL · 3 MIN',
    channelLabel: 'From Trans-Tasman',
  },
};

export const typography = {
  // Headings
  h1: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 32, color: colors.white },
  h2: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 28, color: colors.white },
  h3: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 22, color: colors.white },
  heroTitle: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 31, color: colors.white },
  // Body
  body: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: colors.textDim },
  bodySmall: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16, color: colors.textFaint },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.white },
  // Eyebrows
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: colors.gold,
  },
  // Mono
  mono: { fontFamily: fonts.mono, fontSize: 12, color: colors.textDim },
  monoSmall: { fontFamily: fonts.mono, fontSize: 10, color: colors.textDim },
} as const;
