import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Button, Badge, Avatar, ScreenSkeleton, EmptyState, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { toLatnDigits } from '../../i18n/helpers';

export function ClubDetailScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<any>();
  const l = useLocalizedField();
  const queryClient = useQueryClient();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const { clubId } = route.params;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => campusApi.getClubs(),
  });

  // Joining a club sends a request to the Club Advisor for approval; it is not
  // instant. Track the request locally since the mock API is stateless.
  const [requested, setRequested] = React.useState(false);

  const joinMutation = useMutation({
    mutationFn: () => campusApi.joinClub(clubId),
    onSuccess: () => {
      setRequested(true);
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="clubs" title={t('common.error')} tone="error" />
      </View>
    );
  }
  const clubs = Array.isArray(data?.data) ? data.data : [];
  const club: any = clubs.find((c: any) => c.id === clubId);
  if (!club) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="clubs" title={t('common.emptyClubs')} tone="neutral" />
      </View>
    );
  }
  const advisorName = isAr
    ? club.advisor_name_ar || club.advisor_name_en || club.advisor_name
    : club.advisor_name_en || club.advisor_name_ar || club.advisor_name;
  const isPending = club.request_status === 'pending' || requested;
  const joinTitle = club.is_member
    ? t('campus.joined')
    : isPending
      ? isAr
        ? 'بانتظار موافقة المشرف'
        : 'Pending advisor approval'
      : t('campus.joinClub');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={
          club.category
            ? t(`campus.clubCategory.${club.category}`, { defaultValue: club.category })
            : t('campus.clubs')
        }
        title={l(club, 'name')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {/* Identity block */}
        <View style={[styles.identity, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Avatar name={l(club, 'name')} size={64} ring={colors.primary} />
          <View style={[styles.statsRow, { flexDirection: rowDirection, borderTopColor: colors.divider }]}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.primary }]}>
                {toLatnDigits(String(club.member_count || 0))}
              </Text>
              <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
                {t('campus.members')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.stat}>
              <Badge label={(club.status || 'active').toUpperCase()} variant="lime" size="sm" />
              <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, marginTop: 4 }}>
                {isAr ? 'الحالة' : 'Status'}
              </Text>
            </View>
          </View>
        </View>

        {(club.description_ar || club.description_en) && (
          <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, marginBottom: 6 }}>
              {isAr ? 'عن النادي' : 'About'}
            </Text>
            <Text variant="body" style={{ textAlign, writingDirection }}>
              {l(club, 'description')}
            </Text>
          </View>
        )}

        {advisorName && (
          <View style={[styles.advisorBlock, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: rowDirection }]}>
            <View style={[styles.iconWedge, { backgroundColor: colors.primaryWash }]}>
              <Icon name="profile" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection }}>
                {t('campus.advisor')}
              </Text>
              <Text variant="bodyBold" style={{ textAlign, writingDirection, marginTop: 2 }}>
                {advisorName}
              </Text>
              {!club.is_member && (
                <Text
                  variant="caption"
                  color={colors.textTertiary}
                  style={{ textAlign, writingDirection, marginTop: 4 }}
                >
                  {isAr
                    ? 'يُرسَل طلب الانضمام إلى مشرف النادي للموافقة عليه.'
                    : 'Join requests are sent to the club advisor for approval.'}
                </Text>
              )}
            </View>
          </View>
        )}

        {isPending && !club.is_member && (
          <View style={[styles.pendingBanner, { backgroundColor: colors.primaryWash, borderColor: colors.primary, flexDirection: rowDirection }]}>
            <Icon name="time" size={16} color={colors.primary} />
            <Text variant="smallBold" color={colors.primary} style={{ flex: 1, textAlign, writingDirection }}>
              {isAr
                ? 'تم إرسال الطلب - بانتظار موافقة مشرف النادي'
                : 'Request sent - pending club advisor approval'}
            </Text>
          </View>
        )}

        <Button
          title={joinTitle}
          onPress={() => joinMutation.mutate()}
          variant={club.is_member || isPending ? 'outline' : 'primary'}
          disabled={club.is_member || isPending}
          loading={joinMutation.isPending}
          fullWidth
          size="large"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  identity: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  statsRow: {
    width: '100%',
    paddingTop: spacing.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: StyleSheet.hairlineWidth, height: 36 },
  statNum: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 24,
    lineHeight: 28,
  },

  block: {
    marginTop: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },

  advisorBlock: {
    marginTop: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWedge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pendingBanner: {
    marginTop: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
});
