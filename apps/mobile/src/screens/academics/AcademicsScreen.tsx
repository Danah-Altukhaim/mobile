import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Icon, ProgressRing, Triangle, type IconName } from '../../components/ui';
import { GeometricPattern } from '../../components/common/GeometricPattern';
import { AcademicWarningBanner } from '../../components/common/AcademicWarningBanner';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { localized, toLatnDigits } from '../../i18n/helpers';
import { haptic } from '../../utils/haptics';

type FeatureDef = { key: string; icon: IconName; titleKey: string };
type SectionDef = { key: string; icon: IconName; titleKey: string };

const PRIMARY: FeatureDef[] = [
  { key: 'Schedule', icon: 'schedule', titleKey: 'academics.schedule' },
  { key: 'Grades', icon: 'grades', titleKey: 'academics.grades' },
  { key: 'Assignments', icon: 'assignments', titleKey: 'academics.assignments' },
  { key: 'Calendar', icon: 'calendar', titleKey: 'academics.calendar' },
];

const SECONDARY: SectionDef[] = [
  { key: 'Attendance', icon: 'attendance', titleKey: 'academics.attendance' },
  { key: 'GpaCalculator', icon: 'target', titleKey: 'academics.gpaCalculator' },
  { key: 'DegreeAudit', icon: 'degree', titleKey: 'academics.degreeAudit' },
  { key: 'CourseRegistration', icon: 'registration', titleKey: 'academics.courseRegistration' },
  { key: 'CourseRecommendations', icon: 'sparkles', titleKey: 'academics.courseRecommendations' },
  { key: 'TranscriptRequest', icon: 'transcript', titleKey: 'academics.transcript' },
];

function parseHHmm(t: string | undefined): Date | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return null;
  const d = new Date();
  d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
  return d;
}

