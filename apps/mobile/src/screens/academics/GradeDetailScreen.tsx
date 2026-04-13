import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { Text, Card, ProgressBar, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function GradeDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const { enrollmentId } = route.params;

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['student', 'grade-detail', enrollmentId],
    queryFn: () => academicApi.getGradeDetail(enrollmentId),
  });

  if (isLoading) return <ScreenSkeleton />;
  const breakdown = data?.data;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}>
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('academics.gradeBreakdown')}</Text>

      {breakdown?.course_name && (
        <Card elevation="md" style={styles.headerCard}>
          <Text variant="h3" style={{ textAlign, writingDirection }}>{breakdown.course_name}</Text>
          <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{breakdown.course_code}</Text>
          {breakdown.current_grade && (
            <Text variant="h1" color={colors.primary} style={styles.grade}>
              {breakdown.current_grade}
            </Text>
          )}
        </Card>
      )}

      {breakdown?.components?.map((comp: any, i: number) => {
        const scoreRatio = comp.max_score > 0 ? comp.score / comp.max_score : 0;
        const avgRatio = comp.max_score > 0 ? comp.class_average / comp.max_score : 0;
        const variant = scoreRatio >= avgRatio ? 'success' : scoreRatio >= 0.6 ? 'warning' : 'error';

        return (
          <Card key={i} elevation="sm" style={styles.card}>
            <View style={[styles.compHeader, { flexDirection: rowDirection }]}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{comp.name}</Text>
              <Text variant="caption" color={colors.textSecondary}>
                {t('academics.weight')}: {comp.weight}%
              </Text>
            </View>

            <View style={[styles.scoreRow, { flexDirection: rowDirection }]}>
              <Text variant="caption" color={colors.textSecondary}>{t('academics.score')}</Text>
              <Text variant="bodyBold" color={colors.primary}>
                {comp.score}/{comp.max_score}
              </Text>
            </View>
            <ProgressBar progress={scoreRatio} variant={variant} style={styles.bar} />

            <View style={[styles.scoreRow, { flexDirection: rowDirection }]}>
              <Text variant="caption" color={colors.textSecondary}>{t('academics.classAverage')}</Text>
              <Text variant="body" color={colors.textSecondary}>
                {comp.class_average}/{comp.max_score}
              </Text>
            </View>
            <ProgressBar progress={avgRatio} variant="primary" height={4} style={styles.bar} />
          </Card>
        );
      })}

      {(!breakdown?.components || breakdown.components.length === 0) && (
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>
          {t('common.emptyGrades')}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  headerCard: { marginBottom: spacing.base, alignItems: 'center' },
  grade: { marginTop: spacing.sm },
  card: { marginBottom: spacing.md },
  compHeader: { justifyContent: 'space-between', marginBottom: spacing.sm },
  scoreRow: { justifyContent: 'space-between', marginBottom: spacing.xs },
  bar: { marginBottom: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
