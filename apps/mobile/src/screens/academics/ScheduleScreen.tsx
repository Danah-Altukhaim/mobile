import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, ScreenSkeleton, EmptyState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { localized, toLatnDigits } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { courseColor } from '../../utils/courseColor';

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
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: () => academicApi.getSchedule(),
  });

  const { dayMap, activeDays } = useMemo(() => {
    const sections = Array.isArray(data?.data) ? data!.data : [];
    const map: Record<string, { section: any; slot: any; reserved?: boolean }[]> = {};
    for (const section of sections) {
      for (const slot of section.schedule_slots || []) {
        const day = slot.day?.toLowerCase();
        if (!day) continue;
        if (!map[day]) map[day] = [];
        map[day].push({ section, slot });
      }
    }
    // Monday 11:00-12:00 is a reserved academic hour for all faculty, with no
    // lectures scheduled (Schedule Process and Rules doc). Surface it so the
    // gap in the timetable is explained rather than left blank.
    if (map['monday']?.length) {
      map['monday'].push({
        section: null,
        reserved: true,
        slot: { start_time: '11:00', end_time: '12:00' },
      });
    }
    for (const day of Object.keys(map)) {
      map[day].sort((a, b) => (a.slot.start_time || '').localeCompare(b.slot.start_time || ''));
    }
    const days = dayOrder.filter((d) => map[d]?.length);
    return { dayMap: map, activeDays: days };
  }, [data]);

  if (isLoading) return <ScreenSkeleton />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}>
      <View style={styles.titleBlock}>
        <Text variant="overline" color={colors.primary} style={[styles.eyebrow, { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }]}>
          {isAr ? 'الجدول الدراسي' : 'This week'}
        </Text>
        <Text variant="h1" accessibilityRole="header" style={[{ textAlign, writingDirection }]}>
          {t('academics.schedule')}
        </Text>
      </View>

      {isError ? (
        <EmptyState icon="schedule" title={t('common.error')} tone="error" />
      ) : activeDays.length === 0 ? (
        <EmptyState icon="schedule" title={t('common.noData')} tone="neutral" />
      ) : (
        activeDays.map((day) => (
          <View key={day} style={styles.daySection}>
            <View style={[styles.dayHeader, { flexDirection: rowDirection }]}>
              <View style={[styles.dayMark, { backgroundColor: colors.brandRed }]} />
              <Text variant="h4" style={{ flex: 1, textAlign, writingDirection }}>
                {isAr ? dayLabels[day]?.ar : dayLabels[day]?.en}
              </Text>
              <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
                {toLatnDigits(String(dayMap[day].filter((e) => !e.reserved).length))} {isAr ? 'محاضرات' : 'classes'}
              </Text>
            </View>
            <View style={styles.dayList}>
              {dayMap[day].map((entry, i) => {
                const isLast = i === dayMap[day].length - 1;
                if (entry.reserved) {
                  return (
                    <View
                      key={`reserved-${day}-${i}`}
                      style={[
                        styles.row,
                        styles.reservedRow,
                        { flexDirection: rowDirection, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
                      ]}
                    >
                      <View style={[styles.timeCol, { borderEndColor: colors.divider }]}>
                        <Text variant="smallBold" color={colors.textTertiary}>
                          {toLatnDigits(entry.slot.start_time || '')}
                        </Text>
                        <Text variant="caption" color={colors.textTertiary}>
                          {toLatnDigits(entry.slot.end_time || '')}
                        </Text>
                      </View>
                      <View style={styles.entryBody}>
                        <Text variant="bodyBold" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                          {t('academics.reservedSlot')}
                        </Text>
                        <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginTop: 2 }}>
                          {t('academics.reservedSlotNote')}
                        </Text>
                      </View>
                    </View>
                  );
                }
                const accent = courseColor(entry.section.course_code);
                const langKey = entry.section.language === 'ar'
                  ? 'academics.langAr'
                  : entry.section.language === 'bilingual'
                    ? 'academics.langBilingual'
                    : 'academics.langEn';
                return (
                  <View
                    key={`${entry.section.enrollment_id}-${i}`}
                    style={[
                      styles.row,
                      { flexDirection: rowDirection, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
                    ]}
                  >
                    <View style={[styles.timeCol, { borderEndColor: accent.fg }]}>
                      <Text variant="smallBold" color={colors.textPrimary}>
                        {toLatnDigits(entry.slot.start_time || '')}
                      </Text>
                      <Text variant="caption" color={colors.textTertiary}>
                        {toLatnDigits(entry.slot.end_time || '')}
                      </Text>
                    </View>
                    <View style={styles.entryBody}>
                      <View style={[styles.chipRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.courseChip, { backgroundColor: accent.wash }]}>
                          <Text variant="caption" color={accent.fg}>
                            {entry.section.course_code}
                          </Text>
                        </View>
                        <View style={[styles.courseChip, { backgroundColor: colors.background }]}>
                          <Text variant="caption" color={colors.textSecondary}>
                            {t(langKey)}
                          </Text>
                        </View>
                      </View>
                      <Text variant="bodyBold" numberOfLines={1} style={[{ textAlign, writingDirection, marginTop: 4 }]}>
                        {localized(entry.section, 'course_name') || localized(entry.section, 'name')}
                      </Text>
                      <Text variant="caption" color={colors.textSecondary} style={[{ textAlign, writingDirection, marginTop: 2 }]} numberOfLines={1}>
                        {localized(entry.section, 'instructor_name')} · {entry.slot.room || entry.section.room}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  titleBlock: { marginBottom: spacing.lg },
  eyebrow: { marginBottom: 6 },

  daySection: { marginBottom: spacing.xl },
  dayHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayMark: {
    width: 12,
    height: 2,
  },
  dayList: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    borderBottomColor: colors.divider,
  },
  timeCol: {
    minWidth: 64,
    paddingEnd: spacing.md,
    borderEndWidth: 2,
    alignItems: 'flex-start',
  },
  entryBody: { flex: 1, minWidth: 0 },
  chipRow: {
    gap: 6,
    flexWrap: 'wrap',
  },
  courseChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  reservedRow: {
    backgroundColor: colors.background,
  },
});
