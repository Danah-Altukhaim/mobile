import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
import { useUIStore } from '../../store/ui.store';

export function AIAdvisorFAB() {
  const toggleAIAdvisor = useUIStore((s) => s.toggleAIAdvisor);

  return (
    <TouchableOpacity style={styles.fab} onPress={toggleAIAdvisor} activeOpacity={0.8}>
      <Text variant="h3" color={colors.textInverse}>
        🤖
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    left: 16, // Left in RTL = visually right
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
});
