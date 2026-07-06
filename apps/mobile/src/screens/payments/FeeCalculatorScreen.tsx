import React, { useMemo, useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Select, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { haptic } from '../../utils/haptics';
import { formatCurrency, toLatnDigits } from '../../i18n/helpers';
import {
  calcTuition,
  STANDARD_GRANT_RATE,
  SPORT_DISCOUNT_RATE,
  MAX_CREDITS_PER_TERM,
  SELF_FUND_MIN_CREDITS,
  type ProgramTrack,
} from '@masari/shared';

interface Program {
  id: string;
  labelKey: string;
  track: ProgramTrack;
  level: 'diploma' | 'foundation' | 'bachelor';
  defaultCredits: number;
}

const PROGRAMS: Program[] = [
  { id: 'diploma', labelKey: 'programDiploma', track: 'diploma', level: 'diploma', defaultCredits: 15 },
  { id: 'foundation', labelKey: 'programFoundation', track: 'foundation', level: 'foundation', defaultCredits: 0 },
  { id: 'bba_business', labelKey: 'programBusiness', track: 'bba_business', level: 'bachelor', defaultCredits: 12 },
  { id: 'basc_computer', labelKey: 'programComputer', track: 'basc_computer', level: 'bachelor', defaultCredits: 12 },
];

const GRANTS: { id: string; labelKey: string; rate: number }[] = [
  { id: 'none', labelKey: 'grantNone', rate: 0 },
  { id: 'standard', labelKey: 'grantStandard', rate: STANDARD_GRANT_RATE },
  { id: 'sport', labelKey: 'grantSport', rate: SPORT_DISCOUNT_RATE },
];

export function FeeCalculatorScreen() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const [programId, setProgramId] = useState('diploma');
  const [credits, setCredits] = useState(15);
  const [grantId, setGrantId] = useState('standard');
  // Term selector — summer fees are paid in full upfront (Finance Department
  // doc), not split across the regular 3-installment plan.
  const [term, setTerm] = useState<'regular' | 'summer'>('regular');
  const isSummer = term === 'summer';

  const program = PROGRAMS.find((p) => p.id === programId)!;
  const grant = GRANTS.find((g) => g.id === grantId)!;
  const isFoundation = program.level === 'foundation';

  const handleProgram = (id: string) => {
    setProgramId(id);
    const next = PROGRAMS.find((p) => p.id === id)!;
    if (next.level !== 'foundation') setCredits(next.defaultCredits);
  };

  const breakdown = useMemo(
    () =>
      calcTuition({
        credits,
        track: program.track,
        level: program.level,
        discountRate: grant.rate,
      }),
    [credits, program, grant],
  );

  const stepCredits = (delta: number) => {
    setCredits((c) => Math.min(MAX_CREDITS_PER_TERM, Math.max(SELF_FUND_MIN_CREDITS, c + delta)));
    haptic.selection();
  };

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الإدارة المالية' : 'Finance'}
        title={t('payments.feeCalculator')}
        subtitle={t('payments.feeCalculatorDesc')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Inputs */}
        <View style={styles.card}>
          <Select
            label={t('payments.program')}
            options={PROGRAMS.map((p) => ({ value: p.id, label: t(`payments.${p.labelKey}`) }))}
            value={programId}
            onChange={handleProgram}
          />
          <Select
            label={isAr ? 'الفصل الدراسي' : 'Term'}
            options={[
              { value: 'regular', label: isAr ? 'فصل دراسي عادي' : 'Regular Term' },
              { value: 'summer', label: isAr ? 'الفصل الصيفي' : 'Summer Term' },
            ]}
            value={term}
            onChange={(v) => setTerm(v as 'regular' | 'summer')}
            containerStyle={{ marginTop: spacing.base }}
          />
          {isFoundation ? (
            <View style={styles.flatNote}>
              <Icon name="warning" size={16} color={colors.textTertiary} />
              <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection, lineHeight: 18 }}>
                {t('payments.foundationFlatNote')}
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: spacing.base }}>
              <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginBottom: 6, letterSpacing: isAr ? 0 : 0.5 }}>
                {t('payments.creditsTaken')}
              </Text>
              <View style={[styles.stepper, { flexDirection: rowDirection }]}>
                <Pressable
                  onPress={() => stepCredits(-1)}
                  disabled={credits <= SELF_FUND_MIN_CREDITS}
                  style={({ pressed }) => [
                    styles.stepBtn,
                    { opacity: credits <= SELF_FUND_MIN_CREDITS ? 0.35 : pressed ? 0.6 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="-"
                >
                  <Text style={styles.stepSign}>−</Text>
                </Pressable>
                <View style={styles.stepValue}>
                  <Text style={styles.stepValueText}>{toLatnDigits(String(credits))}</Text>
                </View>
                <Pressable
                  onPress={() => stepCredits(1)}
                  disabled={credits >= MAX_CREDITS_PER_TERM}
                  style={({ pressed }) => [
                    styles.stepBtn,
                    { opacity: credits >= MAX_CREDITS_PER_TERM ? 0.35 : pressed ? 0.6 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="+"
                >
                  <Text style={styles.stepSign}>+</Text>
                </Pressable>
              </View>
            </View>
          )}
          <Select
            label={t('payments.grant')}
            options={GRANTS.map((g) => ({ value: g.id, label: t(`payments.${g.labelKey}`) }))}
            value={grantId}
            onChange={setGrantId}
            containerStyle={{ marginTop: spacing.base }}
          />
        </View>

        {/* Result hero */}
        <View style={styles.hero}>
          <Text
            variant="overline"
            color={colors.secondaryLight}
            style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}
          >
            {t('payments.totalPayable')}
          </Text>
          <Text
            color={colors.textInverse}
            style={[styles.heroAmount, { textAlign, writingDirection }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(breakdown.totalPayable)}
          </Text>
          <View style={[styles.heroStripe, { backgroundColor: colors.brandRed }]} />
        </View>

        {/* Breakdown */}
        <SectionEyebrow label={t('payments.feeDetails')} />
        <View style={styles.list}>
          <BreakdownRow label={t('payments.grossTuition')} value={formatCurrency(breakdown.grossTuition)} />
          {breakdown.discountAmount > 0 && (
            <BreakdownRow
              label={t('payments.discount')}
              value={`- ${formatCurrency(breakdown.discountAmount)}`}
              valueColor={colors.success}
            />
          )}
          <BreakdownRow label={t('payments.netTuition')} value={formatCurrency(breakdown.netTuition)} />
          <BreakdownRow label={t('payments.serviceFee')} value={formatCurrency(breakdown.serviceFee)} />
          <BreakdownRow
            label={t('payments.registrationFee')}
            note={t('payments.registrationFeeNote')}
            value={formatCurrency(breakdown.registrationFee)}
          />
          <BreakdownRow
            label={t('payments.totalPayable')}
            value={formatCurrency(breakdown.totalPayable)}
            emphasis
            isLast
          />
        </View>

        {/* Payment schedule — summer is paid in full upfront, regular is split
            across the 3-installment plan (Finance Department doc). */}
        {isSummer ? (
          <>
            <SectionEyebrow label={isAr ? 'جدول السداد' : 'Payment Schedule'} />
            <View style={styles.list}>
              <BreakdownRow
                label={isAr ? 'دفعة واحدة كاملة' : 'Single Full Payment'}
                note={isAr ? 'تُسدّد قبل بداية الفصل الصيفي' : 'Due before the summer term starts'}
                value={formatCurrency(breakdown.totalPayable)}
                emphasis
                isLast
              />
            </View>
            <View style={styles.summerNote}>
              <Icon name="warning" size={16} color={colors.textTertiary} />
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ flex: 1, textAlign, writingDirection, lineHeight: 18 }}
              >
                {isAr
                  ? 'تُدفع رسوم الفصل الصيفي بالكامل قبل بداية الفصل. لا تُتاح خطة التقسيط على ثلاث دفعات للفصل الصيفي.'
                  : 'Summer fees are paid in full before the semester starts. The 3-installment plan is not available for the summer term.'}
              </Text>
            </View>
          </>
        ) : (
          <>
            <SectionEyebrow label={t('payments.installmentSchedule')} />
            <View style={styles.list}>
              <BreakdownRow
                label={t('payments.installmentBalance')}
                value={formatCurrency(breakdown.installmentBalance)}
              />
              {breakdown.installments.map((inst, i) => (
                <BreakdownRow
                  key={inst.number}
                  label={t('payments.installmentNum', { n: toLatnDigits(String(inst.number)) })}
                  note={t('payments.weekLabel', { n: toLatnDigits(String(inst.week)) })}
                  value={formatCurrency(inst.amount)}
                  isLast={i === breakdown.installments.length - 1}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function BreakdownRow({
  label,
  value,
  note,
  emphasis,
  valueColor,
  isLast,
}: {
  label: string;
  value: string;
  note?: string;
  emphasis?: boolean;
  valueColor?: string;
  isLast?: boolean;
}) {
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  return (
    <View
      style={[
        styles.row,
        {
          flexDirection: rowDirection,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          backgroundColor: emphasis ? colors.primaryWash : colors.surface,
        },
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant={emphasis ? 'bodyBold' : 'body'}
          color={emphasis ? colors.primary : colors.textPrimary}
          style={{ textAlign, writingDirection }}
        >
          {label}
        </Text>
        {note && (
          <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginTop: 2 }}>
            {note}
          </Text>
        )}
      </View>
      <Text
        variant="bodyBold"
        color={valueColor ?? (emphasis ? colors.primary : colors.textPrimary)}
      >
        {value}
      </Text>
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

  card: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.base,
  },

  flatNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.base,
  },
  summerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.sm,
  },

  stepper: {
    alignItems: 'stretch',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  stepBtn: {
    width: 52,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryWash,
  },
  stepSign: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 22,
    lineHeight: 26,
    color: colors.primary,
  },
  stepValue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepValueText: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 22,
    color: colors.textPrimary,
  },

  hero: {
    backgroundColor: colors.primaryDeep,
    padding: spacing.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  heroAmount: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  heroStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

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
});
