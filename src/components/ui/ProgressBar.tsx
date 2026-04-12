import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { useDirection } from '../../hooks/useDirection';
import { spacing, borderRadius } from '../../theme/spacing';

interface ProgressBarProps {
  progress: number; // 0 to 1
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  variant = 'primary',
  showLabel = false,
  height = 8,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const { isRTL } = useDirection();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const percentage = Math.round(clampedProgress * 100);

  const variantColors: Record<string, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  const fillColor = variantColors[variant];

  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }, style]}>
      <View style={[styles.track, { height, backgroundColor: colors.surfaceVariant }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: fillColor,
              height,
              alignSelf: isRTL ? 'flex-end' : 'flex-start',
            },
          ]}
        />
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
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
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
