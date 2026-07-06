import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
  Animated,
} from 'react-native';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { Triangle } from './Triangle';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { shadows } from '../../theme';
import { usePressable } from '../../hooks/usePressable';
import { useDirection } from '../../hooks/useDirection';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'tertiary';
type Size = 'compact' | 'default' | 'large';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: 'leading' | 'trailing';
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'leading',
  fullWidth = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const colors = useColors();
  const { isRTL } = useDirection();
  const isInactive = disabled || loading;
  const { animatedStyle, pressHandlers, onPress: hapticPress } = usePressable({
    hapticOnPress: variant === 'destructive' ? 'warning' : 'light',
    scale: variant === 'tertiary' || variant === 'ghost' ? 1 : 0.97,
  });

  const v = (() => {
    switch (variant) {
      case 'primary':
        return {
          bg: isInactive ? colors.surfaceMuted : colors.primary,
          fg: isInactive ? colors.textTertiary : colors.textInverse,
          border: 'transparent',
          shadow: isInactive ? shadows.none : shadows.sm,
        };
      case 'secondary':
        return {
          bg: isInactive ? colors.surfaceMuted : colors.primaryWash,
          fg: isInactive ? colors.textTertiary : colors.primary,
          border: 'transparent',
          shadow: shadows.none,
        };
      case 'outline':
        return {
          bg: 'transparent',
          fg: isInactive ? colors.textTertiary : colors.primary,
          border: isInactive ? colors.border : colors.primary,
          shadow: shadows.none,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          fg: isInactive ? colors.textTertiary : colors.primary,
          border: 'transparent',
          shadow: shadows.none,
        };
      case 'destructive':
        return {
          bg: isInactive ? colors.surfaceMuted : colors.brandRed,
          fg: isInactive ? colors.textTertiary : colors.textInverse,
          border: 'transparent',
          shadow: isInactive ? shadows.none : shadows.sm,
        };
      case 'tertiary':
        return {
          bg: 'transparent',
          fg: isInactive ? colors.textTertiary : colors.primary,
          border: 'transparent',
          shadow: shadows.none,
        };
    }
  })();

  const handlePress = () => {
    if (isInactive || !onPress) return;
    hapticPress();
    onPress();
  };

  const flexDirection = (() => {
    const wantTrailing = iconPosition === 'trailing';
    const reverse = isRTL ? !wantTrailing : wantTrailing;
    return reverse ? 'row-reverse' : 'row';
  })();

  const iconSize = size === 'compact' ? 14 : size === 'large' ? 18 : 16;
  const iconNode = icon ? (
    <Icon name={icon} size={iconSize} color={v.fg} />
  ) : null;

  const isTextOnly = variant === 'tertiary';

  return (
    <Animated.View
      style={[fullWidth ? { width: '100%' } : null, animatedStyle, style]}
    >
      <Pressable
        onPress={handlePress}
        disabled={isInactive}
        accessibilityRole="button"
        accessibilityState={{ disabled: isInactive, busy: loading }}
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint}
        {...pressHandlers}
        style={({ pressed }) => [
          styles.base,
          isTextOnly ? styles.textOnly : sizes[size],
          v.shadow,
          {
            backgroundColor: v.bg,
            borderColor: v.border,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            borderRadius: isTextOnly ? 0 : borderRadius.md,
            opacity: pressed && !isInactive ? 0.92 : 1,
            flexDirection,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.fg} size="small" />
        ) : (
          <View style={[styles.content, { flexDirection }]}>
            {iconNode}
            {iconNode ? <View style={{ width: 8 }} /> : null}
            <Text variant="button" color={v.fg}>
              {title}
            </Text>
            {isTextOnly && (
              <>
                <View style={{ width: 6 }} />
                <Triangle size={6} color={colors.brandRed} />
              </>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textOnly: {
    minWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
});

const sizes = StyleSheet.create({
  compact: {
    height: 44,
    paddingHorizontal: spacing.base,
  },
  default: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  large: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },
});
