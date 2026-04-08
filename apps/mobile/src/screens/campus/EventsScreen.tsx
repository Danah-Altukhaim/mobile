import React from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Button, ScreenSkeleton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { campusApi } from '../../services/api';

export function EventsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => campusApi.getEvents(),
  });

  const rsvpMutation = useMutation({
    mutationFn: (eventId: string) => campusApi.rsvpEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  if (isLoading) return <ScreenSkeleton />;

  const events = Array.isArray(data?.data) ? data.data : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {events.map((event: any) => (
        <Card key={event.id} elevation="md" style={styles.card}>
          <Text variant="h3">{event.title_ar}</Text>
          {event.description_ar && (
            <Text variant="body" color={colors.textSecondary}>{event.description_ar}</Text>
          )}
          <Text variant="caption" style={styles.detail}>
            📅 {new Date(event.start_time).toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text variant="caption">📍 {event.location}</Text>
          {event.capacity && (
            <Text variant="caption" color={colors.primary}>
              {event.rsvp_count}/{event.capacity} مسجل
            </Text>
          )}
          <Button
            title={event.is_rsvped ? '✓ مسجل' : t('campus.rsvp')}
            onPress={() => rsvpMutation.mutate(event.id)}
            variant={event.is_rsvped ? 'ghost' : 'primary'}
            disabled={event.is_rsvped}
            loading={rsvpMutation.isPending}
            style={styles.rsvpButton}
          />
        </Card>
      ))}

      {events.length === 0 && (
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>
          {t('common.noData')}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  card: { marginBottom: spacing.base },
  detail: { marginTop: spacing.sm },
  rsvpButton: { marginTop: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
