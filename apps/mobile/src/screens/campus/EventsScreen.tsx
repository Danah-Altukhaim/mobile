import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Button, ScreenSkeleton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { campusApi } from '../../services/api';
import { localized, currentLocale } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

export function EventsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { textAlign, writingDirection } = useDirection();

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
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>
        {t('campus.events')}
      </Text>
      {events.map((event: any) => (
        <Card key={event.id} elevation="md" style={styles.card} onTouchEnd={() => navigation.navigate('EventDetail', { eventId: event.id })}>
          <Text variant="h3">{localized(event, 'title')}</Text>
          {(event.description_ar || event.description_en) && (
            <Text variant="body" color={colors.textSecondary}>
              {localized(event, 'description')}
            </Text>
          )}
          <Text variant="caption" style={styles.detail}>
            📅 {new Date(event.start_time).toLocaleDateString(currentLocale(), {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
          <Text variant="caption">📍 {event.location}</Text>
          {event.capacity && (
            <Text variant="caption" color={colors.primary}>
              {event.rsvp_count}/{event.capacity} {t('common.registered')}
            </Text>
          )}
          <Button
            title={event.is_rsvped ? t('campus.rsvped') : t('campus.rsvp')}
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
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.base },
  detail: { marginTop: spacing.sm },
  rsvpButton: { marginTop: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
