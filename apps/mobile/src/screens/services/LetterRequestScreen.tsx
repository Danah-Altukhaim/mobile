import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Button, Input, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { servicesApi } from '../../services/api';
import { useFinanceGate } from '../../hooks/useFinanceGate';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';
import { toLatnDigits } from '../../i18n/helpers';
import type { ServicesStackParamList } from '../../navigation/types';

type LetterType =
  | 'twimc' | 'twimc_balance' | 'expected_graduation_docs'
  | 'puc_letter_with_stipend' | 'puc_letter_no_stipend';

const REQUIRES_CIVIL_ID: LetterType[] = ['puc_letter_with_stipend', 'puc_letter_no_stipend'];
const REQUIRES_PAYMENT: LetterType[] = ['twimc'];
// CCK Hub Feedback v3 — TWIMC variants cannot be requested while balance / installments are outstanding.
const FINANCE_GATED_TYPES: LetterType[] = ['twimc', 'twimc_balance'];
// PUC subsidy letters require structured applicant data alongside the Civil ID.
const REQUIRES_PUC_FIELDS: LetterType[] = ['puc_letter_with_stipend', 'puc_letter_no_stipend'];
// Letter types without a t() key fall back to inline bilingual copy.
const INLINE_TYPES: LetterType[] = ['expected_graduation_docs'];

export function LetterRequestScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<ServicesStackParamList, 'LetterRequest'>>();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const serviceType = route.params.serviceType as LetterType;

  const [reason, setReason] = useState('');
  const [civilId, setCivilId] = useState<{ name: string } | null>(null);
  const [fullName, setFullName] = useState('');
  const [civilIdNumber, setCivilIdNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [refNo, setRefNo] = useState<string | null>(null);

  const requiresCivilId = REQUIRES_CIVIL_ID.includes(serviceType);
  const requiresPayment = REQUIRES_PAYMENT.includes(serviceType);
  const requiresPucFields = REQUIRES_PUC_FIELDS.includes(serviceType);
  const isInline = INLINE_TYPES.includes(serviceType);
  const financeGated = FINANCE_GATED_TYPES.includes(serviceType);
  const finance = useFinanceGate();
  const financeBlocked = financeGated && finance.blocked;

  // expected_graduation_docs has no locale key — use inline bilingual copy.
  const inlineTitle = isAr ? 'مستندات الطلبة المتوقع تخرجهم' : 'Expected-to-Graduate Documents';
  const inlineDescription = isAr
    ? 'اطلب المستندات الرسمية الخاصة بالطلبة المتوقع تخرجهم في الفصل الحالي.'
    : 'Request the official document set for students expected to graduate this semester.';

  const pucFieldsValid =
    !requiresPucFields ||
    (!!fullName.trim() && !!civilIdNumber.trim() && !!academicYear.trim());
  const canSubmit = (!requiresCivilId || !!civilId) && pucFieldsValid && !financeBlocked;

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: serviceType,
        payload: {
          reason,
          hasCivilId: !!civilId,
          ...(requiresPucFields
            ? {
                fullName: fullName.trim(),
                civilIdNumber: civilIdNumber.trim(),
                academicYear: academicYear.trim(),
              }
            : {}),
        },
      }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'طلب جديد' : 'New request'}
        title={isInline ? inlineTitle : t(`services.letterTypes.${serviceType}`)}
        subtitle={isInline ? inlineDescription : t(`services.letterDescriptions.${serviceType}`)}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        {financeBlocked && (
          <View style={[styles.financeBlock, { backgroundColor: colors.brandRedWash, borderColor: colors.brandRed }]}>
            <View style={[styles.financeBlockHeader, { flexDirection: rowDir }]}>
              <Icon name="warning" size={16} color={colors.brandRed} />
              <Text variant="bodyBold" color={colors.brandRedDark} style={{ flex: 1, textAlign, writingDirection }}>
                {t('services.financeGate.title')}
              </Text>
            </View>
            <Text variant="caption" color={colors.brandRedDark} style={{ textAlign, writingDirection, marginTop: 4 }}>
              {finance.balanceDue > 0
                ? t('services.financeGate.outstandingBody', { amount: toLatnDigits(finance.balanceDue.toFixed(3)) })
                : t('services.financeGate.installmentBody', { overdue: toLatnDigits(String(finance.overdueInstallments)) })}
            </Text>
            <Button
              title={t('services.financeGate.cta')}
              variant="outline"
              fullWidth
              onPress={() => navigation.navigate('PaymentsTab', { screen: 'PaymentDashboard' })}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {requiresCivilId && (
            <FilePicker
              label={t('services.uploadCivilId')}
              required
              onPick={setCivilId}
            />
          )}

          {requiresPucFields && (
            <>
              <Input
                label={isAr ? 'الاسم الكامل للطالب' : 'Student full name'}
                value={fullName}
                onChangeText={setFullName}
              />
              <Input
                label={isAr ? 'رقم البطاقة المدنية' : 'Civil ID number'}
                value={civilIdNumber}
                onChangeText={setCivilIdNumber}
                keyboardType="number-pad"
              />
              <Input
                label={isAr ? 'العام الأكاديمي / الفصل الدراسي' : 'Academic year / semester'}
                value={academicYear}
                onChangeText={setAcademicYear}
                placeholder={isAr ? 'مثال: 2025/2026 - الفصل الأول' : 'e.g. 2025/2026 - Fall'}
              />
            </>
          )}

          <Input
            label={requiresCivilId ? t('services.reasonRequired') : t('services.reasonOptional')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />

          {requiresPayment && (
            <View style={[styles.notice, { backgroundColor: colors.warningWash, flexDirection: rowDir }]}>
              <Icon name="warning" size={14} color={colors.warning} />
              <Text variant="smallBold" color={colors.warning} style={{ flex: 1, textAlign, writingDirection }}>
                {t('payments.payNow')} · {t('payments.confirmPayment')}
              </Text>
            </View>
          )}

          <Text
            variant="caption"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, marginVertical: spacing.sm }}
          >
            {t('services.noteSentToEmail')}
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
  formCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  notice: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  financeBlock: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  financeBlockHeader: { alignItems: 'center', gap: 8 },
});
