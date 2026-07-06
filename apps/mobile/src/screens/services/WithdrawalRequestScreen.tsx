import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Button, Input, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { servicesApi, academicApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';
import { WITHDRAWAL_FINE_BY_WEEK } from '@masari/shared';
import { toLatnDigits } from '../../i18n/helpers';
import type { ServicesStackParamList } from '../../navigation/types';

export function WithdrawalRequestScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<ServicesStackParamList, 'WithdrawalRequest'>>();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const kind = route.params.kind;
  const isCollege = kind === 'college';
  const titleKey = isCollege ? 'services.letterTypes.college_withdrawal' : 'services.letterTypes.semester_withdrawal';
  const descKey = isCollege ? 'services.letterDescriptions.college_withdrawal' : 'services.letterDescriptions.semester_withdrawal';

  const { data: summary } = useQuery({
    queryKey: ['student', 'summary'],
    queryFn: () => academicApi.getStudentSummary(),
  });
  const fundingType = summary?.data?.student?.funding_type ?? null;
  const isPuc = fundingType === 'puc';

  const [reason, setReason] = useState('');
  const [signedForm, setSignedForm] = useState<{ name: string } | null>(null);
  const [cid, setCid] = useState<{ name: string } | null>(null);
  const [pucForm1, setPucForm1] = useState<{ name: string } | null>(null);
  const [pucForm2, setPucForm2] = useState<{ name: string } | null>(null);
  const [pucProof, setPucProof] = useState<{ name: string } | null>(null);
  const [refNo, setRefNo] = useState<string | null>(null);

  // Per Finance Department spec, CID upload is required on every request.
  const canSubmit =
    !!signedForm &&
    !!cid &&
    !!reason &&
    (!isPuc || (!!pucProof && (isCollege ? !!pucForm1 : !!pucForm1 && !!pucForm2)));

  const mutation = useMutation({
    mutationFn: () =>
      servicesApi.create({
        type: isCollege ? 'college_withdrawal' : 'semester_withdrawal',
        payload: {
          reason,
          fundingType,
          signedForm: signedForm?.name,
          civilId: cid?.name,
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
        title={t(titleKey)}
        subtitle={t(descKey)}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        {/* Form 1 — download + signed upload + reason */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="body" style={{ textAlign, writingDirection, marginBottom: spacing.sm }}>
            {t('services.withdrawal.downloadIntro')}
          </Text>
          <Button title={t('services.downloadForm')} variant="outline" onPress={() => {}} fullWidth />
          <View style={{ height: spacing.base }} />
          <FilePicker label={t('services.uploadSigned')} required onPick={setSignedForm} />
          <FilePicker
            label={t('services.uploadCivilId')}
            helper={t('services.civilIdHelper')}
            required
            onPick={setCid}
          />
          <Input
            label={t('services.reasonRequired')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Withdrawal fee schedule — sourced from WITHDRAWAL_FINE_BY_WEEK */}
        <View style={[styles.feeTable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1, textAlign, writingDirection, marginBottom: spacing.sm }}>
            {t('services.withdrawal.feeScheduleTitle')}
          </Text>
          <View style={[styles.feeRow, { flexDirection: rowDir, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.divider, paddingBottom: 6 }]}>
            <Text variant="caption" color={colors.textTertiary} style={{ flex: 1, textAlign, writingDirection }}>
              {t('services.withdrawal.week')}
            </Text>
            <Text variant="caption" color={colors.textTertiary}>{t('services.withdrawal.fine')}</Text>
          </View>
          <FeeRow week={t('services.withdrawal.week1')} fine="0%" isRTL={isRTL} />
          {Object.entries(WITHDRAWAL_FINE_BY_WEEK).map(([week, rate]) => (
            <FeeRow
              key={week}
              week={t('services.withdrawal.weekN', { n: toLatnDigits(week) })}
              fine={`${toLatnDigits(String(rate * 100))}%`}
              isRTL={isRTL}
            />
          ))}
          <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginTop: spacing.sm, lineHeight: 18 }}>
            {t('services.withdrawal.feeFootnote')}
          </Text>
        </View>

        {/* Workflow callout */}
        <View style={[styles.workflowCard, { backgroundColor: colors.primaryWash, borderColor: colors.primary }]}>
          <View style={[styles.workflowHeader, { flexDirection: rowDir }]}>
            <View style={[styles.workflowMark, { backgroundColor: colors.primary }]} />
            <Text variant="overline" color={colors.primary} style={{ letterSpacing: isAr ? 0 : 1 }}>
              {t('services.workflow')}
            </Text>
          </View>
          <Step icon="check" textKey="services.withdrawal.advisorStep" isRTL={isRTL} />
          <Step icon="check" textKey="services.withdrawal.financeStep" isRTL={isRTL} />
          {isPuc && (
            <Step
              icon="warning"
              textKey={isCollege ? 'services.withdrawal.pucCollegeStep' : 'services.withdrawal.pucStep'}
              isRTL={isRTL}
              tone="warning"
            />
          )}
        </View>

        {isPuc && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="bodyBold" style={{ marginBottom: spacing.sm, textAlign, writingDirection }}>
              {t('services.withdrawal.pucBlockTitle')}
            </Text>
            <FilePicker
              label={isCollege ? t('services.withdrawal.pucCancelForm') : t('services.withdrawal.pucFreezeForm')}
              required
              onPick={setPucForm1}
            />
            {!isCollege && (
              <FilePicker label={t('services.withdrawal.pucHoldForm')} required onPick={setPucForm2} />
            )}
            <FilePicker label={t('services.withdrawal.uploadProofPuc')} required onPick={setPucProof} />
          </View>
        )}

        {/* Submit */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text
            variant="caption"
            color={colors.textTertiary}
            style={{ textAlign, writingDirection, marginBottom: spacing.sm }}
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

function FeeRow({ week, fine, isRTL }: { week: string; fine: string; isRTL: boolean }) {
  return (
    <View style={[styles.feeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text variant="caption" color={colors.textPrimary} style={{ flex: 1, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }}>
        {week}
      </Text>
      <Text variant="bodyBold" color={colors.brandRedDark}>
        {fine}
      </Text>
    </View>
  );
}

function Step({
  icon, textKey, isRTL, tone,
}: { icon: 'check' | 'warning'; textKey: string; isRTL: boolean; tone?: 'warning' }) {
  const { t } = useTranslation();
  const color = tone === 'warning' ? colors.warning : colors.success;
  return (
    <View style={[styles.stepRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.stepIconWedge, { backgroundColor: color }]}>
        <Icon name={icon} size={10} color={colors.textInverse} />
      </View>
      <Text
        variant="small"
        color={colors.textPrimary}
        style={{ flex: 1, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }}
      >
        {t(textKey)}
      </Text>
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
  workflowCard: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
    gap: 6,
  },
  workflowHeader: { alignItems: 'center', gap: 8, marginBottom: 6 },
  workflowMark: { width: 12, height: 2 },
  feeTable: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  feeRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  stepRow: { paddingVertical: 4, alignItems: 'center', gap: 8 },
  stepIconWedge: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
