import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Ionicons name="search" size={18} color={colors.textTertiary} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: colors.textPrimary, textAlign, writingDirection }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        textAlign={textAlign}
        writingDirection={writingDirection}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  icon: {
    marginEnd: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
    marginStart: spacing.sm,
  },
});
