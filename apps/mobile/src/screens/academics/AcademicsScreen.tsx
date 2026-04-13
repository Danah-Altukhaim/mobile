import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Icon, type IconName } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

const sections: { key: string; icon: IconName; titleKey: string }[] = [
  { key: 'Schedule', icon: 'schedule', titleKey: 'academics.schedule' },
  { key: 'Grades', icon: 'grades', titleKey: 'academics.grades' },
  { key: 'Attendance', icon: 'attendance', titleKey: 'academics.attendance' },
  { key: 'Assignments', icon: 'assignments', titleKey: 'academics.assignments' },
  { key: 'Calendar', icon: 'calendar', titleKey: 'academics.calendar' },
  { key: 'DegreeAudit', icon: 'degree', titleKey: 'academics.degreeAudit' },
  { key: 'CourseRegistration', icon: 'registration', titleKey: 'academics.courseRegistration' },
  { key: 'CourseRecommendations', icon: 'ai', titleKey: 'academics.courseRecommendations' },
  { key: 'TranscriptRequest', icon: 'transcript', titleKey: 'academics.transcript' },
];

export function AcademicsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isRTL } = useDirection();

  const { data: summary } = useQuery({
    queryKey: ['student', 'summary'],
    queryFn: () => academicApi.getStudentSummary(),
  });
  const gpa = summary?.data?.student?.gpa_cumulative;

  return (
    <View style={styles.container}>
      {/* GPA Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.titleAccent, isRTL ? { right: 0 } : { left: 0 }]} />
        <Text variant="h2" color={colors.textInverse}>
          {t('academics.title')}
        </Text>
        <View style={styles.gpaCard}>
          <Text variant="caption" color={colors.textInverse}>
            {t('academics.gpa')}
          </Text>
          <Text variant="h1" color={colors.secondary}>
            {gpa != null ? Number(gpa).toFixed(2) : '—'}
          </Text>
          <View style={styles.gpaUnderline} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.grid,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            onPress={() => navigation.navigate(section.key)}
            style={styles.gridItem}
          >
            <Card elevation="md" style={styles.sectionCard}>
              <View style={styles.iconWrap}>
                <Icon name={section.icon} size={26} color={colors.primary} />
              </View>
              <Text
                variant="bodyBold"
                style={styles.label}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {t(section.titleKey)}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: colors.brandRed,
  },
  titleAccent: {
    position: 'absolute',
    top: 60,
    width: 4,
    height: 28,
    backgroundColor: colors.brandRed,
  },
  gpaCard: {
    alignItems: 'center',
  },
  gpaUnderline: {
    width: 40,
    height: 2,
    marginTop: 4,
    backgroundColor: colors.brandRed,
    borderRadius: 1,
  },
  grid: {
    flexWrap: 'wrap',
    padding: spacing.sm,
    paddingBottom: spacing.xl,
  },
  gridItem: {
    width: '50%',
    padding: spacing.sm,
  },
  sectionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    minHeight: 110,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blue100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 16,
  },
});
