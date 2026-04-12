import React from 'react';
import { TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  const colors = useColors();
  const { isRTL } = useDirection();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              { backgroundColor: isActive ? colors.primary : colors.surfaceVariant },
            ]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.8}
          >
            <Text
              variant="caption"
              color={isActive ? colors.textInverse : colors.textSecondary}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
