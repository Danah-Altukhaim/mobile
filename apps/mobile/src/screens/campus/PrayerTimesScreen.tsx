import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, ScreenSkeleton, Icon, IconName, ProgressBar } from '../../components/ui';
import { GeometricPattern } from '../../components/common/GeometricPattern';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { campusApi } from '../../services/api';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';
import { toLatnDigits, dateLocale } from '../../i18n/helpers';

const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type PrayerKey = (typeof prayerKeys)[number];

const prayerIcons: Record<PrayerKey, IconName> = {
  fajr: 'crescent',
  sunrise: 'sunrise',
  dhuhr: 'sunny',
  asr: 'partly-sunny',
  maghrib: 'sunset',
  isha: 'moon',
};

function parseTimeToToday(hhmm: string): Date | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm || '');
  if (!m) return null;
  const d = new Date();
  d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
  return d;
}

function formatRemaining(ms: number, isAr: boolean): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return toLatnDigits(`${m}m`).replace('m', isAr ? 'د' : 'm');
  if (m === 0) return toLatnDigits(`${h}h`).replace('h', isAr ? 'س' : 'h');
  return toLatnDigits(isAr ? `${h}س ${m}د` : `${h}h ${m}m`);
}

export function PrayerTimesScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const isAr = i18n.language === 'ar';
  const bottomInset = useContentBottomInset();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['prayer-times'],
    queryFn: () => campusApi.getPrayerTimes(),
  });

  const prayer = data?.data;
  const times = prayer?.times || {};

  const computed = useMemo(() => {
    const slots = prayerKeys
      .map((key) => ({ key, at: parseTimeToToday(times?.[key] || '') }))
      .filter((s) => s.at) as { key: PrayerKey; at: Date }[];
    if (slots.length === 0) return null;
    const future = slots.find((s) => s.at.getTime() > now.getTime());
    if (future) {
      const idx = slots.findIndex((s) => s.key === future.key);
      const prev = idx > 0 ? slots[idx - 1] : null;
      const total = prev ? future.at.getTime() - prev.at.getTime() : 60 * 60 * 1000;
      const remaining = future.at.getTime() - now.getTime();
      const progress = prev ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;
      return { nextKey: future.key, nextAt: future.at, remaining, progress };
    }
    return { nextKey: slots[0].key, nextAt: slots[0].at, remaining: 0, progress: 1 };
  }, [times, now]);

  const hijriToday = useMemo(
    () =>
      toLatnDigits(
        new Intl.DateTimeFormat(dateLocale('islamic-umalqura'), {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(now),
      ),
    [now],
  );

  if (isLoading) return <ScreenSkeleton />;

  const nextKey = computed?.nextKey;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Hero countdown — solid deep green, single wedge */}
      {computed && nextKey && (
        <View style={[styles.hero, { backgroundColor: colors.primaryDeep }]}>
          <GeometricPattern
            variant="cornerWedge"
            width={220}
            height={180}
            tone="light"
            opacity={0.10}
            style={[
              styles.heroWedge,
              isRTL ? { left: -18, transform: [{ scaleX: -1 }] } : { right: -18 },
            ]}
          />
          <View style={[styles.heroRow, { flexDirection: rowDirection }]}>
            <View style={styles.heroIconWedge}>
              <Icon name={prayerIcons[nextKey]} size={28} color={colors.secondaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                variant="overline"
                color={colors.secondaryLight}
                style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }}
              >
                {t('campus.nextPrayer')}
              </Text>
              <Text
                variant="h2"
                color={colors.textInverse}
                style={[styles.heroPrayer, { textAlign, writingDirection }]}
              >
                {t(`campus.${nextKey}`)}
              </Text>
              <Text
                variant="body"
                color="rgba(255,255,255,0.78)"
                style={{ textAlign, writingDirection }}
              >
                {toLatnDigits(times[nextKey] || '--:--')} ·{' '}
                {t('campus.in') || (isAr ? 'بعد' : 'in')}{' '}
                {formatRemaining(computed.remaining, isAr)}
              </Text>
            </View>
          </View>
          <View style={styles.heroProgress}>
            <ProgressBar progress={computed.progress} variant="secondary" height={3} />
          </View>
          <View style={[styles.heroFooter, { flexDirection: rowDirection }]}>
            <Text variant="caption" color="rgba(255,255,255,0.78)">
              {hijriToday}
            </Text>
            <View style={{ flex: 1 }} />
            <View style={[styles.locationChip, { flexDirection: rowDirection }]}>
              <Icon name="location" size={12} color={colors.secondaryLight} />
              <Text variant="caption" color={colors.secondaryLight}>
                {t('campus.kuwaitCity')}
              </Text>
            </View>
          </View>
          <View style={[styles.heroStripe, { backgroundColor: colors.brandRed }]} />
        </View>
      )}

      <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
        <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
        <Text
          variant="overline"
          color={colors.textTertiary}
          style={{ letterSpacing: isAr ? 0 : 1 }}
        >
          {t('campus.todayPrayers') || (isAr ? 'صلوات اليوم' : 'Today')}
        </Text>
      </View>

      <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {prayerKeys.map((key, i) => {
          const isNext = nextKey === key;
          const time = toLatnDigits(times?.[key] || '--:--');
          const at = parseTimeToToday(times?.[key] || '');
          const passed = at ? at.getTime() < now.getTime() && !isNext : false;
          const isLast = i === prayerKeys.length - 1;

          return (
            <View
              key={key}
              style={[
                styles.row,
                {
                  flexDirection: rowDirection,
                  borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.divider,
                  backgroundColor: isNext ? colors.primaryWash : 'transparent',
                  opacity: passed ? 0.6 : 1,
                },
              ]}
            >
              {isNext && <View style={[styles.activeAccent, { backgroundColor: colors.primary }]} />}
              <View
                style={[
                  styles.iconWedge,
                  { backgroundColor: isNext ? colors.primary : colors.surfaceMuted },
                ]}
              >
                <Icon
                  name={prayerIcons[key]}
                  size={18}
                  color={isNext ? colors.textInverse : colors.textSecondary}
                />
              </View>
              <Text
                variant="bodyBold"
                color={isNext ? colors.primary : colors.textPrimary}
                style={{ flex: 1, textAlign, writingDirection }}
              >
                {t(`campus.${key}`)}
              </Text>
              <Text
                style={[
                  styles.time,
                  { color: isNext ? colors.primary : colors.textPrimary },
                ]}
              >
                {time}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  hero: {
    padding: spacing.lg,
    overflow: 'hidden',
  },
  heroWedge: {
    position: 'absolute',
    top: -10,
  },
  heroRow: {
    alignItems: 'center',
    gap: spacing.base,
  },
  heroIconWedge: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPrayer: { marginTop: 2 },
  heroProgress: { marginTop: spacing.lg },
  heroFooter: {
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationChip: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionMark: {
    width: 12,
    height: 2,
  },

  list: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
  },
  activeAccent: {
    position: 'absolute',
    start: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  iconWedge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 17,
    lineHeight: 22,
  },
});
