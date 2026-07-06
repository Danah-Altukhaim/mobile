import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, View, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MAX_CREDITS_PER_TERM,
  MISC_FEES_KWD,
  creditLoadRange,
  type FundingType,
} from '@masari/shared';
import { Text, Badge, Button, SearchBar, ScreenSkeleton, EmptyState, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { academicApi } from '../../services/api';
import { courseColor } from '../../utils/courseColor';
import { toLatnDigits } from '../../i18n/helpers';

export function CourseRegistrationScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => academicApi.getAvailableCourses(),
  });
  const { data: schedule } = useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: () => academicApi.getSchedule(),
  });
  const { data: summary } = useQuery({
    queryKey: ['student', 'summary'],
    queryFn: () => academicApi.getStudentSummary(),
  });

  const funding: FundingType = (summary?.data?.student?.funding_type as FundingType) ?? 'self';
  const range = creditLoadRange(funding, 'regular');

  // Late fee (5 KWD) — shown from the 1st day of the semester; must be settled
  // before the student can proceed with registration (Finance Department doc).
  const [lateFeePaid, setLateFeePaid] = useState(false);
  const lateFee = MISC_FEES_KWD.late_registration;
  const lateFeeStr = toLatnDigits(String(lateFee));

  // Repeated-courses-no-discount pop-up — shown once to self-funded students
  // (Finance Department doc). The inline banner below remains as a reminder.
  const repeatedPopupShown = useRef(false);
  useEffect(() => {
    if (funding === 'self' && !repeatedPopupShown.current) {
      repeatedPopupShown.current = true;
      Alert.alert(
        isAr ? 'المواد المعادة' : 'Repeated Courses',
        isAr
          ? 'المواد المعادة غير مؤهلة لخصم المنحة للطلبة ذاتيي التمويل، وتُحتسب بكامل رسومها.'
          : 'Repeated courses are not eligible for the grant discount for self-funded students and are charged at the full rate.',
        [{ text: isAr ? 'حسناً' : 'OK' }],
      );
    }
  }, [funding, isAr]);

  const enrolledCredits = useMemo(() => {
    const list = Array.isArray(schedule?.data) ? schedule!.data : [];
    return list.reduce((sum: number, c: any) => sum + (c?.credit_hours ?? 0), 0);
  }, [schedule]);

  const registerMutation = useMutation({
    mutationFn: (courseId: string) => academicApi.registerCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-courses'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'schedule'] });
      Alert.alert(t('academics.registerSuccess'));
    },
    onError: () => Alert.alert(t('academics.registerFailed')),
  });

  if (isLoading) return <ScreenSkeleton />;
  const courses = Array.isArray(data?.data) ? data.data : [];
  const overCap = enrolledCredits > range.max;
  const underMin = enrolledCredits < range.min;
  const minRuleKey = funding === 'puc' ? 'academics.creditCapPucMin' : 'academics.creditCapSelfMin';
  const filtered = courses.filter((c: any) =>
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    c.name_en.toLowerCase().includes(search.toLowerCase()) ||
    c.name_ar.includes(search),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'تسجيل المقررات' : 'Add courses'}
        title={t('academics.courseRegistration')}
      />
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('common.search')} />
      </View>
      <View style={[styles.loadCard, { backgroundColor: overCap ? colors.warningWash : colors.surface, borderColor: overCap ? colors.warning : colors.border, flexDirection: rowDirection }]}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }}>
            {t('academics.creditLoad')}
          </Text>
          <Text variant="bodyBold" color={overCap ? colors.warning : colors.textPrimary} style={{ textAlign, writingDirection }}>
            {toLatnDigits(String(enrolledCredits))} / {toLatnDigits(String(MAX_CREDITS_PER_TERM))} {t('academics.credits')}
          </Text>
          <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection, marginTop: 2 }}>
            {t(minRuleKey, { min: toLatnDigits(String(range.min)) })}
          </Text>
        </View>
        {overCap && <Icon name="warning" size={20} color={colors.warning} />}
      </View>
      {!lateFeePaid && (
        <View style={[styles.banner, { backgroundColor: colors.errorWash, borderColor: colors.brandRed, flexDirection: rowDirection }]}>
          <Icon name="warning" size={14} color={colors.brandRedDark} />
          <View style={{ flex: 1 }}>
            <Text variant="smallBold" color={colors.brandRedDark} style={{ textAlign, writingDirection }}>
              {isAr
                ? `رسوم تأخير غير مدفوعة (${lateFeeStr} د.ك)`
                : `Unpaid late fee (${lateFeeStr} KWD)`}
            </Text>
            <Text variant="caption" color={colors.brandRedDark} style={{ textAlign, writingDirection, marginTop: 2 }}>
              {isAr
                ? 'تُطبّق رسوم التأخير من أول يوم في الفصل ويجب سدادها قبل متابعة التسجيل.'
                : 'A late fee applies from the first day of the semester and must be paid before you can register.'}
            </Text>
            <Button
              title={isAr ? `دفع رسوم التأخير ${lateFeeStr} د.ك` : `Pay ${lateFeeStr} KWD late fee`}
              onPress={() => {
                setLateFeePaid(true);
                Alert.alert(
                  isAr ? 'تم الدفع' : 'Payment Complete',
                  isAr ? 'تم سداد رسوم التأخير. يمكنك الآن متابعة التسجيل.' : 'Late fee paid. You can now proceed with registration.',
                );
              }}
              variant="primary"
              size="compact"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      )}
      {overCap && (
        <View style={[styles.banner, { backgroundColor: colors.warningWash, borderColor: colors.warning, flexDirection: rowDirection }]}>
          <Icon name="warning" size={14} color={colors.warning} />
          <Text variant="caption" color={colors.warning} style={{ flex: 1, textAlign, writingDirection }}>
            {t('academics.creditCapOver', { max: toLatnDigits(String(range.max)) })}
          </Text>
        </View>
      )}
      {underMin && !overCap && (
        <View style={[styles.banner, { backgroundColor: colors.primaryWash, borderColor: colors.primary, flexDirection: rowDirection }]}>
          <Icon name="warning" size={14} color={colors.primary} />
          <Text variant="caption" color={colors.primary} style={{ flex: 1, textAlign, writingDirection }}>
            {t('academics.creditCapUnder', { min: toLatnDigits(String(range.min)) })}
          </Text>
        </View>
      )}
      {funding === 'self' && (
        <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: rowDirection }]}>
          <Icon name="warning" size={14} color={colors.textTertiary} />
          <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection }}>
            {t('academics.repeatedCourseNotice')}
          </Text>
        </View>
      )}
      <FlatList
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        data={filtered}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="academics" title={t('common.error')} tone="error" />
          ) : (
            <EmptyState icon="academics" title={t('common.emptyClasses')} tone="neutral" />
          )
        }
        renderItem={({ item }: { item: any }) => {
          const isFull = item.seats_available === 0;
          const prereqsMet = item.prereqs_met !== false;
          const wouldExceed = enrolledCredits + (item.credits ?? 0) > range.max;
          const blocked = isFull || !prereqsMet || wouldExceed || !lateFeePaid;
          const seatVariant = isFull ? 'error' : item.seats_available < 10 ? 'warning' : 'success';
          const accent = courseColor(item.course_code);
          const langKey = item.language === 'ar'
            ? 'academics.langAr'
            : item.language === 'bilingual'
              ? 'academics.langBilingual'
              : 'academics.langEn';
          return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.accent, { backgroundColor: accent.fg }]} />
              <View style={styles.cardBody}>
                <View style={[styles.headerRow, { flexDirection: rowDirection }]}>
                  <View style={[styles.codeChip, { backgroundColor: accent.wash }]}>
                    <Text variant="caption" color={accent.fg}>
                      {item.course_code}
                    </Text>
                  </View>
                  <View style={[styles.codeChip, { backgroundColor: colors.background }]}>
                    <Text variant="caption" color={colors.textSecondary}>
                      {t(langKey)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <Badge
                    label={isFull
                      ? t('academics.sectionFull')
                      : `${toLatnDigits(String(item.seats_available))}/${toLatnDigits(String(item.total_seats))}`}
                    variant={seatVariant}
                    size="sm"
                  />
                </View>
                <Text
                  variant="bodyBold"
                  style={{ textAlign, writingDirection, marginTop: 6 }}
                  numberOfLines={2}
                >
                  {l(item, 'name')}
                </Text>
                <Text
                  variant="caption"
                  color={colors.textSecondary}
                  style={{ textAlign, writingDirection, marginTop: 2 }}
                >
                  {toLatnDigits(String(item.credits))} {t('academics.credits')} · {item.schedule}
                </Text>
                {l(item, 'instructor_name') && (
                  <Text
                    variant="caption"
                    color={colors.textTertiary}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                  >
                    {t('academics.instructor')}: {l(item, 'instructor_name')}
                  </Text>
                )}
                {item.prerequisites?.length > 0 && (
                  <Text
                    variant="caption"
                    color={prereqsMet ? colors.textTertiary : colors.brandRedDark}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                  >
                    {t('academics.prerequisites')}: {item.prerequisites.join(', ')}
                  </Text>
                )}
                {!prereqsMet && (
                  <Text
                    variant="caption"
                    color={colors.brandRedDark}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                  >
                    {t('academics.prereqsNotMet')}: {(item.unmet_prerequisites ?? []).join(', ')}
                  </Text>
                )}
                <Button
                  title={
                    !lateFeePaid
                      ? isAr
                        ? 'سدّد رسوم التأخير أولاً'
                        : 'Pay late fee first'
                      : !prereqsMet
                        ? t('academics.prereqsRequired')
                        : isFull
                          ? t('academics.sectionFull')
                          : wouldExceed
                            ? t('academics.creditCapBlocked')
                            : t('academics.register')
                  }
                  onPress={() => registerMutation.mutate(item.id)}
                  variant={blocked ? 'ghost' : 'primary'}
                  disabled={blocked}
                  loading={registerMutation.isPending && registerMutation.variables === item.id}
                  fullWidth
                  size="compact"
                  style={{ marginTop: spacing.md }}
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  loadCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: spacing.sm,
  },
  banner: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  content: { padding: spacing.base },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  accent: { height: 3 },
  cardBody: { padding: spacing.base },
  headerRow: { alignItems: 'center', gap: 8 },
  codeChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
});
