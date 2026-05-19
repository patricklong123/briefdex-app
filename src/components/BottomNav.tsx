import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../theme/tokens';
import { EqBars } from './EqBars';

type Tab = 'home' | 'profile';

interface Props {
  active: Tab;
  onSelect: (tab: Tab) => void;
  onPressNowPlaying: () => void;
  isPlaying: boolean;
}

export function BottomNav({ active, onSelect, onPressNowPlaying, isPlaying }: Props) {
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.6);

  useEffect(() => {
    ringScale.value = withRepeat(
      withTiming(1.08, { duration: 1250, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    ringOpacity.value = withRepeat(
      withTiming(0.3, { duration: 1250, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [ringScale, ringOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const press = (cb: () => void) => () => {
    Haptics.selectionAsync().catch(() => {});
    cb();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.bg} />
      <View style={styles.borderTop} />

      <View style={styles.row}>
        <NavItem
          label="Home"
          active={active === 'home'}
          onPress={press(() => onSelect('home'))}
          icon={(c) => (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 11.5L12 4l9 7.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-8.5z"
                stroke={c}
                strokeWidth={1.7}
                strokeLinejoin="round"
              />
            </Svg>
          )}
        />

        {/* Now Playing */}
        <Pressable onPress={press(onPressNowPlaying)} style={styles.centerWrap}>
          <Animated.View style={[styles.ringPulse, ringStyle]} />
          <LinearGradient
            colors={[colors.goldLight, colors.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerBtn}
          >
            {isPlaying ? <EqBars /> : <View style={styles.staticTriangle} />}
          </LinearGradient>
          <Text style={styles.centerLabel}>{isPlaying ? 'Playing' : 'Play'}</Text>
        </Pressable>

        <NavItem
          label="Profile"
          active={active === 'profile'}
          onPress={press(() => onSelect('profile'))}
          icon={(c) => (
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                stroke={c}
                strokeWidth={1.7}
              />
              <Path
                d="M4 21c0-4 4-7 8-7s8 3 8 7"
                stroke={c}
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
          )}
        />
      </View>
    </View>
  );
}

function NavItem({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: (color: string) => React.ReactNode;
}) {
  const color = active ? colors.gold : 'rgba(255,255,255,0.55)';
  return (
    <Pressable onPress={onPress} style={styles.navItem} hitSlop={8}>
      {icon(color)}
      <Text style={[styles.navLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 22,
    paddingTop: 12,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,13,8,0.92)',
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 28,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flex: 1,
  },
  navLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  centerWrap: {
    width: 80,
    alignItems: 'center',
    marginTop: -28,
  },
  ringPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: colors.goldGlow,
    top: -7,
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  staticTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: '#1a1407',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  centerLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: colors.goldLight,
    marginTop: 4,
    letterSpacing: 0.4,
  },
});
