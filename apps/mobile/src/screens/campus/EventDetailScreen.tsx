import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Button, Badge, Avatar, ScreenSkeleton, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function EventDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const locale = useUIStore((s) => s.locale);
  const l = useLocalizedField();
  const queryClient = useQueryClient();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const { eventId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => campusApi.getEvents(),
  });

  const rsvpMutation = useMutation({
    mutationFn: () => campusApi.rsvpEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  if (isLoading) return <ScreenSkeleton />;
  const events = Array.isArray(data?.data) ? data.data : [];
  const event = events.find((e: any) => e.id === eventId);
  if (!event) return <Text variant="body" style={styles.empty}>{t('common.emptyEvents')}</Text>;

  const dateStr = new Date(event.start_time).toLocaleDateString(
    locale === 'ar' ? 'ar-KW' : 'en-KW',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );
  const timeStr = new Date(event.start_time).toLocaleTimeString(
    locale === 'ar' ? 'ar-KW' : 'en-KW',
    { hour: '2-digit', minute: '2-digit' },
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="h2" style={{ textAlign, writingDirection }}>{l(event, 'title')}</Text>

      <Card elevation="md" style={styles.card}>
        <View style={styles.detail}>
          <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
            <Icon name="schedule" size={16} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}> {dateStr}</Text>
          </View>
          <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
            <Icon name="time" size={16} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}> {timeStr}</Text>
          </View>
          <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
            <Icon name="location" size={16} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}> {l(event, 'location')}</Text>
          </View>
        </View>

        {event.capacity && (
          <View style={[styles.capacityRow, { flexDirection: rowDirection }]}>
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{t('campus.capacity')}</Text>
            <Badge
              label={`${event.rsvp_count}/${event.capacity}`}
              variant={event.rsvp_count >= event.capacity ? 'error' : 'info'}
            />
          </View>
        )}
      </Card>

      {(event.description_ar || event.description_en) && (
        <Card elevation="sm" style={styles.card}>
          <Text variant="body" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{l(event, 'description')}</Text>
        </Card>
      )}

      {event.organizer_name && (
        <View style={[styles.organizer, { flexDirection: rowDirection }]}>
          <Avatar name={event.organizer_name} size={32} />
          <View style={styles.organizerInfo}>
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{t('campus.organizer')}</Text>
            <Text variant="body" style={{ textAlign, writingDirection }}>{event.organizer_name}</Text>
          </View>
        </View>
      )}

      <Button
        title={event.is_rsvped ? t('campus.rsvped') : t('campus.rsvp')}
        onPress={() => rsvpMutation.mutate()}
        variant={event.is_rsvped ? 'ghost' : 'primary'}
        disabled={event.is_rsvped}
        loading={rsvpMutation.isPending}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  card: { marginTop: spacing.base },
  detail: { gap: spacing.xs },
  detailRow: { alignItems: 'center' },
  capacityRow: { justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  organizer: { alignItems: 'center', marginTop: spacing.base, gap: spacing.md },
  organizerInfo: {},
  button: { marginTop: spacing.xl },
  empty: { flex: 1, textAlign: 'center', padding: spacing.xl },
});
