import React, { useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Input, Select, ScreenSkeleton, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi, academicApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';

export function ExcusedAbsenceScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [doc, setDoc] = useState<{ name: string } | null>(null);
  const [refNo, setRefNo] = useState<string | null>(null);

  const { data: policyData, isLoading: loadingPolicy } = useQuery({
    queryKey: ['service', 'absence-policy'],
    queryFn: () => servicesApi.excusedAbsencePolicy(),
  });
  const { data: schedule } = useQuery({
    queryKey: ['student', 'schedule'],
    queryFn: () => academicApi.getSchedule(),
  });

  const courseOptions = useMemo(() => {
    const list = Array.isArray(schedule?.data) ? schedule!.data : [];
    return list.map((c: any) => ({
      value: c.enrollment_id,
      label: `${c.course_code} · ${locale === 'ar' ? c.course_name_ar : c.course_name_en}`,
    }));
  }, [schedule, locale]);

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: 'absence_excuse',
        payload: { course, date, reason, doc: doc?.name },
      }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  if (loadingPolicy) return <ScreenSkeleton />;
  const policy = policyData?.data;
  const policyBody = locale === 'ar' ? policy?.body_ar : policy?.body_en;
  const canSubmit = !!course && !!date && !!doc;

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'طلب جديد' : 'New request'}
        title={t('services.letterTypes.absence_excuse')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} description={t('services.absence.approvedNotice')} />}

        {/* Policy block — warning-toned */}
        <View style={[styles.policyBlock, { backgroundColor: colors.warningWash, borderColor: colors.warning }]}>
          <View style={[styles.policyHeader, { flexDirection: rowDir }]}>
            <Icon name="warning" size={16} color={colors.warning} />
            <Text variant="bodyBold" color={colors.warning} style={{ flex: 1, textAlign, writingDirection }}>
              {t('services.absence.policyHeader')}
            </Text>
          </View>
          <Text variant="bodyBold" color={colors.textPrimary} style={[styles.policySection, { textAlign, writingDirection }]}>
            {t('services.absence.windowHeader')}
          </Text>
          <Text variant="caption" color={colors.textPrimary} style={{ textAlign, writingDirection, lineHeight: 18 }}>
            {t('services.absence.windowBody')}
          </Text>
          <Text variant="bodyBold" color={colors.textPrimary} style={[styles.policySection, { textAlign, writingDirection }]}>
            {t('services.absence.acceptedTitle')}
          </Text>
          <Text variant="caption" color={colors.textPrimary} style={[styles.policyBullet, { textAlign, writingDirection }]}>
            • {t('services.absence.acceptedHospital')}
          </Text>
          <Text variant="caption" color={colors.textPrimary} style={[styles.policyBullet, { textAlign, writingDirection }]}>
            • {t('services.absence.acceptedDeath')}
          </Text>
          <Text variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs, textAlign, writingDirection, lineHeight: 18 }}>
            {t('services.absence.stampNotice')}
          </Text>
          {policyBody && (
            <Text variant="caption" color={colors.textTertiary} style={{ marginTop: spacing.xs, textAlign, writingDirection, lineHeight: 18 }}>
              {policyBody}
            </Text>
          )}
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Select
            label={t('services.absence.selectCourse')}
            options={courseOptions}
            value={course}
            onChange={setCourse}
            placeholder={t('services.selectOne')}
          />
          <Input
            label={t('services.absence.absenceDate')}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label={t('services.absence.reason')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />
          <FilePicker
            label={t('services.uploadDocument')}
            required
            helper={t('services.pdfOnly')}
            onPick={setDoc}
          />
          <Text
            variant="caption"
            color={colors.textTertiary}
            style={{ marginVertical: spacing.sm, textAlign, writingDirection }}
          >
            {t('services.absence.approvedNotice')} · {t('services.absence.rejectedNotice')}
          </Text>
          <Button
            title={t('services.submit')}
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit || mutation.isPending}
            fullWidth
            size="large"
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
  policyBlock: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  policyHeader: { alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  policySection: { marginTop: spacing.md, marginBottom: 4 },
  policyBullet: { marginTop: 2, lineHeight: 18 },
  formCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
});
