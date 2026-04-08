import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card, Badge } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const mockSchedule = [
  {
    id: '1',
    course_code: 'CS101',
    course_name_ar: 'مقدمة في علوم الحاسب',
    instructor_ar: 'د. أحمد المطيري',
    time: '٨:٠٠ - ٩:٣٠',
    room: 'B-201',
    day: 'الأحد',
  },
  {
    id: '2',
    course_code: 'MATH201',
    course_name_ar: 'الرياضيات التطبيقية',
    instructor_ar: 'د. فاطمة الراشد',
    time: '١٠:٠٠ - ١١:٣٠',
    room: 'A-105',
    day: 'الأحد',
  },
  {
    id: '3',
    course_code: 'ENG102',
    course_name_ar: 'اللغة الإنجليزية الأكاديمية',
    instructor_ar: 'أ. سارة العنزي',
    time: '١:٠٠ - ٢:٣٠',
    room: 'C-301',
    day: 'الأحد',
  },
  {
    id: '4',
    course_code: 'IS210',
    course_name_ar: 'نظم المعلومات الإدارية',
    instructor_ar: 'د. محمد الشمري',
    time: '٨:٠٠ - ٩:٣٠',
    room: 'D-102',
    day: 'الاثنين',
  },
];

export function ScheduleScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="h2" style={styles.dayHeader}>
        الأحد
      </Text>
      {mockSchedule
        .filter((s) => s.day === 'الأحد')
        .map((item) => (
          <Card key={item.id} elevation="sm" style={styles.card}>
            <View style={styles.row}>
              <Badge label={item.course_code} variant="info" />
              <Text variant="caption" color={colors.textSecondary}>
                {item.time}
              </Text>
            </View>
            <Text variant="bodyBold">{item.course_name_ar}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {item.instructor_ar} • {item.room}
            </Text>
          </Card>
        ))}

      <Text variant="h2" style={styles.dayHeader}>
        الاثنين
      </Text>
      {mockSchedule
        .filter((s) => s.day === 'الاثنين')
        .map((item) => (
          <Card key={item.id} elevation="sm" style={styles.card}>
            <View style={styles.row}>
              <Badge label={item.course_code} variant="info" />
              <Text variant="caption" color={colors.textSecondary}>
                {item.time}
              </Text>
            </View>
            <Text variant="bodyBold">{item.course_name_ar}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {item.instructor_ar} • {item.room}
            </Text>
          </Card>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
  },
  dayHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});
