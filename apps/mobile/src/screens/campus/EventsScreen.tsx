import React from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Button, ScreenSkeleton, Icon, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { campusApi } from '../../services/api';
import { localized, currentLocale, toLatnDigits } from '../../i18n/helpers';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

export function EventsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: () => campusApi.getEvents(),
  });

  const rsvpMutation = useMutation({
    mutationFn: (eventId: string) => campusApi.rsvpEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  if (isLoading) return <ScreenSkeleton />;
  const events = Array.isArray(data?.data) ? data.data : [];

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'فعاليات الحرم' : 'On campus'}
        title={t('campus.events')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState icon="events" title={t('common.error')} tone="error" />
        ) : events.length === 0 ? (
          <EmptyState icon="events" title={t('common.noData')} tone="neutral" />
        ) : (
          events.map((event: any) => {
            const dateObj = new Date(event.start_time);
            const dayNum = dateObj.getDate();
            const monthShort = dateObj.toLocaleDateString(currentLocale(), { month: 'short' });
            const dateLine = dateObj.toLocaleDateString(currentLocale(), {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            });
            return (
              <Pressable
                key={event.id}
                onPress={() => {
                  haptic.selection();
                  navigation.navigate('EventDetail', { eventId: event.id });
                }}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
                ]}
                accessibilityRole="button"
              >
                <View style={[styles.cardRow, { flexDirection: rowDirection }]}>
                  {/* Date wedge */}
                  <View style={[styles.dateWedge, { backgroundColor: colors.primaryWash }]}>
                    <Text style={[styles.dateNum, { color: colors.primary }]}>
                      {toLatnDigits(String(dayNum))}
                    </Text>
                    <Text variant="caption" color={colors.primary}>
                      {monthShort.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="h4" style={{ textAlign, writingDirection }} numberOfLines={2}>
                      {localized(event, 'title')}
                    </Text>
                    {(event.description_ar || event.description_en) && (
                      <Text
                        variant="small"
                        color={colors.textSecondary}
                        style={{ textAlign, writingDirection, marginTop: 2 }}
                        numberOfLines={2}
                      >
                        {localized(event, 'description')}
                      </Text>
                    )}
                    <View style={[styles.metaRow, { flexDirection: rowDirection, marginTop: 6 }]}>
                      <Icon name="calendar" size={12} color={colors.textTertiary} />
                      <Text variant="caption" color={colors.textTertiary} numberOfLines={1}>
                        {toLatnDigits(dateLine)}
                      </Text>
                    </View>
                    <View style={[styles.metaRow, { flexDirection: rowDirection }]}>
                      <Icon name="location" size={12} color={colors.textTertiary} />
                      <Text variant="caption" color={colors.textTertiary} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                    {event.capacity && (
                      <Text variant="caption" color={colors.primary} style={{ marginTop: 4, textAlign, writingDirection }}>
                        {toLatnDigits(String(event.rsvp_count))}/{toLatnDigits(String(event.capacity))} {t('common.registered')}
                      </Text>
                    )}
                  </View>
                </View>
                <Button
                  title={
                    event.registration_open === false
                      ? t('campus.registrationClosed')
                      : event.is_rsvped
                        ? t('campus.rsvped')
                        : t('campus.rsvp')
                  }
                  onPress={() => rsvpMutation.mutate(event.id)}
                  variant={event.is_rsvped || event.registration_open === false ? 'outline' : 'primary'}
                  disabled={event.is_rsvped || event.registration_open === false}
                  loading={rsvpMutation.isPending && rsvpMutation.variables === event.id}
                  size="compact"
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  cardRow: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dateWedge: {
    width: 60,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  dateNum: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 24,
    lineHeight: 26,
  },
  metaRow: {
    alignItems: 'center',
    gap: 5,
  },
});
