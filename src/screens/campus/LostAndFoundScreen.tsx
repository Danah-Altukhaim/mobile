import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, Button, ScreenSkeleton, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const statusVariants = { found: 'info', claimed: 'success', expired: 'neutral' } as const;

export function LostAndFoundScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['lost-found'],
    queryFn: () => campusApi.getLostFound(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const items = Array.isArray(data?.data) ? data.data : [];

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item: any) => item.id}
      ListHeaderComponent={
        <View style={[styles.header, { flexDirection: rowDirection }]}>
          <Text variant="h2">{t('campus.lostAndFound')}</Text>
          <Button title={t('campus.reportLost')} onPress={() => {}} variant="outline" />
        </View>
      }
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyNotifications')}</Text>
      }
      renderItem={({ item }: { item: any }) => (
        <Card elevation="sm" style={styles.card}>
          <View style={[styles.row, { flexDirection: rowDirection }]}>
            <View style={styles.info}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(item, 'description')}</Text>
              <View style={[styles.locationRow, { flexDirection: rowDirection }]}>
                <Icon name="location" size={14} color={colors.textSecondary} />
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}> {l(item, 'location')}</Text>
              </View>
              <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>{item.date}</Text>
            </View>
            <Badge label={t(`campus.${item.status}`)} variant={statusVariants[item.status as keyof typeof statusVariants] || 'neutral'} />
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  header: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base },
  card: { marginBottom: spacing.sm },
  row: { justifyContent: 'space-between', alignItems: 'flex-start' },
  info: { flex: 1 },
  locationRow: { alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
