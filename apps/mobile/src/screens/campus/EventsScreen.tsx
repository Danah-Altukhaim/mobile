import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const mockEvents = [
  {
    id: '1',
    title_ar: 'ورشة عمل: مقدمة في الذكاء الاصطناعي',
    description_ar: 'تعرف على أساسيات الذكاء الاصطناعي وتطبيقاته في الحياة اليومية',
    date: '١٢ أبريل ٢٠٢٦',
    time: '٢:٠٠ - ٤:٠٠ م',
    location: 'قاعة المؤتمرات الرئيسية',
    organizer: 'نادي البرمجة',
    rsvp_count: 45,
    capacity: 80,
  },
  {
    id: '2',
    title_ar: 'معرض المشاريع الطلابية',
    description_ar: 'عرض مشاريع التخرج والمشاريع الابتكارية للطلاب',
    date: '١٥ أبريل ٢٠٢٦',
    time: '١٠:٠٠ ص - ٣:٠٠ م',
    location: 'ساحة الجامعة',
    organizer: 'كلية الهندسة',
    rsvp_count: 120,
    capacity: 200,
  },
  {
    id: '3',
    title_ar: 'محاضرة: ريادة الأعمال في الكويت',
    description_ar: 'محاضرة من رائد أعمال كويتي ناجح عن تجربته',
    date: '١٨ أبريل ٢٠٢٦',
    time: '٦:٠٠ - ٨:٠٠ م',
    location: 'القاعة الكبرى',
    organizer: 'نادي ريادة الأعمال',
    rsvp_count: 67,
    capacity: 150,
  },
];

export function EventsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {mockEvents.map((event) => (
        <Card key={event.id} elevation="md" style={styles.card}>
          <Text variant="h3">{event.title_ar}</Text>
          <Text variant="body" color={colors.textSecondary}>
            {event.description_ar}
          </Text>
          <View style={styles.details}>
            <Text variant="caption">📅 {event.date} • {event.time}</Text>
            <Text variant="caption">📍 {event.location}</Text>
            <Text variant="caption">🏢 {event.organizer}</Text>
            <Text variant="caption" color={colors.primary}>
              {event.rsvp_count}/{event.capacity} مسجل
            </Text>
          </View>
          <Button title={t('campus.rsvp')} onPress={() => {}} variant="primary" />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  card: { marginBottom: spacing.base },
  details: { marginVertical: spacing.sm, gap: spacing.xs },
});
