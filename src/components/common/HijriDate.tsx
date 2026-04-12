import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
import { dateLocale, toLatnDigits } from '../../i18n/helpers';

interface HijriDateProps {
  date: string | Date;
  showGregorian?: boolean;
  align?: 'start' | 'end';
  hijriColor?: string;
  gregorianColor?: string;
}

export function HijriDate({
  date,
  showGregorian = true,
  align = 'end',
  hijriColor,
  gregorianColor,
}: HijriDateProps) {
  useTranslation(); // re-render on language change
  const d = typeof date === 'string' ? new Date(date) : date;

  const hijri = toLatnDigits(
    new Intl.DateTimeFormat(dateLocale('islamic-umalqura'), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d),
  );

  const gregorian = toLatnDigits(
    new Intl.DateTimeFormat(dateLocale('gregory'), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d),
  );

  return (
    <View style={[styles.container, { alignItems: align === 'end' ? 'flex-end' : 'flex-start' }]}>
      <Text variant="body" color={hijriColor}>{hijri}</Text>
      {showGregorian && (
        <Text variant="caption" color={gregorianColor ?? colors.textSecondary}>
          {gregorian}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
