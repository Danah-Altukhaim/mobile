import React from 'react';
import { View, Switch as RNSwitch, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

interface SwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export function Switch({ label, value, onValueChange, description }: SwitchProps) {
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();

  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      {label ? (
        <View style={styles.labelContainer}>
          <Text variant="body" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
            {label}
          </Text>
          {description && (
            <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
              {description}
            </Text>
          )}
        </View>
      ) : null}
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.surface}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  labelContainer: {
    flex: 1,
    marginEnd: spacing.base,
  },
});
