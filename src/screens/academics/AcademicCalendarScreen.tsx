import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, Tabs, ScreenSkeleton, Icon } from '../../components/ui';
import type { IconName } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const eventTypeVariants: Record<string, 'error' | 'warning' | 'info' | 'success' | 'neutral'> = {
  exam: 'error',
  holiday: 'success',
  registration: 'info',
  deadline: 'warning',
};

const eventTypeIcons: Record<string, IconName> = {
  exam: 'exam',
  holiday: 'holiday',
  registration: 'registration',
  deadline: 'deadline',
};

export function AcademicCalendarScreen() {
  const { t } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const months = [
    { key: 'jan', label: locale === 'ar' ? 'يناير' : 'Jan' },
    { key: 'feb', label: locale === 'ar' ? 'فبراير' : 'Feb' },
    { key: 'mar', label: locale === 'ar' ? 'مارس' : 'Mar' },
    { key: 'apr', label: locale === 'ar' ? 'أبريل' : 'Apr' },
    { key: 'may', label: locale === 'ar' ? 'مايو' : 'May' },
  ];
  const [activeMonth, setActiveMonth] = useState('apr');

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'calendar'],
    queryFn: () => academicApi.getCalendar(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const events = Array.isArray(data?.data) ? data.data : [];

  const monthIndex = months.findIndex((m) => m.key === activeMonth);
  const filtered = events.filter((e: any) => {
    const month = new Date(e.start_date).getMonth();
    return month === monthIndex;
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="h2" style={styles.title}>{t('academics.calendar')}</Text>

      <Tabs tabs={months} activeKey={activeMonth} onChange={setActiveMonth} />

      <View style={styles.list}>
        {filtered.map((event: any, i: number) => {
          const dateStr = new Date(event.start_date).toLocaleDateString(
            locale === 'ar' ? 'ar-u-ca-gregory' : 'en',
            { month: 'short', day: 'numeric' },
          );
          const endStr = event.end_date
            ? new Date(event.end_date).toLocaleDateString(
                locale === 'ar' ? 'ar-u-ca-gregory' : 'en',
                { month: 'short', day: 'numeric' },
              )
            : null;

          return (
            <Card key={i} elevation="sm" style={styles.card}>
              <View style={[styles.row, { flexDirection: rowDirection }]}>
                <View style={styles.iconWrap}>
                  <Icon name={eventTypeIcons[event.type] || 'schedule'} size={24} color={colors.primary} />
                </View>
                <View style={styles.info}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                    {locale === 'ar' ? event.title_ar : event.title_en}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                    {dateStr}{endStr ? ` — ${endStr}` : ''}
                  </Text>
                </View>
                <Badge
                  label={t(`academics.${event.type}`) || event.type}
                  variant={eventTypeVariants[event.type] || 'neutral'}
                />
              </View>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Text variant="body" color={colors.textSecondary} style={styles.empty}>
            {t('common.emptyEvents')}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  list: { marginTop: spacing.base },
  card: { marginBottom: spacing.sm },
  row: { alignItems: 'center' },
  iconWrap: { marginEnd: spacing.md },
  info: { flex: 1 },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
