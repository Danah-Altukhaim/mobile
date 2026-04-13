import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ProgressBar, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { paymentApi } from '../../services/api';
import { currentLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

const statusVariants = { paid: 'success', upcoming: 'warning', future: 'neutral' } as const;

export function InstallmentPlansScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const l = useLocalizedField();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['installments'],
    queryFn: () => paymentApi.getInstallments(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const plan = data?.data;
  const installments = plan?.installments || [];
  const paidCount = installments.filter((i: any) => i.status === 'paid').length;
  const progress = installments.length > 0 ? paidCount / installments.length : 0;

  const formatAmount = (amount: number) =>
    formatCurrency(amount, plan?.currency || 'KWD');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('payments.installmentPlan')}</Text>

      <Card elevation="md" style={styles.summaryCard}>
        <Text variant="h3">{l(plan, 'plan_name') || t('payments.installmentPlan')}</Text>
        <Text variant="h2" color={colors.primary}>{formatAmount(plan?.total_amount || 0)}</Text>
        <ProgressBar progress={progress} variant="success" showLabel height={10} style={styles.bar} />
        <View style={[styles.statsRow, { flexDirection: rowDirection }]}>
          <Text variant="caption" color={colors.success}>{paidCount} {t('payments.paidInstallments')}</Text>
          <Text variant="caption" color={colors.textTertiary}>{installments.length - paidCount} {t('payments.remainingInstallments')}</Text>
        </View>
      </Card>

      {installments.map((inst: any, i: number) => {
        const dateStr = toLatnDigits(
          new Date(inst.due_date).toLocaleDateString(
            currentLocale(), { month: 'short', day: 'numeric', year: 'numeric' },
          ),
        );
        return (
          <Card key={i} elevation="sm" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View style={styles.info}>
                <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{formatAmount(inst.amount)}</Text>
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{dateStr}</Text>
              </View>
              <Badge label={t(`payments.${inst.status}`)} variant={statusVariants[inst.status as keyof typeof statusVariants] || 'neutral'} />
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  summaryCard: { alignItems: 'center', marginBottom: spacing.xl },
  bar: { width: '100%', marginVertical: spacing.md },
  statsRow: { justifyContent: 'space-between', width: '100%' },
  card: { marginBottom: spacing.sm },
  row: { justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
});
