import React, { useMemo } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Text, ListItem, Badge, ScreenSkeleton, Icon } from '../../components/ui';
import type { IconName } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { notificationApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const typeIcons: Record<string, string> = {
  payment: 'card',
  grade: 'stats-chart',
  event: 'calendar',
  gpa: 'ribbon',
};

export function NotificationsListScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const locale = useUIStore((s) => s.locale);
  const { isRTL, textAlign, writingDirection } = useDirection();

  const dynamicStyles = useMemo(() => ({
    container: { flex: 1, backgroundColor: colors.background },
    unread: { backgroundColor: colors.surfaceVariant },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: spacing.xs },
  }), [colors]);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const notifications = Array.isArray(data?.data) ? data.data : [];

  return (
    <FlatList
      style={dynamicStyles.container}
      contentContainerStyle={styles.content}
      data={notifications}
      keyExtractor={(item: any) => item.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
      ListHeaderComponent={
        <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>
          {t('notifications.title')}
        </Text>
      }
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('notifications.noNotifications')}</Text>
      }
      renderItem={({ item }: { item: any }) => {
        const dateStr = new Date(item.created_at).toLocaleDateString(
          locale === 'ar' ? 'ar-KW' : 'en-KW', { month: 'short', day: 'numeric' },
        );
        return (
          <ListItem
            title={locale === 'ar' ? item.title_ar : item.title_en}
            subtitle={locale === 'ar' ? item.body_ar : item.body_en}
            left={<Ionicons name={(typeIcons[item.type] || 'notifications') as any} size={24} color={colors.primary} />}
            right={
              <View style={[styles.right, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                <Text variant="caption" color={colors.textTertiary}>{dateStr}</Text>
                {!item.is_read && <View style={dynamicStyles.unreadDot} />}
              </View>
            }
            style={!item.is_read ? [styles.item, dynamicStyles.unread] : styles.item}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  item: { marginBottom: spacing.sm },
  icon: { fontSize: 24 },
  right: {},
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
