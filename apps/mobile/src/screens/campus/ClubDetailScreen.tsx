import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Button, Badge, Avatar, ScreenSkeleton, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function ClubDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const l = useLocalizedField();
  const queryClient = useQueryClient();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const { clubId } = route.params;

  const { data, isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => campusApi.getClubs(),
  });

  const joinMutation = useMutation({
    mutationFn: () => campusApi.joinClub(clubId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs'] }),
  });

  if (isLoading) return <ScreenSkeleton />;
  const clubs = Array.isArray(data?.data) ? data.data : [];
  const club = clubs.find((c: any) => c.id === clubId);
  if (!club) return <Text variant="body" style={styles.empty}>{t('common.emptyClubs')}</Text>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar name={l(club, 'name')} size={64} />
        <Text variant="h2" style={styles.name}>{l(club, 'name')}</Text>
        <Badge
          label={
            club.category
              ? t(`campus.clubCategory.${club.category}`, { defaultValue: club.category })
              : t('campus.clubs')
          }
          variant="info"
        />
      </View>

      <Card elevation="md" style={styles.card}>
        <View style={[styles.statsRow, { flexDirection: rowDirection }]}>
          <View style={styles.stat}>
            <Text variant="h3" color={colors.primary}>{club.member_count || 0}</Text>
            <Text variant="caption" color={colors.textSecondary}>{t('campus.members')}</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="h3" color={colors.secondary}>{club.status || 'active'}</Text>
            <Text variant="caption" color={colors.textSecondary}>Status</Text>
          </View>
        </View>
      </Card>

      {(club.description_ar || club.description_en) && (
        <Card elevation="sm" style={styles.card}>
          <Text variant="body" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{l(club, 'description')}</Text>
        </Card>
      )}

      {club.advisor_name && (
        <Card elevation="sm" style={styles.card}>
          <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{t('campus.advisor')}</Text>
          <Text variant="body" style={{ textAlign, writingDirection }}>{club.advisor_name}</Text>
        </Card>
      )}

      <Button
        title={club.is_member ? t('campus.members') : t('campus.joinClub')}
        onPress={() => joinMutation.mutate()}
        variant={club.is_member ? 'ghost' : 'primary'}
        disabled={club.is_member}
        loading={joinMutation.isPending}
        style={styles.button}
        icon={club.is_member ? <Icon name="check" size={16} color={colors.textTertiary} /> : undefined}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: spacing.base },
  name: { marginVertical: spacing.sm },
  card: { marginBottom: spacing.md },
  statsRow: { justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  button: { marginTop: spacing.base },
  empty: { flex: 1, textAlign: 'center', padding: spacing.xl },
});
