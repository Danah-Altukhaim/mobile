import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Button, Badge, Avatar, ScreenSkeleton, Icon, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { toLatnDigits } from '../../i18n/helpers';

export function EventDetailScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<any>();
  const locale = useUIStore((s) => s.locale);
  const l = useLocalizedField();
  const queryClient = useQueryClient();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const { eventId } = route.params;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: () => campusApi.getEvents(),
  });

  const rsvpMutation = useMutation({
    mutationFn: () => campusApi.rsvpEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  if (isLoading) return <ScreenSkeleton />;
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="events" title={t('common.error')} tone="error" />
      </View>
    );
  }
  const events = Array.isArray(data?.data) ? data.data : [];
  const event: any = events.find((e: any) => e.id === eventId);
  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="events" title={t('common.emptyEvents')} tone="neutral" />
      </View>
    );
  }

  const dateStr = new Date(event.start_time).toLocaleDateString(
    locale === 'ar' ? 'ar-KW' : 'en-KW',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );
  const timeStr = new Date(event.start_time).toLocaleTimeString(
    locale === 'ar' ? 'ar-KW' : 'en-KW',
    { hour: '2-digit', minute: '2-digit' },
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'فعالية' : 'Event'}
        title={l(event, 'title')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Detail block */}
        <View style={[styles.detailBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <DetailRow icon="schedule" label={toLatnDigits(dateStr)} colors={colors} rowDirection={rowDirection} textAlign={textAlign} writingDirection={writingDirection} />
          <DetailRow icon="time" label={toLatnDigits(timeStr)} colors={colors} rowDirection={rowDirection} textAlign={textAlign} writingDirection={writingDirection} />
          <DetailRow icon="location" label={l(event, 'location')} colors={colors} rowDirection={rowDirection} textAlign={textAlign} writingDirection={writingDirection} />
          {event.capacity && (
            <View style={[styles.capacityRow, { flexDirection: rowDirection, borderTopColor: colors.divider }]}>
              <Text variant="caption" color={colors.textTertiary}>{t('campus.capacity')}</Text>
              <Badge
                label={`${toLatnDigits(String(event.rsvp_count))}/${toLatnDigits(String(event.capacity))}`}
                variant={event.rsvp_count >= event.capacity ? 'error' : 'primary'}
                size="sm"
              />
            </View>
          )}
        </View>

        {(event.description_ar || event.description_en) && (
          <View style={[styles.descBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, marginBottom: 6 }}>
              {isAr ? 'تفاصيل' : 'About'}
            </Text>
            <Text variant="body" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
              {l(event, 'description')}
            </Text>
          </View>
        )}

        {event.organizer_name && (
          <View style={[styles.organizerBlock, { flexDirection: rowDirection, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Avatar name={event.organizer_name} size={40} />
            <View style={{ flex: 1 }}>
              <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}>
                {t('campus.organizer')}
              </Text>
              <Text variant="bodyBold" style={{ textAlign, writingDirection, marginTop: 2 }}>
                {event.organizer_name}
              </Text>
            </View>
          </View>
        )}

        {/* Registration is only possible when the event has it activated. */}
        {event.registration_open === false && (
          <View style={[styles.closedBanner, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: rowDirection }]}>
            <Icon name="time" size={16} color={colors.textTertiary} />
            <Text variant="smallBold" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection }}>
              {t('campus.registrationClosed')}
            </Text>
          </View>
        )}

        <Button
          title={
            event.registration_open === false
              ? t('campus.registrationClosed')
              : event.is_rsvped
                ? t('campus.rsvped')
                : t('campus.rsvp')
          }
          onPress={() => rsvpMutation.mutate()}
          variant={event.is_rsvped || event.registration_open === false ? 'outline' : 'primary'}
          disabled={event.is_rsvped || event.registration_open === false}
          loading={rsvpMutation.isPending}
          fullWidth
          size="large"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

function DetailRow({
  icon, label, colors, rowDirection, textAlign, writingDirection,
}: any) {
  return (
    <View style={[styles.detailRow, { flexDirection: rowDirection }]}>
      <View style={[styles.iconWedge, { backgroundColor: colors.primaryWash }]}>
        <Icon name={icon} size={14} color={colors.primary} />
      </View>
      <Text variant="bodyBold" style={{ flex: 1, textAlign, writingDirection }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  detailBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  detailRow: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
  },
  iconWedge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capacityRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  descBlock: {
    marginTop: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },

  organizerBlock: {
    marginTop: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
  },

  closedBanner: {
    marginTop: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
});
