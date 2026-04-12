import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { spacing, borderRadius } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

// CCK badge palette — see CCK_BRAND.md §Badges
const variantColors = {
  success: { bg: '#E6F2E2', text: '#004D32' },
  warning: { bg: '#FFF1E0', text: '#FF8F3C' },
  error:   { bg: '#E20613', text: '#FFFFFF' },
  info:    { bg: '#E6F2F9', text: '#1BA2DB' },
  neutral: { bg: '#EEEEEE', text: '#737477' },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text variant="caption" color={text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
});
