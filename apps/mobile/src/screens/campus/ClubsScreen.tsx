import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Button, Badge, ScreenSkeleton } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { campusApi } from '../../services/api';
import { localized } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

export function ClubsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { textAlign, writingDirection } = useDirection();

  const { data, isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: () => campusApi.getClubs(),
  });

  const joinMutation = useMutation({
    mutationFn: (clubId: string) => campusApi.joinClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });

  if (isLoading) return <ScreenSkeleton />;

  const clubs = Array.isArray(data?.data) ? data.data : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>
        {t('campus.clubs')}
      </Text>
      {clubs.map((club: any) => (
        <TouchableOpacity
          key={club.id}
          onPress={() => navigation.navigate('ClubDetail', { clubId: club.id })}
        >
          <Card elevation="md" style={styles.card}>
            <Badge
              label={
                club.category
                  ? t(`campus.clubCategory.${club.category}`, { defaultValue: club.category })
                  : ''
              }
              variant="info"
            />
            <Text variant="h3" style={styles.name}>
              {localized(club, 'name')}
            </Text>
            <Text variant="body" color={colors.textSecondary}>
              {localized(club, 'description')}
            </Text>
            <Text variant="caption" color={colors.primary} style={styles.members}>
              {club.member_count} {t('campus.members')}
            </Text>
            <Button
              title={club.is_member ? t('campus.joined') : t('campus.joinClub')}
              onPress={() => joinMutation.mutate(club.id)}
              variant={club.is_member ? 'ghost' : 'outline'}
              disabled={club.is_member}
              loading={joinMutation.isPending}
            />
          </Card>
        </TouchableOpacity>
      ))}

      {clubs.length === 0 && (
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
  name: { marginTop: spacing.sm },
  members: { marginVertical: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
