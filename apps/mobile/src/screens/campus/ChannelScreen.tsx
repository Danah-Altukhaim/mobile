import React, { useState, useLayoutEffect, useMemo } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Text,
  Card,
  Badge,
  Avatar,
  Input,
  Icon,
  ScreenSkeleton,
} from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useUIStore } from '../../store/ui.store';
import { useDirection } from '../../hooks/useDirection';
import { campusApi } from '../../services/api';

const CURRENT_USER_ID = '770e8400-e29b-41d4-a716-446655440002';

export function ChannelScreen() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { channelId, kind = 'class', title } = route.params;
  const isClub = kind === 'club';

  const colors = useColors();
  const l = useLocalizedField();
  const locale = useUIStore((s) => s.locale);
  const intlLocale = locale === 'ar' ? 'ar-KW' : 'en-KW';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const [draft, setDraft] = useState('');
  const queryClient = useQueryClient();
  const queryKey = ['channel', kind, channelId];

  useLayoutEffect(() => {
    navigation.setOptions({ title: title ?? '' });
  }, [navigation, title]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      isClub
        ? campusApi.getClubChannel(channelId)
        : campusApi.getClassChannel(channelId),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => {
      const payload = {
        content_ar: locale === 'ar' ? content : undefined,
        content_en: locale === 'en' ? content : undefined,
      };
      return isClub
        ? campusApi.postClubChannelReply(channelId, payload)
        : campusApi.postClassChannelReply(channelId, payload);
    },
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<any>(queryKey);
      const optimistic = {
        id: `local-${Date.now()}`,
        sender_type: 'me',
        sender_name_ar: 'أنا',
        sender_name_en: 'You',
        content_ar: locale === 'ar' ? content : '',
        content_en: locale === 'en' ? content : '',
        sent_at: new Date().toISOString(),
      };
      if (prev?.data) {
        queryClient.setQueryData(queryKey, {
          ...prev,
          data: { ...prev.data, messages: [...(prev.data.messages || []), optimistic] },
        });
      }
      setDraft('');
      return { prev };
    },
    onError: (_err, _content, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKey, ctx.prev);
      }
    },
  });

  const channel = data?.data;
  const messages = useMemo(() => channel?.messages ?? [], [channel]);

  if (isLoading) return <ScreenSkeleton />;
  if (!channel) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>
          {t('common.noData')}
        </Text>
      </View>
    );
  }

  const headerTitle = isClub
    ? l(channel, 'club_name')
    : `${channel.course_code} · ${l(channel, 'course_name')}`;
  const leadLabel = t(isClub ? 'campus.advisor' : 'campus.instructor');
  const leadName = isClub ? l(channel, 'advisor_name') : l(channel, 'instructor_name');

  const handleSend = () => {
    const content = draft.trim();
    if (!content) return;
    sendMutation.mutate(content);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      {/* Channel header card */}
      <Card variant="outlined" elevation="none" style={styles.channelHeader}>
        <View style={[styles.channelHeaderRow, { flexDirection: rowDirection }]}>
          <View style={[styles.iconBubble, { backgroundColor: colors.primaryWash }]}>
            <Icon name={isClub ? 'clubs' : 'channels'} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyBold" style={{ textAlign, writingDirection }} numberOfLines={1}>
              {headerTitle}
            </Text>
            <Text
              variant="caption"
              color={colors.textSecondary}
              style={{ textAlign, writingDirection, marginTop: 2 }}
              numberOfLines={1}
            >
              {leadLabel}: {leadName}
              {channel.member_count
                ? ` · ${t('campus.membersCount', { count: channel.member_count })}`
                : ''}
            </Text>
          </View>
        </View>
      </Card>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={
          channel.pinned?.length ? (
            <View style={styles.pinnedBlock}>
              {channel.pinned.map((p: any) => (
                <Card
                  key={p.id}
                  elevation="xs"
                  style={[styles.pinnedCard, { borderColor: colors.brandRed }]}
                >
                  <View style={[styles.pinnedHeader, { flexDirection: rowDirection }]}>
                    <Badge label={t('campus.pinned')} variant="error" />
                  </View>
                  <Text
                    variant="body"
                    style={{ textAlign, writingDirection, marginTop: spacing.xs }}
                  >
                    {l(p, 'content')}
                  </Text>
                </Card>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <Text variant="body" color={colors.textSecondary} style={styles.empty}>
            {t('common.emptyMessages')}
          </Text>
        }
        renderItem={({ item }: { item: any }) => {
          const isMe = item.sender_type === 'me' || item.sender_id === CURRENT_USER_ID;
          const isLead = item.sender_type === 'instructor' || item.sender_type === 'advisor';
          const isAnnouncement = !!item.is_announcement;

          // Bubble alignment: "me" trails (right in LTR, left in RTL); others lead.
          const myAlign = isRTL ? 'flex-start' : 'flex-end';
          const otherAlign = isRTL ? 'flex-end' : 'flex-start';

          if (isAnnouncement) {
            return (
              <Card elevation="xs" style={[styles.announcementCard, { borderColor: colors.primary }]}>
                <View style={[styles.announcementHeader, { flexDirection: rowDirection }]}>
                  <Badge label={t('campus.announcement')} variant="info" />
                  <Text variant="caption" color={colors.textTertiary}>
                    {new Date(item.sent_at).toLocaleDateString(intlLocale, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Text
                  variant="caption"
                  color={colors.textSecondary}
                  style={{ textAlign, writingDirection, marginTop: 2 }}
                >
                  {l(item, 'sender_name')}
                </Text>
                <Text
                  variant="body"
                  style={{ textAlign, writingDirection, marginTop: spacing.xs }}
                >
                  {l(item, 'content')}
                </Text>
              </Card>
            );
          }

          return (
            <View style={[styles.messageRow, { flexDirection: rowDirection }]}>
              {!isMe && (
                <Avatar
                  name={item.sender_name_en || item.sender_name_ar}
                  size={32}
                />
              )}
              <View
                style={[
                  styles.bubble,
                  isMe
                    ? [
                        styles.bubbleMe,
                        { backgroundColor: colors.primary, alignSelf: myAlign },
                      ]
                    : [
                        isLead
                          ? { backgroundColor: colors.primaryWash, borderColor: colors.primary, borderWidth: StyleSheet.hairlineWidth }
                          : { backgroundColor: colors.surfaceMuted },
                        { alignSelf: otherAlign },
                      ],
                ]}
              >
                {!isMe && (
                  <Text
                    variant="caption"
                    color={isLead ? colors.primaryDark : colors.textSecondary}
                    style={{ textAlign, writingDirection, marginBottom: 2 }}
                    numberOfLines={1}
                  >
                    {l(item, 'sender_name')}
                  </Text>
                )}
                <Text
                  variant="body"
                  color={isMe ? colors.textInverse : colors.textPrimary}
                  style={{ textAlign, writingDirection }}
                >
                  {l(item, 'content')}
                </Text>
                <Text
                  variant="caption"
                  color={isMe ? 'rgba(255,255,255,0.75)' : colors.textTertiary}
                  style={[styles.time, { textAlign, writingDirection }]}
                >
                  {new Date(item.sent_at).toLocaleTimeString(intlLocale, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
            flexDirection: rowDirection,
          },
        ]}
      >
        <Input
          value={draft}
          onChangeText={setDraft}
          placeholder={t(isClub ? 'campus.messageClub' : 'campus.askInstructor')}
          containerStyle={styles.inputContainer}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!draft.trim() || sendMutation.isPending}
          style={[
            styles.sendBtn,
            {
              backgroundColor: draft.trim() ? colors.primary : colors.surfaceVariant,
              opacity: draft.trim() ? 1 : 0.6,
            },
          ]}
          activeOpacity={0.8}
        >
          <Icon
            name="send"
            size={20}
            color={draft.trim() ? colors.textInverse : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { textAlign: 'center', marginTop: spacing.xl },

  channelHeader: {
    margin: spacing.base,
    padding: spacing.base,
  },
  channelHeaderRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBubble: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.base, paddingBottom: spacing.base },

  pinnedBlock: { marginBottom: spacing.sm, gap: spacing.sm },
  pinnedCard: {
    padding: spacing.md,
    borderLeftWidth: 3,
    borderRadius: 0,
  },
  pinnedHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  announcementCard: {
    padding: spacing.md,
    borderLeftWidth: 3,
    marginBottom: spacing.sm,
    borderRadius: 0,
  },
  announcementHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  messageRow: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bubble: {
    maxWidth: '78%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  bubbleMe: {
    borderBottomEndRadius: 0,
  },
  time: { marginTop: spacing.xs },

  inputBar: {
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  inputContainer: { flex: 1, marginBottom: 0 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
