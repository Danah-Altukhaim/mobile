import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Switch, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { notificationApi } from '../../services/api';

export function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const queryClient = useQueryClient();

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
    mutation.mutate({
      channels: {
        [channel]: { [type]: value },
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h2" style={styles.title}>{t('profile.notificationPreferences')}</Text>

      <Card elevation="sm" style={styles.card}>
        <Text variant="bodyBold" style={styles.sectionTitle}>{t('notifications.pushNotifications')}</Text>
        <Switch label={t('payments.title')} value={prefs?.channels?.payment_reminders?.push ?? true} onValueChange={(v: boolean) => toggleChannel('payment_reminders', 'push', v)} />
        <Switch label={t('academics.grades')} value={prefs?.channels?.grade_updates?.push ?? true} onValueChange={(v: boolean) => toggleChannel('grade_updates', 'push', v)} />
        <Switch label={t('campus.events')} value={prefs?.channels?.event_reminders?.push ?? true} onValueChange={(v: boolean) => toggleChannel('event_reminders', 'push', v)} />
        <Switch label={t('social.title')} value={prefs?.channels?.social_updates?.push ?? true} onValueChange={(v: boolean) => toggleChannel('social_updates', 'push', v)} />
        <Switch label={t('campus.announcements')} value={prefs?.channels?.admin_announcements?.push ?? true} onValueChange={(v: boolean) => toggleChannel('admin_announcements', 'push', v)} />
      </Card>

      <Card elevation="sm" style={styles.card}>
        <Text variant="bodyBold" style={styles.sectionTitle}>{t('notifications.emailNotifications')}</Text>
        <Switch label={t('payments.title')} value={prefs?.channels?.payment_reminders?.email ?? true} onValueChange={(v: boolean) => toggleChannel('payment_reminders', 'email', v)} />
        <Switch label={t('academics.grades')} value={prefs?.channels?.grade_updates?.email ?? true} onValueChange={(v: boolean) => toggleChannel('grade_updates', 'email', v)} />
      </Card>

      <Card elevation="sm" style={styles.card}>
        <Text variant="bodyBold" style={styles.sectionTitle}>{t('profile.quietHours')}</Text>
        <Text variant="body" color={colors.textSecondary}>
          {prefs?.quiet_hours?.start || '22:00'} — {prefs?.quiet_hours?.end || '07:00'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.base },
  sectionTitle: { marginBottom: spacing.sm },
});
