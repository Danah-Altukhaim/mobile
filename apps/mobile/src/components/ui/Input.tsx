import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Pressable,
  Animated,
} from 'react-native';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  onTrailingPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helper,
  required,
  leadingIcon,
  trailingIcon,
  onTrailingPress,
  containerStyle,
  placeholder,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const [focused, setFocused] = useState(false);
  const [obscured, setObscured] = useState(!!secureTextEntry);
  const ringOpacity = useRef(new Animated.Value(0)).current;

  const hasError = !!error;

  const baseBorder = hasError
    ? colors.brandRed
    : focused
    ? colors.primary
    : colors.borderStrong;

  const showPasswordToggle = !!secureTextEntry;
  const effectiveTrailing: IconName | undefined = showPasswordToggle
    ? obscured ? 'eye' : 'eye-off'
    : trailingIcon;

  const handleFocus = (e: any) => {
    setFocused(true);
    Animated.timing(ringOpacity, {
      toValue: 1,
      duration: 160,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    Animated.timing(ringOpacity, {
      toValue: 0,
      duration: 140,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="caption"
          color={focused && !hasError ? colors.primary : colors.textSecondary}
          style={styles.label}
        >
          {label}
          {required ? (
            <Text variant="caption" color={colors.brandRed}>
              {' *'}
            </Text>
          ) : null}
        </Text>
      )}
      <View style={styles.fieldShell}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.focusRing,
            {
              borderColor: hasError ? colors.brandRed : colors.primary,
              opacity: ringOpacity,
            },
          ]}
        />
        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.surface,
              borderColor: baseBorder,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          {leadingIcon && (
            <View style={styles.affix}>
              <Icon
                name={leadingIcon}
                size={18}
                color={focused ? colors.primary : colors.textTertiary}
              />
            </View>
          )}
          <TextInput
            style={[
              styles.input,
              { color: colors.textPrimary, textAlign, writingDirection },
            ]}
            placeholderTextColor={colors.textPlaceholder}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry && obscured}
            textAlign={textAlign}
            accessibilityLabel={label || placeholder}
            accessibilityHint={error || helper}
            accessibilityState={{ disabled: rest.editable === false }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
          {showPasswordToggle ? (
            <Pressable
              onPress={() => {
                haptic.selection();
                setObscured((o) => !o);
              }}
              style={styles.affix}
              accessibilityRole="button"
              accessibilityLabel={obscured ? 'Show password' : 'Hide password'}
            >
              <Icon
                name={obscured ? 'eye' : 'eye-off'}
                size={18}
                color={colors.textTertiary}
              />
            </Pressable>
          ) : effectiveTrailing ? (
            onTrailingPress ? (
              <Pressable onPress={onTrailingPress} style={styles.affix}>
                <Icon
                  name={effectiveTrailing}
                  size={18}
                  color={colors.textTertiary}
                />
              </Pressable>
            ) : (
              <View style={styles.affix}>
                <Icon
                  name={effectiveTrailing}
                  size={18}
                  color={colors.textTertiary}
                />
              </View>
            )
          ) : null}
        </View>
      </View>
      {(error || helper) && (
        <Text
          variant="caption"
          color={hasError ? colors.brandRed : colors.textTertiary}
          style={styles.helper}
        >
          {error || helper}
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
  fieldShell: {
    position: 'relative',
  },
  focusRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: borderRadius.md + 3,
    borderWidth: 3,
  },
  inputWrap: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 50,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: 15,
    fontFamily: 'Almarai_400Regular',
  },
  affix: {
    paddingHorizontal: spacing.base,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helper: {
    marginTop: 6,
  },
});
