import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CRITICAL_CASE_RULES, type CriticalCaseCategory } from '@masari/shared';
import { Text, Icon } from '../ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

// Academic Warning surface — CCK Hub Update + CCK Hub Feedback v3 ("Critical Cases").
// Shown when grades.academic_standing is 'probation' OR a critical-case flag is set.
export function AcademicWarningBanner() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data } = useQuery({
    queryKey: ['student', 'grades'],
    queryFn: () => academicApi.getGrades(),
  });

  const standing = data?.data?.academic_standing as string | undefined;
  const critical = data?.data?.critical_case as CriticalCaseCategory | null | undefined;
  if (standing !== 'probation' && !critical) return null;

  const rule = critical ? CRITICAL_CASE_RULES.find((r) => r.key === critical) : null;
  const title = rule
    ? (isAr ? rule.label_ar : rule.label_en)
    : t('academics.academicWarningTitle');
  const body = rule
    ? (isAr ? rule.description_ar : rule.description_en)
    : t('academics.academicWarningBody');

  return (
    <View style={[styles.banner, { flexDirection: rowDirection }]}>
      <View style={styles.accent} />
      <View style={[styles.body, { flexDirection: rowDirection }]}>
        <Icon name="warning" size={18} color={colors.brandRed} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyBold" color={colors.brandRedDark} style={{ textAlign, writingDirection }}>
            {title}
          </Text>
          <Text
            variant="caption"
            color={colors.brandRedDark}
            style={{ textAlign, writingDirection, marginTop: 2 }}
          >
            {body}
          </Text>
          {rule && (
            <Text
              variant="caption"
              color={colors.brandRed}
              style={{ textAlign, writingDirection, marginTop: 4 }}
            >
              {t('academics.advisingGpaWarning')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.brandRedWash,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandRed,
    marginTop: spacing.base,
  },
  accent: {
    width: 3,
    backgroundColor: colors.brandRed,
  },
  body: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.base,
  },
});
