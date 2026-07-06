import React, { useMemo } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, ScreenSkeleton, EmptyState, Icon, type IconName } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useUIStore } from '../../store/ui.store';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { toLatnDigits } from '../../i18n/helpers';
import { courseColor } from '../../utils/courseColor';

const typeIcons: Record<string, IconName> = {
  homework: 'homework',
  quiz: 'quiz',
  exam: 'grades',
  project: 'project',
};

export function AssignmentFeedScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const locale = useUIStore((s) => s.locale);
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: () => academicApi.getAssignments(),
  });

  const sorted = useMemo(() => {
    const list = Array.isArray(data?.data) ? data!.data : [];
    return [...list].sort(
      (a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    );
  }, [data]);

  if (isLoading) return <ScreenSkeleton />;

  function urgencyTone(due: string) {
    const hours = (new Date(due).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hours < 24) return { fg: colors.brandRed, bg: colors.brandRedWash, label: isAr ? 'عاجل' : 'Urgent' };
    if (hours < 72) return { fg: colors.warning, bg: colors.warningWash, label: isAr ? 'قريب' : 'Soon' };
    return { fg: colors.primary, bg: colors.primaryWash, label: isAr ? 'لاحق' : 'Later' };
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      data={sorted}
      keyExtractor={(item: any, i) => item.id || String(i)}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <View style={styles.titleBlock}>
          <Text
            variant="overline"
            color={colors.primary}
            style={[styles.eyebrow, { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }]}
          >
            {isAr ? 'كل المهام' : 'All assignments'}
          </Text>
          <Text variant="h1" accessibilityRole="header" style={[{ textAlign, writingDirection }]}>
            {t('academics.allAssignments')}
          </Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.divider }]} />}
      ListEmptyComponent={
        isError ? (
          <EmptyState icon="assignments" title={t('common.error')} tone="error" />
        ) : (
          <EmptyState icon="assignments" title={t('common.emptyAssignments')} tone="success" />
        )
      }
      renderItem={({ item }: { item: any }) => {
        const tone = urgencyTone(item.due_date);
        const accent = courseColor(item.course_code);
        const dueStr = new Date(item.due_date).toLocaleDateString(
          locale === 'ar' ? 'ar-KW' : 'en-KW',
          { weekday: 'short', month: 'short', day: 'numeric' },
        );

        return (
          <View
            style={[
              styles.row,
              {
                flexDirection: rowDirection,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.dateChip, { backgroundColor: tone.bg }]}>
              <Text variant="overline" color={tone.fg} style={{ letterSpacing: isAr ? 0 : 0.8 }}>
                {tone.label}
              </Text>
              <Text style={[styles.dateChipDate, { color: tone.fg }]} numberOfLines={1}>
                {toLatnDigits(dueStr)}
              </Text>
            </View>
            <View style={styles.info}>
              <View style={[styles.courseLine, { flexDirection: rowDirection }]}>
                <View style={[styles.courseChip, { backgroundColor: accent.wash }]}>
                  <Text variant="caption" color={accent.fg}>
                    {item.course_code}
                  </Text>
                </View>
                <Icon
                  name={typeIcons[item.type] || 'document'}
                  size={12}
                  color={colors.textTertiary}
                />
                <Text variant="caption" color={colors.textTertiary}>
                  {t(`academics.${item.type}`, { defaultValue: item.type })}
                </Text>
              </View>
              <Text
                variant="bodyBold"
                style={{ textAlign, writingDirection, marginTop: 4 }}
                numberOfLines={2}
              >
                {l(item, 'title')}
              </Text>
              {item.submitted && (
                <View style={[styles.submittedRow, { flexDirection: rowDirection, marginTop: 4 }]}>
                  <Icon name="check" size={12} color={colors.success} />
                  <Text variant="caption" color={colors.success}>
                    {t('academics.submitted')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },
  titleBlock: { marginBottom: spacing.base },
  eyebrow: { marginBottom: 6 },
  separator: { height: spacing.sm, backgroundColor: 'transparent' },

  row: {
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'stretch',
  },
  dateChip: {
    minWidth: 76,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
  },
  dateChipDate: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 14,
    lineHeight: 16,
  },
  info: { flex: 1, minWidth: 0 },
  courseLine: {
    alignItems: 'center',
    gap: 6,
  },
  courseChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  submittedRow: {
    alignItems: 'center',
    gap: 4,
  },
});
