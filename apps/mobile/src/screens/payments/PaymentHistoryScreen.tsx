import React, { useState } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, Tabs, ScreenSkeleton, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { paymentApi } from '../../services/api';
import { currentLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';

const statusVariants = { completed: 'success', pending: 'warning', failed: 'error' } as const;

export function PaymentHistoryScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [filter, setFilter] = useState('all');
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'سجل المدفوعات' : 'All transactions'}
        title={t('payments.history')}
      />
      <View style={styles.tabsWrap}>
        <Tabs tabs={tabs} activeKey={filter} onChange={setFilter} />
      </View>
      <FlatList
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        data={filtered}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="payment-history" title={t('common.error')} tone="error" />
          ) : (
            <EmptyState icon="payment-history" title={t('common.emptyPayments')} tone="neutral" />
          )
        }
        renderItem={({ item }: { item: any }) => {
          const dateStr = toLatnDigits(
            new Date(item.created_at).toLocaleDateString(currentLocale(), {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          );
          const amount = formatCurrency(item.amount, item.currency || 'KWD');
          const tone = statusVariants[item.status as keyof typeof statusVariants] || 'neutral';
          const accentColor =
            item.status === 'completed' ? colors.success
              : item.status === 'pending' ? colors.warning
                : item.status === 'failed' ? colors.brandRed
                  : colors.textTertiary;
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.accent, { backgroundColor: accentColor }]} />
              <View style={styles.body}>
                <View style={[styles.row, { flexDirection: rowDirection }]}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                      {amount}
                    </Text>
                    <Text
                      variant="caption"
                      color={colors.textSecondary}
                      style={{ textAlign, writingDirection, marginTop: 2 }}
                    >
                      {dateStr} · {item.method?.toUpperCase()}
                    </Text>
                  </View>
                  <Badge label={t(`payments.${item.status}`)} variant={tone} size="sm" />
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsWrap: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  accent: { width: 3, position: 'absolute', top: 0, bottom: 0, start: 0 },
  body: { padding: spacing.base, paddingStart: spacing.base + 6 },
  row: { justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
});
