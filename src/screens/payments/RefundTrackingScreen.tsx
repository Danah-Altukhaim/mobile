import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { paymentApi } from '../../services/api';
import { currentLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

export function RefundTrackingScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const l = useLocalizedField();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['refunds'],
    queryFn: () => paymentApi.getRefunds(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const refunds = Array.isArray(data?.data) ? data.data : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h2" style={styles.title}>{t('payments.refundTracking')}</Text>

      {refunds.map((refund: any) => {
        const amount = formatCurrency(refund.amount, refund.currency || 'KWD');
        const dateStr = toLatnDigits(
          new Date(refund.initiated_at).toLocaleDateString(
            currentLocale(), { month: 'short', day: 'numeric' },
          ),
        );

        return (
          <Card key={refund.id} elevation="md" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <Text variant="h3" color={colors.primary}>{amount}</Text>
              <Badge label={refund.status} variant="warning" />
            </View>
            <Text variant="body" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{l(refund, 'reason')}</Text>
            <View style={styles.timeline}>
              <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{t('payments.initiated')}: {dateStr}</Text>
              <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                {t('payments.estimatedCompletion')}: {refund.estimated_completion}
              </Text>
            </View>
          </Card>
        );
      })}

      {refunds.length === 0 && (
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyPayments')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.md },
  row: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  timeline: { marginTop: spacing.sm, gap: spacing.xs },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
