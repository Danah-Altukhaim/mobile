import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
import { useUIStore } from '../../store/ui.store';
import { useDirection } from '../../hooks/useDirection';

export function AIAdvisorFAB() {
  const toggleAIAdvisor = useUIStore((s) => s.toggleAIAdvisor);
  const { isRTL } = useDirection();

  return (
    <TouchableOpacity
      style={[styles.fab, isRTL ? { left: 16 } : { right: 16 }]}
      onPress={toggleAIAdvisor}
      activeOpacity={0.85}
    >
      <Text variant="h3" color={colors.textInverse}>
        🤖
      </Text>
      <View style={[styles.statusDot, isRTL ? { left: 2 } : { right: 2 }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E1E1E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brandRed,
    borderWidth: 2,
    borderColor: colors.textInverse,
  },
});
