import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card, Badge } from '../../components/ui';
import { HijriDate } from '../../components/common';
import { AIAdvisorFAB } from '../../components/common';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';

export function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="body" color={colors.textInverse}>
              {t('home.greeting')}، {user?.name_ar}
            </Text>
            <HijriDate date={new Date()} />
          </View>
        </View>

        {/* Today's Classes */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3">{t('home.todayClasses')}</Text>
          <View style={styles.classItem}>
            <Text variant="bodyBold">مقدمة في علوم الحاسب</Text>
            <Text variant="caption" color={colors.textSecondary}>
              CS101 • ٨:٠٠ - ٩:٣٠ • قاعة B-201
            </Text>
          </View>
          <View style={styles.classItem}>
            <Text variant="bodyBold">الرياضيات التطبيقية</Text>
            <Text variant="caption" color={colors.textSecondary}>
              MATH201 • ١٠:٠٠ - ١١:٣٠ • قاعة A-105
            </Text>
          </View>
          <View style={styles.classItem}>
            <Text variant="bodyBold">اللغة الإنجليزية الأكاديمية</Text>
            <Text variant="caption" color={colors.textSecondary}>
              ENG102 • ١:٠٠ - ٢:٣٠ • قاعة C-301
            </Text>
          </View>
        </Card>

        {/* Upcoming Deadlines */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3">{t('home.upcomingDeadlines')}</Text>
          <View style={styles.deadlineItem}>
            <Badge label="غداً" variant="warning" />
            <Text variant="body">واجب البرمجة - CS101</Text>
          </View>
          <View style={styles.deadlineItem}>
            <Badge label="٣ أيام" variant="info" />
            <Text variant="body">اختبار قصير - MATH201</Text>
          </View>
        </Card>

        {/* Balance Due */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3">{t('home.balanceDue')}</Text>
          <Text variant="h1" color={colors.primary}>
            ١,٢٥٠ د.ك
          </Text>
          <Text variant="caption" color={colors.textSecondary}>
            تاريخ الاستحقاق: ١٥ أبريل ٢٠٢٦
          </Text>
        </Card>
      </ScrollView>

      <AIAdvisorFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  card: {
    margin: spacing.base,
  },
  classItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  deadlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
