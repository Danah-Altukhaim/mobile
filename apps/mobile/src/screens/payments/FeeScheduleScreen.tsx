import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Badge } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { formatCurrency, toLatnDigits } from '../../i18n/helpers';
import {
  CREDIT_PRICE_KWD,
  FOUNDATION_SEMESTER_FEE_KWD,
  STANDARD_GRANT_RATE,
  MISC_FEES_KWD,
  WITHDRAWAL_FINE_BY_WEEK,
  type MiscFeeType,
} from '@masari/shared';

const TUITION_ROWS: { key: string; value: number; unit: 'perCredit' | 'perSemester' }[] = [
  { key: 'programDiploma', value: CREDIT_PRICE_KWD.diploma, unit: 'perCredit' },
  { key: 'programBusiness', value: CREDIT_PRICE_KWD.bba_business, unit: 'perCredit' },
  { key: 'programComputer', value: CREDIT_PRICE_KWD.basc_computer, unit: 'perCredit' },
  { key: 'programFoundation', value: FOUNDATION_SEMESTER_FEE_KWD, unit: 'perSemester' },
];

const MISC_ORDER: MiscFeeType[] = [
  'application',
  'late_registration',
  're_admission',
  'id_replacement',
  'official_transcript',
  'twimc_letter',
  'diploma_reissuance',
  'placement_test',
  'graduation_gown',
];

const WITHDRAWAL_WEEKS = [2, 3, 4, 5];

export function FeeScheduleScreen() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const rightAlign = isRTL ? 'flex-start' : 'flex-end';
  const bottomInset = useContentBottomInset();

  const pct = (rate: number) => `${toLatnDigits(String(Math.round(rate * 100)))}%`;
  const diplomaAfterGrant = CREDIT_PRICE_KWD.diploma * (1 - STANDARD_GRANT_RATE);

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الإدارة المالية' : 'Finance'}
        title={t('payments.feeSchedule')}
        subtitle={t('payments.feeScheduleDesc')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Tuition */}
        <SectionEyebrow label={t('payments.tuitionSection')} />
        <View style={styles.list}>
          {TUITION_ROWS.map((row, i) => (
            <View
              key={row.key}
              style={[
                styles.row,
                {
                  flexDirection: rowDirection,
                  borderBottomWidth: i === TUITION_ROWS.length - 1 ? 0 : StyleSheet.hairlineWidth,
                },
              ]}
            >
              <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }} numberOfLines={2}>
                {t(`payments.${row.key}`)}
              </Text>
              <View style={[styles.rowEnd, { alignItems: rightAlign }]}>
                <Text variant="bodyBold">{formatCurrency(row.value)}</Text>
                <Text variant="caption" color={colors.textTertiary}>
                  {t(`payments.${row.unit}`)}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text
          variant="caption"
          color={colors.textSecondary}
          style={{ textAlign, writingDirection, marginTop: spacing.sm, lineHeight: 18 }}
        >
          {t('payments.grantNote', {
            rate: pct(STANDARD_GRANT_RATE),
            price: formatCurrency(diplomaAfterGrant),
          })}
        </Text>

        {/* Per-request fees */}
        <SectionEyebrow label={t('payments.perRequestSection')} />
        <View style={styles.list}>
          {MISC_ORDER.map((key, i) => {
            const note =
              key === 'late_registration'
                ? isAr
                  ? 'تُطبّق من أول يوم في الفصل ويجب سدادها لمتابعة التسجيل.'
                  : 'Applies from the first day of the semester and must be paid to continue registration.'
                : key === 'twimc_letter'
                  ? isAr
                    ? 'يمكن للطلبة الجدد طلب الخطاب بعد الأسبوع الخامس من الدراسة فقط.'
                    : 'New students can only request this letter after the 5th week of classes.'
                  : null;
            return (
              <View
                key={key}
                style={[
                  styles.row,
                  {
                    flexDirection: rowDirection,
                    borderBottomWidth: i === MISC_ORDER.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }} numberOfLines={2}>
                    {t(`payments.fee_${key}`)}
                  </Text>
                  {!!note && (
                    <Text
                      variant="caption"
                      color={colors.textTertiary}
                      style={{ textAlign, writingDirection, marginTop: 2, lineHeight: 18 }}
                    >
                      {note}
                    </Text>
                  )}
                </View>
                <View style={[styles.rowEnd, { alignItems: rightAlign }]}>
                  <Text variant="bodyBold">{formatCurrency(MISC_FEES_KWD[key])}</Text>
                  <Badge label={t('payments.nonRefundable')} variant="neutral" size="sm" />
                </View>
              </View>
            );
          })}
        </View>

        {/* Withdrawal fines */}
        <SectionEyebrow label={t('payments.withdrawalFinesSection')} />
        <Text
          variant="caption"
          color={colors.textSecondary}
          style={{ textAlign, writingDirection, marginBottom: spacing.sm, lineHeight: 18 }}
        >
          {t('payments.withdrawalFinesDesc')}
        </Text>
        <View style={styles.list}>
          {WITHDRAWAL_WEEKS.map((week, i) => {
            const isLast = i === WITHDRAWAL_WEEKS.length - 1;
            const rate = WITHDRAWAL_FINE_BY_WEEK[week];
            return (
              <View
                key={week}
                style={[
                  styles.row,
                  {
                    flexDirection: rowDirection,
                    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={[styles.rowAccent, { backgroundColor: rate >= 1 ? colors.brandRed : colors.secondary }]} />
                <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }}>
                  {t(isLast ? 'payments.studyWeekOnward' : 'payments.studyWeek', {
                    n: toLatnDigits(String(week)),
                  })}
                </Text>
                <Text variant="bodyBold" color={rate >= 1 ? colors.brandRed : colors.textPrimary}>
                  {pct(rate)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionEyebrow({ label }: { label: string }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  return (
    <View style={styles.eyebrowWrap}>
      <View style={styles.eyebrowMark} />
      <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },

  eyebrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    gap: 8,
  },
  eyebrowMark: { width: 12, height: 2, backgroundColor: colors.secondary },

  list: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
    borderBottomColor: colors.divider,
  },
  rowEnd: { gap: 4 },
  rowAccent: { width: 3, height: 32 },
});
