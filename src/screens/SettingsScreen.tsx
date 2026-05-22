import React from 'react';
import {
  Animated,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ScreenBackground';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { usePreferences } from '../hooks/usePreferences';
import {
  PLAYBACK_SPEEDS,
  PlaybackSpeed,
  SKIP_INTERVALS,
  SkipInterval,
} from '../services/preferencesService';

interface Props {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: Props) {
  const { prefs, update } = usePreferences();

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <ChevronLeftIcon />
            <Text style={styles.backText}>Profile</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>SETTINGS</Text>
            <Text style={styles.title}>Preferences</Text>
          </View>

          <Text style={styles.sectionLabel}>PLAYBACK</Text>
          <View style={{ gap: 12 }}>
            <Card label="Playback Speed" subtitle="Applied when you start a new episode">
              <Segmented
                options={PLAYBACK_SPEEDS}
                value={prefs.playbackSpeed}
                format={formatSpeed}
                onChange={(v) => update({ playbackSpeed: v as PlaybackSpeed })}
              />
            </Card>
            <Card label="Skip Interval" subtitle="How far to jump when tapping skip buttons">
              <Segmented
                options={SKIP_INTERVALS}
                value={prefs.skipInterval}
                format={(v) => `${v}s`}
                onChange={(v) => update({ skipInterval: v as SkipInterval })}
              />
            </Card>
          </View>

          <Text style={styles.sectionLabel}>AUTO-PLAY</Text>
          <View>
            <Card
              label="Auto-play Next Channel"
              subtitle="Automatically play the next channel when one finishes"
              right={
                <Toggle
                  value={prefs.autoplayNextChannel}
                  onChange={(v) => update({ autoplayNextChannel: v })}
                />
              }
            />
          </View>

          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={{ gap: 8 }}>
            <AboutRow
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://briefdex.com/privacy-policy.html')}
            />
            <AboutRow label="Terms of Service" />
            <AboutRow label="Version" value="1.0 · MVP" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function formatSpeed(v: number): string {
  return v === 1 ? '1x' : `${v}x`;
}

function Card({
  label,
  subtitle,
  right,
  children,
}: {
  label: string;
  subtitle: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, paddingRight: right ? 12 : 0 }}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {right}
      </View>
      {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
    </View>
  );
}

function Segmented<T extends number>({
  options,
  value,
  onChange,
  format,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format: (v: T) => string;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={String(opt)}
            onPress={() => onChange(opt)}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && !active && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {format(opt)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.08)', colors.goldFaint],
  });
  const knobLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const knobBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textDim, colors.gold],
  });

  return (
    <Pressable onPress={() => onChange(!value)} hitSlop={8}>
      <Animated.View
        style={[
          styles.toggleTrack,
          { backgroundColor: trackBg, borderColor: value ? colors.goldBorder : colors.line },
        ]}
      >
        <Animated.View
          style={[styles.toggleKnob, { left: knobLeft, backgroundColor: knobBg }]}
        />
      </Animated.View>
    </Pressable>
  );
}

function AboutRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const isStatic = value !== undefined;
  return (
    <Pressable
      disabled={isStatic}
      onPress={onPress}
      style={({ pressed }) => [
        styles.aboutRow,
        !isStatic && pressed && { backgroundColor: 'rgba(255,255,255,0.04)' },
      ]}
    >
      <Text style={styles.aboutLabel}>{label}</Text>
      {isStatic ? (
        <Text style={styles.aboutValue}>{value}</Text>
      ) : (
        <ChevronRightIcon />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
  },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 60 },
  header: { paddingTop: spacing.lg, paddingBottom: spacing.xl },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 27,
    color: colors.white,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.white,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 3,
    lineHeight: 15,
  },
  segmented: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.gold,
  },
  segmentText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textDim,
    letterSpacing: 0.3,
  },
  segmentTextActive: {
    color: '#1a1407',
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
  },
  toggleKnob: {
    position: 'absolute',
    top: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  aboutLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
  },
  aboutValue: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
  },
});
