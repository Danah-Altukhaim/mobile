import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Text, Card, Button, Icon } from '../../components/ui';
import type { IconName } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { paymentApi } from '../../services/api';
import { formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

const methods: { id: string; label_en: string; label_ar: string; iconName: IconName; prominent: boolean }[] = [
  { id: 'knet', label_en: 'KNET', label_ar: 'كي نت', iconName: 'bank', prominent: true },
  { id: 'mada', label_en: 'mada', label_ar: 'مدى', iconName: 'card', prominent: false },
  { id: 'apple_pay', label_en: 'Apple Pay', label_ar: 'أبل باي', iconName: 'apple', prominent: false },
  { id: 'visa', label_en: 'Visa / MC', label_ar: 'فيزا / ماستركارد', iconName: 'card', prominent: false },
];

export function PaymentMethodScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const { amount, feeIds } = route.params;
  const [selected, setSelected] = useState('knet');

  const mutation = useMutation({
    mutationFn: () => paymentApi.initiatePayment({ amount, fee_ids: feeIds, method: selected }),
    onSuccess: (data: any) => {
      navigation.navigate('PaymentConfirmation', { paymentId: data?.data?.payment_id || 'mock-001' });
    },
  });

  const formattedAmount = formatCurrency(amount, 'KWD');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h2" style={styles.title}>{t('payments.selectMethod')}</Text>

      <Card elevation="md" style={styles.amountCard}>
        <Text variant="caption" color={colors.textSecondary}>{t('payments.balance')}</Text>
        <Text variant="h1" color={colors.primary}>{formattedAmount}</Text>
      </Card>

      <View style={[styles.grid, { flexDirection: rowDirection }]}>
        {methods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              selected === method.id && { borderColor: colors.primary, backgroundColor: colors.surfaceVariant },
              method.prominent && styles.methodProminent,
            ]}
            onPress={() => setSelected(method.id)}
            activeOpacity={0.8}
          >
            <Icon name={method.iconName} size={32} color={selected === method.id ? colors.primary : colors.textPrimary} />
            <Text variant="bodyBold" color={selected === method.id ? colors.primary : colors.textPrimary} style={styles.methodLabel}>
              {isRTL ? method.label_ar : method.label_en}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={t('payments.confirmPayment')}
        onPress={() => mutation.mutate()}
        loading={mutation.isPending}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  amountCard: { alignItems: 'center', marginBottom: spacing.xl },
  grid: { flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  methodCard: {
    width: '47%',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    minHeight: 100,
    justifyContent: 'center',
  },
  methodProminent: {
    borderWidth: 2,
  },
  methodLabel: { marginTop: spacing.sm },
  button: { marginTop: spacing.base },
});
