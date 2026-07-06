import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { haptic } from '../../utils/haptics';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Text, Icon, Triangle, type IconName } from '../../components/ui';
import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { localized } from '../../i18n/helpers';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useDirection } from '../../hooks/useDirection';

const mockEvents = [
  {
    id: '1',
    title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي',
    title_en: 'Workshop: Introduction to AI',
    date_ar: '١٢ أبريل ٢٠٢٦',
    date_en: 'April 12, 2026',
    location_ar: 'قاعة المؤتمرات الرئيسية',
    location_en: 'Main Conference Hall',
    rsvp_count: 45,
  },
  {
    id: '2',
    title_ar: 'معرض المشاريع الطلابية',
    title_en: 'Student Projects Exhibition',
    date_ar: '١٥ أبريل ٢٠٢٦',
    date_en: 'April 15, 2026',
    location_ar: 'ساحة الجامعة',
    location_en: 'University Plaza',
    rsvp_count: 120,
  },
];

const QUICK: Array<{ route: string; icon: IconName; label: string }> = [
  { route: 'Channels', icon: 'channels', label: 'campus.channels' },
  { route: 'PrayerTimes', icon: 'prayer', label: 'campus.prayerTimes' },
  { route: 'Clubs',       icon: 'clubs',  label: 'campus.clubs' },
  { route: 'Events',      icon: 'events', label: 'campus.events' },
  { route: 'CampusMap',   icon: 'map',    label: 'campus.map' },
  { route: 'NewsFeed',    icon: 'news',   label: 'campus.news' },
];

export function CampusScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const isAr = i18n.language === 'ar';
  const bottomInset = useContentBottomInset();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader eyebrow={t('campus.kuwaitCity')} title={t('campus.title')} />

        {/* Quick links — sharp tile grid */}
        <View style={styles.quickWrap}>
          {QUICK.map((link) => (
            <Pressable
              key={link.route}
              style={({ pressed }) => [
                styles.quickItem,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => {
                haptic.selection();
                navigation.navigate(link.route);
              }}
              accessibilityRole="button"
            >
              <View style={styles.quickTile}>
                <View style={styles.quickIconWedge}>
                  <Icon name={link.icon} size={20} color={colors.primary} />
                </View>
                <Text
                  variant="caption"
                  color={colors.textPrimary}
                  style={styles.quickLabel}
                  numberOfLines={2}
                >
                  {t(link.label)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Events */}
        <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
          <View style={styles.sectionMark} />
          <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
            {t('campus.events')}
          </Text>
        </View>

        <View style={styles.eventList}>
          {mockEvents.map((event, i) => {
            const isLast = i === mockEvents.length - 1;
            return (
              <Pressable
                key={event.id}
                onPress={() => {
                  haptic.selection();
                  navigation.navigate('EventDetail', { eventId: event.id });
                }}
                style={({ pressed }) => [
                  styles.eventRow,
                  {
                    flexDirection: rowDirection,
                    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    backgroundColor: pressed ? colors.primarySoft : 'transparent',
                  },
                ]}
                accessibilityRole="button"
              >
                <View style={styles.eventAccent} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyBold" style={{ textAlign, writingDirection }} numberOfLines={2}>
                    {localized(event, 'title')}
                  </Text>
                  <Text
                    variant="caption"
                    color={colors.textSecondary}
                    style={{ textAlign, writingDirection, marginTop: 2 }}
                  >
                    {localized(event, 'date')} · {localized(event, 'location')}
                  </Text>
                  <Text
                    variant="caption"
                    color={colors.primary}
                    style={{ textAlign, writingDirection, marginTop: 4 }}
                  >
                    {event.rsvp_count} {t('common.registered')}
                  </Text>
                </View>
                <Triangle size={7} color={colors.chevron} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {},

  quickWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.base,
  },
  quickItem: {
    width: '33.333%',
    padding: spacing.sm,
  },
  quickTile: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 8,
    minHeight: 96,
  },
  quickIconWedge: {
    width: 44,
    height: 44,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  sectionMark: {
    width: 12,
    height: 2,
    backgroundColor: colors.secondary,
  },

  eventList: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  eventRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomColor: colors.divider,
  },
  eventAccent: {
    width: 3,
    height: 36,
    backgroundColor: colors.primary,
  },
});
