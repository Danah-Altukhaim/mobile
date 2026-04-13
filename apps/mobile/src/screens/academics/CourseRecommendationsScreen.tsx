import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, Button, ProgressBar, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { aiApi } from '../../services/api';

export function CourseRecommendationsScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['ai', 'course-recommendations'],
    queryFn: () => aiApi.getCourseRecommendations(),
  });

  if (isLoading) return <ScreenSkeleton />;

  const recommendations = data?.data || [];

  const getWorkloadLabel = (level: string) => {
    if (level === 'light') return t('ai.workloadLight');
    if (level === 'heavy') return t('ai.workloadHeavy');
    return t('ai.workloadModerate');
  };

  const getWorkloadVariant = (level: string): 'success' | 'warning' | 'error' => {
    if (level === 'light') return 'success';
    if (level === 'heavy') return 'error';
    return 'warning';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="h2" style={{ textAlign, writingDirection }}>{t('ai.courseRecommendations')}</Text>
          <Text variant="caption" color={colors.textSecondary} style={[styles.subtitle, { textAlign, writingDirection }]}>
            {t('ai.studentsLikeYou')}
          </Text>
        </View>
        {recommendations.map((rec: any) => (
          <Card key={rec.id} elevation="md" style={styles.card}>
            <View style={[styles.cardHeader, { flexDirection: rowDirection }]}>
              <View style={styles.courseInfo}>
                <Text variant="h3" style={{ textAlign, writingDirection }}>{rec.course_code}</Text>
                <Text variant="body" style={{ textAlign, writingDirection }}>{l(rec, 'name')}</Text>
              </View>
              <View style={[styles.matchBadge, { backgroundColor: colors.primary + '10' }]}>
                <Text variant="h3" color={colors.primary}>{rec.match_score}%</Text>
                <Text variant="small" color={colors.textSecondary}>{t('ai.matchScore')}</Text>
              </View>
            </View>

            <View style={[styles.reasonRow, { backgroundColor: colors.surfaceVariant }]}>
              <Text variant="caption" color={colors.textSecondary}>{t('ai.reason')}:</Text>
              <Text variant="body" style={styles.reasonText}>{l(rec, 'reason')}</Text>
            </View>

            <View style={[styles.statsRow, { borderTopColor: colors.divider, flexDirection: rowDirection }]}>
              <View style={styles.stat}>
                <Text variant="caption" color={colors.textSecondary}>{t('ai.historicalGrade')}</Text>
                <Text variant="bodyBold">{rec.historical_grade_avg}</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="caption" color={colors.textSecondary}>{t('ai.workload')}</Text>
                <Badge label={getWorkloadLabel(rec.workload_level)} variant={getWorkloadVariant(rec.workload_level)} />
              </View>
              <View style={styles.stat}>
                <Text variant="caption" color={colors.textSecondary}>{t('academics.credits')}</Text>
                <Text variant="bodyBold">{rec.credits}</Text>
              </View>
            </View>

            <View style={styles.seatsRow}>
              <Text variant="caption" color={colors.textSecondary}>
                {t('academics.seatsAvailable')}: {rec.seats_available}/{rec.total_seats}
              </Text>
              <ProgressBar
                progress={rec.seats_available / rec.total_seats}
                variant={rec.seats_available > 5 ? 'success' : rec.seats_available > 0 ? 'warning' : 'error'}
                style={styles.seatsBar}
              />
            </View>

            <View style={[styles.scheduleRow, { borderTopColor: colors.divider }]}>
              <Text variant="caption" color={colors.textSecondary}>{rec.schedule}</Text>
              {rec.prerequisites.length > 0 && (
                <Text variant="small" color={colors.textTertiary}>
                  {t('academics.prerequisites')}: {rec.prerequisites.join(', ')}
                </Text>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: spacing.base },
  subtitle: { marginTop: spacing.xs },
  flex1: { flex: 1 },
  scroll: { padding: spacing.base, paddingBottom: 100 },
  card: { marginBottom: spacing.base },
  cardHeader: { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  courseInfo: { flex: 1 },
  matchBadge: { alignItems: 'center', borderRadius: borderRadius.md, padding: spacing.sm, minWidth: 60 },
  reasonRow: { borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  reasonText: { marginTop: 2 },
  statsRow: { justifyContent: 'space-between', paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  stat: { alignItems: 'center', gap: 2 },
  seatsRow: { paddingVertical: spacing.sm },
  seatsBar: { marginTop: spacing.xs },
  scheduleRow: { paddingTop: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, gap: 2 },
});
