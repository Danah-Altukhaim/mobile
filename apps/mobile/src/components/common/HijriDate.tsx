import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';

interface HijriDateProps {
  date: string | Date;
  showGregorian?: boolean;
}

export function HijriDate({ date, showGregorian = true }: HijriDateProps) {
  const d = typeof date === 'string' ? new Date(date) : date;

  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);

  const gregorian = new Intl.DateTimeFormat('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);

  return (
    <View style={styles.container}>
      <Text variant="body">{hijri}</Text>
      {showGregorian && (
        <Text variant="caption" color={colors.textSecondary}>
          {gregorian}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end', // RTL: align right
  },
});
