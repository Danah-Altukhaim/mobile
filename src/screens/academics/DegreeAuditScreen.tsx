import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ProgressBar, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const statusVariants = { completed: 'success', in_progress: 'info', not_started: 'neutral' } as const;

export function DegreeAuditScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const rightAlign = isRTL ? 'flex-start' : 'flex-end';

  const statusColors = { completed: colors.success, in_progress: colors.info, not_started: colors.textTertiary };

  const { data, isLoading } = useQuery({
    queryKey: ['degree-audit'],
    queryFn: () => academicApi.getDegreeAudit(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const audit = data?.data;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>
        {t('academics.degreeAudit')}
      </Text>

      <Card elevation="md" style={styles.progressCard}>
        <Text variant="h1" color={colors.primary} style={styles.percentage}>
          {audit?.completion_percentage || 0}%
        </Text>
        <Text variant="caption" color={colors.textSecondary}>{t('academics.completionRate')}</Text>
        <ProgressBar progress={(audit?.completion_percentage || 0) / 100} variant="primary" height={12} style={styles.bar} />
        <View style={[styles.statsRow, { flexDirection: rowDirection }]}>
          <View style={styles.stat}>
            <Text variant="bodyBold" color={colors.success}>{audit?.credits_completed || 0}</Text>
            <Text variant="caption" color={colors.textSecondary}>{t('academics.completed')}</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="bodyBold" color={colors.info}>{audit?.credits_in_progress || 0}</Text>
            <Text variant="caption" color={colors.textSecondary}>{t('academics.inProgress')}</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="bodyBold" color={colors.textTertiary}>{audit?.credits_remaining || 0}</Text>
            <Text variant="caption" color={colors.textSecondary}>{t('academics.remaining')}</Text>
          </View>
        </View>
        <Text variant="caption" color={colors.textSecondary} style={styles.total}>
          {t('academics.totalCredits')}: {audit?.total_credits_required || 0}
        </Text>
      </Card>

      {audit?.courses?.map((course: any, i: number) => (
        <Card key={i} elevation="sm" style={styles.courseCard}>
          <View style={[styles.courseRow, { flexDirection: rowDirection }]}>
            <View style={styles.courseInfo}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                {l(course, 'name') || course.code}
              </Text>
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection }}
              >
                {course.code} • {course.credits} {t('academics.credits')}
              </Text>
            </View>
            <View style={[styles.courseRight, { alignItems: rightAlign }]}>
              {course.grade && <Text variant="body" color={colors.primary}>{course.grade}</Text>}
              <Badge label={t(`academics.${course.status === 'in_progress' ? 'inProgress' : course.status}`)} variant={statusVariants[course.status as keyof typeof statusVariants] || 'neutral'} />
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  progressCard: { alignItems: 'center', marginBottom: spacing.xl },
  percentage: { marginBottom: spacing.xs },
  bar: { width: '100%', marginVertical: spacing.md },
  statsRow: { justifyContent: 'space-around', width: '100%' },
  stat: { alignItems: 'center' },
  total: { marginTop: spacing.sm },
  courseCard: { marginBottom: spacing.sm },
  courseRow: { justifyContent: 'space-between', alignItems: 'center' },
  courseInfo: { flex: 1 },
  courseRight: { gap: 4 },
});
