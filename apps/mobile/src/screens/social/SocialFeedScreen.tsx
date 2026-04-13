import React, { useState } from 'react';
import { FlatList, View, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Avatar, Button, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { socialApi } from '../../services/api';

export function SocialFeedScreen() {
  const { t } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const l = useLocalizedField();
  const queryClient = useQueryClient();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [showNewPost, setShowNewPost] = useState(false);
  const [postContent, setPostContent] = useState('');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['social-feed'],
    queryFn: () => socialApi.getFeed(),
  });

  const createPostMutation = useMutation({
    mutationFn: (content: string) => socialApi.createPost({ content_ar: content, content_en: content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      setShowNewPost(false);
      setPostContent('');
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  const posts = Array.isArray(data?.data) ? data.data : [];

  return (
    <>
      <FlatList
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        data={posts}
        keyExtractor={(item: any) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={[styles.header, { flexDirection: rowDirection }]}>
            <Text variant="h2" style={{ textAlign, writingDirection }}>{t('social.feed')}</Text>
            <Button title={t('social.newPost')} onPress={() => setShowNewPost(true)} variant="outline" />
          </View>
        }
        ListEmptyComponent={
          <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyPosts')}</Text>
        }
        renderItem={({ item }: { item: any }) => {
          const timeStr = new Date(item.created_at).toLocaleDateString(
            locale === 'ar' ? 'ar-KW' : 'en-KW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
          );
          return (
            <Card elevation="sm" style={styles.card}>
              <View style={[styles.authorRow, { flexDirection: rowDirection }]}>
                <Avatar name={item.author?.name_en} size={36} />
                <View style={styles.authorInfo}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(item.author, 'name')}</Text>
                  <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>{timeStr}</Text>
                </View>
              </View>
              <Text variant="body" style={[styles.postContent, { textAlign, writingDirection }]}>
                {locale === 'ar' ? item.content_ar : item.content_en}
              </Text>
              <View style={[styles.actions, { flexDirection: rowDirection }]}>
                <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 4 }}>
                  <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>{item.likes_count} {t('social.likes')}</Text>
                </View>
                <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 4 }}>
                  <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
                  <Text variant="caption" color={colors.textSecondary}>{item.comments_count} {t('social.comments')}</Text>
                </View>
              </View>
            </Card>
          );
        }}
      />

      <Modal visible={showNewPost} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { flexDirection: rowDirection }]}>
              <Text variant="h3" style={{ textAlign, writingDirection }}>{t('social.newPost')}</Text>
              <Button title={t('common.cancel')} onPress={() => setShowNewPost(false)} variant="ghost" />
            </View>
            <TextInput
              style={[styles.input, { borderColor: colors.divider, color: colors.textPrimary, textAlign, writingDirection }]}
              value={postContent}
              onChangeText={setPostContent}
              placeholder={t('social.postPlaceholder')}
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              writingDirection={locale === 'ar' ? 'rtl' : 'ltr'}
            />
            <Button
              title={t('social.post')}
              onPress={() => createPostMutation.mutate(postContent)}
              disabled={!postContent.trim()}
              loading={createPostMutation.isPending}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  header: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  card: { marginBottom: spacing.md },
  authorRow: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  authorInfo: { flex: 1 },
  postContent: { marginBottom: spacing.sm },
  actions: { gap: spacing.xl },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: '60%' },
  modalHeader: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    minHeight: 120,
    fontSize: 16,
    marginBottom: spacing.base,
  },
});
