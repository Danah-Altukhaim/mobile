import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';

const trendIcons = { up: '↑', down: '↓', stable: '→' };
const trendVariants = { up: 'success', down: 'error', stable: 'neutral' } as const;

function getGradeTrend(grade: string | null): 'up' | 'down' | 'stable' {
  if (!grade) return 'stable';
  const gpaMap: Record<string, number> = { 'A+': 4, 'A': 4, 'A-': 3.7, 'B+': 3.3, 'B': 3, 'B-': 2.7, 'C+': 2.3, 'C': 2, 'D': 1, 'F': 0 };
  const points = gpaMap[grade] || 0;
  return points >= 3.3 ? 'up' : points >= 2.7 ? 'stable' : 'down';
}

export function GradesScreen() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student', 'grades'],
    queryFn: () => academicApi.getGrades(),
  });

  if (isLoading) return <ScreenSkeleton />;

  const grades = data?.data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* GPA Summary */}
      <Card elevation="md" style={styles.gpaCard}>
        <View style={styles.gpaRow}>
          <View style={styles.gpaItem}>
            <Text variant="caption" color={colors.textSecondary}>{t('academics.gpa')}</Text>
            <Text variant="h1" color={colors.primary}>
              {grades?.cumulative_gpa?.toFixed(2) || '—'}
            </Text>
          </View>
          <View style={styles.gpaItem}>
            <Text variant="caption" color={colors.textSecondary}>{t('academics.credits')}</Text>
            <Text variant="h2" color={colors.primaryLight}>
              {grades?.credits_completed || 0}
            </Text>
          </View>
        </View>
      </Card>

      {/* Course Grades */}
      {grades?.courses?.map((course: any, i: number) => {
        const trend = getGradeTrend(course.grade);
        return (
          <Card key={i} elevation="sm" style={styles.courseCard}>
            <View style={styles.courseRow}>
              <View style={styles.courseInfo}>
                <Text variant="bodyBold">{course.course_name_ar || course.name_ar}</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {course.course_code} • {course.credit_hours || course.credits} {t('academics.credits')}
                </Text>
              </View>
              <View style={styles.gradeInfo}>
                <Text variant="h2" color={colors.primary}>
                  {course.grade || '—'}
                </Text>
                <Badge
                  label={trendIcons[trend]}
                  variant={trendVariants[trend]}
                />
              </View>
            </View>
          </Card>
        );
      })}

      {(!grades?.courses || grades.courses.length === 0) && (
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>
          {t('common.noData')}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  gpaCard: { marginBottom: spacing.base },
  gpaRow: { flexDirection: 'row', justifyContent: 'space-around' },
  gpaItem: { alignItems: 'center' },
  courseCard: { marginBottom: spacing.sm },
  courseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courseInfo: { flex: 1 },
  gradeInfo: { alignItems: 'center', gap: 4 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
