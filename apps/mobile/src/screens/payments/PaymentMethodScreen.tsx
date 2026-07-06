import React, { useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Text, Button, Icon, type IconName } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { paymentApi } from '../../services/api';
import { formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { haptic } from '../../utils/haptics';
import { FINANCE_POLICY_NOTES } from '@masari/shared';

// Per the Finance Department spec, CCK accepts only KNET, Visa, Mastercard, and
// Cash (paid at the Finance counter). Apple Pay/Mada are not currently approved
// instruments — keep them out so the UI doesn't promise something Finance won't
// settle.
const methods: { id: string; label_en: string; label_ar: string; iconName: IconName }[] = [
  { id: 'knet', label_en: 'KNET', label_ar: 'كي نت', iconName: 'bank' },
  { id: 'visa', label_en: 'Visa', label_ar: 'فيزا', iconName: 'card' },
  { id: 'mastercard', label_en: 'Mastercard', label_ar: 'ماستركارد', iconName: 'card' },
  { id: 'cash', label_en: 'Cash (counter)', label_ar: 'نقداً (الكاونتر)', iconName: 'card' },
];

export function PaymentMethodScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const { amount, feeIds } = route.params;
  const [selected, setSelected] = useState('knet');
  const bottomInset = useContentBottomInset();

  const mutation = useMutation({
    mutationFn: () =>
      paymentApi.initiatePayment({ amount, fee_ids: feeIds, method: selected as any } as any),
    onSuccess: (data: any) => {
      navigation.navigate('PaymentConfirmation', {
        paymentId: data?.data?.payment_id || 'mock-001',
      });
    },
  });

  const formattedAmount = formatCurrency(amount, 'KWD');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الدفع' : 'Checkout'}
        title={t('payments.selectMethod')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Amount banner */}
        <View
          style={[
            styles.amountBlock,
            { backgroundColor: colors.primaryDeep, borderColor: colors.primary },
          ]}
        >
          <Text
            variant="overline"
            color={colors.secondaryLight}
            style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}
          >
            {t('payments.balance')}
          </Text>
          <Text
            color={colors.textInverse}
            style={[styles.amountText, { textAlign, writingDirection }]}
          >
            {formattedAmount}
          </Text>
          <View style={[styles.amountStripe, { backgroundColor: colors.brandRed }]} />
        </View>

        {/* Method grid */}
        <View style={[styles.grid, { flexDirection: rowDirection }]}>
          {methods.map((method) => {
            const isActive = selected === method.id;
            return (
              <Pressable
                key={method.id}
                onPress={() => {
                  haptic.selection();
                  setSelected(method.id);
                }}
                style={({ pressed }) => [
                  styles.methodCard,
                  {
                    backgroundColor: isActive ? colors.primaryWash : colors.surface,
                    borderColor: isActive ? colors.primary : colors.border,
                    borderWidth: isActive ? 2 : StyleSheet.hairlineWidth,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Icon
                  name={method.iconName}
                  size={28}
                  color={isActive ? colors.primary : colors.textPrimary}
                />
                <Text
                  variant="bodyBold"
                  color={isActive ? colors.primary : colors.textPrimary}
                  style={styles.methodLabel}
                >
                  {isAr ? method.label_ar : method.label_en}
                </Text>
                {isActive && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
              </Pressable>
            );
          })}
        </View>

        <Button
          title={t('payments.confirmPayment')}
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          fullWidth
          size="large"
          style={{ marginTop: spacing.lg }}
        />

        {/* Finance policy block — verbatim from the Finance Department docs. */}
        <View style={[styles.policyBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection, marginBottom: spacing.sm }}>
            {t('payments.financeNotesHeader')}
          </Text>
          {(isAr ? FINANCE_POLICY_NOTES.ar : FINANCE_POLICY_NOTES.en).map((line) => (
            <View key={line} style={[styles.policyRow, { flexDirection: rowDirection }]}>
              <View style={[styles.policyMark, { backgroundColor: colors.brandRed }]} />
              <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection, lineHeight: 18 }}>
                {line}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  amountBlock: {
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  amountText: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 36,
    lineHeight: 42,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  amountStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  grid: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  methodCard: {
    width: '47.5%',
    padding: spacing.base,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    gap: 8,
  },
  methodLabel: { textAlign: 'center' },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
  },
  policyBlock: {
    marginTop: spacing.lg,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
  },
  policyRow: {
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 4,
  },
  policyMark: {
    width: 5,
    height: 5,
    marginTop: 7,
  },
});
