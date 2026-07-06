import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Text, Button, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { paymentApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { toLatnDigits } from '../../i18n/helpers';

export function PaymentConfirmationScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const { paymentId } = route.params;

  const receiptMutation = useMutation({
    mutationFn: () => paymentApi.getReceipt(paymentId),
    onSuccess: (data) => {
      const url = (data as any)?.data?.receipt_url || (data as any)?.data?.pdf_url || paymentId;
      Alert.alert(t('payments.receiptReady'), `Ref: ${url}`);
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.retry'));
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}>
        {/* Hero success block — green hero with stripe */}
        <View style={[styles.heroBlock, { backgroundColor: colors.successWash, borderColor: colors.success }]}>
          <View style={[styles.successIconWedge, { backgroundColor: colors.success }]}>
            <Icon name="check" size={32} color={colors.textInverse} />
          </View>
          <Text variant="overline" color={colors.success} style={{ letterSpacing: isAr ? 0 : 1, marginTop: spacing.base }}>
            {isAr ? 'تم الاستلام' : 'Confirmed'}
          </Text>
          <Text variant="h2" color={colors.success} style={styles.heroTitle} accessibilityRole="header">
            {t('payments.paymentSuccess')}
          </Text>
          <View style={[styles.heroStripe, { backgroundColor: colors.success }]} />
        </View>

        {/* Receipt details */}
        <View style={[styles.detailsBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Row
            label={t('payments.transactionRef')}
            value={paymentId}
            colors={colors}
            rowDir={rowDirection}
            textAlign={textAlign}
            writingDirection={writingDirection}
            mono
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Row
            label={t('payments.dueDate')}
            value={toLatnDigits(new Date().toLocaleDateString(isAr ? 'ar-KW' : 'en-KW'))}
            colors={colors}
            rowDir={rowDirection}
            textAlign={textAlign}
            writingDirection={writingDirection}
          />
        </View>

        <Button
          title={t('payments.downloadReceipt')}
          onPress={() => receiptMutation.mutate()}
          variant="outline"
          fullWidth
          size="large"
          icon="document"
          loading={receiptMutation.isPending}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          title={t('payments.backToDashboard')}
          onPress={() => navigation.navigate('PaymentDashboard')}
          variant="primary"
          fullWidth
          size="large"
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </View>
  );
}

function Row({
  label, value, colors, rowDir, textAlign, writingDirection, mono,
}: any) {
  return (
    <View style={[styles.row, { flexDirection: rowDir }]}>
      <Text variant="caption" color={colors.textTertiary}>
        {label}
      </Text>
      <Text
        variant="bodyBold"
        color={colors.textPrimary}
        style={[
          { textAlign, writingDirection },
          mono && { fontFamily: 'Almarai_700Bold', letterSpacing: 0.5 },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  heroBlock: {
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  successIconWedge: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { marginTop: 4, textAlign: 'center' },
  heroStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  detailsBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  row: {
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
