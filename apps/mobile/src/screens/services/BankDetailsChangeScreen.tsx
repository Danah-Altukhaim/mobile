import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Input, ScreenSkeleton } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';

export function BankDetailsChangeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { textAlign, writingDirection } = useDirection();
  const bottomInset = useContentBottomInset();

  const [iban, setIban] = useState('');
  const [bankName, setBankName] = useState('');
  const [picked, setPicked] = useState<Record<string, { name: string }>>({});
  const [refNo, setRefNo] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['service', 'social-allowance-requirements'],
    queryFn: () => servicesApi.socialAllowanceRequirements(),
  });

  const docs = data?.data?.bank_change ?? [];
  const allUploaded = docs.every((d) => !!picked[d.key]);
  const canSubmit = allUploaded && !!iban && !!bankName;

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: 'bank_details_change',
        payload: { iban, bankName, docs: Object.fromEntries(Object.entries(picked).map(([k, v]) => [k, v.name])) },
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
        eyebrow={isAr ? 'تغيير بنك' : 'Banking'}
        title={t('services.letterTypes.bank_details_change')}
        subtitle={t('services.letterDescriptions.bank_details_change')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input label="IBAN" value={iban} onChangeText={setIban} autoCapitalize="characters" />
          <Input label={isAr ? 'البنك' : 'Bank'} value={bankName} onChangeText={setBankName} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="overline"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, letterSpacing: isAr ? 0 : 1, marginBottom: spacing.sm }}
          >
            {isAr ? 'المستندات' : 'Documents'}
          </Text>
          {docs.map((doc) => (
            <FilePicker
              key={doc.key}
              label={locale === 'ar' ? doc.label_ar : doc.label_en}
              required={doc.required}
              onPick={(file) => setPicked((prev) => ({ ...prev, [doc.key]: file }))}
            />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
});
