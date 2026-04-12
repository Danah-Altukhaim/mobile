import React, { useState } from 'react';
import { FlatList, View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Input, Button, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useUIStore } from '../../store/ui.store';
import { socialApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function ConversationScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { conversationId } = route.params;
  const [message, setMessage] = useState('');
  const currentUserId = '770e8400-e29b-41d4-a716-446655440002';
  const queryClient = useQueryClient();
  const colors = useColors();
  const l = useLocalizedField();
  const locale = useUIStore((s) => s.locale);
  const intlLocale = locale === 'ar' ? 'ar-KW' : 'en-KW';
  const { isRTL, textAlign, writingDirection } = useDirection();

  const { data, isLoading } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => socialApi.getConversation(conversationId),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => socialApi.sendMessage(conversationId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      setMessage('');
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  const messages = Array.isArray(data?.data) ? data.data : [];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={messages}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          const isMine = item.sender_id === currentUserId;
          const mineAlign = isRTL ? 'flex-start' : 'flex-end';
          const otherAlign = isRTL ? 'flex-end' : 'flex-start';
          return (
            <View
              style={[
                styles.bubble,
                isMine
                  ? [styles.bubbleMine, { backgroundColor: colors.primary, alignSelf: mineAlign }]
                  : [styles.bubbleOther, { backgroundColor: colors.surfaceVariant, alignSelf: otherAlign }],
              ]}
            >
              <Text
                variant="body"
                color={isMine ? colors.textInverse : colors.textPrimary}
                style={{ textAlign, writingDirection }}
              >
                {l(item, 'content') || item.content || ''}
              </Text>
              <Text
                variant="caption"
                color={isMine ? 'rgba(255,255,255,0.7)' : colors.textTertiary}
                style={[styles.time, { textAlign, writingDirection }]}
              >
                {new Date(item.sent_at || item.created_at).toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />
      <View
        style={[
          styles.inputBar,
          { backgroundColor: colors.surface, borderTopColor: colors.divider, flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <Input
          value={message}
          onChangeText={setMessage}
          placeholder={t('social.typeMessage')}
          containerStyle={styles.inputContainer}
        />
        <Button
          title={t('social.send')}
          onPress={() => sendMutation.mutate(message)}
          disabled={!message.trim()}
          loading={sendMutation.isPending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  content: { padding: spacing.base },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  bubbleMine: {
    borderBottomEndRadius: 4,
  },
  bubbleOther: {
    borderBottomStartRadius: 4,
  },
  time: { marginTop: spacing.xs },
  inputBar: {
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  inputContainer: { flex: 1, marginBottom: 0 },
});
