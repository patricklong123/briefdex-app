import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  CHANNEL_THEMES,
  ChannelKey,
  colors,
  fonts,
  nextChannelInSequence,
  radii,
  spacing,
} from '../theme/tokens';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { usePreferences } from '../hooks/usePreferences';
import { ScrubBar } from '../components/ScrubBar';
import { PulsingDot } from '../components/PulsingDot';
import { SkipButton } from '../components/SkipButton';
import { formatShortDate } from '../utils/date';
import { fetchLatestEpisode } from '../services/episodeService';
import { audioService } from '../services/audioService';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_DISTANCE = 130;
const DISMISS_VELOCITY = 800;

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
  const [currentChannel, setCurrentChannel] = useState<ChannelKey>(channelKey);
  const theme = CHANNEL_THEMES[currentChannel];
  const player = useAudioPlayer();
  const { prefs } = usePreferences();
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- Gesture-driven sheet dismissal (à la Apple Music / Spotify) ---
  // The whole player slides up on mount and follows the finger downward; on
  // release it either flings closed or springs back to fully open.
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 340, easing: Easing.out(Easing.cubic) });
  }, [translateY]);

  const dismiss = () => {
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 260, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  };

  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetX([-24, 24])
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(
          SCREEN_HEIGHT,
          { duration: 240, easing: Easing.in(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(onClose)();
          },
        );
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SCREEN_HEIGHT], [0.55, 0], Extrapolation.CLAMP),
  }));

  // If the modal re-opens with a different channel without unmounting, follow the prop.
  useEffect(() => {
    setCurrentChannel(channelKey);
  }, [channelKey]);

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

  // Auto-advance to the next channel when the current episode finishes,
  // if the preference is enabled and there is a next channel in the sequence.
  useEffect(() => {
    if (!prefs.autoplayNextChannel) return;
    return audioService.onFinish(() => {
      const next = nextChannelInSequence(currentChannel);
      if (!next) return;
      setIsFetching(true);
      setCurrentChannel(next);
    });
  }, [prefs.autoplayNextChannel, currentChannel]);

  const episode = player.episode;
  const loading = isFetching || !episode;

  const duration = episode ? player.durationSec || episode.duration : 0;
  const rawPosition = player.positionSec;
  const position = scrubRatio !== null ? scrubRatio * duration : rawPosition;
  const progress = duration > 0 ? rawPosition / duration : 0;
  const durationMin = episode ? Math.max(1, Math.round(episode.duration / 60)) : 0;
  const metaText =
    theme.eyebrowText ??
    (episode ? `${formatShortDate(episode.date)} · ${durationMin} MIN` : '');

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    player.toggle();
  };

  const cycleSpeed = () => {
    Haptics.selectionAsync().catch(() => {});
    player.cycleRate();
  };

  const closeButton = (extraStyle?: object) => (
    <Pressable onPress={dismiss} style={[styles.iconBtn, extraStyle]} hitSlop={10}>
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
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />
      <Animated.View
        style={[
          styles.root,
          { backgroundColor: theme.gradient[0] },
          loading && styles.loadingRoot,
          sheetStyle,
        ]}
      >
        {loading ? (
          <GestureDetector gesture={pan}>
            <SafeAreaView style={styles.loadingSafe} edges={['top', 'bottom']}>
              {closeButton(styles.loadingClose)}
              {fetchError ? (
                <Text style={styles.loadingText}>{fetchError}</Text>
              ) : (
                <>
                  <ActivityIndicator color={theme.accent} />
                  <Text style={styles.loadingText}>Loading {theme.italicTitle}…</Text>
                </>
              )}
            </SafeAreaView>
          </GestureDetector>
        ) : (
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            {/* Drag-to-dismiss is bound to the top bar + cover art so the
                transport controls below stay fully interactive. */}
            <GestureDetector gesture={pan}>
              <View style={styles.dragArea}>
                <View style={styles.topBar}>
                  {closeButton()}
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
                    <Text style={[styles.letterBadgeText, { color: theme.accent }]}>
                      {theme.letter}
                    </Text>
                  </View>
                </View>

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
                        <Text style={[styles.badgeText, { color: theme.accent }]}>
                          {theme.badgeText}
                        </Text>
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
              </View>
            </GestureDetector>

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
                <SkipButton
                  direction="back"
                  seconds={prefs.skipInterval}
                  onPress={() => player.skipBack(prefs.skipInterval)}
                />
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
                <SkipButton
                  direction="forward"
                  seconds={prefs.skipInterval}
                  onPress={() => player.skipForward(prefs.skipInterval)}
                />
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
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
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
  dragArea: {
    flex: 1,
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
