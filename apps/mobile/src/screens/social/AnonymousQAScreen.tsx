import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Button, ScreenSkeleton, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useDirection } from '../../hooks/useDirection';
import { socialApi } from '../../services/api';

export function AnonymousQAScreen() {
  const { t } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['anonymous-qa'],
    queryFn: () => socialApi.getAnonymousQA(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const questions = Array.isArray(data?.data) ? data.data : [];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={questions}
      keyExtractor={(item: any) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text variant="h2" style={[styles.headerTitle, { textAlign, writingDirection }]}>
            {t('social.anonymousQA')}
          </Text>
          <View style={[styles.headerAction, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Button title={t('social.askQuestion')} onPress={() => {}} variant="outline" />
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyPosts')}</Text>
      }
      renderItem={({ item }: { item: any }) => (
        <Card elevation="sm" style={styles.card}>
          <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
            {locale === 'ar' ? item.question_ar : item.question_en}
          </Text>
          <Text variant="body" color={colors.textSecondary} style={[styles.answer, { textAlign, writingDirection }]}>
            {locale === 'ar' ? item.answer_ar : item.answer_en}
          </Text>
          <View style={[styles.footer, { flexDirection: rowDirection }]}>
            <View style={[styles.upvotes, { flexDirection: rowDirection }]}>
              <Icon name="thumbs-up" size={14} color={colors.primary} />
              <Text variant="caption" color={colors.primary}>{item.upvotes} {t('social.upvotes')}</Text>
            </View>
            <Text variant="caption" color={colors.textTertiary}>{item.created_at}</Text>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  header: { marginBottom: spacing.base },
  headerTitle: { marginBottom: spacing.sm },
  headerAction: {},
  card: { marginBottom: spacing.md },
  answer: { marginTop: spacing.sm },
  footer: { justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  upvotes: { alignItems: 'center', gap: spacing.xs },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
