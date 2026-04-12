import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function NewsFeedScreen() {
  const { t } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['campus-news'],
    queryFn: () => campusApi.getNews(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const news = Array.isArray(data?.data) ? data.data : [];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={news}
      keyExtractor={(item: any) => item.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
      ListHeaderComponent={<Text variant="h2" style={styles.title}>{t('campus.news')}</Text>}
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyNotifications')}</Text>
      }
      renderItem={({ item }: { item: any }) => {
        const dateStr = new Date(item.date).toLocaleDateString(
          locale === 'ar' ? 'ar-KW' : 'en-KW', { month: 'short', day: 'numeric' },
        );
        return (
          <Card elevation="sm" style={styles.card}>
            <View style={[styles.header, { flexDirection: rowDirection }]}>
              <Badge label={item.department} variant="info" />
              <Text variant="caption" color={colors.textTertiary}>{dateStr}</Text>
            </View>
            <Text variant="bodyBold" style={[styles.newsTitle, { textAlign, writingDirection }]}>{l(item, 'title')}</Text>
            <Text variant="body" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{l(item, 'excerpt')}</Text>
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
  card: { marginBottom: spacing.md },
  header: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  newsTitle: { marginBottom: spacing.xs },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
