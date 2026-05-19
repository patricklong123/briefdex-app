import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii } from '../theme/tokens';
import { Channel } from '../types';

interface Props {
  channel: Channel;
  onPress?: (channel: Channel) => void;
}

// Each tile has a unique gradient accent corner
const ACCENTS: Record<string, { angle: { start: { x: number; y: number }; end: { x: number; y: number } }; color: string }> = {
  'nz-markets': {
    angle: { start: { x: 1, y: 0 }, end: { x: 0.3, y: 0.6 } },
    color: 'rgba(201,168,76,0.22)',
  },
  'macro-rbnz': {
    angle: { start: { x: 0, y: 1 }, end: { x: 0.6, y: 0.4 } },
    color: 'rgba(45,106,66,0.35)',
  },
  'global-markets': {
    angle: { start: { x: 0, y: 0 }, end: { x: 0.6, y: 0.6 } },
    color: 'rgba(168,212,180,0.20)',
  },
  'trans-tasman': {
    angle: { start: { x: 1, y: 1 }, end: { x: 0.4, y: 0.4 } },
    color: 'rgba(201,168,76,0.20)',
  },
};

export function ChannelTile({ channel, onPress }: Props) {
  const accent = ACCENTS[channel.id] ?? ACCENTS['nz-markets'];
  const progress = channel.progress ?? 0;
  const isDone = channel.done;
  const isNew = !progress && !isDone;

  let progressLabel: { text: string; color: string };
  if (isDone) progressLabel = { text: '✓ Done', color: colors.g200 };
  else if (progress > 0) progressLabel = { text: `${Math.round((1 - progress) * 5)}m left`, color: colors.gold };
  else progressLabel = { text: 'New', color: colors.textFaint };

  return (
    <Pressable
      onPress={() => onPress?.(channel)}
      style={({ pressed }) => [
        styles.tile,
        pressed && { borderColor: colors.goldBorder, transform: [{ scale: 0.99 }] },
      ]}
    >
      <LinearGradient
        colors={[colors.g850, colors.g800]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject as any}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[accent.color, 'transparent']}
        start={accent.angle.start}
        end={accent.angle.end}
        style={StyleSheet.absoluteFillObject as any}
      />

      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Text style={styles.iconLetter}>{channel.letter}</Text>
        </View>
        <View style={styles.durationPill}>
          <Text style={styles.durationText}>{channel.duration}</Text>
        </View>
      </View>

      <View style={{ marginTop: 'auto' }}>
        <Text style={styles.category}>{channel.category.toUpperCase()}</Text>
        <Text style={styles.name}>{channel.name}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {channel.description}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(isDone ? 1 : progress) * 100}%`,
                backgroundColor: isDone ? colors.g500 : colors.gold,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: progressLabel.color }]}>{progressLabel.text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    height: 168,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    overflow: 'hidden',
    backgroundColor: colors.g850,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.gold,
  },
  durationPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  durationText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textDim,
  },
  category: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: 'rgba(201,168,76,0.6)',
    marginTop: 8,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.white,
    marginTop: 2,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    marginTop: 2,
  },
  progressTrack: {
    height: 2,
    width: '100%',
    backgroundColor: colors.line,
    borderRadius: 1,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
  progressLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    marginTop: 4,
  },
});
