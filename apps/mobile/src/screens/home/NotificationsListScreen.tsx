import React, { useMemo } from 'react';
import { SectionList, View, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, ScreenSkeleton, Icon, EmptyState, type IconName } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { notificationApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { toLatnDigits } from '../../i18n/helpers';

const typeIcons: Record<string, IconName> = {
  payment: 'notification-payment',
  payment_reminder: 'notification-payment',
  grade: 'notification-grade',
  grade_update: 'notification-grade',
  event: 'notification-event',
  event_reminder: 'notification-event',
  gpa: 'notification-gpa',
  academic_warning: 'notification-gpa',
  absence_warning: 'attendance',
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function NotificationsListScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  const sections = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];
    const today = startOfDay(new Date()).getTime();
    const oneWeekAgo = today - 6 * 24 * 60 * 60 * 1000;
    const buckets: Record<string, any[]> = { today: [], week: [], earlier: [] };
    for (const n of list) {
      const t = startOfDay(new Date(n.created_at)).getTime();
      if (t >= today) buckets.today.push(n);
      else if (t >= oneWeekAgo) buckets.week.push(n);
      else buckets.earlier.push(n);
    }
    return [
      { titleKey: 'notifications.today', data: buckets.today },
      { titleKey: 'notifications.thisWeek', data: buckets.week },
      { titleKey: 'notifications.earlier', data: buckets.earlier },
    ].filter((s) => s.data.length > 0);
  }, [data]);

  if (isLoading) return <ScreenSkeleton />;

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <InnerScreenHeader
          eyebrow={isAr ? 'مركز الإشعارات' : 'Inbox'}
          title={t('notifications.title')}
        />
        <EmptyState
          icon="notifications"
          tone="error"
          title={t('common.error')}
          message={t('common.error')}
        />
      </View>
    );
  }

  const tonePerType: Record<string, { fg: string; wash: string }> = {
    payment: { fg: colors.warning, wash: colors.warningWash },
    payment_reminder: { fg: colors.warning, wash: colors.warningWash },
    grade: { fg: colors.primary, wash: colors.primaryWash },
    grade_update: { fg: colors.primary, wash: colors.primaryWash },
    event: { fg: colors.info, wash: colors.infoWash },
    event_reminder: { fg: colors.info, wash: colors.infoWash },
    gpa: { fg: colors.secondaryDark, wash: '#EFF7E0' },
    academic_warning: { fg: colors.brandRed, wash: colors.warningWash },
    absence_warning: { fg: colors.brandRed, wash: colors.warningWash },
  };

  if (sections.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <InnerScreenHeader
          eyebrow={isAr ? 'مركز الإشعارات' : 'Inbox'}
          title={t('notifications.title')}
        />
        <EmptyState
          icon="notifications"
          title={t('common.allCaught')}
          message={t('notifications.noNotifications')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        sections={sections}
        keyExtractor={(item: any) => item.id}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <InnerScreenHeader
            eyebrow={isAr ? 'مركز الإشعارات' : 'Inbox'}
            title={t('notifications.title')}
          />
        }
        renderSectionHeader={({ section }: any) => (
          <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
            <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
            <Text
              variant="overline"
              color={colors.textTertiary}
              style={{ letterSpacing: isAr ? 0 : 1 }}
            >
              {t(section.titleKey)}
            </Text>
            <Text variant="caption" color={colors.textQuiet}>
              {toLatnDigits(String(section.data.length))}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }: any) => {
          const tone = tonePerType[item.type] || { fg: colors.primary, wash: colors.primaryWash };
          const dateStr = new Date(item.created_at).toLocaleDateString(
            locale === 'ar' ? 'ar-KW' : 'en-KW',
            { month: 'short', day: 'numeric' },
          );
          const isLast = index === section.data.length - 1;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                {
                  flexDirection: rowDirection,
                  backgroundColor: pressed ? colors.primarySoft : item.is_read ? colors.surface : colors.primaryWash,
                  borderColor: colors.border,
                  borderBottomWidth: isLast ? StyleSheet.hairlineWidth : 0,
                  borderTopWidth: index === 0 ? StyleSheet.hairlineWidth : 0,
                },
              ]}
            >
              {!item.is_read && (
                <View style={[styles.unreadAccent, { backgroundColor: colors.primary }]} />
              )}
              <View style={[styles.iconWedge, { backgroundColor: tone.wash }]}>
                <Icon
                  name={typeIcons[item.type] || 'notifications'}
                  size={18}
                  color={tone.fg}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  variant="bodyBold"
                  style={{ textAlign, writingDirection }}
                  numberOfLines={1}
                >
                  {locale === 'ar' ? item.title_ar : item.title_en}
                </Text>
                <Text
                  variant="small"
                  color={colors.textSecondary}
                  style={{ textAlign, writingDirection, marginTop: 2 }}
                  numberOfLines={2}
                >
                  {locale === 'ar' ? item.body_ar : item.body_en}
                </Text>
              </View>
              <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
                <Text variant="caption" color={colors.textTertiary}>
                  {toLatnDigits(dateStr)}
                </Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: colors.divider, [isRTL ? 'right' : 'left']: spacing.base + 36 + spacing.md },
                  ]}
                />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2, flexShrink: 0 },
  row: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.md,
    alignItems: 'flex-start',
    borderColor: 'transparent',
  },
  unreadAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    start: 0,
    width: 3,
  },
  iconWedge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});
