import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';

const suggestedPrompts = [
  'ما جدولي بكرة؟',
  'كم باقي علي؟',
  'وش المواد اللي أقدر أسجلها؟',
  'كيف أرفع معدلي؟',
];

const mockMessages = [
  {
    role: 'assistant' as const,
    content: 'مرحباً! أنا مستشارك الأكاديمي الذكي. كيف أقدر أساعدك اليوم؟',
  },
];

export function AIAdvisorScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      {
        role: 'assistant',
        content:
          'شكراً على سؤالك! هذا نموذج تجريبي. في النسخة الكاملة، سأتمكن من الوصول إلى بياناتك الأكاديمية ومساعدتك بشكل أفضل.',
      },
    ]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3" color={colors.textInverse}>
          {t('ai.title')}
        </Text>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
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

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <View style={styles.suggestions}>
            <Text variant="caption" color={colors.textSecondary}>
              {t('ai.suggestedPrompts')}
            </Text>
            {suggestedPrompts.map((prompt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => sendMessage(prompt)}
              >
                <Text variant="caption" color={colors.primary}>
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={t('ai.placeholder')}
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage(input)}
          textAlign="right"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(input)}>
          <Text variant="body" color={colors.textInverse}>
            ➤
          </Text>
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
});
