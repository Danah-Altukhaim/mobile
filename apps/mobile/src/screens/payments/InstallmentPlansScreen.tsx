import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, ProgressBar, ScreenSkeleton, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { paymentApi } from '../../services/api';
import { currentLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';

const statusVariants = { paid: 'success', upcoming: 'warning', future: 'neutral' } as const;

export function InstallmentPlansScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const l = useLocalizedField();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['installments'],
    queryFn: () => paymentApi.getInstallments(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const plan = data?.data;
  const installments = plan?.installments || [];
  const paidCount = installments.filter((i: any) => i.status === 'paid').length;
  const progress = installments.length > 0 ? paidCount / installments.length : 0;
  const formatAmount = (amount: number) => formatCurrency(amount, plan?.currency || 'KWD');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={l(plan, 'plan_name') || (isAr ? 'خطة' : 'Plan')}
        title={t('payments.installmentPlan')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={[styles.summaryBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}>
            {t('payments.balance')}
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.primary, textAlign, writingDirection }]}>
            {formatAmount(plan?.total_amount || 0)}
          </Text>
          <ProgressBar progress={progress} variant="success" height={6} style={{ marginTop: spacing.sm }} />
          <View style={[styles.statsRow, { flexDirection: rowDirection, borderTopColor: colors.divider }]}>
            <View style={styles.stat}>
              <Text variant="caption" color={colors.textTertiary}>{t('payments.paidInstallments')}</Text>
              <Text variant="bodyBold" color={colors.success}>
                {toLatnDigits(String(paidCount))}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.stat}>
              <Text variant="caption" color={colors.textTertiary}>{t('payments.remainingInstallments')}</Text>
              <Text variant="bodyBold" color={colors.warning}>
                {toLatnDigits(String(installments.length - paidCount))}
              </Text>
            </View>
          </View>
        </View>

        {/* List */}
        <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
          <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
          <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
            {isAr ? 'الأقساط' : 'Schedule'}
          </Text>
        </View>

        {isError ? (
          <EmptyState icon="installment" title={t('common.error')} tone="error" />
        ) : installments.length === 0 ? (
          <EmptyState icon="installment" title={t('common.noData')} tone="neutral" />
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {installments.map((inst: any, i: number, arr: any[]) => {
              const dateStr = toLatnDigits(
                new Date(inst.due_date).toLocaleDateString(currentLocale(), {
                  month: 'short', day: 'numeric', year: 'numeric',
                }),
              );
              const tone = statusVariants[inst.status as keyof typeof statusVariants] || 'neutral';
              const accentColor =
                inst.status === 'paid' ? colors.success
                  : inst.status === 'upcoming' ? colors.warning
                    : colors.borderStrong;
              const isLast = i === arr.length - 1;
              return (
                <View
                  key={i}
                  style={[
                    styles.row,
                    {
                      flexDirection: rowDirection,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <View style={[styles.rowAccent, { backgroundColor: accentColor }]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                      {formatAmount(inst.amount)}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection, marginTop: 2 }}>
                      {dateStr}
                    </Text>
                  </View>
                  <Badge label={t(`payments.${inst.status}`)} variant={tone} size="sm" />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  summaryBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryAmount: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 32,
    lineHeight: 38,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28 },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },

  list: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
  },
  rowAccent: { width: 3, height: 36 },
});
