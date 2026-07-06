import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, ScreenSkeleton, Icon, EmptyState } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { toLatnDigits } from '../../i18n/helpers';

export function DiningServicesScreen() {
  const { t, i18n } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campus-dining'],
    queryFn: () => campusApi.getDining(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const venues = Array.isArray(data?.data) ? data.data : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الإطعام' : 'On campus'}
        title={t('campus.dining')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {isError ? (
          <EmptyState icon="dining" title={t('common.error')} tone="error" />
        ) : venues.length === 0 ? (
          <EmptyState icon="dining" title={t('common.noData')} tone="neutral" />
        ) : (
          venues.map((venue: any) => (
            <View
              key={venue.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View
                style={[
                  styles.statusAccent,
                  { backgroundColor: venue.is_open ? colors.success : colors.brandRed },
                ]}
              />
              <View style={styles.body}>
                <View style={[styles.header, { flexDirection: rowDirection }]}>
                  <Text variant="h4" style={{ flex: 1, textAlign, writingDirection }} numberOfLines={1}>
                    {l(venue, 'name')}
                  </Text>
                  <Badge
                    label={venue.is_open ? t('campus.open') : t('campus.closed')}
                    variant={venue.is_open ? 'success' : 'error'}
                    size="sm"
                    dot
                  />
                </View>
                <View style={[styles.hoursRow, { flexDirection: rowDirection }]}>
                  <Icon name="time" size={12} color={colors.textTertiary} />
                  <Text variant="caption" color={colors.textSecondary}>
                    {toLatnDigits(venue.hours)}
                  </Text>
                </View>

                {venue.menu_items?.length > 0 && (
                  <View style={[styles.menu, { borderTopColor: colors.divider }]}>
                    <Text
                      variant="overline"
                      color={colors.textTertiary}
                      style={{ letterSpacing: isAr ? 0 : 1, marginBottom: 6 }}
                    >
                      {t('campus.menu')}
                    </Text>
                    {venue.menu_items.map((item: any, i: number) => (
                      <View
                        key={i}
                        style={[styles.menuItem, { flexDirection: rowDirection }]}
                      >
                        <Text variant="body" style={{ flex: 1, textAlign, writingDirection }}>
                          {l(item, 'name')}
                        </Text>
                        <Text variant="bodyBold" color={colors.primary}>
                          {toLatnDigits(String(item.price))} KWD
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  statusAccent: { height: 3 },
  body: { padding: spacing.base },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  hoursRow: { alignItems: 'center', gap: 5 },
  menu: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  menuItem: {
    paddingVertical: 6,
    alignItems: 'center',
    gap: spacing.sm,
  },
});
