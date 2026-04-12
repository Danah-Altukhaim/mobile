import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { localized } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
const dayLabels: Record<string, { ar: string; en: string }> = {
  sunday: { ar: 'الأحد', en: 'Sunday' },
  monday: { ar: 'الاثنين', en: 'Monday' },
  tuesday: { ar: 'الثلاثاء', en: 'Tuesday' },
  wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
  thursday: { ar: 'الخميس', en: 'Thursday' },
};

export function ScheduleScreen() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: () => academicApi.getSchedule(),
  });

  if (isLoading) return <ScreenSkeleton />;

  const sections = Array.isArray(data?.data) ? data.data : [];

  // Build a day -> slots map from sections
  const dayMap: Record<string, { section: any; slot: any }[]> = {};
  for (const section of sections) {
    for (const slot of section.schedule_slots || []) {
      const day = slot.day?.toLowerCase();
      if (!day) continue;
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push({ section, slot });
    }
  }

  // Sort slots within each day by start_time
  for (const day of Object.keys(dayMap)) {
    dayMap[day].sort((a, b) => (a.slot.start_time || '').localeCompare(b.slot.start_time || ''));
  }

  const activeDays = dayOrder.filter((d) => dayMap[d]?.length);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {activeDays.map((day) => (
        <View key={day}>
          <Text variant="h2" style={[styles.dayHeader, { textAlign, writingDirection }]}>
            {isAr ? dayLabels[day]?.ar : dayLabels[day]?.en}
          </Text>
          {dayMap[day].map((entry, i) => (
            <Card key={`${entry.section.enrollment_id}-${i}`} elevation="sm" style={styles.card}>
              <View style={[styles.row, { flexDirection: rowDirection }]}>
                <Badge label={entry.section.course_code} variant="info" />
                <Text variant="caption" color={colors.textSecondary}>
                  {entry.slot.start_time} - {entry.slot.end_time}
                </Text>
              </View>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                {localized(entry.section, 'course_name') || localized(entry.section, 'name')}
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                {localized(entry.section, 'instructor_name')} • {entry.slot.room || entry.section.room}
              </Text>
            </Card>
          ))}
        </View>
      ))}

      {activeDays.length === 0 && (
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
  dayHeader: { marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { marginBottom: spacing.sm },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
