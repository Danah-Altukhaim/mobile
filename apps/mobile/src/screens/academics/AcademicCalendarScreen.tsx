import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { AdvisingAppointment } from '@masari/shared';
import { Text, Tabs, ScreenSkeleton, Icon, EmptyState, type IconName } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { toLatnDigits } from '../../i18n/helpers';

const eventTypeIcons: Record<string, IconName> = {
  exam: 'exam',
  holiday: 'holiday',
  registration: 'registration',
  deadline: 'deadline',
};

export function AcademicCalendarScreen() {
  const { t, i18n } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const months = [
    { key: 'jan', label: locale === 'ar' ? 'يناير' : 'Jan' },
    { key: 'feb', label: locale === 'ar' ? 'فبراير' : 'Feb' },
    { key: 'mar', label: locale === 'ar' ? 'مارس' : 'Mar' },
    { key: 'apr', label: locale === 'ar' ? 'أبريل' : 'Apr' },
    { key: 'may', label: locale === 'ar' ? 'مايو' : 'May' },
  ];
  const [activeMonth, setActiveMonth] = useState('apr');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', 'calendar'],
    queryFn: () => academicApi.getCalendar(),
  });

  const { data: meetingsData } = useQuery({
    queryKey: ['student', 'advising-meetings'],
    queryFn: () => academicApi.getAdvisingMeetings(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const events = Array.isArray(data?.data) ? data.data : [];
  const meetings: AdvisingAppointment[] = (
    Array.isArray(meetingsData?.data) ? meetingsData.data : []
  ).filter((m: AdvisingAppointment) => m.status !== 'cancelled');

  const monthIndex = months.findIndex((m) => m.key === activeMonth);
  const filtered = events.filter((e: any) => new Date(e.start_date).getMonth() === monthIndex);

  const tonePerType: Record<string, { fg: string; wash: string }> = {
    exam: { fg: colors.brandRed, wash: colors.brandRedWash },
    holiday: { fg: colors.success, wash: colors.successWash },
    registration: { fg: colors.info, wash: colors.infoWash },
    deadline: { fg: colors.warning, wash: colors.warningWash },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الفصل الدراسي' : 'Spring 2026'}
        title={t('academics.calendar')}
      />
      <View style={styles.tabsWrap}>
        <Tabs tabs={months} activeKey={activeMonth} onChange={setActiveMonth} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Advising appointments scheduled for the student by an advisor/admin. */}
        <View style={[styles.advisingCard, { backgroundColor: colors.primaryWash, borderColor: colors.primary }]}>
          <View style={[styles.advisingHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.advisingMark, { backgroundColor: colors.primary }]} />
            <Text variant="bodyBold" color={colors.primary} style={{ textAlign, writingDirection }}>
              {t('academics.advisingAppointmentsTitle')}
            </Text>
          </View>
          {meetings.length === 0 ? (
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
              {t('academics.advisingAppointmentsEmpty')}
            </Text>
          ) : (
            meetings.map((m) => {
              const when = new Date(m.scheduled_at);
              const dateStr = when.toLocaleDateString(
                locale === 'ar' ? 'ar-u-ca-gregory' : 'en',
                { weekday: 'short', month: 'short', day: 'numeric' },
              );
              const timeStr = when.toLocaleTimeString(locale === 'ar' ? 'ar' : 'en', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const note = isAr ? m.notes_ar : m.notes_en;
              return (
                <View key={m.id} style={[styles.meetingRow, { borderColor: colors.primary }]}>
                  <Text variant="caption" color={colors.textPrimary} style={{ textAlign, writingDirection, fontWeight: '700' }}>
                    {isAr ? m.title_ar : m.title_en}
                  </Text>
                  <View style={[styles.meetingMeta, { flexDirection: rowDirection }]}>
                    <Icon name="schedule" size={12} color={colors.primary} />
                    <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                      {toLatnDigits(`${dateStr} · ${timeStr}`)}
                    </Text>
                  </View>
                  <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection, marginTop: 2 }}>
                    {t('academics.advisingAdvisor')}: {isAr ? m.advisor_ar : m.advisor_en}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection, marginTop: 2 }}>
                    {t('academics.advisingLocation')}: {isAr ? m.location_ar : m.location_en}
                  </Text>
                  {note ? (
                    <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection, marginTop: 2, fontStyle: 'italic' }}>
                      {note}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        {isError ? (
          <EmptyState icon="calendar" title={t('common.error')} tone="error" />
        ) : filtered.length === 0 ? (
          <EmptyState icon="calendar" title={t('common.emptyEvents')} tone="neutral" />
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {filtered.map((event: any, i: number, arr: any[]) => {
              const dateStr = new Date(event.start_date).toLocaleDateString(
                locale === 'ar' ? 'ar-u-ca-gregory' : 'en',
                { month: 'short', day: 'numeric' },
              );
              const dayNum = new Date(event.start_date).getDate();
              const tone = tonePerType[event.type] || { fg: colors.primary, wash: colors.primaryWash };
              const isLast = i === arr.length - 1;
              return (
                <View
                  key={i}
                  style={[
                    styles.row,
                    {
                      flexDirection: rowDirection,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <View style={[styles.dateBlock, { backgroundColor: tone.wash }]}>
                    <Text style={[styles.dateNum, { color: tone.fg }]}>
                      {toLatnDigits(String(dayNum))}
                    </Text>
                    <Text variant="caption" color={tone.fg}>
                      {toLatnDigits(dateStr.split(' ')[0])}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={[styles.typeRow, { flexDirection: rowDirection }]}>
                      <Icon name={eventTypeIcons[event.type] || 'schedule'} size={12} color={tone.fg} />
                      <Text variant="caption" color={tone.fg}>
                        {t(`academics.${event.type}`) || event.type}
                      </Text>
                    </View>
                    <Text
                      variant="bodyBold"
                      style={{ textAlign, writingDirection, marginTop: 2 }}
                      numberOfLines={2}
                    >
                      {locale === 'ar' ? event.title_ar : event.title_en}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsWrap: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  content: { padding: spacing.base },

  list: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    alignItems: 'center',
  },
  dateBlock: {
    width: 56,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNum: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 22,
    lineHeight: 24,
  },
  typeRow: {
    alignItems: 'center',
    gap: 4,
  },
  advisingCard: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: 6,
  },
  advisingHeader: { alignItems: 'center', gap: 8, marginBottom: spacing.xs },
  advisingMark: { width: 12, height: 2 },
  meetingRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  meetingMeta: { alignItems: 'center', gap: 4, marginTop: 2 },
});
