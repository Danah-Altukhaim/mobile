import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Text, Icon, IconName, ProgressRing, Card, Avatar, Triangle } from '../../components/ui';
import { GeometricPattern } from '../../components/common/GeometricPattern';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { shadows } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { useProfileSheet } from '../../store/profile-sheet.store';
import { useHomeWidgets } from '../../store/home-widgets.store';
import { academicApi } from '../../services/api';
import { localized, formatCurrency, toLatnDigits, dateLocale } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { courseColor } from '../../utils/courseColor';
import { haptic } from '../../utils/haptics';

function greetingKey() {
  const h = new Date().getHours();
  if (h < 5) return 'home.goodNight';
  if (h < 12) return 'home.goodMorning';
  if (h < 17) return 'home.goodAfternoon';
  return 'home.goodEvening';
}

function parseHHmm(t: string | undefined): Date | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return null;
  const d = new Date();
  d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
  return d;
}

function relativeMinutes(toDate: Date, now: Date): number {
  return Math.round((toDate.getTime() - now.getTime()) / 60000);
}

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const openProfileSheet = useProfileSheet((s) => s.open);

  const widgets = useHomeWidgets((s) => s.widgets);

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['student', 'summary'],
    queryFn: () => academicApi.getStudentSummary(),
  });
  const { data: schedule } = useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: () => academicApi.getSchedule(),
  });
  const { data: assignments } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => academicApi.getAssignments(),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptic.light();
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['student', 'summary'] }),
        queryClient.invalidateQueries({ queryKey: ['student', 'schedule'] }),
        queryClient.invalidateQueries({ queryKey: ['student', 'assignments'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const studentData = summary?.data;
  const scheduleData = (schedule?.data ?? []) as any[];
  const assignmentData = (assignments?.data ?? []) as any[];

  const fullName = isAr
    ? user?.name_ar || studentData?.student?.name_ar || ''
    : user?.name_en || studentData?.student?.name_en || '';
  const firstName = fullName.split(/\s+/).filter(Boolean)[0] || '';

  const gpa = studentData?.student?.gpa_cumulative;
  const gpaDisplay = gpa != null ? toLatnDigits(Number(gpa).toFixed(2)) : '—';
  const gpaProgress = gpa != null ? Math.min(1, Math.max(0, Number(gpa) / 4)) : 0;

  const balance = studentData?.balance_due;
  const balanceDisplay = balance != null
    ? formatCurrency(balance, studentData?.currency || 'KWD')
    : '—';
  const hasBalance = balance != null && balance > 0;

  // Single most-urgent context for the hero
  const heroPick = useMemo(() => {
    const now = new Date();
    const upcomingClass = scheduleData
      .map((c) => {
        const slot = c.schedule_slots?.[0];
        const at = parseHHmm(slot?.start_time);
        return at ? { c, at, mins: relativeMinutes(at, now) } : null;
      })
      .filter((x): x is { c: any; at: Date; mins: number } => !!x)
      .filter((x) => x.mins >= -10 && x.mins <= 120)
      .sort((a, b) => a.mins - b.mins)[0];
    if (upcomingClass) return { kind: 'class' as const, ...upcomingClass };

    if (hasBalance) return { kind: 'balance' as const };

    const todayAssignment = assignmentData
      .filter((a) => !a.submitted)
      .map((a) => {
        const due = new Date(a.due_date);
        const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { a, due, days };
      })
      .filter((x) => x.days <= 1)
      .sort((a, b) => a.days - b.days)[0];
    if (todayAssignment) return { kind: 'assignment' as const, ...todayAssignment };

    return { kind: 'gpa' as const };
  }, [scheduleData, assignmentData, hasBalance]);

  const dateLabel = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat(dateLocale('gregory'), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(now);
  }, [i18n.language]);

  const goToTab = (tab: string, screen: string) => navigation.navigate(tab, { screen });

  if (loadingSummary && !summary) return null;

  const enabledIds = new Set(widgets.filter((w) => w.enabled).map((w) => w.id));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textInverse}
            colors={[colors.primary]}
            progressViewOffset={20}
          />
        }
      >
        {/* HERO — solid green band with one wedge accent + clean header */}
        <View style={styles.hero}>
          <View style={styles.heroBg} />
          <GeometricPattern
            variant="cornerWedge"
            width={240}
            height={200}
            tone="light"
            opacity={0.10}
            style={[
              styles.heroWedge,
              isRTL ? { left: -20, transform: [{ scaleX: -1 }] } : { right: -20 },
            ]}
          />

          <View style={[styles.heroTop, { paddingTop: insets.top + 14, flexDirection: rowDirection }]}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                variant="overline"
                color={colors.secondaryLight}
                style={[styles.dateText, { textAlign, writingDirection }]}
              >
                {dateLabel}
              </Text>
              <Text
                variant="h2"
                color={colors.textInverse}
                numberOfLines={1}
                accessibilityRole="header"
                style={[styles.greeting, { textAlign, writingDirection }]}
              >
                {t(greetingKey())}{firstName ? `, ${firstName}` : ''}
              </Text>
            </View>

            <View style={[styles.heroChips, { flexDirection: rowDirection }]}>
              <Pressable
                onPress={() => {
                  haptic.selection();
                  navigation.navigate('Notifications');
                }}
                hitSlop={8}
                style={({ pressed }) => [styles.chipBtn, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel={t('notifications.title')}
              >
                <Icon name="notifications" size={18} color={colors.textInverse} />
                <View style={styles.bellDot} />
              </Pressable>
              <Pressable
                onPress={() => {
                  haptic.light();
                  openProfileSheet();
                }}
                hitSlop={8}
                style={({ pressed }) => [styles.avatarTrigger, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel={t('profile.title', { defaultValue: 'Profile' })}
              >
                <Avatar
                  name={fullName || 'C'}
                  size={40}
                  ring="rgba(255,255,255,0.55)"
                  tint="rgba(255,255,255,0.20)"
                />
              </Pressable>
            </View>
          </View>

          {/* Priority card — sits inside hero with a calm margin */}
          <View style={styles.priorityWrap}>
            <PriorityCard
              pick={heroPick}
              t={t}
              isRTL={isRTL}
              navigation={navigation}
              gpaDisplay={gpaDisplay}
              gpaProgress={gpaProgress}
              balanceDisplay={balanceDisplay}
              isAr={isAr}
            />
          </View>

          <View style={styles.heroStripe} />
        </View>

        {/* QUICK ACTIONS */}
        {enabledIds.has('quickActions') && (
          <View style={styles.quickWrap}>
            <View style={[styles.quickRow, { flexDirection: rowDirection }]}>
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.key}
                  style={({ pressed }) => [styles.quickItem, pressed && { transform: [{ scale: 0.97 }] }]}
                  onPress={() => {
                    haptic.selection();
                    goToTab(action.tab, action.screen);
                  }}
                  accessibilityRole="button"
                >
                  <View style={styles.quickTile}>
                    <View style={[styles.quickIconWedge, { backgroundColor: action.bg }]}>
                      <Icon name={action.icon} size={20} color={action.fg} />
                    </View>
                    <Text
                      variant="caption"
                      color={colors.textPrimary}
                      style={styles.quickLabel}
                      numberOfLines={1}
                    >
                      {t(action.label)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* TODAY'S CLASSES */}
        {enabledIds.has('todayClasses') && (
          <View>
            <SectionHeader
              title={t('home.todayClasses')}
              actionLabel={t('common.seeAll')}
              onPress={() => goToTab('AcademicsTab', 'Schedule')}
            />
            {scheduleData.length > 0 ? (
              <FlatList
                data={scheduleData}
                horizontal
                inverted={isRTL}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => `class-${i}`}
                contentContainerStyle={styles.classScroll}
                renderItem={({ item }) => <ClassCard item={item} />}
              />
            ) : (
              <View style={styles.emptyClassesCard}>
                <View style={[styles.emptyClassRow, { flexDirection: rowDirection }]}>
                  <View style={styles.emptyIconWedge}>
                    <Icon name="check" size={18} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                      {t('home.noClassesToday')}
                    </Text>
                    <Text
                      variant="small"
                      color={colors.textSecondary}
                      style={{ textAlign, writingDirection, marginTop: 2 }}
                    >
                      {t('home.enjoyDay')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* DEADLINES */}
        {enabledIds.has('deadlines') && (
          <View>
            <SectionHeader
              title={t('home.upcomingDeadlines')}
              actionLabel={t('common.seeAll')}
              onPress={() => goToTab('AcademicsTab', 'Assignments')}
            />
            <View style={styles.deadlineList}>
              {assignmentData.length > 0 ? (
                assignmentData.slice(0, 3).map((a: any, i: number, arr) => (
                  <DeadlineRow
                    key={i}
                    item={a}
                    isLast={i === arr.length - 1}
                    onPress={() => goToTab('AcademicsTab', 'Assignments')}
                  />
                ))
              ) : (
                <View style={styles.emptyDeadlines}>
                  <Text variant="small" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
                    {t('common.emptyAssignments')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* CUSTOMIZE LINK */}
        <Pressable
          onPress={() => {
            haptic.selection();
            navigation.navigate('Account', { screen: 'CustomizeHome' });
          }}
          style={({ pressed }) => [
            styles.customizeLink,
            { opacity: pressed ? 0.6 : 1, flexDirection: rowDirection },
          ]}
        >
          <Icon name="settings" size={13} color={colors.textTertiary} />
          <Text variant="caption" color={colors.textTertiary}>
            {t('customizeHome.entry')}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Priority Card
// ────────────────────────────────────────────────────────────────────────────

function PriorityCard({
  pick,
  t,
  isRTL,
  navigation,
  gpaDisplay,
  gpaProgress,
  balanceDisplay,
  isAr,
}: {
  pick: any;
  t: any;
  isRTL: boolean;
  navigation: any;
  gpaDisplay: string;
  gpaProgress: number;
  balanceDisplay: string;
  isAr: boolean;
}) {
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';
  const writingDirection = isRTL ? 'rtl' : 'ltr';

  if (pick.kind === 'class') {
    const accent = courseColor(pick.c.course_code);
    const minsLeft = pick.mins;
    const startStr = parseHHmm(pick.c.schedule_slots?.[0]?.start_time);
    const endStr = parseHHmm(pick.c.schedule_slots?.[0]?.end_time);
    const timeLabel = startStr && endStr
      ? `${startStr.toLocaleTimeString(isAr ? 'ar-KW' : 'en-KW', { hour: '2-digit', minute: '2-digit' })} – ${endStr.toLocaleTimeString(isAr ? 'ar-KW' : 'en-KW', { hour: '2-digit', minute: '2-digit' })}`
      : '';
    const courseName = localized(pick.c, 'course_name') || localized(pick.c, 'name');
    return (
      <Card
        variant="raised"
        elevation="lg"
        style={styles.priorityCard}
        padding="none"
        onPress={() => navigation.navigate('AcademicsTab', { screen: 'Schedule' })}
      >
        <View style={[styles.priorityAccentBar, { backgroundColor: accent.fg }]} />
        <View style={styles.priorityContent}>
          <View style={[styles.priorityHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.priorityChip, { backgroundColor: accent.wash, flexDirection: rowDirection }]}>
              <Icon name="schedule" size={12} color={accent.fg} />
              <Text variant="caption" color={accent.fg}>
                {minsLeft <= 0
                  ? t('home.now') || 'Now'
                  : minsLeft < 60
                    ? `${t('common.in') || 'in'} ${toLatnDigits(String(minsLeft))}m`
                    : timeLabel}
              </Text>
            </View>
            <Text variant="caption" color={colors.textTertiary}>
              {pick.c.course_code}
            </Text>
          </View>
          <Text
            variant="h3"
            color={colors.textPrimary}
            style={[styles.priorityTitle, { textAlign, writingDirection }]}
            numberOfLines={2}
          >
            {courseName}
          </Text>
          <View style={[styles.priorityMeta, { flexDirection: rowDirection }]}>
            <View style={[styles.metaPiece, { flexDirection: rowDirection }]}>
              <Icon name="location" size={13} color={colors.textTertiary} />
              <Text variant="small" color={colors.textSecondary}>
                {pick.c.room || '—'}
              </Text>
            </View>
            <View style={[styles.metaPiece, { flexDirection: rowDirection }]}>
              <Icon name="time" size={13} color={colors.textTertiary} />
              <Text variant="small" color={colors.textSecondary}>
                {timeLabel}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
  }

  if (pick.kind === 'balance') {
    return (
      <Card
        variant="raised"
        elevation="lg"
        style={styles.priorityCard}
        padding="none"
        onPress={() => navigation.navigate('Account', { screen: 'PaymentDashboard' })}
      >
        <View style={[styles.priorityAccentBar, { backgroundColor: colors.brandRed }]} />
        <View style={styles.priorityContent}>
          <View style={[styles.priorityHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.priorityChip, { backgroundColor: colors.brandRedWash, flexDirection: rowDirection }]}>
              <Icon name="warning" size={12} color={colors.brandRed} />
              <Text variant="caption" color={colors.brandRed}>
                {t('home.balanceDue')}
              </Text>
            </View>
          </View>
          <Text
            color={colors.brandRed}
            style={[styles.priorityAmount, { textAlign, writingDirection }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {balanceDisplay}
          </Text>
          <View style={[styles.priorityCTA, { flexDirection: rowDirection }]}>
            <Text variant="smallBold" color={colors.primary}>
              {t('home.payNow')}
            </Text>
            <Triangle size={6} color={colors.brandRed} />
          </View>
        </View>
      </Card>
    );
  }

  if (pick.kind === 'assignment') {
    const days = pick.days;
    const tone = days <= 0 ? colors.brandRed : days <= 1 ? colors.warning : colors.primary;
    const wash = days <= 0 ? colors.brandRedWash : days <= 1 ? colors.warningWash : colors.primaryWash;
    const labelKey = days <= 0 ? t('common.today') : days === 1 ? t('common.tomorrow') : `${days}d`;
    return (
      <Card
        variant="raised"
        elevation="lg"
        style={styles.priorityCard}
        padding="none"
        onPress={() => navigation.navigate('AcademicsTab', { screen: 'Assignments' })}
      >
        <View style={[styles.priorityAccentBar, { backgroundColor: tone }]} />
        <View style={styles.priorityContent}>
          <View style={[styles.priorityHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.priorityChip, { backgroundColor: wash, flexDirection: rowDirection }]}>
              <Icon name="assignments" size={12} color={tone} />
              <Text variant="caption" color={tone}>
                {labelKey}
              </Text>
            </View>
            <Text variant="caption" color={colors.textTertiary}>
              {pick.a.course_code}
            </Text>
          </View>
          <Text variant="h3" style={[styles.priorityTitle, { textAlign, writingDirection }]} numberOfLines={2}>
            {localized(pick.a, 'title')}
          </Text>
        </View>
      </Card>
    );
  }

  // GPA fallback
  return (
    <Card
      variant="raised"
      elevation="lg"
      style={styles.priorityCard}
      padding="none"
      onPress={() => navigation.navigate('AcademicsTab', { screen: 'Grades' })}
    >
      <View style={[styles.priorityAccentBar, { backgroundColor: colors.primary }]} />
      <View style={[styles.gpaCard, { flexDirection: rowDirection }]}>
        <ProgressRing
          progress={gpaProgress}
          size={88}
          strokeWidth={7}
          value={gpaDisplay}
          label={t('academics.gpa')}
          caption={`/ ${toLatnDigits('4.00')}`}
        />
        <View style={{ flex: 1, paddingHorizontal: spacing.base }}>
          <Text variant="h4" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
            {t('home.allClear')}
          </Text>
          <Text variant="small" color={colors.textTertiary} style={{ textAlign, writingDirection, marginTop: 4 }}>
            {balanceDisplay} · {t('home.balanceDue')}
          </Text>
          <View style={[styles.priorityCTA, { flexDirection: rowDirection, marginTop: spacing.sm }]}>
            <Text variant="smallBold" color={colors.primary}>
              {t('common.seeAll')}
            </Text>
            <Triangle size={6} color={colors.brandRed} />
          </View>
        </View>
      </View>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Class card
// ────────────────────────────────────────────────────────────────────────────

function ClassCard({ item }: { item: any }) {
  const accent = courseColor(item.course_code);
  const slot = item.schedule_slots?.[0];
  const start = slot?.start_time ?? '';
  const end = slot?.end_time ?? '';
  const { textAlign, writingDirection, isRTL } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={[styles.classCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.classAccent, { backgroundColor: accent.fg }]} />
      <View style={styles.classBody}>
        <View style={[styles.classCodeChip, { backgroundColor: accent.wash }]}>
          <Text variant="caption" color={accent.fg}>
            {item.course_code}
          </Text>
        </View>
        <Text
          variant="h4"
          color={colors.textPrimary}
          style={[styles.classTitle, { textAlign, writingDirection }]}
          numberOfLines={2}
        >
          {localized(item, 'course_name') || localized(item, 'name')}
        </Text>
        <View style={[styles.classFooter, { flexDirection: rowDirection }]}>
          <View style={[styles.classMeta, { flexDirection: rowDirection }]}>
            <Icon name="time" size={12} color={colors.textTertiary} />
            <Text variant="caption" color={colors.textSecondary}>
              {toLatnDigits(`${start}–${end}`)}
            </Text>
          </View>
          <View style={[styles.classMeta, { flexDirection: rowDirection }]}>
            <Icon name="location" size={12} color={colors.textTertiary} />
            <Text variant="caption" color={colors.textSecondary}>
              {item.room}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Deadline row
// ────────────────────────────────────────────────────────────────────────────

function DeadlineRow({
  item,
  isLast,
  onPress,
}: {
  item: any;
  isLast: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const dueDate = new Date(item.due_date);
  const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const tone = days <= 1 ? 'urgent' : days <= 3 ? 'soon' : 'later';
  const palette = DEADLINE_TONES[tone];
  const dayLabel = days <= 0 ? t('common.today') : days === 1 ? t('common.tomorrow') : toLatnDigits(String(days));
  const dayUnit = days > 1 ? t('home.daysShort') : '';

  return (
    <Pressable
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      style={({ pressed }) => [
        styles.deadlineRow,
        {
          flexDirection: rowDirection,
          opacity: pressed ? 0.6 : 1,
        },
        !isLast && styles.deadlineDivider,
      ]}
    >
      <View style={[styles.deadlinePill, { backgroundColor: palette.bg }]}>
        <Text color={palette.fg} style={styles.deadlineDay}>
          {dayLabel}
        </Text>
        {!!dayUnit && (
          <Text color={palette.fg} style={styles.deadlineDayUnit}>
            {dayUnit}
          </Text>
        )}
      </View>
      <View style={styles.deadlineBody}>
        <Text
          variant="bodyBold"
          numberOfLines={1}
          style={[{ textAlign, writingDirection }]}
        >
          {localized(item, 'title')}
        </Text>
        <Text
          variant="small"
          color={colors.textTertiary}
          numberOfLines={1}
          style={[{ textAlign, writingDirection, marginTop: 2 }]}
        >
          {item.course_code} · {t(`academics.${item.type}`, { defaultValue: item.type })}
        </Text>
      </View>
      <Triangle size={7} color={colors.chevron} />
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Section header
// ────────────────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  actionLabel,
  onPress,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  return (
    <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
      <Text variant="h4" style={[{ flex: 1, textAlign, writingDirection }]}>
        {title}
      </Text>
      {!!actionLabel && (
        <Pressable
          onPress={() => {
            haptic.selection();
            onPress?.();
          }}
          hitSlop={8}
          style={[styles.sectionAction, { flexDirection: rowDirection }]}
        >
          <Text variant="smallBold" color={colors.primary}>
            {actionLabel}
          </Text>
          <Triangle size={6} color={colors.brandRed} />
        </Pressable>
      )}
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────

const QUICK_ACTIONS: Array<{
  key: string;
  icon: IconName;
  label: string;
  tab: string;
  screen: string;
  bg: string;
  fg: string;
}> = [
  { key: 'schedule', icon: 'schedule', label: 'academics.schedule', tab: 'AcademicsTab', screen: 'Schedule', bg: '#E6F2E2', fg: '#006341' },
  { key: 'grades', icon: 'grades', label: 'academics.grades', tab: 'AcademicsTab', screen: 'Grades', bg: '#EFF7E0', fg: '#5A9020' },
  { key: 'assignments', icon: 'assignments', label: 'academics.assignments', tab: 'AcademicsTab', screen: 'Assignments', bg: '#E6F2E2', fg: '#006341' },
  { key: 'services', icon: 'briefcase', label: 'tabs.services', tab: 'ServicesTab', screen: 'ServicesHub', bg: '#EFF7E0', fg: '#5A9020' },
];

const DEADLINE_TONES = {
  urgent: { bg: colors.brandRedWash, fg: colors.brandRedDark },
  soon: { bg: colors.warningWash, fg: colors.warning },
  later: { bg: colors.primaryWash, fg: colors.primaryDark },
} as const;

const HERO_BG = colors.primaryDeep;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {},

  // Hero
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
    backgroundColor: HERO_BG,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HERO_BG,
  },
  heroWedge: {
    position: 'absolute',
    top: -10,
  },
  heroTop: {
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  dateText: {
    opacity: 0.85,
    marginBottom: 4,
  },
  greeting: {
    fontFamily: 'Almarai_800ExtraBold',
  },
  heroChips: {
    alignItems: 'center',
    gap: 10,
  },
  chipBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    backgroundColor: colors.brandRed,
    borderWidth: 1.5,
    borderColor: HERO_BG,
  },
  avatarTrigger: {},
  priorityWrap: {
    marginTop: spacing.xs,
  },
  heroStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brandRed,
  },

  // Priority card
  priorityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  priorityAccentBar: { height: 4 },
  priorityContent: { padding: spacing.lg },
  priorityHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  priorityChip: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  priorityTitle: { marginTop: 4 },
  priorityMeta: {
    marginTop: spacing.md,
    gap: spacing.lg,
    alignItems: 'center',
  },
  metaPiece: {
    alignItems: 'center',
    gap: 5,
  },
  priorityAmount: {
    marginTop: spacing.sm,
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  priorityCTA: {
    marginTop: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  gpaCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },

  // Quick actions
  quickWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  quickRow: {
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickItem: {
    flex: 1,
  },
  quickTile: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 8,
    minHeight: 84,
  },
  quickIconWedge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    lineHeight: 14,
  },

  // Section header
  sectionHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionAction: {
    alignItems: 'center',
    gap: 4,
  },

  // Today's classes
  classScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  classCard: {
    width: 230,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  classAccent: { height: 3 },
  classBody: {
    padding: spacing.base,
  },
  classCodeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: 8,
  },
  classTitle: {
    minHeight: 48,
    marginBottom: spacing.sm,
  },
  classFooter: {
    alignItems: 'center',
    gap: spacing.base,
  },
  classMeta: {
    alignItems: 'center',
    gap: 5,
  },

  emptyClassesCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.base,
  },
  emptyClassRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyIconWedge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.successWash,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Deadlines
  deadlineList: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
  },
  deadlineRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  deadlineDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  deadlinePill: {
    minWidth: 52,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineDay: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 14,
    lineHeight: 16,
  },
  deadlineDayUnit: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 10,
    lineHeight: 12,
    marginTop: 1,
    opacity: 0.8,
  },
  deadlineBody: { flex: 1, minWidth: 0 },
  emptyDeadlines: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },

  customizeLink: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.xl,
  },
});
