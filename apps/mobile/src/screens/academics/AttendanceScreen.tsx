import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import {
  attendanceLevel,
  getAttendanceThresholds,
  ATTENDANCE_POLICY_NOTES,
  type AttendanceLevel,
  type AttendanceTrack,
} from '@masari/shared';
import { Text, Badge, ProgressBar, Icon, ScreenSkeleton, EmptyState } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { academicApi } from '../../services/api';
import { useUIStore } from '../../store/ui.store';
import { toLatnDigits } from '../../i18n/helpers';

const LEVEL_VARIANT: Record<AttendanceLevel, 'success' | 'warning' | 'error'> = {
  ok: 'success',
  first_warning: 'warning',
  second_warning: 'warning',
  fa: 'error',
};

const LEVEL_LABEL_KEY: Record<AttendanceLevel, string> = {
  ok: 'academics.currentStateOk',
  first_warning: 'academics.currentStateFirst',
  second_warning: 'academics.currentStateSecond',
  fa: 'academics.currentStateFa',
};

export function AttendanceScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: () => academicApi.getAttendance(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const courses = Array.isArray(data?.data) ? data.data : [];
  const notes = locale === 'ar' ? ATTENDANCE_POLICY_NOTES.ar : ATTENDANCE_POLICY_NOTES.en;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.titleBlock}>
        <Text
          variant="overline"
          color={colors.primary}
          style={[styles.eyebrow, { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }]}
        >
          {isAr ? 'بحسب المقرر' : 'Per course'}
        </Text>
        <Text variant="h1" accessibilityRole="header" style={{ textAlign, writingDirection }}>
          {t('academics.attendance')}
        </Text>
        <Text
          variant="small"
          color={colors.textSecondary}
          style={[styles.subtitle, { textAlign, writingDirection }]}
        >
          {t('academics.policySubtitle')}
        </Text>
      </View>

      {isError ? (
        <EmptyState icon="attendance" title={t('common.error')} tone="error" />
      ) : courses.length === 0 ? (
        <EmptyState icon="attendance" title={t('common.emptyClasses')} tone="success" />
      ) : (
        courses.map((course: any, i: number) => {
          const track: AttendanceTrack = course.track === 'foundation' ? 'foundation' : 'degree';
          const credits = Number(course.credit_hours) || 3;
          const thresholds = getAttendanceThresholds(track, credits);
          const absentHours = Number(course.absent_hours) || 0;
          const level = attendanceLevel(absentHours, thresholds);
          const variant = LEVEL_VARIANT[level];

          const progressDenominator = thresholds.fa_hours;
          const progress = Math.min(1, absentHours / progressDenominator);

          let footnoteKey = '';
          let footnoteHours = 0;
          if (level === 'ok') {
            footnoteHours = thresholds.first_warning_hours - absentHours;
            footnoteKey = 'academics.hoursToNextThreshold';
          } else if (level === 'first_warning') {
            footnoteHours = thresholds.second_warning_hours - absentHours;
            footnoteKey = 'academics.hoursToNextThreshold';
          } else if (level === 'second_warning') {
            footnoteHours = thresholds.fa_hours - absentHours;
            footnoteKey = 'academics.hoursToFa';
          }

          return (
            <View
              key={i}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={[styles.cardHeader, { flexDirection: rowDirection }]}>
                <View style={styles.courseInfo}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                    {l(course, 'course_name') || course.course_code}
                  </Text>
                  <Text
                    variant="caption"
                    color={colors.textSecondary}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                  >
                    {course.course_code} · {toLatnDigits(String(credits))} {t('academics.credits')}
                  </Text>
                </View>
                <Badge label={t(LEVEL_LABEL_KEY[level])} variant={variant} />
              </View>

              <View style={[styles.statRow, { flexDirection: rowDirection }]}>
                <Text variant="caption" color={colors.textTertiary}>
                  {t('academics.absentHours')}
                </Text>
                <Text
                  variant="bodyBold"
                  color={level === 'ok' ? colors.textPrimary : colors.brandRedDark}
                >
                  {toLatnDigits(absentHours.toFixed(1))}h / {toLatnDigits(String(thresholds.fa_hours))}h
                </Text>
              </View>
              <ProgressBar progress={progress} variant={variant} style={styles.progress} />

              <View style={[styles.thresholdRow, { flexDirection: rowDirection }]}>
                <ThresholdPill
                  label={t('academics.firstWarning')}
                  value={`${toLatnDigits(String(thresholds.first_warning_hours))}h`}
                  hit={absentHours >= thresholds.first_warning_hours}
                  colors={colors}
                />
                <ThresholdPill
                  label={t('academics.secondWarning')}
                  value={`${toLatnDigits(String(thresholds.second_warning_hours))}h`}
                  hit={absentHours >= thresholds.second_warning_hours}
                  colors={colors}
                />
                <ThresholdPill
                  label={t('academics.courseDismissal')}
                  value={`${toLatnDigits(String(thresholds.fa_hours))}h`}
                  hit={absentHours >= thresholds.fa_hours}
                  colors={colors}
                  terminal
                />
              </View>

              {footnoteKey && (
                <Text
                  variant="caption"
                  color={colors.textTertiary}
                  style={[styles.footnote, { textAlign, writingDirection }]}
                >
                  {t(footnoteKey, { hours: toLatnDigits(Math.max(0, footnoteHours).toFixed(1)) })}
                </Text>
              )}

              {/* CCK Hub Feedback v3 — "Notification of warnings be sent to students in each stage". */}
              {level !== 'ok' && (
                <View
                  style={[
                    styles.warningNotice,
                    {
                      flexDirection: rowDirection,
                      backgroundColor: level === 'fa' ? colors.brandRedWash : colors.warningWash,
                    },
                  ]}
                >
                  <Icon
                    name="warning"
                    size={12}
                    color={level === 'fa' ? colors.brandRed : colors.warning}
                  />
                  <Text
                    variant="caption"
                    color={level === 'fa' ? colors.brandRedDark : colors.warning}
                    style={{ flex: 1, textAlign, writingDirection }}
                  >
                    {t(`academics.notificationSent.${level}`)}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.miniStats,
                  { flexDirection: rowDirection, borderTopColor: colors.divider },
                ]}
              >
                <MiniStat label={t('academics.present')} value={toLatnDigits(String(course.present || 0))} color={colors.success} />
                <MiniDivider color={colors.divider} />
                <MiniStat label={t('academics.absent')} value={toLatnDigits(String(course.absent || 0))} color={colors.brandRed} />
                <MiniDivider color={colors.divider} />
                <MiniStat label={t('academics.excused')} value={toLatnDigits(String(course.excused || 0))} color={colors.warning} />
                <MiniDivider color={colors.divider} />
                <MiniStat label={t('academics.late')} value={toLatnDigits(String(course.late || 0))} color={colors.info} />
              </View>
            </View>
          );
        })
      )}

      {/* Policy card */}
      <View
        style={[
          styles.policyCard,
          { backgroundColor: colors.primaryWash, borderColor: colors.primary },
        ]}
      >
        <View style={[styles.policyHeader, { flexDirection: rowDirection }]}>
          <View style={[styles.policyMark, { backgroundColor: colors.primary }]} />
          <Text variant="bodyBold" color={colors.primary} style={{ textAlign, writingDirection }}>
            {t('academics.policyTitle')}
          </Text>
        </View>
        <Text
          variant="caption"
          color={colors.primaryDark}
          style={[styles.policyMeta, { textAlign, writingDirection }]}
        >
          {t('academics.policyNotesTitle')}
        </Text>
        {notes.map((note, idx) => (
          <View
            key={idx}
            style={[styles.bulletRow, { flexDirection: rowDirection }]}
          >
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text
              variant="caption"
              color={colors.textPrimary}
              style={[styles.bulletText, { textAlign, writingDirection }]}
            >
              {note}
            </Text>
          </View>
        ))}
        <Pressable
          onPress={() => navigation.navigate('ServicesTab', { screen: 'ExcusedAbsence' })}
          style={[
            styles.cta,
            { borderColor: colors.primary, flexDirection: rowDirection },
          ]}
        >
          <Icon name="plus" size={14} color={colors.primary} />
          <Text variant="smallBold" color={colors.primary}>
            {t('academics.submitExcuseCta')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={styles.miniStat}>
      <Text variant="caption" color={color}>{label}</Text>
      <Text variant="bodyBold" color={color}>{value}</Text>
    </View>
  );
}

