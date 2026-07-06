import React from 'react';
import { View, ViewProps, StyleSheet, Pressable, Animated } from 'react-native';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { shadows } from '../../theme';
import { usePressable } from '../../hooks/usePressable';

type Padding = 'none' | 'sm' | 'md' | 'lg';
// Three explicit visual modes — never stack a border AND a shadow.
//   flat      — paper-on-paper; best inside grouped lists
//   outlined  — hairline border only; structural cards
//   raised    — soft shadow only; interactive surfaces & hero cards
type Elevation = 'none' | 'xs' | 'sm' | 'md' | 'lg';
type Variant = 'flat' | 'outlined' | 'raised';

interface CardProps extends ViewProps {
  /** Visual mode. Defaults to `outlined`. */
  variant?: Variant;
  /** Legacy: forwarded as a `raised` hint when no variant is supplied. */
  elevation?: Elevation;
  padding?: Padding;
  onPress?: () => void;
  /** Required for screen readers when the card is pressable. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const paddingValue: Record<Padding, number> = {
  none: 0,
  sm: spacing.md,
  md: spacing.base,
  lg: spacing.lg,
};

const elevationToShadow: Record<Elevation, keyof typeof shadows> = {
  none: 'none',
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export function Card({
  variant,
  elevation = 'sm',
  padding = 'md',
  style,
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: CardProps) {
  const colors = useColors();
  const { animatedStyle, pressHandlers, onPress: hapticPress } = usePressable();

  // Resolve effective variant — explicit `variant` wins; otherwise infer
  // from the `elevation` legacy prop so old callsites still get a card.
  const resolved: Variant = variant ?? (elevation === 'none' ? 'outlined' : 'raised');

  const visuals = (() => {
    switch (resolved) {
      case 'flat':
        return {
          bg: colors.surface,
          border: 0,
          borderColor: 'transparent',
          shadow: shadows.none,
        };
      case 'outlined':
        return {
          bg: colors.surface,
          border: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          shadow: shadows.none,
        };
      case 'raised':
        return {
          bg: colors.surface,
          border: 0,
          borderColor: 'transparent',
          shadow: shadows[elevationToShadow[elevation]],
        };
    }
  })();

  const baseStyle = [
    {
      backgroundColor: visuals.bg,
      borderRadius: borderRadius.lg,
      padding: paddingValue[padding],
      borderWidth: visuals.border,
      borderColor: visuals.borderColor,
    },
    visuals.shadow,
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={() => {
            hapticPress();
            onPress();
          }}
          {...pressHandlers}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          style={baseStyle as any}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={baseStyle as any} {...props}>
      {children}
    </View>
  );
}
