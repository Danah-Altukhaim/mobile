import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Button, Badge, ScreenSkeleton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';

export function PaymentDashboardScreen() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'fees'],
    queryFn: () => academicApi.getFees(),
  });

  if (isLoading) return <ScreenSkeleton />;

  const dashboard = data?.data;
  const currency = dashboard?.currency || 'KWD';
  const formatter = new Intl.NumberFormat('ar', { style: 'currency', currency });

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <View style={styles.header}>
        <Text variant="body" color={colors.textInverse}>{t('payments.balance')}</Text>
        <Text variant="h1" color={colors.secondary} style={styles.amount}>
          {dashboard?.balance_due != null ? formatter.format(dashboard.balance_due) : '—'}
        </Text>
        {dashboard?.next_due_date && (
          <Text variant="caption" color={colors.textInverse}>
            {t('payments.dueDate')}: {new Date(dashboard.next_due_date).toLocaleDateString('ar')}
          </Text>
        )}
        <Button
          title={t('payments.payNow')}
          onPress={() => {}}
          variant="secondary"
          style={styles.payButton}
          disabled={!dashboard?.balance_due || dashboard.balance_due <= 0}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Fee Breakdown */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>تفاصيل الرسوم</Text>
          {dashboard?.fees?.map((fee: any, i: number) => {
            const isPaid = parseFloat(fee.paid_amount) >= parseFloat(fee.amount);
            return (
              <View key={i} style={styles.feeRow}>
                <Text variant="body">{fee.description_ar}</Text>
                <View style={styles.feeRight}>
                  <Text variant="bodyBold">{formatter.format(parseFloat(fee.amount))}</Text>
                  <Badge
                    label={isPaid ? t('payments.paid') : t('payments.pending')}
                    variant={isPaid ? 'success' : 'warning'}
                  />
                </View>
              </View>
            );
          })}
        </Card>

        {/* Payment History */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>{t('payments.history')}</Text>
          {dashboard?.recent_payments?.length > 0 ? (
            dashboard.recent_payments.map((payment: any, i: number) => (
              <View key={i} style={styles.feeRow}>
                <View>
                  <Text variant="body">{formatter.format(parseFloat(payment.amount))}</Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {new Date(payment.created_at).toLocaleDateString('ar')} • {payment.method || 'KNET'}
                  </Text>
                </View>
                <Badge
                  label={payment.status === 'completed' ? t('payments.paid') : t('payments.pending')}
                  variant={payment.status === 'completed' ? 'success' : 'warning'}
                />
              </View>
            ))
          ) : (
            <Text variant="body" color={colors.textSecondary}>{t('common.noData')}</Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  amount: { fontSize: 40, marginVertical: spacing.sm },
  payButton: { marginTop: spacing.base, width: '100%' },
  scroll: { padding: spacing.base },
  card: { marginBottom: spacing.base },
  sectionTitle: { marginBottom: spacing.sm },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  feeRight: { alignItems: 'flex-end', gap: 4 },
});
