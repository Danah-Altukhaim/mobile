import React from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Button, Badge, ScreenSkeleton, Icon, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { campusApi } from '../../services/api';
import { localized, toLatnDigits } from '../../i18n/helpers';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

export function ClubsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => campusApi.getClubs(),
  });

  // Joining a club is not instant: the request is routed to the Club Advisor
  // for approval. Track requests sent this session so the button reflects the
  // pending-approval state even though the mock API is stateless.
  const [requestedIds, setRequestedIds] = React.useState<string[]>([]);

  const joinMutation = useMutation({
    mutationFn: (clubId: string) => campusApi.joinClub(clubId),
    onSuccess: (_res, clubId) => {
      setRequestedIds((prev) => (prev.includes(clubId) ? prev : [...prev, clubId]));
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  const clubs = Array.isArray(data?.data) ? data.data : [];

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الحياة الطلابية' : 'Get involved'}
        title={t('campus.clubs')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState icon="clubs" title={t('common.error')} tone="error" />
        ) : clubs.length === 0 ? (
          <EmptyState icon="clubs" title={t('common.noData')} tone="neutral" />
        ) : (
          clubs.map((club: any) => {
            const isPending =
              club.request_status === 'pending' || requestedIds.includes(club.id);
            const joinTitle = club.is_member
              ? t('campus.joined')
              : isPending
                ? isAr
                  ? 'بانتظار موافقة المشرف'
                  : 'Pending advisor approval'
                : t('campus.joinClub');
            return (
            <Pressable
              key={club.id}
              onPress={() => {
                haptic.selection();
                navigation.navigate('ClubDetail', { clubId: club.id });
              }}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
              ]}
              accessibilityRole="button"
            >
              <View style={styles.accent} />
              <View style={styles.body}>
                <View style={[styles.headRow, { flexDirection: rowDirection }]}>
                  {!!club.category && (
                    <Badge
                      label={t(`campus.clubCategory.${club.category}`, { defaultValue: club.category })}
                      variant="primary"
                      size="sm"
                    />
                  )}
                  <View style={{ flex: 1 }} />
                  <View style={[styles.memberCount, { flexDirection: rowDirection }]}>
                    <Icon name="people" size={12} color={colors.textTertiary} />
                    <Text variant="caption" color={colors.textTertiary}>
                      {toLatnDigits(String(club.member_count))}
                    </Text>
                  </View>
                </View>
                <Text
                  variant="h4"
                  style={{ marginTop: 6, textAlign, writingDirection }}
                  numberOfLines={2}
                >
                  {localized(club, 'name')}
                </Text>
                <Text
                  variant="small"
                  color={colors.textSecondary}
                  style={{ marginTop: 4, textAlign, writingDirection }}
                  numberOfLines={3}
                >
                  {localized(club, 'description')}
                </Text>
                <Button
                  title={joinTitle}
                  onPress={() => joinMutation.mutate(club.id)}
                  variant={club.is_member || isPending ? 'outline' : 'primary'}
                  disabled={club.is_member || isPending}
                  loading={joinMutation.isPending && joinMutation.variables === club.id}
                  size="compact"
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
              </View>
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
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  accent: { height: 3, backgroundColor: colors.secondary },
  body: { padding: spacing.base },
  headRow: { alignItems: 'center', gap: 8 },
  memberCount: { alignItems: 'center', gap: 4 },
});
