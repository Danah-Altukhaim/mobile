import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { useDirection } from '../../hooks/useDirection';
import { spacing, borderRadius } from '../../theme/spacing';

interface ProgressBarProps {
  progress: number; // 0 to 1
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
  showLabel?: boolean;
  height?: number;
  indeterminate?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  variant = 'primary',
  showLabel = false,
  height = 8,
  indeterminate = false,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const { isRTL } = useDirection();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const percentage = Math.round(clampedProgress * 100);

  const animated = useRef(new Animated.Value(clampedProgress)).current;
  const indetX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (indeterminate) return;
    Animated.timing(animated, {
      toValue: clampedProgress,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, animated, indeterminate]);

  useEffect(() => {
    if (!indeterminate) return;
    const loop = Animated.loop(
      Animated.timing(indetX, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [indeterminate, indetX]);

  const variantColors: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const fillColor = variantColors[variant];
  const widthInterp = animated.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const indetTranslate = indetX.interpolate({
    inputRange: [0, 1],
    outputRange: ['-40%', '100%'],
  });

  return (
    <View
      style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={
        indeterminate ? undefined : { min: 0, max: 100, now: percentage }
      }
    >
      <View style={[styles.track, { height, backgroundColor: colors.surfaceVariant }]}>
        {indeterminate ? (
          <Animated.View
            style={[
              styles.indeterminate,
              {
                backgroundColor: fillColor,
                height,
                transform: [{ translateX: indetTranslate as any }],
              },
            ]}
          />
        ) : (
          <Animated.View
            style={[
              styles.fill,
              {
                width: widthInterp,
                backgroundColor: fillColor,
                height,
                alignSelf: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          />
        )}
      </View>
      {showLabel && (
        <Text
          variant="caption"
          color={colors.textSecondary}
          style={[styles.label, isRTL ? styles.labelRTL : styles.labelLTR]}
        >
          {percentage}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  track: {
    flex: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.sm,
  },
  indeterminate: {
    width: '40%',
    borderRadius: borderRadius.sm,
  },
  label: {
    minWidth: 36,
  },
  labelLTR: {
    marginLeft: spacing.sm,
  },
  labelRTL: {
    marginRight: spacing.sm,
  },
});