function MiniDivider({ color }: { color: string }) {
  return <View style={[styles.miniDivider, { backgroundColor: color }]} />;
}

function ThresholdPill({
  label,
  value,
  hit,
  terminal,
  colors,
}: {
  label: string;
  value: string;
  hit: boolean;
  terminal?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const bg = hit
    ? terminal ? colors.brandRedWash : colors.warningWash
    : colors.surfaceMuted;
  const fg = hit
    ? terminal ? colors.brandRedDark : colors.warning
    : colors.textTertiary;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillValue, { color: fg }]}>{value}</Text>
      <Text variant="caption" color={fg} style={styles.pillLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },
  titleBlock: { marginBottom: spacing.lg },
  eyebrow: { marginBottom: 6 },
  subtitle: { marginTop: 4 },

  card: {
    marginBottom: spacing.md,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  courseInfo: { flex: 1, minWidth: 0 },

  statRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progress: {
    marginTop: 4,
    marginBottom: spacing.sm,
  },

  thresholdRow: {
    gap: 6,
    marginBottom: spacing.xs,
  },
  pill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  pillValue: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 12,
    lineHeight: 14,
  },
  pillLabel: {
    fontSize: 10,
    lineHeight: 12,
  },

  footnote: { marginTop: 4, marginBottom: spacing.sm },
  warningNotice: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },

  miniStats: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  miniStat: { flex: 1, alignItems: 'center', gap: 2 },
  miniDivider: { width: StyleSheet.hairlineWidth, height: 24 },

  policyCard: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderWidth: 1,
  },
  policyHeader: { alignItems: 'center', gap: 8 },
  policyMark: { width: 12, height: 2 },
  policyMeta: { marginTop: 6, marginBottom: spacing.sm, opacity: 0.85 },
  bulletRow: { gap: spacing.sm, marginBottom: spacing.sm, alignItems: 'flex-start' },
  bullet: { width: 4, height: 4, marginTop: 8 },
  bulletText: { flex: 1, lineHeight: 18 },
  cta: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
  },
});
