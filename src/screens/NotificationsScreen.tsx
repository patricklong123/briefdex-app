import React from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ScreenBackground';
import { ChevronLeftIcon } from '../components/Icons';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { useNotificationSettings } from '../hooks/useNotificationSettings';
import { formatTime, TimeOfDay } from '../services/notificationsService';

interface Props {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: Props) {
  const { settings, update } = useNotificationSettings();

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

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>NOTIFICATIONS</Text>
            <Text style={styles.title}>Alerts & Reminders</Text>
          </View>

          <View style={{ gap: 12 }}>
            <SettingCard
              label="Daily briefing notification"
              subtitle="Get notified when today's briefings are ready"
              enabled={settings.dailyBriefing.enabled}
              onToggle={(v) =>
                update({ dailyBriefing: { ...settings.dailyBriefing, enabled: v } })
              }
              time={settings.dailyBriefing.time}
              onTimeChange={(t) =>
                update({ dailyBriefing: { ...settings.dailyBriefing, time: t } })
              }
            />
            <SettingCard
              label="Listening reminders"
              subtitle="Remind you if you haven't listened by a set time"
              enabled={settings.listeningReminder.enabled}
              onToggle={(v) =>
                update({ listeningReminder: { ...settings.listeningReminder, enabled: v } })
              }
              time={settings.listeningReminder.time}
              onTimeChange={(t) =>
                update({ listeningReminder: { ...settings.listeningReminder, time: t } })
              }
            />
            <SettingCard
              label="Weekly summary"
              subtitle="A Sunday recap of the week's key market moments"
              enabled={settings.weeklySummary.enabled}
              onToggle={(v) =>
                update({ weeklySummary: { ...settings.weeklySummary, enabled: v } })
              }
              comingSoon
            />
          </View>

          <Text style={styles.footnote}>
            Notifications are delivered in your device's local time zone.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function SettingCard({
  label,
  subtitle,
  enabled,
  onToggle,
  time,
  onTimeChange,
  comingSoon,
}: {
  label: string;
  subtitle: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  time?: TimeOfDay;
  onTimeChange?: (t: TimeOfDay) => void;
  comingSoon?: boolean;
}) {
  return (
    <View style={[styles.card, comingSoon && styles.cardComingSoon]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <View style={styles.labelRow}>
            <Text style={styles.cardLabel}>{label}</Text>
            {comingSoon ? (
              <View style={styles.comingSoonPill}>
                <Text style={styles.comingSoonText}>COMING SOON</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Toggle value={comingSoon ? false : enabled} onChange={onToggle} disabled={comingSoon} />
      </View>

      {!comingSoon && enabled && time && onTimeChange ? (
        <TimePicker time={time} onChange={onTimeChange} />
      ) : null}
    </View>
  );
}

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
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
  const knobLeft = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });
  const knobBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textDim, colors.gold],
  });

  return (
    <Pressable
      onPress={disabled ? undefined : () => onChange(!value)}
      disabled={disabled}
      hitSlop={8}
    >
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

function TimePicker({
  time,
  onChange,
}: {
  time: TimeOfDay;
  onChange: (t: TimeOfDay) => void;
}) {
  const isPM = time.hour >= 12;

  const setHour12 = (h12: number) => {
    const wrapped = ((h12 - 1 + 12) % 12) + 1; // 1..12
    const next = wrapped % 12 + (isPM ? 12 : 0); // 0..23
    onChange({ hour: next, minute: time.minute });
  };

  const setMinute = (m: number) => {
    const wrapped = ((m % 60) + 60) % 60;
    onChange({ hour: time.hour, minute: wrapped });
  };

  const setPeriod = (pm: boolean) => {
    const base = time.hour % 12;
    onChange({ hour: pm ? base + 12 : base, minute: time.minute });
  };

  const hour12 = time.hour % 12 === 0 ? 12 : time.hour % 12;

  return (
    <View style={styles.pickerWrap}>
      <View style={styles.pickerRow}>
        <Stepper
          value={hour12}
          onIncrement={() => setHour12(hour12 + 1)}
          onDecrement={() => setHour12(hour12 - 1)}
          format={(v) => String(v)}
        />
        <Text style={styles.colon}>:</Text>
        <Stepper
          value={time.minute}
          onIncrement={() => setMinute(time.minute + 5)}
          onDecrement={() => setMinute(time.minute - 5)}
          format={(v) => String(v).padStart(2, '0')}
        />

        <View style={styles.periodGroup}>
          <PeriodChip label="AM" active={!isPM} onPress={() => setPeriod(false)} />
          <PeriodChip label="PM" active={isPM} onPress={() => setPeriod(true)} />
        </View>
      </View>
      <Text style={styles.pickerHint}>Delivery time · {formatTime(time)}</Text>
    </View>
  );
}

function Stepper({
  value,
  onIncrement,
  onDecrement,
  format,
}: {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  format: (v: number) => string;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        hitSlop={6}
        onPress={onIncrement}
        style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.5 }]}
      >
        <Text style={styles.stepperArrow}>▲</Text>
      </Pressable>
      <Text style={styles.stepperValue}>{format(value)}</Text>
      <Pressable
        hitSlop={6}
        onPress={onDecrement}
        style={({ pressed }) => [styles.stepperBtn, pressed && { opacity: 0.5 }]}
      >
        <Text style={styles.stepperArrow}>▼</Text>
      </Pressable>
    </View>
  );
}

function PeriodChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.periodChip,
        active && styles.periodChipActive,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{label}</Text>
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
  card: {
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
    gap: spacing.md,
  },
  cardComingSoon: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.white,
  },
  comingSoonPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  comingSoonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 8,
    letterSpacing: 1,
    color: colors.gold,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 3,
    lineHeight: 15,
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
  pickerWrap: {
    marginTop: 4,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepper: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    minWidth: 52,
  },
  stepperBtn: {
    paddingVertical: 2,
  },
  stepperArrow: {
    fontSize: 9,
    color: colors.gold,
  },
  stepperValue: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.white,
    paddingVertical: 2,
  },
  colon: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.textDim,
  },
  periodGroup: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 6,
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  periodChipActive: {
    backgroundColor: colors.goldFaint,
    borderColor: colors.goldBorder,
  },
  periodChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textDim,
  },
  periodChipTextActive: {
    color: colors.gold,
  },
  pickerHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
  },
  footnote: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textGhost,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
