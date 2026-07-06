import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Badge, Button, ScreenSkeleton, Icon, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useToast } from '../../components/ui/Toast';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { useQuery } from '@tanstack/react-query';
import { toLatnDigits } from '../../i18n/helpers';

const statusVariants = { found: 'info', claimed: 'success', expired: 'neutral' } as const;

export function LostAndFoundScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const toast = useToast();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lost-found'],
    queryFn: () => campusApi.getLostFound(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const items = Array.isArray(data?.data) ? data.data : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'مكتب الإدارة' : 'Office Lost & Found'}
        title={t('campus.lostAndFound')}
        trailing={
          <Button
            title={t('campus.reportLost')}
            onPress={() => toast.show(t('common.comingSoonMessage'), { variant: 'info' })}
            variant="outline"
            icon="plus"
            size="compact"
          />
        }
      />
      <FlatList
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
        data={items}
        keyExtractor={(item: any) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          isError ? (
            <EmptyState icon="lost-found" title={t('common.error')} tone="error" />
          ) : (
            <EmptyState
              icon="lost-found"
              title={t('campus.lostAndFound')}
              message={t('common.allCaught')}
              tone="success"
            />
          )
        }
        renderItem={({ item }: { item: any }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                  {l(item, 'description')}
                </Text>
                <View style={[styles.locationRow, { flexDirection: rowDirection, marginTop: 4 }]}>
                  <Icon name="location" size={12} color={colors.textTertiary} />
                  <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                    {l(item, 'location')}
                  </Text>
                </View>
                <Text
                  variant="caption"
                  color={colors.textTertiary}
                  style={{ textAlign, writingDirection, marginTop: 2 }}
                >
                  {toLatnDigits(item.date)}
                </Text>
              </View>
              <Badge
                label={t(`campus.${item.status}`)}
                variant={statusVariants[item.status as keyof typeof statusVariants] || 'neutral'}
                size="sm"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  row: { alignItems: 'flex-start', gap: spacing.sm },
  locationRow: { alignItems: 'center', gap: 5 },
});
