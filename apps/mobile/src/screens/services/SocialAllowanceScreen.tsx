import React, { useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Select, ScreenSkeleton, Tabs } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';
import type { SocialAllowanceCategory } from '@masari/shared';

const CATEGORIES: { value: SocialAllowanceCategory; key: string }[] = [
  { value: 'kuwaiti', key: 'services.social.categoryKuwaiti' },
  { value: 'kuwaiti_mother_dependant', key: 'services.social.categoryKuwaitiMother' },
  { value: 'disabled', key: 'services.social.categoryDisabled' },
  { value: 'married', key: 'services.social.categoryMarried' },
];

// CCK Hub Feedback v3 — document order differs for newly-admitted vs expected-to-graduate.
type ApplicantFlow = 'newly_admitted' | 'expected_graduation';

export function SocialAllowanceScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { textAlign, writingDirection } = useDirection();
  const bottomInset = useContentBottomInset();

  const [flow, setFlow] = useState<ApplicantFlow>('newly_admitted');
  const [category, setCategory] = useState<SocialAllowanceCategory>('kuwaiti');
  const [picked, setPicked] = useState<Record<string, { name: string }>>({});
  const [refNo, setRefNo] = useState<string | null>(null);

  const { data: reqs, isLoading } = useQuery({
    queryKey: ['service', 'social-allowance-requirements'],
    queryFn: () => servicesApi.socialAllowanceRequirements(),
  });

  // Flow-aware lookup: prefer the new flow-keyed shape, fall back to the legacy flat map.
  const docs = useMemo(() => {
    const flowed = (reqs?.data as any)?.[flow]?.[category];
    if (Array.isArray(flowed)) return flowed;
    return (reqs?.data as any)?.[category] ?? [];
  }, [reqs, category, flow]);
  const allUploaded = docs.every((d: any) => !!picked[d.key]);

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: 'social_allowance',
        payload: {
          category,
          applicant_flow: flow,
          docs: Object.fromEntries(Object.entries(picked).map(([k, v]) => [k, v.name])),
        },
      }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  if (isLoading) return <ScreenSkeleton />;

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'دعم اجتماعي' : 'Social allowance'}
        title={t('services.letterTypes.social_allowance')}
        subtitle={`${t('services.letterDescriptions.social_allowance')} ${t('services.social.destinationPuc')}`}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && (
          <SuccessBanner referenceNo={refNo} description={t('services.social.applicationNoEmail')} />
        )}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Newly admitted vs Expected to graduate — different document orders per the feedback v3. */}
          <Tabs
            tabs={[
              { key: 'newly_admitted', label: t('services.social.flowNewlyAdmitted') },
              { key: 'expected_graduation', label: t('services.social.flowExpectedGraduation') },
            ]}
            activeKey={flow}
            onChange={(k) => {
              setFlow(k as ApplicantFlow);
              setPicked({});
            }}
          />
          <Select
            label={t('services.social.category')}
            options={CATEGORIES.map((c) => ({ value: c.value, label: t(c.key) }))}
            value={category}
            onChange={(v) => {
              setCategory(v as SocialAllowanceCategory);
              setPicked({});
            }}
          />
          <Text
            variant="caption"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, marginTop: 4 }}
          >
            {t('services.social.categoryHelp')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="overline"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1, marginBottom: spacing.sm }}
          >
            {t('services.social.documents')}
          </Text>
          {docs.map((doc: any) => (
            <FilePicker
              key={doc.key}
              label={locale === 'ar' ? doc.label_ar : doc.label_en}
              required={doc.required}
              onPick={(file) => setPicked((prev) => ({ ...prev, [doc.key]: file }))}
            />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="caption"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, marginBottom: spacing.sm }}
          >
            {t('services.social.applicationNoEmail')}
          </Text>
          <Button
            title={t('services.submit')}
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!allUploaded || mutation.isPending}
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
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
});
