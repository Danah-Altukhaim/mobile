import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Badge, Button, ScreenSkeleton, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { socialApi } from '../../services/api';

export function StudyGroupsScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const queryClient = useQueryClient();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => socialApi.getStudyGroups(),
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: string) => socialApi.joinStudyGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] });
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  const groups = Array.isArray(data?.data) ? data.data : [];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={groups}
      keyExtractor={(item: any) => item.id}
      ListHeaderComponent={<Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('social.studyGroups')}</Text>}
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyMessages')}</Text>
      }
      renderItem={({ item }: { item: any }) => (
        <Card elevation="sm" style={styles.card}>
          <View style={[styles.row, { flexDirection: rowDirection }]}>
            <View style={styles.info}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(item, 'name')}</Text>
              <Badge label={item.course_code} variant="info" />
              <View style={[styles.metaRow, { flexDirection: rowDirection }]}>
                <Icon name="people" size={14} color={colors.primary} />
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                  {t('social.memberCount', { count: item.member_count })}
                </Text>
              </View>
              <View style={[styles.metaRow, { flexDirection: rowDirection }]}>
                <Icon name="location" size={14} color={colors.primary} />
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                  {item.location}
                </Text>
              </View>
            </View>
          </View>
          <Button
            title={item.is_member ? t('social.joined') : t('social.joinGroup')}
            onPress={() => joinMutation.mutate(item.id)}
            variant={item.is_member ? 'ghost' : 'outline'}
            disabled={item.is_member}
            loading={joinMutation.isPending && joinMutation.variables === item.id}
            style={styles.button}
          />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.md },
  row: { justifyContent: 'space-between' },
  info: { flex: 1, gap: spacing.xs },
  metaRow: { alignItems: 'center', gap: spacing.xs },
  button: { marginTop: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
