import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

const variantColors = {
  success: { bg: '#E8F5E9', text: colors.success },
  warning: { bg: '#FFF3E0', text: colors.warning },
  error: { bg: '#FFEBEE', text: colors.error },
  info: { bg: '#E3F2FD', text: colors.info },
  neutral: { bg: colors.surfaceVariant, text: colors.textSecondary },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text variant="small" color={text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
});
