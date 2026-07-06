import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const [focused, setFocused] = useState(false);
  const ring = useRef(new Animated.Value(0)).current;

  const setActive = (active: boolean) => {
    setFocused(active);
    Animated.timing(ring, {
      toValue: active ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
    if (active) onFocus?.();
    else onBlur?.();
  };

  const borderColor = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: borderColor as any,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <Ionicons
        name="search"
        size={17}
        color={focused ? colors.primary : colors.textTertiary}
        style={styles.icon}
      />
      <TextInput
        style={[
          styles.input,
          { color: colors.textPrimary, textAlign, writingDirection },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        textAlign={textAlign}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearButton}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    gap: 10,
  },
  icon: {},
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Almarai_400Regular',
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: 4,
  },
});
