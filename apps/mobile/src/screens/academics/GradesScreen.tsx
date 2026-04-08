import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card, Badge } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const mockGrades = [
  { code: 'CS101', name: 'مقدمة في علوم الحاسب', grade: 'A-', points: 3.7, trend: 'up' },
  { code: 'MATH201', name: 'الرياضيات التطبيقية', grade: 'B+', points: 3.3, trend: 'stable' },
  { code: 'ENG102', name: 'اللغة الإنجليزية الأكاديمية', grade: 'A', points: 4.0, trend: 'up' },
  { code: 'IS210', name: 'نظم المعلومات الإدارية', grade: 'B', points: 3.0, trend: 'down' },
];

const trendIcons = { up: '↑', down: '↓', stable: '→' };
const trendVariants = { up: 'success', down: 'error', stable: 'neutral' } as const;

export function GradesScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* GPA Summary */}
      <Card elevation="md" style={styles.gpaCard}>
        <View style={styles.gpaRow}>
          <View style={styles.gpaItem}>
            <Text variant="caption" color={colors.textSecondary}>
              {t('academics.gpa')}
            </Text>
            <Text variant="h1" color={colors.primary}>
              ٣.٤٥
            </Text>
          </View>
          <View style={styles.gpaItem}>
            <Text variant="caption" color={colors.textSecondary}>
              {t('academics.semester')}
            </Text>
            <Text variant="h2" color={colors.primaryLight}>
              ٣.٥٠
            </Text>
          </View>
          <View style={styles.gpaItem}>
            <Text variant="caption" color={colors.textSecondary}>
              {t('academics.credits')}
            </Text>
            <Text variant="h2" color={colors.primaryLight}>
              ٤٥
            </Text>
          </View>
        </View>
      </Card>

      {/* Course Grades */}
      {mockGrades.map((course) => (
        <Card key={course.code} elevation="sm" style={styles.courseCard}>
          <View style={styles.courseRow}>
            <View style={styles.courseInfo}>
              <Text variant="bodyBold">{course.name}</Text>
              <Text variant="caption" color={colors.textSecondary}>
                {course.code}
              </Text>
            </View>
            <View style={styles.gradeInfo}>
              <Text variant="h2" color={colors.primary}>
                {course.grade}
              </Text>
              <Badge
                label={trendIcons[course.trend as keyof typeof trendIcons]}
                variant={trendVariants[course.trend as keyof typeof trendVariants]}
              />
            </View>
          </View>
        </Card>
      ))}
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
});
