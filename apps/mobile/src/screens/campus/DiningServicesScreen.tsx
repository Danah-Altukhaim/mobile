import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { useLocalizedField } from '../../hooks/useLocale';
import { campusApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function DiningServicesScreen() {
  const { t } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['campus-dining'],
    queryFn: () => campusApi.getDining(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const venues = Array.isArray(data?.data) ? data.data : [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('campus.dining')}</Text>

      {venues.map((venue: any) => (
        <Card key={venue.id} elevation="md" style={styles.card}>
          <View style={[styles.header, { flexDirection: rowDirection }]}>
            <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(venue, 'name')}</Text>
            <Badge label={venue.is_open ? t('campus.open') : t('campus.closed')} variant={venue.is_open ? 'success' : 'error'} />
          </View>
          <View style={[styles.hoursRow, { flexDirection: rowDirection }]}>
            <Icon name="time" size={14} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}> {venue.hours}</Text>
          </View>
          {venue.menu_items?.length > 0 && (
            <View style={styles.menu}>
              <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>{t('campus.menu')}:</Text>
              {venue.menu_items.map((item: any, i: number) => (
                <View key={i} style={[styles.menuItem, { flexDirection: rowDirection }]}>
                  <Text variant="body" style={{ textAlign, writingDirection }}>{l(item, 'name')}</Text>
                  <Text variant="body" color={colors.primary}>{item.price} KWD</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.md },
  header: { justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  hoursRow: { alignItems: 'center' },
  menu: { marginTop: spacing.sm },
  menuItem: { justifyContent: 'space-between', paddingVertical: spacing.xs },
});
