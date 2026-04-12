import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Avatar, Badge, Button, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { socialApi } from '../../services/api';

export function PeerMentoringScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['mentoring'],
    queryFn: () => socialApi.getMentoring(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const mentors = Array.isArray(data?.data) ? data.data : [];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={mentors}
      keyExtractor={(item: any) => item.id}
      ListHeaderComponent={<Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('social.peerMentoring')}</Text>}
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyMessages')}</Text>
      }
      renderItem={({ item }: { item: any }) => (
        <Card elevation="md" style={styles.card}>
          <View style={[styles.row, { flexDirection: rowDirection }]}>
            <Avatar name={item.name_en} size={48} />
            <View style={styles.info}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(item, 'name')}</Text>
              <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                {l(item, 'major')} {'\u2022'} {t('social.year')} {item.year}
              </Text>
              <Text variant="caption" color={colors.primary} style={{ textAlign, writingDirection }}>GPA: {item.gpa}</Text>
            </View>
          </View>
          <Text variant="body" color={colors.textSecondary} style={[styles.bio, { textAlign, writingDirection }]}>{l(item, 'bio')}</Text>
          <View style={[styles.topics, { flexDirection: rowDirection }]}>
            {item.topics?.map((topic: string, i: number) => (
              <Badge key={i} label={topic} variant="info" />
            ))}
          </View>
          <Button title={t('social.requestMatch')} onPress={() => {}} variant="outline" style={styles.button} />
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
  row: { alignItems: 'center' },
  info: { marginStart: spacing.md, flex: 1 },
  bio: { marginTop: spacing.sm },
  topics: { gap: spacing.sm, marginTop: spacing.sm },
  button: { marginTop: spacing.md },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
