import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Text, Card, Icon } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { localized, currentLocale } from '../../i18n/helpers';
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

export function CampusScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();

  return (
    <View style={styles.container}>
      <View style={styles.header} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="h2" style={[styles.screenTitle, { textAlign, writingDirection }]}>
          {t('campus.title')}
        </Text>
        {/* Quick Links */}
        {([
          [
            { route: 'PrayerTimes', icon: 'prayer', label: 'campus.prayerTimes' },
            { route: 'Clubs', icon: 'clubs', label: 'campus.clubs' },
            { route: 'Events', icon: 'events', label: 'campus.events' },
            { route: 'CampusMap', icon: 'map', label: 'campus.map' },
          ],
          [
            { route: 'DiningServices', icon: 'dining', label: 'campus.dining' },
            { route: 'NewsFeed', icon: 'news', label: 'campus.news' },
            { route: 'LostAndFound', icon: 'lost-found', label: 'campus.lostFound' },
          ],
        ] as const).map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={[styles.quickLinks, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            {row.map((link) => (
              <TouchableOpacity
                key={link.route}
                style={styles.quickLink}
                onPress={() => navigation.navigate(link.route)}
              >
                <View style={styles.quickLinkIcon}>
                  <Icon name={link.icon} size={28} color={colors.primary} />
                </View>
                <Text variant="caption">{t(link.label)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Featured Events */}
        <Text variant="h3" style={[styles.sectionTitle, { textAlign, writingDirection }]}>
          {t('campus.events')}
        </Text>
        {mockEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
          >
            <Card elevation="sm" style={styles.eventCard}>
              <Text variant="bodyBold">{localized(event, 'title')}</Text>
              <Text variant="caption" color={colors.textSecondary}>
                {localized(event, 'date')} • {localized(event, 'location')}
              </Text>
              <Text variant="small" color={colors.primary}>
                {event.rsvp_count} {t('common.registered')}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    height: 100,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  screenTitle: { marginBottom: spacing.base },
  scroll: { padding: spacing.base },
  quickLinks: {
    marginTop: spacing.base,
  },
  quickLink: { width: '25%', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.blue100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { marginBottom: spacing.sm },
  eventCard: { marginBottom: spacing.sm },
});
