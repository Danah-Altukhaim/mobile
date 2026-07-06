import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Button, Select, ScreenSkeleton, Badge, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { localized, toLatnDigits } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import {
  GRADING_SCHEME,
  pointsForLetter,
  verbalClassificationFor,
  CGPA_GRADUATION_MIN,
} from '@masari/shared';

// Official CCK 11-tier scheme (Grading Policy v2 §6) — letter, points, score range.
const GRADE_OPTIONS = GRADING_SCHEME.filter((t) => t.letter !== 'FA').map((t) => ({
  label: `${t.letter} · ${t.points.toFixed(2)}`,
  value: t.letter,
}));

type Simulation = Record<string, string>;

function computeProjected(
  cumulativeGpa: number,
  completedCredits: number,
  inProgress: Array<{ credits: number; grade: string }>,
): number {
  const basePoints = cumulativeGpa * completedCredits;
  const addedPoints = inProgress.reduce((sum, c) => sum + pointsForLetter(c.grade) * c.credits, 0);
  const addedCredits = inProgress.reduce((sum, c) => sum + c.credits, 0);
  const totalCredits = completedCredits + addedCredits;
  if (totalCredits === 0) return cumulativeGpa;
  return (basePoints + addedPoints) / totalCredits;
}

export function GpaCalculatorScreen() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [simulation, setSimulation] = useState<Simulation>({});
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', 'grades'],
    queryFn: () => academicApi.getGrades(),
  });

  const grades = data?.data;
  const currentGpa = grades?.cumulative_gpa ?? 0;
  const completedCredits = grades?.credits_completed ?? 0;

  const inProgressCourses = useMemo(
    () => (grades?.courses || []).filter((c: any) => !c.grade),
    [grades],
  );

  const simulated = inProgressCourses.map((c: any) => ({
    credits: c.credit_hours || c.credits || 0,
    grade: simulation[c.enrollment_id] || 'B',
  }));

  const projectedGpa = useMemo(
    () => computeProjected(currentGpa, completedCredits, simulated),
    [currentGpa, completedCredits, simulated],
  );

  const delta = projectedGpa - currentGpa;
  const deltaVariant = delta > 0.01 ? 'success' : delta < -0.01 ? 'error' : 'neutral';
  const deltaLabel = `${delta >= 0 ? '+' : ''}${toLatnDigits(delta.toFixed(2))}`;

  // Verbal classification (Grading Policy §7) — drives the chip below the projection.
  const verbal = verbalClassificationFor(projectedGpa);
  const verbalLabel = verbal ? (isAr ? verbal.label_ar : verbal.label_en) : null;
  const meetsGraduation = projectedGpa >= CGPA_GRADUATION_MIN;

  if (isLoading) return <ScreenSkeleton />;

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'محاكاة' : 'Simulator'}
        title={t('academics.gpaCalculator')}
        subtitle={t('academics.gpaCalculatorDesc')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Projection card — three-column */}
        <View style={styles.summaryBlock}>
          <View style={[styles.summaryRow, { flexDirection: rowDirection }]}>
            <View style={styles.summaryItem}>
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ textAlign: 'center', letterSpacing: isAr ? 0 : 1 }}
              >
                {t('academics.currentGpa')}
              </Text>
              <Text style={[styles.summaryNum, { color: colors.textPrimary }]}>
                {toLatnDigits(currentGpa.toFixed(2))}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
            <View style={[styles.summaryItem, styles.summaryItemHero]}>
              <Text
                variant="overline"
                color={colors.primary}
                style={{ textAlign: 'center', letterSpacing: isAr ? 0 : 1 }}
              >
                {t('academics.projectedGpa')}
              </Text>
              <Text style={[styles.summaryNumHero, { color: colors.primary }]}>
                {toLatnDigits(projectedGpa.toFixed(2))}
              </Text>
              <Badge label={deltaLabel} variant={deltaVariant} size="sm" />
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.summaryItem}>
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ textAlign: 'center', letterSpacing: isAr ? 0 : 1 }}
              >
                {t('academics.credits')}
              </Text>
              <Text style={[styles.summaryNum, { color: colors.textPrimary }]}>
                {toLatnDigits(String(completedCredits))}
              </Text>
            </View>
          </View>
        </View>

        {/* Grading Policy §7 verbal classification + §5.6 graduation gate. */}
        {(verbalLabel || !meetsGraduation) && (
          <View style={[styles.classificationRow, { flexDirection: rowDirection }]}>
            {verbalLabel && (
              <Badge label={verbalLabel} variant={meetsGraduation ? 'success' : 'warning'} size="sm" />
            )}
            <Text
              variant="caption"
              color={meetsGraduation ? colors.textTertiary : colors.brandRedDark}
              style={{ flex: 1, textAlign, writingDirection }}
            >
              {meetsGraduation
                ? t('academics.classificationNote')
                : t('academics.belowGraduationMin', { min: toLatnDigits(CGPA_GRADUATION_MIN.toFixed(2)) })}
            </Text>
          </View>
        )}

        <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
          <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
          <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
            {t('academics.currentCourses')}
          </Text>
        </View>

        {isError ? (
          <EmptyState icon="academics" title={t('common.error')} tone="error" />
        ) : inProgressCourses.length === 0 ? (
          <EmptyState icon="academics" title={t('academics.noInProgressCourses')} tone="neutral" />
        ) : (
          inProgressCourses.map((course: any) => (
            <View key={course.enrollment_id} style={styles.courseCard}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                {localized(course, 'course_name')}
              </Text>
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginBottom: spacing.sm }}
              >
                {course.course_code} · {toLatnDigits(String(course.credit_hours || course.credits))}{' '}
                {t('academics.credits')}
              </Text>
              <Select
                label={t('academics.simulatedGrade')}
                options={GRADE_OPTIONS}
                value={simulation[course.enrollment_id] || 'B'}
                onChange={(value) =>
                  setSimulation((prev) => ({ ...prev, [course.enrollment_id]: value }))
                }
              />
            </View>
          ))
        )}

        {inProgressCourses.length > 0 && (
          <Button
            title={t('academics.resetSimulation')}
            onPress={() => setSimulation({})}
            variant="outline"
            fullWidth
            style={{ marginTop: spacing.base }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },

  summaryBlock: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  summaryItemHero: {
    flex: 1.2,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  summaryNum: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 22,
    lineHeight: 26,
    marginTop: 2,
  },
  summaryNumHero: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 32,
    lineHeight: 36,
    marginTop: 2,
    letterSpacing: -0.5,
  },

  classificationRow: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },

  courseCard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
});
