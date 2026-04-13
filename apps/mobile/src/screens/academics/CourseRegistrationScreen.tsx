import React, { useState } from 'react';
import { FlatList, View, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Text, Card, Badge, Button, SearchBar, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { useDirection } from '../../hooks/useDirection';
import { academicApi } from '../../services/api';

export function CourseRegistrationScreen() {
  const { t } = useTranslation();
  const l = useLocalizedField();
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => academicApi.getAvailableCourses(),
  });

  const registerMutation = useMutation({
    mutationFn: (courseId: string) => academicApi.registerCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-courses'] });
      Alert.alert(t('academics.registerSuccess'));
    },
    onError: () => {
      Alert.alert(t('academics.registerFailed'));
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  const courses = Array.isArray(data?.data) ? data.data : [];
  const filtered = courses.filter((c: any) =>
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    c.name_en.toLowerCase().includes(search.toLowerCase()) ||
    c.name_ar.includes(search),
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={filtered}
      keyExtractor={(item: any) => item.id}
      ListHeaderComponent={
        <View>
          <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('academics.courseRegistration')}</Text>
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('common.search')} />
          <View style={styles.spacer} />
        </View>
      }
      ListEmptyComponent={
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyClasses')}</Text>
      }
      renderItem={({ item }: { item: any }) => {
        const isFull = item.seats_available === 0;
        return (
          <Card elevation="sm" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View style={styles.info}>
                <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(item, 'name')}</Text>
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                  {item.course_code} • {item.credits} {t('academics.credits')} • {item.schedule}
                </Text>
                {l(item, 'instructor_name') && (
                  <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                    {t('academics.instructor')}: {l(item, 'instructor_name')}
                  </Text>
                )}
                {item.prerequisites?.length > 0 && (
                  <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection }}>
                    {t('academics.prerequisites')}: {item.prerequisites.join(', ')}
                  </Text>
                )}
              </View>
              <View style={styles.right}>
                <Badge
                  label={isFull ? t('academics.sectionFull') : `${item.seats_available}/${item.total_seats}`}
                  variant={isFull ? 'error' : item.seats_available < 10 ? 'warning' : 'success'}
                />
              </View>
            </View>
            <Button
              title={t('academics.register')}
              onPress={() => registerMutation.mutate(item.id)}
              variant={isFull ? 'ghost' : 'primary'}
              disabled={isFull}
              loading={registerMutation.isPending && registerMutation.variables === item.id}
              style={styles.button}
            />
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  spacer: { height: spacing.base },
  card: { marginBottom: spacing.md },
  row: { justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  info: { flex: 1 },
  right: {},
  button: { marginTop: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
