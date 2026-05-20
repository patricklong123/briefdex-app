import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import {
  CHANNEL_THEMES,
  ChannelKey,
  ChannelTheme,
  colors,
  fonts,
  radii,
  spacing,
} from '../theme/tokens';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { ScrubBar } from '../components/ScrubBar';
import { PulsingDot } from '../components/PulsingDot';
import { SkipButton } from '../components/SkipButton';
import { formatShortDate } from '../utils/date';
import { fetchLatestEpisode } from '../services/episodeService';
import { audioService } from '../services/audioService';

interface Props {
  onClose: () => void;
  channelKey?: ChannelKey;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatRate(r: number): string {
  if (r === 1) return '1.0';
  return r.toString();
}

export function PlayerScreen({ onClose, channelKey = 'daily-wrap' }: Props) {
  const theme = CHANNEL_THEMES[channelKey];
  const player = useAudioPlayer();
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadedChannel = player.episode?.channel;
  const channelAlreadyLoaded = loadedChannel === theme.apiChannel;

  // When reopening the player on the same channel (e.g. via the bottom-nav
  // "Now Playing" pill), keep the existing playback state. Otherwise fetch
  // the latest episode for this channel and start it.
  const needsFetch = !channelAlreadyLoaded;
  const [isFetching, setIsFetching] = useState(needsFetch);

  useEffect(() => {
    if (!needsFetch) {
      setIsFetching(false);
      return;
    }
    let cancelled = false;
    setIsFetching(true);
    setFetchError(null);
    fetchLatestEpisode(theme.apiChannel)
      .then(async (ep) => {
        if (cancelled) return;
        await audioService.load(ep);
        if (cancelled) return;
        setIsFetching(false);
        audioService.play();
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setFetchError(e.message);
        setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [needsFetch, theme.apiChannel]);

  const episode = player.episode;

  if (isFetching || !episode) {
    return <LoadingView theme={theme} onClose={onClose} error={fetchError} />;
  }

  const duration = player.durationSec || episode.duration;
  const rawPosition = player.positionSec;
  const position = scrubRatio !== null ? scrubRatio * duration : rawPosition;
  const progress = duration > 0 ? rawPosition / duration : 0;
  const durationMin = Math.max(1, Math.round(episode.duration / 60));
  const metaText =
    theme.eyebrowText ?? `${formatShortDate(episode.date)} · ${durationMin} MIN`;

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    player.toggle();
  };

  const cycleSpeed = () => {
    Haptics.selectionAsync().catch(() => {});
    player.cycleRate();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.gradient[0] }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={10}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M6 9l6 6 6-6"
                stroke={colors.white}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>NOW PLAYING</Text>
            <Text style={styles.eyebrowSub}>{theme.channelLabel}</Text>
          </View>
          <View
            style={[
              styles.letterBadge,
              { backgroundColor: theme.accentFaint, borderColor: theme.accentBorder },
            ]}
          >
            <Text style={[styles.letterBadgeText, { color: theme.accent }]}>{theme.letter}</Text>
          </View>
        </View>

        {/* Cover art */}
        <View style={styles.coverWrap}>
          <LinearGradient
            colors={theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cover, { borderColor: theme.accentBorder }]}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[theme.overlayTopRight, 'transparent']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0.2, y: 0.5 }}
              style={StyleSheet.absoluteFillObject as any}
            />
            <LinearGradient
              pointerEvents="none"
              colors={['transparent', theme.overlayBottomLeft]}
              start={{ x: 0.2, y: 0.5 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject as any}
            />

            <View style={styles.coverTop}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.accentFaint, borderColor: theme.accentBorder },
                ]}
              >
                <PulsingDot size={6} color={theme.accent} />
                <Text style={[styles.badgeText, { color: theme.accent }]}>{theme.badgeText}</Text>
              </View>
            </View>

            <View style={styles.coverBottom}>
              <Text style={[styles.coverItalic, { color: theme.accentLight }]}>
                {theme.italicTitle}
              </Text>
              <Text style={styles.coverTitle}>{theme.tagline}</Text>
              <Text style={styles.coverMeta}>{metaText}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <ScrubBar
            progress={progress}
            onScrub={setScrubRatio}
            onScrubComplete={(r) => {
              Haptics.selectionAsync().catch(() => {});
              player.seekTo(r * duration);
              setScrubRatio(null);
            }}
            height={4}
            color={theme.accent}
            colorLight={theme.accentLight}
          />
          <View style={styles.timeRow}>
            <Text style={[styles.timeGold, { color: theme.accent }]}>{fmt(position)}</Text>
            <Text style={styles.timeFaint}>{fmt(duration)}</Text>
          </View>

          <View style={styles.transport}>
            <SkipButton direction="back" onPress={player.skipBack} />
            <Pressable
              onPress={togglePlay}
              style={({ pressed }) => [
                styles.playBtnWrap,
                {
                  shadowColor: theme.accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 24,
                  elevation: 8,
                },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={[theme.accentLight, theme.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playBtn}
              >
                {player.isPlaying ? (
                  <View style={styles.pauseRow}>
                    <View style={[styles.pauseBar, { backgroundColor: theme.accentInk }]} />
                    <View style={[styles.pauseBar, { backgroundColor: theme.accentInk }]} />
                  </View>
                ) : (
                  <View style={[styles.bigTriangle, { borderLeftColor: theme.accentInk }]} />
                )}
              </LinearGradient>
            </Pressable>
            <SkipButton direction="forward" onPress={player.skipForward} />
          </View>

          <Pressable
            onPress={cycleSpeed}
            style={[
              styles.speedChip,
              { backgroundColor: theme.accentFaint, borderColor: theme.accentBorder },
            ]}
            hitSlop={10}
          >
            <Text style={[styles.speedText, { color: theme.accent }]}>
              {formatRate(player.rate)}x
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

interface LoadingProps {
  theme: ChannelTheme;
  onClose: () => void;
  error: string | null;
}

function LoadingView({ theme, onClose, error }: LoadingProps) {
  return (
    <View style={[styles.root, styles.loadingRoot, { backgroundColor: theme.gradient[0] }]}>
      <SafeAreaView style={styles.loadingSafe} edges={['top', 'bottom']}>
        <Pressable onPress={onClose} style={[styles.iconBtn, styles.loadingClose]} hitSlop={10}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 9l6 6 6-6"
              stroke={colors.white}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        {error ? (
          <Text style={styles.loadingText}>{error}</Text>
        ) : (
          <>
            <ActivityIndicator color={theme.accent} />
            <Text style={styles.loadingText}>Loading {theme.italicTitle}…</Text>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.g900 },
  loadingRoot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSafe: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingClose: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.xl,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBadgeText: {
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  eyebrowSub: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textDim,
    marginTop: 2,
  },
  coverWrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: 380,
  },
  cover: {
    flex: 1,
    borderRadius: radii.xxl,
    borderWidth: 1,
    padding: 28,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  coverTop: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  coverBottom: {},
  coverItalic: {
    fontFamily: fonts.headingItalic,
    fontSize: 16,
    marginBottom: 6,
  },
  coverTitle: {
    fontFamily: fonts.headingBlack,
    fontSize: 34,
    lineHeight: 40,
    color: colors.white,
  },
  coverMeta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 10,
    letterSpacing: 0.8,
  },
  controls: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeGold: {
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  timeFaint: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textFaint,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    marginTop: spacing.lg,
  },
  playBtnWrap: {
    borderRadius: 38,
  },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 6,
  },
  pauseRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseBar: {
    width: 5,
    height: 26,
    borderRadius: 1.5,
  },
  speedChip: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  speedText: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
  },
});