export function AcademicsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const bottomInset = useContentBottomInset();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const isAr = i18n.language === 'ar';

  const { data: summary } = useQuery({
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

  const gpa = summary?.data?.student?.gpa_cumulative;
  const gpaProgress = gpa != null ? Math.min(1, Math.max(0, Number(gpa) / 4)) : 0;
  const gpaDisplay = gpa != null ? toLatnDigits(Number(gpa).toFixed(2)) : '—';
  const term = summary?.data?.current_term;
  const termLabel = term ? localized(term, 'name') : '';

  const scheduleData = (schedule?.data ?? []) as any[];
  const assignmentData = (assignments?.data ?? []) as any[];
  const dueCount = useMemo(
    () => assignmentData.filter((a: any) => !a.submitted).length,
    [assignmentData],
  );

  const nextClass = useMemo(() => {
    const now = new Date();
    return scheduleData
      .map((c) => ({ c, at: parseHHmm(c.schedule_slots?.[0]?.start_time) }))
      .filter((x): x is { c: any; at: Date } => !!x.at)
      .filter((x) => x.at.getTime() > now.getTime() - 10 * 60 * 1000)
      .sort((a, b) => a.at.getTime() - b.at.getTime())[0];
  }, [scheduleData]);

  const nextClassLabel = useMemo(() => {
    if (!nextClass) return null;
    const mins = Math.round((nextClass.at.getTime() - Date.now()) / 60000);
    if (mins <= 0) return t('home.now');
    if (mins <= 60) return `${t('common.in')} ${toLatnDigits(String(mins))}m`;
    return toLatnDigits(
      nextClass.at.toLocaleTimeString(isAr ? 'ar-KW' : 'en-KW', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    );
  }, [nextClass, isAr, t]);

  // Per-card live meta — keeps each feature card informative, not just a label.
  const meta: Record<string, { text: string; urgent?: boolean } | null> = {
    Schedule: nextClassLabel
      ? { text: `${t('home.now') === nextClassLabel ? '' : t('academics.next') + ' '}${nextClassLabel}`.trim() }
      : { text: t('home.noClassesToday') },
    Grades: gpa != null ? { text: `${t('academics.gpa')} ${gpaDisplay}` } : null,
    Assignments:
      dueCount > 0
        ? { text: `${toLatnDigits(String(dueCount))} ${t('academics.due')}`, urgent: true }
        : { text: t('home.allClear') },
    Calendar: termLabel ? { text: termLabel } : null,
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO BAND — solid CCK green deep + single corner wedge + lime hairline + red stripe */}
        <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <GeometricPattern
            variant="cornerWedge"
            width={240}
            height={200}
            tone="light"
            opacity={0.1}
            style={[
              styles.heroWedge,
              isRTL ? { left: -20, transform: [{ scaleX: -1 }] } : { right: -20 },
            ]}
          />
          <View style={styles.heroBody}>
            {!!termLabel && (
              <View style={[styles.termChip, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                <View style={styles.termChipDot} />
                <Text variant="overline" color={colors.secondaryLight} style={{ letterSpacing: isAr ? 0 : 1 }}>
                  {termLabel}
                </Text>
              </View>
            )}
            <Text
              variant="h1"
              color={colors.textInverse}
              accessibilityRole="header"
              style={[styles.heroTitle, { textAlign, writingDirection }]}
            >
              {t('academics.title')}
            </Text>
          </View>
          <View style={styles.heroLime} />
          <View style={styles.heroStripe} />
        </View>

        {/* GPA STAT CARD — focal cumulative GPA with lime brand accent */}
        <View style={styles.section}>
          <Card variant="raised" elevation="md" padding="none" style={styles.statCard}>
            <View style={styles.statAccent} />
            <View style={[styles.statBody, { flexDirection: rowDirection }]}>
              <ProgressRing
                progress={gpaProgress}
                size={92}
                strokeWidth={9}
                value={gpaDisplay}
                label={t('academics.gpa')}
                caption={`/ ${toLatnDigits('4.00')}`}
              />
              <View style={styles.statDivider} />
              <View style={styles.statInfo}>
                <Text
                  variant="overline"
                  color={colors.textTertiary}
                  style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }}
                >
                  {t('academics.cumulativeGpa') || (isAr ? 'المعدل التراكمي' : 'Cumulative GPA')}
                </Text>
                <Text
                  variant="bodyBold"
                  style={{ marginTop: 4, textAlign, writingDirection }}
                  numberOfLines={2}
                >
                  {dueCount > 0
                    ? `${toLatnDigits(String(dueCount))} ${t('home.upcomingDeadlines')}`
                    : t('home.allClear')}
                </Text>
                <Pressable
                  onPress={() => {
                    haptic.selection();
                    navigation.navigate('GpaCalculator');
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t('academics.gpaCalculator')}
                  style={[styles.statCTA, { flexDirection: rowDirection, marginTop: 10 }]}
                >
                  <Text variant="smallBold" color={colors.primary}>
                    {t('academics.gpaCalculator')}
                  </Text>
                  <Triangle size={6} color={colors.brandRed} />
                </Pressable>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.warningWrap}>
          <AcademicWarningBanner />
        </View>

        {/* PRIMARY — 2×2 feature cards with live meta */}
        <SectionEyebrow label={t('academics.title')} />
        <View style={[styles.featureGrid, { flexDirection: rowDirection }]}>
          {PRIMARY.map((s) => {
            const m = meta[s.key];
            return (
              <Pressable
                key={s.key}
                onPress={() => {
                  haptic.selection();
                  navigation.navigate(s.key);
                }}
                accessibilityRole="button"
                accessibilityLabel={t(s.titleKey)}
                style={({ pressed }) => [styles.featureCard, pressed && styles.featurePressed]}
              >
                <View style={styles.featureAccent} />
                <View style={styles.featureBody}>
                  <View style={[styles.featureTop, { flexDirection: rowDirection }]}>
                    <View style={styles.featureIconWedge}>
                      <Icon name={s.icon} size={22} color={colors.primary} />
                    </View>
                    <Triangle size={7} color={colors.chevron} />
                  </View>
                  <Text
                    variant="bodyBold"
                    color={colors.textPrimary}
                    numberOfLines={1}
                    style={[styles.featureTitle, { textAlign, writingDirection }]}
                  >
                    {t(s.titleKey)}
                  </Text>
                  {m && (
                    <Text
                      variant="caption"
                      color={m.urgent ? colors.brandRed : colors.textTertiary}
                      numberOfLines={1}
                      style={{ textAlign, writingDirection }}
                    >
                      {m.text}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* SECONDARY (more) */}
        <SectionEyebrow label={isAr ? 'المزيد' : 'More'} />
        <View style={styles.secondaryList}>
          {SECONDARY.map((s, i) => (
            <Pressable
              key={s.key}
              onPress={() => {
                haptic.selection();
                navigation.navigate(s.key);
              }}
              style={({ pressed }) => [
                styles.secondaryRow,
                {
                  flexDirection: rowDirection,
                  borderBottomWidth: i === SECONDARY.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.divider,
                  backgroundColor: pressed ? colors.primarySoft : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t(s.titleKey)}
            >
              <View style={styles.secondaryIconWedge}>
                <Icon name={s.icon} size={16} color={colors.primary} />
              </View>
              <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }}>
                {t(s.titleKey)}
              </Text>
              <Triangle size={7} color={colors.chevron} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionEyebrow({ label }: { label: string }) {
  const { textAlign, writingDirection } = useDirection();
  const { i18n } = useTranslation();
  return (
    <View style={styles.eyebrowWrap}>
      <View style={styles.eyebrowMark} />
      <Text
        variant="overline"
        color={colors.textTertiary}
        style={{ textAlign, writingDirection, letterSpacing: i18n.language === 'ar' ? 0 : 1 }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {},

  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg + 2,
    overflow: 'hidden',
    backgroundColor: colors.primaryDeep,
  },
  heroWedge: {
    position: 'absolute',
    top: -10,
  },
  heroBody: {
    paddingTop: spacing.md,
  },
  termChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  termChipDot: {
    width: 5,
    height: 5,
    backgroundColor: colors.secondary,
  },
  heroTitle: {
    fontFamily: 'Almarai_800ExtraBold',
  },
  // Lime hairline sitting just above the red brand stripe (New Growth Green accent).
  heroLime: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.secondary,
    opacity: 0.5,
  },
  heroStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brandRed,
  },

  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.base,
  },

  // GPA stat card
  statCard: {
    overflow: 'hidden',
  },
  statAccent: {
    height: 3,
    backgroundColor: colors.secondary,
  },
  statBody: {
    alignItems: 'center',
    padding: spacing.base,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
    marginHorizontal: spacing.base,
  },
  statInfo: {
    flex: 1,
  },
  statCTA: {
    alignItems: 'center',
    gap: 4,
  },

  warningWrap: {
    paddingHorizontal: spacing.lg,
  },

  // Section eyebrow with brand mark
  eyebrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    gap: 8,
  },
  eyebrowMark: {
    width: 12,
    height: 2,
    backgroundColor: colors.secondary,
  },

  // 2×2 feature grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    rowGap: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  featurePressed: {
    backgroundColor: colors.primarySoft,
  },
  featureAccent: {
    height: 3,
    backgroundColor: colors.secondary,
  },
  featureBody: {
    padding: spacing.base,
    gap: 10,
  },
  featureTop: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureIconWedge: {
    width: 44,
    height: 44,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {},

  // Secondary list
  secondaryList: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  secondaryRow: {
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    alignItems: 'center',
    gap: spacing.md,
  },
  secondaryIconWedge: {
    width: 32,
    height: 32,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
