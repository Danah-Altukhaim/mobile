import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Text, Icon, Triangle } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { aiApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { haptic } from '../../utils/haptics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
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

const followUpPromptsAr = [
  'وضّح أكثر',
  'أعطني مثال',
  'كيف أبدأ؟',
];

const followUpPromptsEn = [
  'Tell me more',
  'Give me an example',
  'How do I start?',
];

const initialMessageAr = 'مرحباً! أنا مستشارك الأكاديمي الذكي. كيف أقدر أساعدك اليوم؟';
const initialMessageEn = "Hello! I'm your AI academic advisor. How can I help you today?";
const errorAr = 'عذراً، لم أتمكن من الاتصال بالخادم. حاول مرة أخرى لاحقاً.';
const errorEn = "Sorry, I couldn't connect to the server. Please try again later.";

function TypingDots({ color }: { color: string }) {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(dot, { toValue: 0, duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.delay((dots.length - 1 - i) * 150),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={styles.dotsRow}>
      {dots.map((d, i) => {
        const translateY = d.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
        const opacity = d.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: color, opacity, transform: [{ translateY }] },
            ]}
          />
        );
      })}
    </View>
  );
}

function streamWords(full: string, onChunk: (so_far: string) => void, onDone: () => void) {
  const words = full.split(/(\s+)/);
  let i = 0;
  let current = '';
  const tick = () => {
    if (i >= words.length) {
      onDone();
      return;
    }
    current += words[i];
    i++;
    onChunk(current);
    setTimeout(tick, 28 + Math.random() * 24);
  };
  tick();
}

export function AIAdvisorScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const isAr = i18n.language === 'ar';
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'assistant', content: isAr ? initialMessageAr : initialMessageEn },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const idRef = useRef(0);
  const nextId = () => `m-${++idRef.current}`;

  const prompts = isAr ? suggestedPromptsAr : suggestedPromptsEn;
  const followUps = isAr ? followUpPromptsAr : followUpPromptsEn;

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const chatMutation = useMutation({
    mutationFn: (message: string) =>
      aiApi.sendMessage({
        message,
        conversation_id: conversationId || undefined,
        language: i18n.language as 'ar' | 'en',
      }),
    onSuccess: (response) => {
      if (response.data) {
        setConversationId(response.data.conversation_id);
        const full = response.data.message.content;
        const id = nextId();
        setMessages((prev) => [...prev, { id, role: 'assistant', content: '', streaming: true }]);
        streamWords(
          full,
          (sofar) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, content: sofar } : m)),
            );
            scrollToEnd();
          },
          () => {
            setMessages((prev) =>
              prev.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
            );
            haptic.light();
          },
        );
      }
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', content: isAr ? errorAr : errorEn },
      ]);
      haptic.error();
    },
  });

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;
    haptic.light();
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
    setInput('');
    chatMutation.mutate(trimmed);
    scrollToEnd();
  };

  const lastMessage = messages[messages.length - 1];
  const showFollowUps =
    !chatMutation.isPending &&
    lastMessage?.role === 'assistant' &&
    !lastMessage?.streaming &&
    messages.length > 1 &&
    messages.length < 8;
  const showInitialPrompts = messages.length <= 1 && !chatMutation.isPending;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Triangle direction="left" size={10} color={colors.chevron} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerBadge}>
            <Icon name="sparkles" size={14} color={colors.secondaryLight} />
            <Text variant="caption" color={colors.secondaryLight}>
              {t('ai.title')}
            </Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
        <View style={styles.redStripe} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const userAlign = isRTL ? 'flex-start' : 'flex-end';
            const assistantAlign = isRTL ? 'flex-end' : 'flex-start';
            return (
              <View
                key={msg.id}
                style={[
                  styles.bubble,
                  isUser
                    ? [styles.userBubble, { alignSelf: userAlign }]
                    : [styles.assistantBubble, { alignSelf: assistantAlign }],
                ]}
              >
                <Text
                  variant="body"
                  color={isUser ? colors.textInverse : colors.textPrimary}
                  style={{ textAlign, writingDirection }}
                >
                  {msg.content}
                  {msg.streaming ? '▍' : ''}
                </Text>
              </View>
            );
          })}

          {chatMutation.isPending && (
            <View
              style={[
                styles.bubble,
                styles.assistantBubble,
                { alignSelf: isRTL ? 'flex-end' : 'flex-start', paddingVertical: spacing.md },
              ]}
            >
              <TypingDots color={colors.textTertiary} />
            </View>
          )}

          {(showInitialPrompts || showFollowUps) && (
            <View style={styles.suggestions}>
              <Text
                variant="overline"
                color={colors.textTertiary}
                style={{ textAlign, writingDirection, marginBottom: spacing.sm }}
              >
                {showInitialPrompts ? t('ai.suggestedPrompts') : t('ai.followUps') || t('ai.suggestedPrompts')}
              </Text>
              <View style={[styles.suggestionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {(showInitialPrompts ? prompts : followUps).map((prompt, i) => (
                  <Pressable
                    key={i}
                    style={({ pressed }) => [
                      styles.suggestionChip,
                      { opacity: pressed ? 0.85 : 1 },
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
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row', paddingBottom: insets.bottom + spacing.sm },
          ]}
        >
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { writingDirection, textAlign }]}
              placeholder={t('ai.placeholder')}
              placeholderTextColor={colors.textPlaceholder}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage(input)}
              editable={!chatMutation.isPending}
              multiline
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: input.trim() && !chatMutation.isPending ? colors.primary : colors.surfaceVariant,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => sendMessage(input)}
            disabled={chatMutation.isPending || !input.trim()}
            accessibilityRole="button"
            accessibilityLabel={t('common.send')}
          >
            <Icon
              name="send"
              size={18}
              color={input.trim() && !chatMutation.isPending ? colors.textInverse : colors.textTertiary}
              flip="auto"
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  redStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.brandRed,
  },
  messages: { flex: 1 },
  messagesContent: {
    padding: spacing.base,
    gap: spacing.xs,
  },
  bubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomEndRadius: 0,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomStartRadius: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 18,
  },
  dot: {
    width: 6,
    height: 6,
  },
  suggestions: {
    marginTop: spacing.base,
  },
  suggestionsRow: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.sm,
  },
  inputRow: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    fontFamily: 'Almarai_400Regular',
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
