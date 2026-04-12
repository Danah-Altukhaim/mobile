import React, { useState } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, Tabs, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { paymentApi } from '../../services/api';
import { currentLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

const statusVariants = { completed: 'success', pending: 'warning', failed: 'error' } as const;

export function PaymentHistoryScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [filter, setFilter] = useState('all');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => paymentApi.getHistory(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const payments = Array.isArray(data?.data) ? data.data : [];
  const filtered = filter === 'all' ? payments : payments.filter((p: any) => p.status === filter);

  const tabs = [
    { key: 'all', label: t('payments.allPayments') },
    { key: 'completed', label: t('payments.paid') },
    { key: 'pending', label: t('payments.pending') },
    { key: 'failed', label: t('payments.failed') },
  ];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(item: any) => item.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
      ListHeaderComponent={
        <View>
          <Text variant="h2" style={styles.title}>{t('payments.history')}</Text>
          <Tabs tabs={tabs} activeKey={filter} onChange={setFilter} />
          <View style={styles.spacer} />
        </View>
      }
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyPayments')}</Text>
      }
      renderItem={({ item }: { item: any }) => {
        const dateStr = toLatnDigits(
          new Date(item.created_at).toLocaleDateString(
            currentLocale(),
            { year: 'numeric', month: 'short', day: 'numeric' },
          ),
        );
        const amount = formatCurrency(item.amount, item.currency || 'KWD');

        return (
          <Card elevation="sm" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View style={styles.info}>
                <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{amount}</Text>
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{dateStr} • {item.method?.toUpperCase()}</Text>
              </View>
              <Badge label={t(`payments.${item.status}`)} variant={statusVariants[item.status as keyof typeof statusVariants] || 'neutral'} />
            </View>
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  spacer: { height: spacing.base },
  card: { marginBottom: spacing.sm },
  row: { justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
