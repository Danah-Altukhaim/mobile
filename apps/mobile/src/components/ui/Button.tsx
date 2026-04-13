import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'compact' | 'default' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const textColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.primary
      : colors.textInverse;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[variant],
        sizes[size],
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text variant="button" color={textColor}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.4,
  },
});

const sizes = StyleSheet.create({
  compact: {
    height: 36,
    paddingHorizontal: spacing.base,
  },
  default: {
    height: 40,
    paddingHorizontal: spacing.lg,
  },
  large: {
    height: 48,
    paddingHorizontal: spacing.xl,
  },
});
