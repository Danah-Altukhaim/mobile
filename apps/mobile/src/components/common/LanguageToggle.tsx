import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { changeLanguage } from '../../i18n';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const colors = useColors();
  const isAr = i18n.language === 'ar';

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant, flexDirection: isAr ? 'row-reverse' : 'row' }]}>
      <TouchableOpacity
        onPress={() => changeLanguage('en')}
        style={[styles.option, !isAr && { backgroundColor: colors.primary }]}
      >
        <Text variant="caption" color={!isAr ? colors.textInverse : colors.textSecondary}>
          EN
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => changeLanguage('ar')}
        style={[styles.option, isAr && { backgroundColor: colors.primary }]}
      >
        <Text variant="caption" color={isAr ? colors.textInverse : colors.textSecondary}>
          {isAr ? 'عربي' : 'AR'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 2,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 14,
  },
});
