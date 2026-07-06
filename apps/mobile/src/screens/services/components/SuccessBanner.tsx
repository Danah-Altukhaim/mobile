import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Icon } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useDirection } from '../../../hooks/useDirection';

interface Props {
  referenceNo: string;
  description?: string;
}

export function SuccessBanner({ referenceNo, description }: Props) {
  const { t } = useTranslation();
  const { isRTL, textAlign, writingDirection } = useDirection();
  return (
    <View style={[styles.banner, { backgroundColor: colors.successWash, borderColor: colors.success }]}>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.iconWedge, { backgroundColor: colors.success }]}>
          <Icon name="check" size={16} color={colors.textInverse} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold" color={colors.success} style={{ textAlign, writingDirection }}>
            {t('services.reference')}: {referenceNo}
          </Text>
          <Text
            variant="caption"
            color={colors.primaryDark}
            style={{ textAlign, writingDirection, marginTop: 2 }}
          >
            {description || t('services.noteSentToEmail')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    marginBottom: spacing.base,
    padding: spacing.base,
  },
  row: { alignItems: 'center', gap: spacing.md },
  iconWedge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
