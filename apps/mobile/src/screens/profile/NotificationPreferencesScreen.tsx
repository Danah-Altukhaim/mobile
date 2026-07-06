import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Switch, ScreenSkeleton, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { notificationApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';

export function NotificationPreferencesScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const isAr = i18n.language === 'ar';

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationApi.getPreferences(),
  });

  const mutation = useMutation({
    mutationFn: (updated: any) => notificationApi.updatePreferences(updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  const prefs = data?.data;

  const toggleChannel = (channel: string, type: 'push' | 'email', value: boolean) => {
    mutation.mutate({ channels: { [channel]: { [type]: value } } });
  };

  const PUSH_ROWS = [
    { channel: 'payment_reminders', label: t('payments.title') },
    { channel: 'grade_updates', label: t('academics.grades') },
    { channel: 'absence_warnings', label: t('academics.attendance') },
    { channel: 'event_reminders', label: t('campus.events') },
    { channel: 'admin_announcements', label: t('campus.announcements') },
  ];
  const EMAIL_ROWS = [
    { channel: 'payment_reminders', label: t('payments.title') },
    { channel: 'grade_updates', label: t('academics.grades') },
    { channel: 'absence_warnings', label: t('academics.attendance') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الإعدادات' : 'Preferences'}
        title={t('profile.notificationPreferences')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        <SectionEyebrow label={t('notifications.pushNotifications')} colors={colors} isAr={isAr} />
        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {PUSH_ROWS.map((r, i) => (
            <SwitchRow
              key={r.channel}
              label={r.label}
              value={prefs?.channels?.[r.channel]?.push ?? true}
              onValueChange={(v: boolean) => toggleChannel(r.channel, 'push', v)}
              isLast={i === PUSH_ROWS.length - 1}
              colors={colors}
              rowDirection={rowDirection}
              textAlign={textAlign}
              writingDirection={writingDirection}
            />
          ))}
        </View>

        <SectionEyebrow label={t('notifications.emailNotifications')} colors={colors} isAr={isAr} />
        <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {EMAIL_ROWS.map((r, i) => (
            <SwitchRow
              key={r.channel}
              label={r.label}
              value={prefs?.channels?.[r.channel]?.email ?? true}
              onValueChange={(v: boolean) => toggleChannel(r.channel, 'email', v)}
              isLast={i === EMAIL_ROWS.length - 1}
              colors={colors}
              rowDirection={rowDirection}
              textAlign={textAlign}
              writingDirection={writingDirection}
            />
          ))}
        </View>

        <SectionEyebrow label={t('profile.quietHours')} colors={colors} isAr={isAr} />
        <View style={[styles.quietBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.quietRow, { flexDirection: rowDirection }]}>
            <View style={[styles.quietIcon, { backgroundColor: colors.primaryWash }]}>
              <Icon name="moon" size={16} color={colors.primary} />
            </View>
            <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }}>
              {prefs?.quiet_hours?.start || '22:00'} — {prefs?.quiet_hours?.end || '07:00'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SwitchRow({
  label, value, onValueChange, isLast, colors, rowDirection, textAlign, writingDirection,
}: any) {
  return (
    <View
      style={[
        styles.switchRow,
        {
          flexDirection: rowDirection,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }}>
        {label}
      </Text>
      <Switch label="" value={value} onValueChange={onValueChange} />
    </View>
  );
}

function SectionEyebrow({ label, colors, isAr }: { label: string; colors: any; isAr: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
      <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },

  list: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  switchRow: {
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 56,
    gap: spacing.md,
  },

  quietBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  quietRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  quietIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
