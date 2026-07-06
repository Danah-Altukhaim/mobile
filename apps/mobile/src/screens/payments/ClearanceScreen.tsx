import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, ScreenSkeleton } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { apiClient } from '../../services/api';

type ClearanceStatus = 'cleared' | 'pending' | 'blocked';

interface ClearanceDept {
  key: string;
  name_ar: string;
  name_en: string;
  status: ClearanceStatus;
  note_ar?: string;
  note_en?: string;
}

interface ClearanceData {
  overall: ClearanceStatus;
  updated_at: string;
  departments: ClearanceDept[];
}

const STATUS_VARIANT: Record<ClearanceStatus, 'success' | 'warning' | 'error'> = {
  cleared: 'success',
  pending: 'warning',
  blocked: 'error',
};

export function ClearanceScreen() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'clearance'],
    queryFn: () => apiClient.get<ClearanceData>('/api/v1/students/me/clearance'),
  });

  if (isLoading) return <ScreenSkeleton />;

  const clearance = data?.data;
  const departments = clearance?.departments ?? [];
  const overall = clearance?.overall ?? 'pending';

  const statusLabel = (status: ClearanceStatus): string => {
    if (status === 'cleared') return isAr ? 'تم التخليص' : 'Cleared';
    if (status === 'blocked') return isAr ? 'موقوف' : 'Blocked';
    return isAr ? 'قيد المراجعة' : 'Pending';
  };

  const allCleared = overall === 'cleared';

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الإدارة المالية' : 'Finance'}
        title={isAr ? 'حالة إخلاء الطرف' : 'Clearance Status'}
        subtitle={
          isAr
            ? 'حالة إخلاء طرفك عبر الأقسام، المطلوبة للتخرج أو الانسحاب.'
            : 'Your clearance status across departments, required for graduation or withdrawal.'
        }
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Overall status hero */}
        <View style={styles.hero}>
          <Text
            variant="overline"
            color={colors.secondaryLight}
            style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}
          >
            {isAr ? 'الحالة العامة' : 'Overall Status'}
          </Text>
          <Text
            color={colors.textInverse}
            style={[styles.heroText, { textAlign, writingDirection }]}
          >
            {allCleared
              ? isAr
                ? 'تم إخلاء الطرف بالكامل'
                : 'Fully Cleared'
              : isAr
                ? 'إخلاء الطرف غير مكتمل'
                : 'Clearance Incomplete'}
          </Text>
          <Text
            variant="small"
            color="rgba(255,255,255,0.78)"
            style={{ textAlign, writingDirection, marginTop: 2 }}
          >
            {allCleared
              ? isAr
                ? 'جميع الأقسام أنهت إجراءاتها.'
                : 'All departments have completed their review.'
              : isAr
                ? 'يجب إنهاء جميع الأقسام قبل التخرج أو الانسحاب.'
                : 'All departments must clear before graduation or withdrawal.'}
          </Text>
          <View style={[styles.heroStripe, { backgroundColor: colors.brandRed }]} />
        </View>

        {/* Departments */}
        <SectionEyebrow label={isAr ? 'الأقسام' : 'Departments'} />
        <View style={styles.list}>
          {departments.map((dept, i) => {
            const isLast = i === departments.length - 1;
            const note = isAr ? dept.note_ar : dept.note_en;
            return (
              <View
                key={dept.key}
                style={[
                  styles.row,
                  {
                    flexDirection: rowDirection,
                    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View
                  style={[
                    styles.rowAccent,
                    {
                      backgroundColor:
                        dept.status === 'cleared'
                          ? colors.secondary
                          : dept.status === 'blocked'
                            ? colors.brandRed
                            : colors.warning,
                    },
                  ]}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }} numberOfLines={2}>
                    {isAr ? dept.name_ar : dept.name_en}
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
                <Badge
                  label={statusLabel(dept.status)}
                  variant={STATUS_VARIANT[dept.status]}
                  size="sm"
                />
              </View>
            );
          })}
        </View>

        <Text
          variant="caption"
          color={colors.textSecondary}
          style={{ textAlign, writingDirection, marginTop: spacing.sm, lineHeight: 18 }}
        >
          {isAr
            ? 'إخلاء الطرف للقراءة فقط. لتسوية أي قسم معلّق راجِع القسم المعني مباشرةً.'
            : 'Clearance is read-only. To resolve a pending department, contact that department directly.'}
        </Text>
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

  hero: {
    backgroundColor: colors.primaryDeep,
    padding: spacing.lg,
    marginTop: spacing.base,
    overflow: 'hidden',
  },
  heroText: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 24,
    lineHeight: 32,
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
  rowAccent: { width: 3, height: 36 },
});
