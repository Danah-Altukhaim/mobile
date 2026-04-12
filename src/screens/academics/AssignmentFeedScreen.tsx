import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useUIStore } from '../../store/ui.store';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const typeIcons: Record<string, string> = {
  homework: 'document-text',
  quiz: 'list',
  exam: 'school',
  project: 'code-slash',
};

export function AssignmentFeedScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const locale = useUIStore((s) => s.locale);
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const rightAlign = isRTL ? 'flex-start' : 'flex-end';

  function getUrgency(dueDate: string): { color: string; variant: 'error' | 'warning' | 'info' } {
    const now = Date.now();
    const due = new Date(dueDate).getTime();
    const hoursLeft = (due - now) / (1000 * 60 * 60);
    if (hoursLeft < 24) return { color: colors.error, variant: 'error' };
    if (hoursLeft < 72) return { color: colors.warning, variant: 'warning' };
    return { color: colors.info, variant: 'info' };
  }

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => academicApi.getAssignments(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const assignments = Array.isArray(data?.data) ? data.data : [];
  const sorted = [...assignments].sort(
    (a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={sorted}
      keyExtractor={(item: any, i) => item.id || String(i)}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
      ListHeaderComponent={
        <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>
          {t('academics.allAssignments')}
        </Text>
      }
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyAssignments')}</Text>
      }
      renderItem={({ item }: { item: any }) => {
        const urgency = getUrgency(item.due_date);
        const dueStr = new Date(item.due_date).toLocaleDateString(
          locale === 'ar' ? 'ar-KW' : 'en-KW',
          { weekday: 'short', month: 'short', day: 'numeric' },
        );

        return (
          <Card elevation="sm" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View style={styles.info}>
                <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                  {l(item, 'title')}
                </Text>
                <Text
                  variant="caption"
                  color={colors.textSecondary}
                  style={{ textAlign, writingDirection }}
                >
                  {item.course_code} <Ionicons name={(typeIcons[item.type] || 'document') as any} size={14} color={colors.textSecondary} />
                </Text>
              </View>
              <View style={[styles.right, { alignItems: rightAlign }]}>
                <Badge label={dueStr} variant={urgency.variant} />
                {item.submitted && (
                  <Text variant="caption" color={colors.success}>{t('academics.submitted')}</Text>
                )}
              </View>
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
  card: { marginBottom: spacing.sm },
  row: { justifyContent: 'space-between', alignItems: 'center' },
  info: { flex: 1 },
  right: { gap: 4 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
