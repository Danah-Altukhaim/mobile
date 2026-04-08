import React, { useState, useRef } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { aiApi } from '../../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedPrompts = [
  'ما جدولي بكرة؟',
  'كم باقي علي؟',
  'وش المواد اللي أقدر أسجلها؟',
  'كيف أرفع معدلي؟',
];

export function AIAdvisorScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'مرحباً! أنا مستشارك الأكاديمي الذكي. كيف أقدر أساعدك اليوم؟' },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      aiApi.sendMessage({
        message,
        conversation_id: conversationId || undefined,
        language: 'ar',
      }),
    onSuccess: (response) => {
      if (response.data) {
        setConversationId(response.data.conversation_id);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.data.message.content },
        ]);
      }
    },
    onError: () => {
      // Fallback if backend is unavailable
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، لم أتمكن من الاتصال بالخادم. حاول مرة أخرى لاحقاً.',
        },
      ]);
    },
  });

  const sendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    chatMutation.mutate(text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text variant="h3" color={colors.textInverse}>{t('ai.title')}</Text>
      </View>

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}
          >
            <Text
              variant="body"
              color={msg.role === 'user' ? colors.textInverse : colors.textPrimary}
            >
              {msg.content}
            </Text>
          </View>
        ))}

        {chatMutation.isPending && (
          <View style={[styles.bubble, styles.assistantBubble]}>
            <Text variant="body" color={colors.textSecondary}>يكتب...</Text>
          </View>
        )}

        {messages.length <= 1 && (
          <View style={styles.suggestions}>
            <Text variant="caption" color={colors.textSecondary}>{t('ai.suggestedPrompts')}</Text>
            {suggestedPrompts.map((prompt, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => sendMessage(prompt)}>
                <Text variant="caption" color={colors.primary}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('ai.placeholder')}
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage(input)}
          textAlign="right"
          editable={!chatMutation.isPending}
        />
        <TouchableOpacity
          style={[styles.sendButton, chatMutation.isPending && styles.sendButtonDisabled]}
          onPress={() => sendMessage(input)}
          disabled={chatMutation.isPending}
        >
          <Text variant="body" color={colors.textInverse}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.base,
    paddingTop: 50,
    alignItems: 'center',
  },
  messages: { flex: 1 },
  messagesContent: { padding: spacing.base },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surfaceVariant,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  suggestions: { marginTop: spacing.base, gap: spacing.sm },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: 16,
    fontFamily: 'Cairo_400Regular',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: { opacity: 0.5 },
});
