import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, ScreenSkeleton, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { toLatnDigits } from '../../i18n/helpers';

export function NewsFeedScreen() {
  const { t, i18n } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const l = useLocalizedField();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['campus-news'],
    queryFn: () => campusApi.getNews(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const news = Array.isArray(data?.data) ? data.data : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'إعلانات الجامعة' : 'Updates'}
        title={t('campus.news')}
      />
      <FlatList
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        data={news}
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
            <EmptyState icon="news" title={t('common.error')} tone="error" />
          ) : (
            <EmptyState icon="news" title={t('common.emptyNotifications')} tone="neutral" />
          )
        }
        renderItem={({ item }: { item: any }) => {
          const dateStr = new Date(item.date).toLocaleDateString(
            locale === 'ar' ? 'ar-KW' : 'en-KW',
            { month: 'short', day: 'numeric' },
          );
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.header, { flexDirection: rowDirection }]}>
                <Badge
                  label={t(`campus.departments.${item.department}`, { defaultValue: item.department })}
                  variant="primary"
                  size="sm"
                />
                <Text variant="caption" color={colors.textTertiary}>
                  {toLatnDigits(dateStr)}
                </Text>
              </View>
              <Text
                variant="h4"
                style={{ textAlign, writingDirection, marginTop: 6 }}
                numberOfLines={2}
              >
                {l(item, 'title')}
              </Text>
              <Text
                variant="small"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginTop: 4 }}
                numberOfLines={3}
              >
                {l(item, 'excerpt')}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  header: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
