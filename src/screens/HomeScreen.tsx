import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ScreenBackground';
import { HeroCard } from '../components/HeroCard';
import { ChannelTile } from '../components/ChannelTile';
import { BottomNav } from '../components/BottomNav';
import { ChannelKey, colors, fonts, radii, spacing } from '../theme/tokens';
import { CHANNELS } from '../data/placeholders';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useChannelProgress } from '../hooks/useChannelProgress';
import { useApp } from '../contexts/AppContext';
import { formatLongDate, greetingForHour } from '../utils/date';
import { fetchLatestEpisode } from '../services/episodeService';
import { audioService } from '../services/audioService';
import { Channel, Episode } from '../types';

interface Props {
  onOpenPlayer: (channel?: ChannelKey) => void;
  onOpenProfile: () => void;
}

export function HomeScreen({ onOpenPlayer, onOpenProfile }: Props) {
  const { user } = useApp();
  const player = useAudioPlayer();
  const now = new Date();
  const firstName = user.name.split(' ')[0];

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channelDates, setChannelDates] = useState<Record<string, string | undefined>>({});

  const heroProgress = useChannelProgress('daily-wrap', episode?.dateKey);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchLatestEpisode('daily-wrap')
      .then((ep) => {
        if (cancelled) return;
        setEpisode(ep);
        setChannelDates((d) => ({ ...d, 'daily-wrap': ep.dateKey }));
        audioService.load(ep);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      });

    // Fetch dates for the other channels in parallel so each tile can key
    // its progress lookup. Audio for these is loaded by PlayerScreen on tap.
    CHANNELS.forEach((c) => {
      fetchLatestEpisode(c.id)
        .then((ep) => {
          if (cancelled) return;
          setChannelDates((d) => ({ ...d, [c.id]: ep.dateKey }));
        })
        .catch(() => {
          // Date-only lookup — silent failure; tile stays in "New" state.
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePlayPress = async () => {
    if (episode) {
      // Re-load is a no-op when the same episode id is already loaded,
      // but switches back to Daily Wrap if the user was just in a channel player.
      await audioService.load(episode);
      await audioService.play();
    }
    onOpenPlayer('daily-wrap');
  };

  const retry = () => {
    setEpisode(null);
    setError(null);
    fetchLatestEpisode('daily-wrap')
      .then((ep) => {
        setEpisode(ep);
        setChannelDates((d) => ({ ...d, 'daily-wrap': ep.dateKey }));
        audioService.load(ep);
      })
      .catch((err: Error) => setError(err.message));
  };

  // Prefer the live player position when the daily-wrap episode is loaded
  // in audioService — keeps the hero scrubbing in real time even between
  // the 5-second progressService saves.
  const heroIsLoaded = player.episode?.id === episode?.id;
  const heroPositionSec = heroIsLoaded ? player.positionSec : heroProgress.positionSeconds;
  const heroDurationSec = heroIsLoaded
    ? player.durationSec || (episode?.duration ?? 0)
    : heroProgress.durationSeconds || (episode?.duration ?? 0);

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greetingForHour(now.getHours())} 👋</Text>
            <Text style={styles.name}>{firstName}.</Text>
            <Text style={styles.date}>{formatLongDate(now)}</Text>
          </View>

          {/* Hero */}
          {episode ? (
            <HeroCard
              episode={episode}
              positionSec={heroPositionSec}
              durationSec={heroDurationSec}
              complete={heroProgress.complete}
              onPressPlay={handlePlayPress}
            />
          ) : error ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusTitle}>Couldn't load today's briefing</Text>
              <Text style={styles.statusMessage}>{error}</Text>
              <Pressable onPress={retry} style={styles.retryBtn} hitSlop={10}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.statusCard}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.statusMessage}>Loading today's briefing…</Text>
            </View>
          )}

          {/* Section header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All channels</Text>
            <Text style={styles.sectionMeta}>5 daily</Text>
          </View>

          {/* Channel grid (2 cols) */}
          <View style={styles.grid}>
            {CHANNELS.map((c) => (
              <View key={c.id} style={styles.gridCell}>
                <ChannelTile
                  channel={c}
                  episodeDate={channelDates[c.id]}
                  onPress={(channel: Channel) => onOpenPlayer(channel.id as ChannelKey)}
                />
              </View>
            ))}
          </View>

          {/* Trust row */}
          <View style={styles.trustRow}>
            <View style={styles.trustLine} />
            <View style={styles.trustItems}>
              <TrustPill text="Primary sources" />
              <TrustPill text="Editor reviewed" />
              <TrustPill text="NZ-first" />
            </View>
          </View>
        </ScrollView>

        <BottomNav
          active="home"
          onSelect={(t) => {
            if (t === 'profile') onOpenProfile();
          }}
          onPressNowPlaying={onOpenPlayer}
          isPlaying={player.isPlaying}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

function TrustPill({ text }: { text: string }) {
  return (
    <View style={styles.trustPill}>
      <View style={styles.trustDot} />
      <Text style={styles.trustText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 140,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
    marginTop: 4,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
    marginTop: 2,
  },
  statusCard: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.g800,
    paddingVertical: 56,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 220,
  },
  statusTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  statusMessage: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  retryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.white,
  },
  sectionMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridCell: {
    width: '50%',
    paddingHorizontal: 6,
    paddingBottom: 12,
  },
  trustRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  trustLine: {
    height: 1,
    backgroundColor: colors.line,
    marginBottom: spacing.md,
  },
  trustItems: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.gold,
  },
  trustText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
  },
});
