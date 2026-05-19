import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';

interface Props {
  children: React.ReactNode;
}

/** Dark green app background with subtle radial gradient overlays */
export function ScreenBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(45,106,66,0.10)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.4, y: 0.4 }}
        style={StyleSheet.absoluteFillObject as any}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['transparent', 'rgba(201,168,76,0.05)']}
        start={{ x: 0, y: 0.6 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFillObject as any}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.g900 },
});
