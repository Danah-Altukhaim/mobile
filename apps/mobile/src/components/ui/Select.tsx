import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  containerStyle,
}: SelectProps) {
  const colors = useColors();
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((o) => o.value === value);
  const { isRTL, textAlign, writingDirection } = useDirection();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" color={colors.textSecondary} style={[styles.label, { textAlign, writingDirection }]}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        style={[
          styles.trigger,
          { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text
          variant="body"
          color={selectedOption ? colors.textPrimary : colors.textTertiary}
          style={{ textAlign, writingDirection, flex: 1 }}
        >
          {selectedOption ? selectedOption.label : placeholder || ''}
        </Text>
        <Text variant="caption" color={colors.textTertiary}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: colors.surface }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    { borderBottomColor: colors.divider },
                    item.value === value && { backgroundColor: colors.surfaceVariant },
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text
                    variant="body"
                    color={
                      item.value === value ? colors.primary : colors.textPrimary
                    }
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    marginBottom: spacing.xs,
  },
  trigger: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    minHeight: 48,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  dropdown: {
    borderRadius: borderRadius.lg,
    maxHeight: 300,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
  },
});
