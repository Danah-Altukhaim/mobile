import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, ProgressBar, ScreenSkeleton, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { aiApi } from '../../services/api';
import { courseColor } from '../../utils/courseColor';
import { toLatnDigits } from '../../i18n/helpers';

export function CourseRecommendationsScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai', 'course-recommendations'],
    queryFn: () => aiApi.getCourseRecommendations(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const recommendations = data?.data || [];
  const planSemester = recommendations[0]?.plan_semester;

  const workloadVariant = (level: string): 'success' | 'warning' | 'error' => {
    if (level === 'light') return 'success';
    if (level === 'heavy') return 'error';
    return 'warning';
  };

  const workloadLabel = (level: string) => {
    if (level === 'light') return t('ai.workloadLight');
    if (level === 'heavy') return t('ai.workloadHeavy');
    return t('ai.workloadModerate');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={
          planSemester
            ? t('ai.nextSemesterPlan', { number: toLatnDigits(String(planSemester)) })
            : isAr
              ? 'خطة المقررات'
              : 'Course plan'
        }
        title={t('ai.courseRecommendations')}
        subtitle={t('ai.recommendedNextTerm')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState icon="sparkles" title={t('common.error')} tone="error" />
        ) : recommendations.length === 0 ? (
          <EmptyState icon="sparkles" title={isAr ? 'لا توصيات بعد' : 'No suggestions yet'} tone="neutral" />
        ) : (
          recommendations.map((rec: any) => {
            const accent = courseColor(rec.course_code);
            const seatVariant =
              rec.seats_available > 5 ? 'success' :
              rec.seats_available > 0 ? 'warning' : 'error';
            const prereqsMet = rec.prereqs_met !== false;
            const unmet: string[] = rec.unmet_prerequisites || [];
            const prereqs: string[] = rec.prerequisites || [];
            const langKey = rec.language === 'ar'
              ? 'academics.langAr'
              : rec.language === 'bilingual'
                ? 'academics.langBilingual'
                : 'academics.langEn';
            return (
              <View
                key={rec.id}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={[styles.accent, { backgroundColor: accent.fg }]} />
                <View style={styles.cardBody}>
                  <View style={[styles.headerRow, { flexDirection: rowDirection }]}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={[styles.chipRow, { flexDirection: rowDirection }]}>
                        <View style={[styles.codeChip, { backgroundColor: accent.wash }]}>
                          <Text variant="caption" color={accent.fg}>{rec.course_code}</Text>
                        </View>
                        <View style={[styles.codeChip, { backgroundColor: colors.background }]}>
                          <Text variant="caption" color={colors.textSecondary}>{t(langKey)}</Text>
                        </View>
                      </View>
                      <Text variant="h4" style={{ marginTop: 6, textAlign, writingDirection }} numberOfLines={2}>
                        {l(rec, 'name')}
                      </Text>
                    </View>
                    <View style={[styles.matchBlock, { backgroundColor: colors.primaryWash }]}>
                      <Text style={[styles.matchScore, { color: colors.primary }]}>
                        {toLatnDigits(String(rec.match_score))}%
                      </Text>
                      <Text variant="caption" color={colors.primary}>
                        {t('ai.matchScore')}
                      </Text>
                    </View>
                  </View>

                  {/* Prerequisite readiness — straight from the major sheet */}
                  <View
                    style={[
                      styles.prereqBanner,
                      {
                        flexDirection: rowDirection,
                        backgroundColor: prereqsMet ? colors.successWash : colors.warningWash,
                        borderColor: prereqsMet ? colors.success : colors.warning,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.prereqMark,
                        { backgroundColor: prereqsMet ? colors.success : colors.warning },
                      ]}
                    />
                    <Text
                      variant="small"
                      color={prereqsMet ? colors.success : colors.warning}
                      style={{ flex: 1, textAlign, writingDirection }}
                    >
                      {prereqsMet
                        ? t('ai.prereqsReady')
                        : t('ai.prereqsPending', { courses: unmet.join(isAr ? '، ' : ', ') })}
                    </Text>
                  </View>

                  <View style={[styles.reasonBlock, { backgroundColor: colors.surfaceMuted }]}>
                    <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
                      {t('ai.reason')}
                    </Text>
                    <Text
                      variant="small"
                      color={colors.textSecondary}
                      style={{ textAlign, writingDirection, marginTop: 4 }}
                    >
                      {l(rec, 'reason')}
                    </Text>
                  </View>

                  <View style={[styles.statsRow, { flexDirection: rowDirection, borderTopColor: colors.divider }]}>
                    <View style={styles.stat}>
                      <Text variant="caption" color={colors.textTertiary}>{t('academics.credits')}</Text>
                      <Text variant="bodyBold">{toLatnDigits(String(rec.credits))}</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                    <View style={styles.stat}>
                      <Text variant="caption" color={colors.textTertiary}>{t('ai.workload')}</Text>
                      <Badge label={workloadLabel(rec.workload_level)} variant={workloadVariant(rec.workload_level)} size="sm" />
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                    <View style={styles.stat}>
                      <Text variant="caption" color={colors.textTertiary}>{t('academics.prerequisites')}</Text>
                      <Badge
                        label={prereqsMet ? t('academics.ready') : t('ai.prereqPendingShort')}
                        variant={prereqsMet ? 'success' : 'warning'}
                        size="sm"
                      />
                    </View>
                  </View>

                  <View style={styles.seatsBlock}>
                    <View style={[styles.seatRow, { flexDirection: rowDirection }]}>
                      <Text variant="caption" color={colors.textSecondary}>
                        {t('academics.seatsAvailable')}
                      </Text>
                      <Text variant="caption" color={colors.textPrimary}>
                        {toLatnDigits(String(rec.seats_available))}/{toLatnDigits(String(rec.total_seats))}
                      </Text>
                    </View>
                    <ProgressBar
                      progress={rec.seats_available / rec.total_seats}
                      variant={seatVariant}
                      style={{ marginTop: 6 }}
                    />
                  </View>

                  <View style={[styles.scheduleBlock, { borderTopColor: colors.divider }]}>
                    <Text variant="caption" color={colors.textTertiary}>{rec.schedule}</Text>
                    {prereqs.length > 0 && (
                      <Text variant="caption" color={colors.textTertiary} style={{ marginTop: 2 }}>
                        {t('academics.prerequisites')}: {prereqs.join(isAr ? '، ' : ', ')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  accent: { height: 3 },
  cardBody: { padding: spacing.base },
  headerRow: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  chipRow: {
    gap: 6,
    flexWrap: 'wrap',
  },
  codeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  matchBlock: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minWidth: 70,
  },
  matchScore: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 22,
    lineHeight: 26,
  },
  prereqBanner: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  prereqMark: { width: 10, height: 10 },
  reasonBlock: {
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  statsRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28 },
  seatsBlock: { marginTop: spacing.sm },
  seatRow: { justifyContent: 'space-between', alignItems: 'center' },
  scheduleBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
