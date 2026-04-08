import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Text, Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const sections = [
  { key: 'Schedule', icon: '📅', titleKey: 'academics.schedule' },
  { key: 'Grades', icon: '📊', titleKey: 'academics.grades' },
  { key: 'Attendance', icon: '✅', titleKey: 'academics.attendance' },
  { key: 'Assignments', icon: '📝', titleKey: 'academics.assignments' },
  { key: 'Calendar', icon: '🗓️', titleKey: 'academics.calendar' },
  { key: 'DegreeAudit', icon: '🎓', titleKey: 'academics.degreeAudit' },
] as const;

export function AcademicsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      {/* GPA Header */}
      <View style={styles.header}>
        <Text variant="h2" color={colors.textInverse}>
          {t('academics.title')}
        </Text>
        <View style={styles.gpaCard}>
          <Text variant="caption" color={colors.textInverse}>
            {t('academics.gpa')}
          </Text>
          <Text variant="h1" color={colors.secondary}>
            ٣.٤٥
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            onPress={() => navigation.navigate(section.key)}
            style={styles.gridItem}
          >
            <Card elevation="md" style={styles.sectionCard}>
              <Text variant="h2" style={styles.icon}>
                {section.icon}
              </Text>
              <Text variant="bodyBold">{t(section.titleKey)}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpaCard: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
  },
  gridItem: {
    width: '50%',
    padding: spacing.sm,
  },
  sectionCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  icon: {
    marginBottom: spacing.sm,
  },
});
