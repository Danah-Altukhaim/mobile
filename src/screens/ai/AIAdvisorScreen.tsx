import React, { useState, useRef } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Text } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { aiApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const suggestedPromptsAr = [
  'ما جدولي بكرة؟',
  'كم باقي علي؟',
  'وش المواد اللي أقدر أسجلها؟',
  'كيف أرفع معدلي؟',
];

const suggestedPromptsEn = [
  "What's my schedule tomorrow?",
  'How much do I owe?',
  'What courses can I register for?',
  'How can I improve my GPA?',
];

const initialMessageAr = 'مرحباً! أنا مستشارك الأكاديمي الذكي. كيف أقدر أساعدك اليوم؟';
const initialMessageEn = "Hello! I'm your AI academic advisor. How can I help you today?";
const typingAr = 'يكتب...';
const typingEn = 'Typing...';
const errorAr = 'عذراً، لم أتمكن من الاتصال بالخادم. حاول مرة أخرى لاحقاً.';
const errorEn = 'Sorry, I could not connect to the server. Please try again later.';

export function AIAdvisorScreen() {
  const { t, i18n } = useTranslation();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const isAr = i18n.language === 'ar';
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: isAr ? initialMessageAr : initialMessageEn },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const prompts = isAr ? suggestedPromptsAr : suggestedPromptsEn;

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      aiApi.sendMessage({
        message,
        conversation_id: conversationId || undefined,
        language: i18n.language,
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
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: isAr ? errorAr : errorEn },
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
      <View style={styles.header} />

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
        <Text variant="h2" style={[styles.screenTitle, { textAlign, writingDirection }]}>
          {t('ai.title')}
        </Text>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const userAlign = isRTL ? 'flex-start' : 'flex-end';
          const assistantAlign = isRTL ? 'flex-end' : 'flex-start';
          return (
            <View
              key={i}
              style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.assistantBubble,
                { alignSelf: isUser ? userAlign : assistantAlign },
              ]}
            >
              <Text
                variant="body"
                color={isUser ? colors.textInverse : colors.textPrimary}
                style={{ textAlign, writingDirection }}
              >
                {msg.content}
              </Text>
            </View>
          );
        })}

        {chatMutation.isPending && (
          <View
            style={[
              styles.bubble,
              styles.assistantBubble,
              { alignSelf: isRTL ? 'flex-end' : 'flex-start' },
            ]}
          >
            <Text variant="body" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
              {isAr ? typingAr : typingEn}
            </Text>
          </View>
        )}

        {messages.length <= 1 && (
          <View style={styles.suggestions}>
            <Text
              variant="caption"
              color={colors.textSecondary}
              style={{ textAlign, writingDirection }}
            >
              {t('ai.suggestedPrompts')}
            </Text>
            {prompts.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.suggestionChip,
                  { alignSelf: isRTL ? 'flex-end' : 'flex-start' },
                ]}
                onPress={() => sendMessage(prompt)}
              >
                <Text
                  variant="caption"
                  color={colors.primary}
                  style={{ textAlign, writingDirection }}
                >
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TextInput
          style={[styles.input, { writingDirection }]}
          placeholder={t('ai.placeholder')}
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage(input)}
          textAlign={textAlign}
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
    paddingTop: 50,
    height: 70,
  },
  screenTitle: {
    marginBottom: spacing.base,
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
  },
  assistantBubble: {
    backgroundColor: colors.surfaceVariant,
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
    alignItems: 'center',
    gap: spacing.sm,
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
  },
  sendButtonDisabled: { opacity: 0.5 },
});
