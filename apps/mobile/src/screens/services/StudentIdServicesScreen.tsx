import React, { useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Tabs, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { servicesApi } from '../../services/api';
import { FilePicker } from './components/FilePicker';
import { SuccessBanner } from './components/SuccessBanner';
import { formatCurrency } from '../../i18n/helpers';
import { MISC_FEES_KWD } from '@masari/shared';

export function StudentIdServicesScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();
  const [tab, setTab] = useState<'lost' | 'photo'>('lost');
  const [photo, setPhoto] = useState<{ name: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [refNo, setRefNo] = useState<string | null>(null);

  const lostMutation = useMutation({
    mutationFn: () => servicesApi.create({ type: 'student_id_lost' }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });
  const photoMutation = useMutation({
    mutationFn: () =>
      servicesApi.create({ type: 'student_id_photo', payload: { photo: photo?.name } }),
    onSuccess: () => {
      const seq = String(Date.now()).slice(-4);
      setRefNo(`CCK-${new Date().getFullYear()}-${seq}`);
    },
  });

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'بطاقة الطالب' : 'Student ID'}
        title={t('services.studentId.title')}
      />
      <View style={styles.tabsWrap}>
        <Tabs
          tabs={[
            { key: 'lost', label: t('services.letterTypes.student_id_lost') },
            { key: 'photo', label: t('services.letterTypes.student_id_photo') },
          ]}
          activeKey={tab}
          onChange={(k) => {
            setTab(k as 'lost' | 'photo');
            setRefNo(null);
          }}
        />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {refNo && <SuccessBanner referenceNo={refNo} />}

        {tab === 'lost' ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="body" style={{ textAlign, writingDirection, marginBottom: spacing.sm }}>
              {t('services.studentId.lostIntro')}
            </Text>
            <View style={[styles.feeRow, { backgroundColor: colors.warningWash, borderColor: colors.warning, flexDirection: rowDir }]}>
              <Icon name="card" size={16} color={colors.warning} />
              <Text variant="bodyBold" color={colors.warning} style={{ flex: 1, textAlign, writingDirection }}>
                {t('services.studentId.feeLabel')}
              </Text>
              <Text variant="bodyBold" color={colors.warning}>
                {formatCurrency(MISC_FEES_KWD.id_replacement, 'KWD')}
              </Text>
            </View>
            <Text variant="caption" color={colors.textTertiary} style={{ textAlign, writingDirection, marginBottom: spacing.sm, lineHeight: 18 }}>
              {t('services.studentId.lostFlowExplain')}
            </Text>
            <Button
              title={t('services.studentId.payAndSubmit', {
                amount: formatCurrency(MISC_FEES_KWD.id_replacement, 'KWD'),
              })}
              onPress={() => lostMutation.mutate()}
              loading={lostMutation.isPending}
              fullWidth
              size="large"
            />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="body" style={{ textAlign, writingDirection, marginBottom: spacing.sm }}>
              {t('services.studentId.photoIntro')}
            </Text>
            <View style={[styles.photoNote, { backgroundColor: colors.primaryWash, borderColor: colors.primary, flexDirection: rowDir }]}>
              <Icon name="image" size={16} color={colors.primary} />
              <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection, lineHeight: 18 }}>
                {isAr
                  ? 'يجب أن تكون الصورة المرفوعة لقطة واضحة للوجه. سيتم تعديلها تلقائياً لتصبح بخلفية بيضاء قبل طباعتها على البطاقة.'
                  : 'The uploaded photo must be a clear headshot. It will be auto-adjusted to a white background before being printed on your ID.'}
              </Text>
            </View>
            <FilePicker label={t('services.studentId.uploadPhoto')} required onPick={setPhoto} />
            <Pressable
              onPress={() => setConfirmed((v) => !v)}
              style={[styles.checkRow, { flexDirection: rowDir }]}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: confirmed ? colors.primary : colors.borderStrong,
                    backgroundColor: confirmed ? colors.primary : 'transparent',
                  },
                ]}
              >
                {confirmed && <Icon name="check" size={12} color={colors.textInverse} />}
              </View>
              <Text
                variant="small"
                color={colors.textSecondary}
                style={{ flex: 1, textAlign, writingDirection }}
              >
                {t('services.studentId.agreement')}
              </Text>
            </Pressable>
            <Button
              title={t('services.submit')}
              onPress={() => photoMutation.mutate()}
              loading={photoMutation.isPending}
              disabled={!photo || !confirmed || photoMutation.isPending}
              fullWidth
              size="large"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

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
  tabsWrap: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  content: { padding: spacing.base },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  feeRow: {
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  photoNote: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  checkRow: { alignItems: 'center', marginVertical: spacing.sm, minHeight: 32, gap: spacing.sm },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
