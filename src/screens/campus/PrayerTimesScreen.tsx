import React from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';
import { campusApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const prayerIcons: Record<string, string> = {
  fajr: 'moon',
  sunrise: 'sunny',
  dhuhr: 'sunny',
  asr: 'partly-sunny',
  maghrib: 'cloudy-night',
  isha: 'moon',
};

export function PrayerTimesScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const rightAlign = isRTL ? 'flex-start' : 'flex-end';

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['prayer-times'],
    queryFn: () => campusApi.getPrayerTimes(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const prayer = data?.data;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}>
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>
        {t('campus.prayerTimes')}
      </Text>
      <View style={styles.location}>
        <View style={{ flexDirection: rowDirection, alignItems: 'center', gap: 6 }}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text variant="caption" color={colors.textSecondary}>
            {prayer?.location || 'Kuwait City'}
          </Text>
        </View>
      </View>

      {prayerKeys.map((key) => {
        const isNext = prayer?.next_prayer === key;
        return (
          <Card
            key={key}
            elevation={isNext ? 'md' : 'sm'}
            style={[styles.card, isNext && { borderWidth: 2, borderColor: colors.primary, borderRadius: borderRadius.lg }]}
          >
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View style={[styles.left, { flexDirection: rowDirection }]}>
                <Ionicons
                  name={(prayerIcons[key] || 'sunny') as any}
                  size={24}
                  color={isNext ? colors.primary : colors.textSecondary}
                  style={isRTL ? { marginLeft: spacing.md } : { marginRight: spacing.md }}
                />
                <Text variant={isNext ? 'bodyBold' : 'body'} color={isNext ? colors.primary : colors.textPrimary}>
                  {t(`campus.${key}`)}
                </Text>
              </View>
              <View style={[styles.right, { alignItems: rightAlign }]}>
                <Text variant={isNext ? 'h3' : 'body'} color={isNext ? colors.primary : colors.textPrimary}>
                  {prayer?.times?.[key] || '--:--'}
                </Text>
                {isNext && (
                  <Text variant="caption" color={colors.primary}>{t('campus.nextPrayer')}</Text>
                )}
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.sm },
  location: { marginBottom: spacing.base },
  card: { marginBottom: spacing.sm },
  row: { justifyContent: 'space-between', alignItems: 'center' },
  left: { alignItems: 'center' },
  right: {},
});
