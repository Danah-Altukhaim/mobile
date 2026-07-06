import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { Text, ProgressBar, ScreenSkeleton, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { toLatnDigits } from '../../i18n/helpers';
import { courseColor } from '../../utils/courseColor';

export function GradeDetailScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<any>();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const { enrollmentId } = route.params;
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['student', 'grade-detail', enrollmentId],
    queryFn: () => academicApi.getGradeDetail(enrollmentId),
  });

  if (isLoading) return <ScreenSkeleton />;
  const breakdown: any = data?.data;
  const courseName = breakdown?.course_name_en || breakdown?.course_name_ar || breakdown?.course_name;
  const courseCode = breakdown?.course_code;
  const grade = breakdown?.current_grade;
  const accent = courseCode ? courseColor(courseCode) : { fg: colors.primary, wash: colors.primaryWash };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={courseCode || (isAr ? 'مقرر' : 'Course')}
        title={courseName || t('academics.gradeBreakdown')}
      />
      <ScrollView
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
        {/* Hero grade card — large letter on lime accent strip */}
        {grade && (
          <View style={[styles.gradeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.gradeAccent, { backgroundColor: accent.fg }]} />
            <View style={styles.gradeBody}>
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ letterSpacing: isAr ? 0 : 1 }}
              >
                {t('academics.currentGrade') || (isAr ? 'الدرجة الحالية' : 'Current grade')}
              </Text>
              <Text style={[styles.gradeLetter, { color: colors.primary }]}>
                {grade}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
          <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
          <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
            {isAr ? 'تفصيل الدرجات' : 'Breakdown'}
          </Text>
        </View>

        {isError ? (
          <EmptyState icon="grades" title={t('common.error')} tone="error" />
        ) : breakdown?.components?.length > 0 ? (
          breakdown.components.map((comp: any, i: number) => {
            const scoreRatio = comp.max_score > 0 ? comp.score / comp.max_score : 0;
            const avgRatio = comp.max_score > 0 ? comp.class_average / comp.max_score : 0;
            const variant = scoreRatio >= avgRatio ? 'success' : scoreRatio >= 0.6 ? 'warning' : 'error';
            return (
              <View
                key={i}
                style={[
                  styles.compCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.compHeader, { flexDirection: rowDirection }]}>
                  <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }}>
                    {comp.name}
                  </Text>
                  <View style={[styles.weightChip, { backgroundColor: colors.primaryWash }]}>
                    <Text variant="caption" color={colors.primary}>
                      {toLatnDigits(String(comp.weight))}%
                    </Text>
                  </View>
                </View>

                <View style={[styles.scoreRow, { flexDirection: rowDirection }]}>
                  <Text variant="caption" color={colors.textSecondary}>
                    {t('academics.score')}
                  </Text>
                  <Text variant="bodyBold" color={colors.primary}>
                    {toLatnDigits(String(comp.score))}/{toLatnDigits(String(comp.max_score))}
                  </Text>
                </View>
                <ProgressBar progress={scoreRatio} variant={variant} style={styles.bar} />

                <View style={[styles.scoreRow, { flexDirection: rowDirection }]}>
                  <Text variant="caption" color={colors.textTertiary}>
                    {t('academics.classAverage')}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {toLatnDigits(String(comp.class_average))}/{toLatnDigits(String(comp.max_score))}
                  </Text>
                </View>
                <ProgressBar progress={avgRatio} variant="primary" height={3} style={styles.bar} />
              </View>
            );
          })
        ) : (
          <EmptyState icon="grades" title={t('common.emptyGrades')} tone="neutral" />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  gradeCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  gradeAccent: { height: 3 },
  gradeBody: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  gradeLetter: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 64,
    lineHeight: 72,
    marginTop: 6,
    letterSpacing: -1,
  },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },

  compCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  compHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  weightChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  scoreRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bar: { marginBottom: spacing.sm },
});
