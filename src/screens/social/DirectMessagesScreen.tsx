import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Avatar, Badge, ListItem, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { socialApi } from '../../services/api';

export function DirectMessagesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const l = useLocalizedField();
  const colors = useColors();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['messages'],
    queryFn: () => socialApi.getMessages(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const conversations = Array.isArray(data?.data) ? data.data : [];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={conversations}
      keyExtractor={(item: any) => item.conversation_id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
      ListHeaderComponent={<Text variant="h2" style={styles.title}>{t('social.messages')}</Text>}
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyMessages')}</Text>
      }
      renderItem={({ item }: { item: any }) => (
        <ListItem
          title={l(item.participant, 'name')}
          subtitle={l(item.last_message, 'content')}
          left={<Avatar name={item.participant?.name_en} size={44} />}
          right={
            item.unread_count > 0 ? (
              <Badge label={String(item.unread_count)} variant="error" />
            ) : undefined
          }
          onPress={() => navigation.navigate('Conversation', {
            conversationId: item.conversation_id,
            participantName: l(item.participant, 'name'),
          })}
          style={styles.item}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  item: { marginBottom: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
