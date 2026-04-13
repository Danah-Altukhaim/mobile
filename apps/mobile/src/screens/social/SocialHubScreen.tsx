import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Avatar, Badge, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { socialApi } from '../../services/api';

const sections = [
  { key: 'SocialFeed', iconName: 'feed' as const, titleKey: 'social.feed' },
  { key: 'DirectMessages', iconName: 'messages' as const, titleKey: 'social.messages' },
  { key: 'StudyGroups', iconName: 'study-groups' as const, titleKey: 'social.studyGroups' },
  { key: 'PeerMentoring', iconName: 'mentoring' as const, titleKey: 'social.peerMentoring' },
  { key: 'AnonymousQA', iconName: 'qa' as const, titleKey: 'social.anonymousQA' },
] as const;

export function SocialHubScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data: feedData } = useQuery({ queryKey: ['social-feed'], queryFn: () => socialApi.getFeed() });
  const { data: messagesData } = useQuery({ queryKey: ['social-messages'], queryFn: () => socialApi.getMessages() });
  const posts = Array.isArray(feedData?.data) ? feedData.data.slice(0, 2) : [];
  const conversations = Array.isArray(messagesData?.data) ? messagesData.data : [];
  const unreadCount = conversations.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scroll}>
        <View style={[styles.header, { backgroundColor: colors.primary, flexDirection: rowDirection }]}>
          <Text variant="h2" color={colors.textInverse} style={{ textAlign, writingDirection }}>{t('social.title')}</Text>
          {unreadCount > 0 && <Badge label={`${unreadCount} ${t('social.unread')}`} variant="warning" />}
        </View>
        {/* Quick Links */}
        <View style={[styles.quickLinks, { flexDirection: rowDirection }]}>
          {sections.map((section) => (
            <TouchableOpacity key={section.key} style={styles.quickLink} onPress={() => navigation.navigate(section.key)}>
              <Icon name={section.iconName} size={28} color={colors.primary} />
              <Text variant="caption" style={styles.linkLabel}>{t(section.titleKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Posts */}
        <Text variant="h3" style={[styles.sectionTitle, { textAlign, writingDirection }]}>{t('social.feed')}</Text>
        {posts.map((post: any) => (
          <TouchableOpacity key={post.id} onPress={() => navigation.navigate('SocialFeed')}>
            <Card elevation="sm" style={styles.postCard}>
              <View style={[styles.authorRow, { flexDirection: rowDirection }]}>
                <Avatar name={post.author?.name_en} size={32} />
                <View style={styles.authorInfo}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(post.author, 'name')}</Text>
                  <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
                    {new Date(post.created_at).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-KW', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>
              <Text variant="body" numberOfLines={2} style={{ textAlign, writingDirection }}>
                {locale === 'ar' ? post.content_ar : post.content_en}
              </Text>
              <View style={[styles.stats, { flexDirection: rowDirection }]}>
                <View style={[styles.statItem, { flexDirection: rowDirection }]}>
                  <Icon name="heart" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}> {post.likes_count}</Text>
                </View>
                <View style={[styles.statItem, { flexDirection: rowDirection }]}>
                  <Icon name="comment" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}> {post.comments_count}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Recent Messages */}
        {conversations.length > 0 && (
          <>
            <Text variant="h3" style={[styles.sectionTitle, { textAlign, writingDirection }]}>{t('social.messages')}</Text>
            {conversations.slice(0, 2).map((conv: any) => (
              <TouchableOpacity key={conv.conversation_id} onPress={() => navigation.navigate('Conversation', { conversationId: conv.conversation_id, participantName: l(conv.participant, 'name') })}>
                <Card elevation="sm" style={styles.postCard}>
                  <View style={[styles.authorRow, { flexDirection: rowDirection }]}>
                    <Avatar name={conv.participant?.name_en} size={32} />
                    <View style={styles.authorInfo}>
                      <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(conv.participant, 'name')}</Text>
                      <Text variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ textAlign, writingDirection }}>
                        {locale === 'ar' ? conv.last_message?.content_ar : conv.last_message?.content_en}
                      </Text>
                    </View>
                    {conv.unread_count > 0 && <Badge label={`${conv.unread_count}`} variant="error" />}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.xl, paddingTop: 60, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, justifyContent: 'space-between', alignItems: 'center', marginHorizontal: -spacing.base, marginTop: -spacing.base },
  flex1: { flex: 1 },
  scroll: { padding: spacing.base, paddingBottom: 100 },
  quickLinks: { flexWrap: 'wrap', marginVertical: spacing.base },
  quickLink: { width: '20%', alignItems: 'center', paddingVertical: spacing.sm },
  linkLabel: { textAlign: 'center', fontSize: 10, marginTop: spacing.xs },
  sectionTitle: { marginBottom: spacing.sm, marginTop: spacing.sm },
  postCard: { marginBottom: spacing.sm },
  authorRow: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  authorInfo: { flex: 1 },
  stats: { gap: spacing.lg, marginTop: spacing.xs },
  statItem: { alignItems: 'center' },
});
