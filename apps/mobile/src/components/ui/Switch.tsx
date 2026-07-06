import React from 'react';
import { View, Switch as RNSwitch, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

interface SwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export function Switch({ label, value, onValueChange, description }: SwitchProps) {
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();

  const handleChange = (next: boolean) => {
    haptic.selection();
    onValueChange(next);
  };

  return (
    <Pressable
      onPress={() => handleChange(!value)}
      style={({ pressed }) => [
        styles.container,
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          backgroundColor: pressed ? colors.surfaceVariant : 'transparent',
        },
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      {label ? (
        <View style={styles.labelContainer}>
          <Text variant="body" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
            {label}
          </Text>
          {description && (
            <Text
              variant="caption"
              color={colors.textTertiary}
              style={{ textAlign, writingDirection, marginTop: 2 }}
            >
              {description}
            </Text>
          )}
        </View>
      ) : null}
      <RNSwitch
        value={value}
        onValueChange={handleChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    minHeight: 56,
    gap: spacing.base,
    borderRadius: 4,
  },
  labelContainer: {
    flex: 1,
  },
});
