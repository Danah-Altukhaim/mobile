import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { spacing, borderRadius } from '../../theme/spacing';
import { useColors } from '../../theme/useColors';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'lime';
type Size = 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: Variant;
  icon?: IconName;
  size?: Size;
  /** Solid filled treatment (e.g. urgent CTA). Defaults to soft wash. */
  solid?: boolean;
  /** Tiny dot prefix (status). */
  dot?: boolean;
}

export function Badge({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
  solid = false,
  dot = false,
}: BadgeProps) {
  const colors = useColors();

  const palette: Record<Variant, { wash: string; fg: string; solid: string; solidFg: string }> = {
    success: { wash: colors.successWash, fg: colors.primary, solid: colors.success, solidFg: colors.textInverse },
    warning: { wash: colors.warningWash, fg: colors.warning, solid: colors.warning, solidFg: colors.textInverse },
    error:   { wash: colors.brandRedWash, fg: colors.brandRedDark, solid: colors.brandRed, solidFg: colors.textInverse },
    info:    { wash: colors.infoWash, fg: colors.info, solid: colors.info, solidFg: colors.textInverse },
    primary: { wash: colors.primaryWash, fg: colors.primary, solid: colors.primary, solidFg: colors.textInverse },
    lime:    { wash: '#EFF7E0', fg: colors.secondaryDark, solid: colors.secondary, solidFg: colors.textInverse },
    neutral: { wash: colors.surfaceMuted, fg: colors.textSecondary, solid: colors.textSecondary, solidFg: colors.textInverse },
  };

  const p = palette[variant];
  const bg = solid ? p.solid : p.wash;
  const fg = solid ? p.solidFg : p.fg;

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[styles.badge, sizes[size], { backgroundColor: bg }]}
    >
      {dot && (
        <View
          style={{
            backgroundColor: fg,
            width: size === 'sm' ? 5 : 6,
            height: size === 'sm' ? 5 : 6,
          }}
        />
      )}
      {icon && (
        <Icon name={icon} size={size === 'sm' ? 10 : 12} color={fg} />
      )}
      <Text variant="caption" color={fg} style={size === 'sm' ? styles.smallText : undefined}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    gap: 5,
    alignSelf: 'flex-start',
  },
  smallText: {
    fontSize: 10,
    lineHeight: 14,
  },
});

const sizes = StyleSheet.create({
  sm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  md: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
});
