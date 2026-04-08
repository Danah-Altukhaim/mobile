import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { HijriDate } from '../../components/common';
import { AIAdvisorFAB } from '../../components/common';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { academicApi } from '../../services/api';

export function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['student', 'summary'],
    queryFn: () => academicApi.getStudentSummary(),
  });

  const { data: schedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: () => academicApi.getSchedule(),
  });

  const { data: assignments } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => academicApi.getAssignments(),
  });

  if (loadingSummary && loadingSchedule) return <ScreenSkeleton />;

  const studentData = summary?.data;
  const scheduleData = schedule?.data;
  const assignmentData = assignments?.data;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="body" color={colors.textInverse}>
              {t('home.greeting')}، {user?.name_ar || studentData?.student?.name_ar || ''}
            </Text>
            <HijriDate date={new Date()} />
          </View>
          {studentData && (
            <View style={styles.gpaChip}>
              <Text variant="small" color={colors.textInverse}>{t('academics.gpa')}</Text>
              <Text variant="h3" color={colors.secondary}>
                {studentData.student?.gpa_cumulative || '—'}
              </Text>
            </View>
          )}
        </View>

        {/* Today's Classes */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3">{t('home.todayClasses')}</Text>
          {scheduleData && Array.isArray(scheduleData) ? (
            scheduleData.length > 0 ? (
              scheduleData.map((section: any, i: number) => (
                <View key={i} style={styles.classItem}>
                  <Text variant="bodyBold">{section.course_name_ar || section.name_ar}</Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {section.course_code} • {section.schedule_slots?.[0]?.start_time} - {section.schedule_slots?.[0]?.end_time} • {section.room}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="body" color={colors.textSecondary}>لا توجد حصص اليوم</Text>
            )
          ) : (
            <Text variant="body" color={colors.textSecondary}>{t('common.loading')}</Text>
          )}
        </Card>

        {/* Upcoming Deadlines */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3">{t('home.upcomingDeadlines')}</Text>
          {assignmentData && Array.isArray(assignmentData) ? (
            assignmentData.slice(0, 3).map((a: any, i: number) => {
              const dueDate = new Date(a.due_date);
              const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const variant = daysUntil <= 1 ? 'error' : daysUntil <= 3 ? 'warning' : 'info';
              const label = daysUntil <= 0 ? 'اليوم' : daysUntil === 1 ? 'غداً' : `${daysUntil} أيام`;

              return (
                <View key={i} style={styles.deadlineItem}>
                  <Badge label={label} variant={variant} />
                  <Text variant="body">{a.title || a.title_ar} - {a.course_code}</Text>
                </View>
              );
            })
          ) : (
            <Text variant="body" color={colors.textSecondary}>{t('common.noData')}</Text>
          )}
        </Card>

        {/* Balance Due */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3">{t('home.balanceDue')}</Text>
          <Text variant="h1" color={colors.primary}>
            {studentData?.balance_due
              ? new Intl.NumberFormat('ar-KW', { style: 'currency', currency: studentData.currency || 'KWD' }).format(studentData.balance_due)
              : '—'}
          </Text>
        </Card>
      </ScrollView>

      <AIAdvisorFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 100 },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gpaChip: { alignItems: 'center' },
  card: { margin: spacing.base },
  classItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
