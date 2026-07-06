import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, ScreenSkeleton, ProgressRing, EmptyState, Triangle } from '../../components/ui';
import { AcademicWarningBanner } from '../../components/common/AcademicWarningBanner';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { localized, toLatnDigits } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { courseColor } from '../../utils/courseColor';
import { haptic } from '../../utils/haptics';

const trendArrows = { up: '▲', down: '▼', stable: '–' };

function getGradeTrend(grade: string | null): 'up' | 'down' | 'stable' {
  if (!grade) return 'stable';
  const gpaMap: Record<string, number> = {
    'A+': 4, A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7,
    'C+': 2.3, C: 2, D: 1, F: 0,
  };
  const points = gpaMap[grade] || 0;
  return points >= 3.3 ? 'up' : points >= 2.7 ? 'stable' : 'down';
}

const trendTone: Record<'up' | 'down' | 'stable', { fg: string; bg: string }> = {
  up: { fg: '#5A9020', bg: '#EFF7E0' },
  down: { fg: '#C70000', bg: '#FFE9E9' },
  stable: { fg: '#5C615C', bg: '#F4F2EC' },
};

export function GradesScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', 'grades'],
    queryFn: () => academicApi.getGrades(),
  });

  if (isLoading) return <ScreenSkeleton />;

  const grades = data?.data;
  const courses = grades?.courses || [];
  const cumulative = grades?.cumulative_gpa;
  const cumulativeProgress = cumulative != null ? Math.min(1, Math.max(0, Number(cumulative) / 4)) : 0;
  const cumulativeDisplay = cumulative != null ? toLatnDigits(Number(cumulative).toFixed(2)) : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}>
      <View style={styles.titleBlock}>
        <Text
          variant="overline"
          color={colors.primary}
          style={[styles.eyebrow, { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }]}
        >
          {isAr ? 'هذا الفصل' : 'This term'}
        </Text>
        <Text variant="h1" accessibilityRole="header" style={{ textAlign, writingDirection }}>
          {t('academics.grades')}
        </Text>
      </View>

      <AcademicWarningBanner />

      {/* GPA + credits banner */}
      <View style={styles.gpaBanner}>
        <View style={[styles.gpaInner, { flexDirection: rowDirection }]}>
          <ProgressRing
            progress={cumulativeProgress}
            size={88}
            strokeWidth={8}
            value={cumulativeDisplay}
            label={t('academics.gpa')}
            caption={`/ ${toLatnDigits('4.00')}`}
          />
          <View style={[styles.gpaSplit, { flexDirection: rowDirection }]}>
            <View style={styles.gpaItem}>
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}
              >
                {t('academics.credits')}
              </Text>
              <Text
                color={colors.textPrimary}
                style={[styles.gpaItemValue, { textAlign, writingDirection }]}
              >
                {toLatnDigits(String(grades?.credits_completed || 0))}
              </Text>
            </View>
            <View style={styles.gpaDivider} />
            <View style={styles.gpaItem}>
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}
              >
                {isAr ? 'مقررات' : 'Courses'}
              </Text>
              <Text
                color={colors.textPrimary}
                style={[styles.gpaItemValue, { textAlign, writingDirection }]}
              >
                {toLatnDigits(String(courses.length))}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section header */}
      <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
        <View style={styles.sectionMark} />
        <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
          {isAr ? 'المقررات' : 'Courses'}
        </Text>
      </View>

      {isError ? (
        <EmptyState icon="grades" title={t('common.error')} tone="error" />
      ) : courses.length === 0 ? (
        <EmptyState icon="grades" title={t('common.noData')} tone="neutral" />
      ) : (
        <View style={styles.courseList}>
          {courses.map((course: any, i: number) => {
            const trend = getGradeTrend(course.grade);
            const ttone = trendTone[trend];
            const accent = courseColor(course.course_code);
            const isLast = i === courses.length - 1;
            return (
              <Pressable
                key={i}
                onPress={() => {
                  haptic.selection();
                  navigation.navigate('GradeDetail', { enrollmentId: course.enrollment_id });
                }}
                style={({ pressed }) => [
                  styles.courseRow,
                  {
                    flexDirection: rowDirection,
                    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    backgroundColor: pressed ? colors.primarySoft : 'transparent',
                  },
                ]}
                accessibilityRole="button"
              >
                <View style={[styles.courseAccent, { backgroundColor: accent.fg }]} />
                <View style={styles.courseInfo}>
                  <Text
                    variant="bodyBold"
                    style={{ textAlign, writingDirection }}
                    numberOfLines={1}
                  >
                    {localized(course, 'course_name') || localized(course, 'name')}
                  </Text>
                  <Text
                    variant="caption"
                    color={colors.textSecondary}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                  >
                    {course.course_code} · {toLatnDigits(String(course.credit_hours || course.credits || ''))} {t('academics.credits')}
                  </Text>
                </View>
                <View style={[styles.gradeCol, { flexDirection: rowDirection }]}>
                  <View style={[styles.trendChip, { backgroundColor: ttone.bg }]}>
                    <Text variant="caption" color={ttone.fg}>
                      {trendArrows[trend]}
                    </Text>
                  </View>
                  <Text style={[styles.gradeLetter, { color: colors.primary }]}>
                    {course.grade || '—'}
                  </Text>
                </View>
                <Triangle size={7} color={colors.chevron} />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  titleBlock: { marginBottom: spacing.lg },
  eyebrow: { marginBottom: 6 },

  gpaBanner: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  gpaInner: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  gpaSplit: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.lg,
  },
  gpaItem: {
    flex: 1,
    minWidth: 0,
  },
  gpaItemValue: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 28,
    lineHeight: 32,
    marginTop: 2,
  },
  gpaDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.divider,
  },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionMark: {
    width: 12,
    height: 2,
    backgroundColor: colors.secondary,
  },

  courseList: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  courseRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomColor: colors.divider,
  },
  courseAccent: {
    width: 3,
    height: 36,
  },
  courseInfo: { flex: 1, minWidth: 0 },
  gradeCol: {
    alignItems: 'center',
    gap: 8,
  },
  trendChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gradeLetter: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 22,
    lineHeight: 26,
  },
});
