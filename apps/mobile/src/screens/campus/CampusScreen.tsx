import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Text, Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const mockEvents = [
  {
    id: '1',
    title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي',
    date: '١٢ أبريل ٢٠٢٦',
    location: 'قاعة المؤتمرات الرئيسية',
    rsvp_count: 45,
  },
  {
    id: '2',
    title_ar: 'معرض المشاريع الطلابية',
    date: '١٥ أبريل ٢٠٢٦',
    location: 'ساحة الجامعة',
    rsvp_count: 120,
  },
];

export function CampusScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" color={colors.textInverse}>
          {t('campus.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('Events')}
          >
            <Text variant="h2">📅</Text>
            <Text variant="caption">{t('campus.events')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('Clubs')}
          >
            <Text variant="h2">👥</Text>
            <Text variant="caption">{t('campus.clubs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLink}>
            <Text variant="h2">🕌</Text>
            <Text variant="caption">{t('campus.prayerTimes')}</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Events */}
        <Text variant="h3" style={styles.sectionTitle}>
          {t('campus.events')}
        </Text>
        {mockEvents.map((event) => (
          <Card key={event.id} elevation="sm" style={styles.eventCard}>
            <Text variant="bodyBold">{event.title_ar}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {event.date} • {event.location}
            </Text>
            <Text variant="small" color={colors.primary}>
              {event.rsvp_count} مسجل
            </Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  scroll: { padding: spacing.base },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.base,
  },
  quickLink: { alignItems: 'center', gap: spacing.xs },
  sectionTitle: { marginBottom: spacing.sm },
  eventCard: { marginBottom: spacing.sm },
});
