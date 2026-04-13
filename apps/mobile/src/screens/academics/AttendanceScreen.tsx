import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ProgressBar, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { academicApi } from '../../services/api';

export function AttendanceScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign } = useDirection();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: () => academicApi.getAttendance(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const courses = Array.isArray(data?.data) ? data.data : [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}>
      <Text variant="h2" style={[styles.title, { textAlign }]}>{t('academics.attendance')}</Text>

      {courses.map((course: any, i: number) => {
        const rate = course.total_sessions > 0
          ? course.present / course.total_sessions
          : 0;
        const variant = rate >= 0.85 ? 'success' : rate >= 0.75 ? 'warning' : 'error';

        return (
          <Card key={i} elevation="sm" style={styles.card}>
            <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.courseInfo}>
                <Text variant="bodyBold" style={{ textAlign }}>{l(course, 'course_name') || course.course_code}</Text>
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign }}>{course.course_code}</Text>
              </View>
              {course.warning && (
                <Badge label={t('academics.warningThreshold')} variant="error" />
              )}
            </View>

            <ProgressBar progress={rate} variant={variant} showLabel style={styles.progress} />

            <View style={[styles.stats, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={styles.stat}>
                <Text variant="caption" color={colors.success}>{t('academics.present')}</Text>
                <Text variant="bodyBold" color={colors.success}>{course.present}</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="caption" color={colors.error}>{t('academics.absent')}</Text>
                <Text variant="bodyBold" color={colors.error}>{course.absent}</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="caption" color={colors.warning}>{t('academics.excused')}</Text>
                <Text variant="bodyBold" color={colors.warning}>{course.excused || 0}</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="caption" color={colors.info}>{t('academics.late')}</Text>
                <Text variant="bodyBold" color={colors.info}>{course.late || 0}</Text>
              </View>
            </View>
          </Card>
        );
      })}

      {courses.length === 0 && (
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyClasses')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.md },
  header: { justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  courseInfo: { flex: 1 },
  progress: { marginBottom: spacing.md },
  stats: { justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
