import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  placeholder,
  ...rest
}: InputProps) {
  const colors = useColors();
  const { textAlign, writingDirection } = useDirection();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            borderWidth: error ? 2 : 1.5,
            color: colors.textPrimary,
            textAlign,
            writingDirection,
          },
        ]}
        placeholderTextColor={colors.textPlaceholder}
        placeholder={placeholder}
        textAlign={textAlign}
        writingDirection={writingDirection}
        accessibilityLabel={label || placeholder}
        accessibilityHint={error}
        accessibilityState={{ disabled: rest.editable === false }}
        {...rest}
      />
      {error && (
        <Text variant="caption" color={colors.error} style={styles.helper}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: 14,
    height: 40,
  },
  helper: {
    marginTop: spacing.xs,
  },
});
