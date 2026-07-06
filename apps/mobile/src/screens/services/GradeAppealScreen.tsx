import React, { useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Input, Select, ScreenSkeleton } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi, academicApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

export function GradeAppealScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { textAlign, writingDirection } = useDirection();
  const bottomInset = useContentBottomInset();

  const [course, setCourse] = useState('');
  const [expected, setExpected] = useState('');
  const [justification, setJustification] = useState('');
  const [signedForm, setSignedForm] = useState<{ name: string } | null>(null);
  const [refNo, setRefNo] = useState<string | null>(null);

  const { data: gradesData, isLoading } = useQuery({
    queryKey: ['student', 'grades'],
    queryFn: () => academicApi.getGrades(),
  });

  // Appeals are only accepted during the appeal period (CCK Hub Update).
  const { data: windowData, isLoading: windowLoading } = useQuery({
    queryKey: ['services', 'appeal-window'],
    queryFn: () => servicesApi.appealWindow(),
  });
  const appealWindow = windowData?.data;
  const windowOpen = appealWindow?.open !== false;
  const fmtWindowDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString(isAr ? 'ar-KW' : 'en-GB', { day: 'numeric', month: 'short' }) : '';

  const courses = useMemo(() => {
    const list = (gradesData?.data?.courses || []).filter((c: any) => !!c.grade);
    return list.map((c: any) => ({
      value: c.enrollment_id,
      label: `${c.course_code} · ${locale === 'ar' ? c.course_name_ar : c.course_name_en} · ${c.grade}`,
    }));
  }, [gradesData, locale]);

  const currentGrade = useMemo(() => {
    const c = (gradesData?.data?.courses || []).find((x: any) => x.enrollment_id === course);
    return c?.grade ?? '—';
  }, [gradesData, course]);

  const canSubmit = windowOpen && !!course && !!expected && !!justification && !!signedForm;

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: 'grade_appeal',
        payload: { course, currentGrade, expected, justification, form: signedForm?.name },
      }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  if (isLoading || windowLoading) return <ScreenSkeleton />;

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'استئناف' : 'Appeal'}
        title={t('services.letterTypes.grade_appeal')}
        subtitle={t('services.appeals.intro')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        {appealWindow && (
          windowOpen ? (
            <View style={[styles.windowBanner, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text variant="caption" color="secondary" style={{ textAlign, writingDirection }}>
                {t('services.appeals.windowOpen', {
                  term: isAr ? appealWindow.term_ar : appealWindow.term_en,
                  from: fmtWindowDate(appealWindow.opens_at),
                  to: fmtWindowDate(appealWindow.closes_at),
                })}
              </Text>
            </View>
          ) : (
            <View style={[styles.windowBanner, { borderColor: colors.error, backgroundColor: colors.surface }]}>
              <Text variant="bodyBold" style={{ color: colors.error, textAlign, writingDirection }}>
                {t('services.appeals.windowClosedTitle')}
              </Text>
              <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs, textAlign, writingDirection }}>
                {t('services.appeals.windowClosedBody', {
                  from: fmtWindowDate(appealWindow.opens_at),
                  to: fmtWindowDate(appealWindow.closes_at),
                })}
              </Text>
            </View>
          )
        )}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: windowOpen ? 1 : 0.5 }]}>
          <Button title={t('services.downloadForm')} variant="outline" fullWidth onPress={() => {}} disabled={!windowOpen} />
          <View style={{ height: spacing.sm }} />
          <Select
            label={t('services.appeals.course')}
            options={courses}
            value={course}
            onChange={setCourse}
            placeholder={t('services.selectOne')}
          />
          <Input label={t('services.appeals.currentGrade')} value={currentGrade} editable={false} />
          <Select
            label={t('services.appeals.expectedGrade')}
            options={GRADES.map((g) => ({ value: g, label: g }))}
            value={expected}
            onChange={setExpected}
            placeholder={t('services.selectOne')}
          />
          <Input
            label={t('services.appeals.justification')}
            value={justification}
            onChangeText={setJustification}
            multiline
            numberOfLines={4}
          />
          <FilePicker label={t('services.uploadSigned')} required onPick={setSignedForm} />
          <Button
            title={t('services.submit')}
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit || mutation.isPending}
            fullWidth
            size="large"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        {refNo && (
          <Button
            title={t('services.openMyRequests')}
            variant="outline"
            onPress={() => navigation.navigate('MyRequests')}
            fullWidth
            style={{ marginTop: spacing.base }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  windowBanner: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
});
