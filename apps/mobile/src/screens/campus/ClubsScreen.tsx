import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button, Badge } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const mockClubs = [
  {
    id: '1',
    name_ar: 'نادي البرمجة',
    description_ar: 'نادي لمحبي البرمجة وتطوير البرمجيات',
    category: 'تقنية',
    member_count: 45,
  },
  {
    id: '2',
    name_ar: 'نادي ريادة الأعمال',
    description_ar: 'دعم رواد الأعمال الشباب وتطوير مهاراتهم',
    category: 'أعمال',
    member_count: 32,
  },
  {
    id: '3',
    name_ar: 'النادي الثقافي',
    description_ar: 'فعاليات ثقافية وأدبية متنوعة',
    category: 'ثقافة',
    member_count: 58,
  },
];

export function ClubsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {mockClubs.map((club) => (
        <Card key={club.id} elevation="md" style={styles.card}>
          <Badge label={club.category} variant="info" />
          <Text variant="h3" style={styles.name}>
            {club.name_ar}
          </Text>
          <Text variant="body" color={colors.textSecondary}>
            {club.description_ar}
          </Text>
          <Text variant="caption" color={colors.primary} style={styles.members}>
            {club.member_count} {t('campus.members')}
          </Text>
          <Button title={t('campus.joinClub')} onPress={() => {}} variant="outline" />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  card: { marginBottom: spacing.base },
  name: { marginTop: spacing.sm },
  members: { marginVertical: spacing.sm },
});
