import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { academicApi } from '../../services/api';
import { localized, currentLocale, dateLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

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

  const userName = isAr
    ? (user?.name_ar || studentData?.student?.name_ar || '')
    : (user?.name_en || studentData?.student?.name_en || '');

  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('');

  const now = new Date();
  const hijriLabel = toLatnDigits(
    new Intl.DateTimeFormat(dateLocale('islamic-umalqura'), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now),
  );
  const gregorianLabel = toLatnDigits(
    new Intl.DateTimeFormat(dateLocale('gregory'), {
      day: 'numeric',
      month: 'short',
    }).format(now),
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header — CCK Green with red maple-leaf accent */}
        <View style={styles.header}>
          <View style={styles.headerGlow} />
          <View style={styles.headerOrb} />
          <View style={[styles.mapleBar, isRTL ? { right: 0 } : { left: 0 }]} />

          <View
            style={[
              styles.headerTopRow,
              { flexDirection: rowDirection, justifyContent: isRTL ? 'flex-start' : 'flex-end' },
            ]}
          >
            <View style={[styles.dateBadge, { flexDirection: rowDirection }]}>
              <View style={styles.liveDot} />
              <Text variant="caption" color={colors.textInverse}>
                {hijriLabel}
              </Text>
              <View style={styles.dateBadgeDot} />
              <Text variant="caption" color={colors.blue300}>
                {gregorianLabel}
              </Text>
            </View>
          </View>

          <View style={[styles.headerMain, { flexDirection: rowDirection }]}>
            <View style={styles.avatar}>
              <View style={styles.avatarInner}>
                <Text variant="h3" color={colors.textInverse}>
                  {initials}
                </Text>
              </View>
            </View>
            <View style={styles.headerText}>
              <Text
                variant="caption"
                color={colors.blue300}
                style={[styles.greeting, { textAlign, writingDirection }]}
              >
                {t('home.greeting')}
              </Text>
              <Text
                variant="h2"
                color={colors.textInverse}
                style={[styles.userName, { textAlign, writingDirection }]}
                numberOfLines={1}
              >
                {userName}
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Classes */}
        <Card elevation="sm" style={styles.card}>
          <Text variant="h4" style={[styles.sectionTitle, { textAlign, writingDirection }]}>
            {t('home.todayClasses')}
          </Text>
          {scheduleData && Array.isArray(scheduleData) ? (
            scheduleData.length > 0 ? (
              scheduleData.map((section: any, i: number) => (
                <View key={i} style={[styles.classItem, { flexDirection: rowDirection }]}>
                  <View style={styles.classIndicator} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                      {localized(section, 'course_name') || localized(section, 'name')}
                    </Text>
                    <Text
                      variant="small"
                      color={colors.textSecondary}
                      style={{ textAlign, writingDirection }}
                    >
                      {section.course_code} · {section.schedule_slots?.[0]?.start_time}–{section.schedule_slots?.[0]?.end_time} · {section.room}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text variant="body" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
                {t('home.noClassesToday')}
              </Text>
            )
          ) : (
            <Text variant="body" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
              {t('common.loading')}
            </Text>
          )}
        </Card>

        {/* Upcoming Deadlines */}
        <Card elevation="sm" style={styles.card}>
          <Text variant="h4" style={[styles.sectionTitle, { textAlign, writingDirection }]}>
            {t('home.upcomingDeadlines')}
          </Text>
          {assignmentData && Array.isArray(assignmentData) ? (
            assignmentData.slice(0, 3).map((a: any, i: number) => {
              const dueDate = new Date(a.due_date);
              const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const variant = daysUntil <= 1 ? 'error' : daysUntil <= 3 ? 'warning' : 'info';
              const label = daysUntil <= 0
                ? t('common.today')
                : daysUntil === 1
                  ? t('common.tomorrow')
                  : t('common.daysLeft', { count: daysUntil });

              const isUrgent = variant === 'error';
              return (
                <View key={i} style={[styles.deadlineItem, { flexDirection: rowDirection }]}>
                  <View
                    style={[
                      styles.deadlineStripe,
                      { backgroundColor: isUrgent ? colors.brandRed : 'transparent' },
                    ]}
                  />
                  <Badge label={label} variant={variant} />
                  <Text variant="small" style={{ flex: 1, textAlign, writingDirection }}>
                    {localized(a, 'title')} · {a.course_code}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text variant="body" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
              {t('common.noData')}
            </Text>
          )}
        </Card>

        {/* Balance Due */}
        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab', { screen: 'PaymentDashboard' })}>
          <Card elevation="sm" style={styles.card}>
            <Text variant="h4" style={[styles.sectionTitle, { textAlign, writingDirection }]}>
              {t('home.balanceDue')}
            </Text>
            <Text variant="h1" color={colors.primary} style={{ fontFamily: 'Almarai_400Regular', textAlign, writingDirection }}>
              {studentData?.balance_due
                ? formatCurrency(studentData.balance_due, studentData.currency || 'KWD')
                : '—'}
            </Text>
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 120 },

  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    borderBottomWidth: 3,
    borderBottomColor: colors.brandRed,
  },
  mapleBar: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 64,
    backgroundColor: colors.brandRed,
  },
  headerGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.accent,
    opacity: 0.14,
    top: -90,
    start: -70,
  },
  headerOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.textInverse,
    opacity: 0.05,
    bottom: -70,
    end: -40,
  },
  headerTopRow: {
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  dateBadge: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    gap: spacing.sm,
  },
  dateBadgeDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.blue300,
    opacity: 0.7,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandRed,
    shadowColor: colors.brandRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  headerMain: {
    alignItems: 'center',
    gap: spacing.base,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  userName: {
    marginTop: 2,
  },
  card: { marginHorizontal: spacing.base, marginTop: spacing.sm },
  sectionTitle: { marginBottom: spacing.md },

  classItem: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  classIndicator: {
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  deadlineItem: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  deadlineStripe: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
});
