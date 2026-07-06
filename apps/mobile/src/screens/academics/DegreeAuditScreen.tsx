import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ACADEMIC_WARNING_POLICY, type ProgramLevel } from '@masari/shared';
import { Text, Badge, Button, ProgressBar, ScreenSkeleton, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { toLatnDigits } from '../../i18n/helpers';

type RequestStatus = 'idle' | 'processing' | 'ready';
type AuditStatus = 'completed' | 'in_progress' | 'not_started';

const statusVariants = { completed: 'success', in_progress: 'info', not_started: 'neutral' } as const;

export function DegreeAuditScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const rightAlign = isRTL ? 'flex-start' : 'flex-end';
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const bottomInset = useContentBottomInset();

  const { data, isLoading } = useQuery({
    queryKey: ['degree-audit'],
    queryFn: () => academicApi.getDegreeAudit(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const audit: any = data?.data;
  const completionPct = audit?.completion_percentage || 0;
  const semesters: any[] = audit?.semesters || [];
  const years: number[] = [...new Set(semesters.map((s) => s.year))] as number[];

  const statusLabel = (status: AuditStatus) =>
    t(`academics.${status === 'in_progress' ? 'inProgress' : status === 'completed' ? 'completed' : 'notStarted'}`);

  const toneFor = (status: AuditStatus) =>
    status === 'completed' ? colors.success : status === 'in_progress' ? colors.info : colors.textTertiary;

  const buildReport = () => {
    const title = isAr ? 'تقرير خطة التخرج التفصيلي' : 'Detailed Degree Audit Report';
    const header = [
      title,
      '='.repeat(title.length),
      isAr ? audit?.program_name_ar : audit?.program_name_en,
      '',
      `${t('academics.completionRate')}: ${completionPct}%`,
      `${t('academics.completed')}: ${audit?.credits_completed ?? 0}`,
      `${t('academics.inProgress')}: ${audit?.credits_in_progress ?? 0}`,
      `${t('academics.remaining')}: ${audit?.credits_remaining ?? 0}`,
      `${t('academics.totalCredits')}: ${audit?.total_credits_required ?? 0}`,
    ].join('\n');
    const body = semesters
      .map((s) => {
        const semHeader = `\n${t('academics.semesterN', { number: s.number })} — ${s.total_credits} ${t(
          'academics.credits',
        )} (${statusLabel(s.status)})\n${'-'.repeat(30)}`;
        const courseLines = s.courses
          .map((c: any) => {
            const name = isAr ? c.name_ar || c.code : c.name_en || c.code;
            const grade = c.grade ? ` — ${c.grade}` : '';
            return `• ${c.code}  ${name} (${c.credits} ${t('academics.credits')})${grade}`;
          })
          .join('\n');
        return `${semHeader}\n${courseLines}`;
      })
      .join('\n');
    return `${header}\n${body}\n`;
  };

  const handleRequest = () => {
    setRequestStatus('processing');
    setTimeout(() => {
      setReferenceId(`DOC-${Date.now().toString().slice(-6)}`);
      setRequestStatus('ready');
    }, 1200);
  };

  const handleDownload = async () => {
    try {
      await Share.share({ title: t('academics.degreeReportTitle'), message: buildReport() });
    } catch {
      Alert.alert(t('common.error'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'التقدم نحو التخرج' : 'Toward graduation'}
        title={t('academics.degreeAudit')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Hero progress block */}
        <View style={[styles.progressBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {!!(audit?.program_name_en || audit?.program_name_ar) && (
            <Text
              variant="caption"
              color={colors.textSecondary}
              style={{ textAlign, writingDirection, marginBottom: spacing.sm }}
              numberOfLines={2}
            >
              {isAr ? audit?.program_name_ar : audit?.program_name_en}
            </Text>
          )}
          <View style={[styles.progressTop, { flexDirection: rowDirection }]}>
            <Text style={[styles.percentage, { color: colors.primary }]}>
              {toLatnDigits(String(completionPct))}%
            </Text>
            <View style={{ flex: 1, paddingHorizontal: spacing.base }}>
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }}
              >
                {t('academics.completionRate')}
              </Text>
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginTop: 2 }}
              >
                {t('academics.totalCredits')}: {toLatnDigits(String(audit?.total_credits_required || 0))}
              </Text>
            </View>
          </View>
          <ProgressBar progress={completionPct / 100} variant="primary" height={6} style={{ marginTop: spacing.sm }} />
          <View style={[styles.statsRow, { flexDirection: rowDirection, borderTopColor: colors.divider }]}>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: colors.success }]} />
              <Text variant="caption" color={colors.textTertiary}>{t('academics.completed')}</Text>
              <Text variant="bodyBold">{toLatnDigits(String(audit?.credits_completed || 0))}</Text>
            </View>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: colors.info }]} />
              <Text variant="caption" color={colors.textTertiary}>{t('academics.inProgress')}</Text>
              <Text variant="bodyBold">{toLatnDigits(String(audit?.credits_in_progress || 0))}</Text>
            </View>
            <View style={styles.stat}>
              <View style={[styles.statDot, { backgroundColor: colors.textTertiary }]} />
              <Text variant="caption" color={colors.textTertiary}>{t('academics.remaining')}</Text>
              <Text variant="bodyBold">{toLatnDigits(String(audit?.credits_remaining || 0))}</Text>
            </View>
          </View>
        </View>

        {/* Academic Warning Policy (CCK Hub Feedback v3) — minimum CGPA per earned-credit tier. */}
        <View style={[styles.warningPolicyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.docHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.docMark, { backgroundColor: colors.brandRed }]} />
            <Text variant="bodyBold" color={colors.brandRed} style={{ flex: 1, textAlign, writingDirection }}>
              {t('academics.warningPolicyTitle')}
            </Text>
          </View>
          {(['diploma', 'bachelor'] as ProgramLevel[]).map((level) => (
            <View key={level} style={{ marginTop: spacing.sm }}>
              <Text variant="overline" color={colors.textTertiary} style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1, marginBottom: 6 }}>
                {t(`academics.programLevel.${level}`)}
              </Text>
              {ACADEMIC_WARNING_POLICY[level].map((row, idx) => {
                const upper = row.earned_max === -1
                  ? (isAr ? `${toLatnDigits(String(row.earned_min))} فأكثر` : `${toLatnDigits(String(row.earned_min))}+`)
                  : `${toLatnDigits(String(row.earned_min))}-${toLatnDigits(String(row.earned_max))}`;
                return (
                  <View key={idx} style={[styles.warningRow, { flexDirection: rowDirection, borderTopColor: colors.divider }]}>
                    <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection }}>
                      {t('academics.creditsEarnedRange', { range: upper })}
                    </Text>
                    <Text variant="bodyBold" color={colors.brandRedDark}>
                      ≥ {toLatnDigits(row.min_cgpa.toFixed(2))}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Document request */}
        <View style={[styles.docCard, { backgroundColor: colors.primaryWash, borderColor: colors.primary }]}>
          <View style={[styles.docHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.docMark, { backgroundColor: colors.primary }]} />
            <Icon name="document" size={16} color={colors.primary} />
            <Text variant="bodyBold" color={colors.primary} style={{ flex: 1, textAlign, writingDirection }}>
              {t('academics.requestDegreeReport')}
            </Text>
          </View>
          <Text
            variant="small"
            color={colors.primaryDark}
            style={{ textAlign, writingDirection, marginBottom: spacing.sm, opacity: 0.9 }}
          >
            {t('academics.requestDegreeReportDesc')}
          </Text>
          {requestStatus === 'idle' && (
            <Button title={t('academics.requestDocument')} onPress={handleRequest} variant="primary" size="compact" />
          )}
          {requestStatus === 'processing' && (
            <View style={[styles.statusRow, { flexDirection: rowDirection }]}>
              <Badge label={t('academics.processing')} variant="info" size="sm" />
              <Text variant="caption" color={colors.primaryDark}>{t('academics.generatingReport')}</Text>
            </View>
          )}
          {requestStatus === 'ready' && (
            <View style={{ gap: spacing.sm }}>
              <View style={[styles.statusRow, { flexDirection: rowDirection }]}>
                <Badge label={t('academics.ready')} variant="success" size="sm" />
                {referenceId && (
                  <Text variant="caption" color={colors.primaryDark}>
                    {t('academics.referenceId')}: {referenceId}
                  </Text>
                )}
              </View>
              <Button title={t('academics.downloadReport')} onPress={handleDownload} variant="primary" size="compact" />
            </View>
          )}
        </View>

        {/* Major-sheet plan, grouped by year then semester */}
        {years.map((year) => (
          <View key={year}>
            <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
              <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
              <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
                {t('academics.yearLabel', { year: toLatnDigits(String(year)) })}
              </Text>
            </View>
            {semesters
              .filter((s) => s.year === year)
              .map((sem) => {
                const tone = toneFor(sem.status);
                return (
                  <View
                    key={sem.number}
                    style={[styles.semBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View
                      style={[
                        styles.semHeader,
                        { flexDirection: rowDirection, borderBottomColor: colors.divider },
                      ]}
                    >
                      <View style={[styles.semMark, { backgroundColor: tone }]} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                          {t('academics.semesterN', { number: toLatnDigits(String(sem.number)) })}
                        </Text>
                        <Text
                          variant="caption"
                          color={colors.textTertiary}
                          style={{ textAlign, writingDirection, marginTop: 2 }}
                        >
                          {toLatnDigits(String(sem.total_credits))} {t('academics.credits')}
                        </Text>
                      </View>
                      <Badge
                        label={sem.status === 'in_progress' ? t('academics.currentTerm') : statusLabel(sem.status)}
                        variant={statusVariants[sem.status as AuditStatus]}
                        size="sm"
                      />
                    </View>
                    {sem.courses.map((course: any, i: number, arr: any[]) => {
                      const isLast = i === arr.length - 1;
                      const prereqs: string[] = course.prerequisites || [];
                      return (
                        <View
                          key={course.code}
                          style={[
                            styles.courseRow,
                            {
                              flexDirection: rowDirection,
                              borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                              borderBottomColor: colors.divider,
                            },
                          ]}
                        >
                          <View style={[styles.courseAccent, { backgroundColor: tone }]} />
                          <View style={styles.courseInfo}>
                            <Text variant="bodyBold" style={{ textAlign, writingDirection }} numberOfLines={2}>
                              {l(course, 'name') || course.code}
                            </Text>
                            <Text
                              variant="caption"
                              color={colors.textSecondary}
                              style={{ textAlign, writingDirection, marginTop: 2 }}
                            >
                              {course.code} · {toLatnDigits(String(course.credits))} {t('academics.credits')}
                            </Text>
                            {prereqs.length > 0 && (
                              <Text
                                variant="caption"
                                color={colors.textTertiary}
                                style={{ textAlign, writingDirection, marginTop: 2 }}
                              >
                                {t('academics.prerequisites')}: {prereqs.join(isAr ? '، ' : ', ')}
                              </Text>
                            )}
                          </View>
                          {course.grade && (
                            <View style={[styles.courseRight, { alignItems: rightAlign }]}>
                              <Text variant="bodyBold" color={colors.primary}>
                                {course.grade}
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  progressBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  progressTop: {
    alignItems: 'center',
  },
  percentage: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1,
  },
  statsRow: {
    marginTop: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center', gap: 4 },
  statDot: { width: 8, height: 8 },

  docCard: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  docHeader: { alignItems: 'center', gap: 8, marginBottom: 6 },
  docMark: { width: 12, height: 2 },
  statusRow: { alignItems: 'center', gap: 8 },
  warningPolicyCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  warningRow: {
    paddingVertical: 8,
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },

  semBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  semHeader: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  semMark: { width: 3, height: 28 },
  courseRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
  },
  courseAccent: { width: 3, height: 36 },
  courseInfo: { flex: 1, minWidth: 0 },
  courseRight: { gap: 4 },
});
