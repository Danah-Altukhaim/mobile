import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Text, Badge, Button, Select, ScreenSkeleton, EmptyState, Icon } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { API_PATHS, MISC_FEES_KWD } from '@masari/shared';
import { apiClient } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useFinanceGate } from '../../hooks/useFinanceGate';
import { toLatnDigits } from '../../i18n/helpers';
import { useNavigation } from '@react-navigation/native';

export function TranscriptRequestScreen() {
  const { t, i18n } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const colors = useColors();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const navigation = useNavigation<any>();
  const finance = useFinanceGate();
  const financeBlocked = finance.blocked;
  const [type, setType] = useState('official');
  const bottomInset = useContentBottomInset();

  const { data, isLoading } = useQuery({
    queryKey: ['transcript-requests'],
    queryFn: () => apiClient.get<any[]>(API_PATHS.TRANSCRIPT_REQUESTS),
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post(API_PATHS.TRANSCRIPT_REQUEST, { type, copies: 1, delivery: 'email' }),
  });

  if (isLoading) return <ScreenSkeleton />;
  const requests = Array.isArray(data?.data) ? data.data : [];

  const statusVariants = { ready: 'success', processing: 'warning' } as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <InnerScreenHeader
        eyebrow={isAr ? 'طلب جديد' : 'Records'}
        title={t('academics.transcriptRequest')}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        {financeBlocked && (
          <View style={[styles.financeBlock, { backgroundColor: colors.brandRedWash, borderColor: colors.brandRed }]}>
            <View style={[styles.financeBlockHeader, { flexDirection: rowDirection }]}>
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

        {/* New request card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Select
            label={t('common.status')}
            options={[
              { label: t('academics.official'), value: 'official' },
              { label: t('academics.unofficial'), value: 'unofficial' },
            ]}
            value={type}
            onChange={setType}
          />
          <View style={[styles.feeNote, { backgroundColor: colors.surfaceMuted, flexDirection: rowDirection }]}>
            <Icon name="payments" size={14} color={colors.textTertiary} />
            <Text variant="caption" color={colors.textSecondary} style={{ flex: 1, textAlign, writingDirection }}>
              {t('academics.transcriptFeeNote', {
                fee: toLatnDigits(String(MISC_FEES_KWD.official_transcript)),
              })}
            </Text>
          </View>
          <Button
            title={t('academics.requestTranscript')}
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={financeBlocked || mutation.isPending}
            fullWidth
            size="large"
            style={{ marginTop: spacing.sm }}
          />
          {mutation.isSuccess && (
            <View style={[styles.successBanner, { backgroundColor: colors.successWash, flexDirection: rowDirection }]}>
              <Icon name="check" size={14} color={colors.success} />
              <Text variant="smallBold" color={colors.success}>
                {t('academics.processing')}
              </Text>
            </View>
          )}
        </View>

        {requests.length === 0 ? null : (
          <>
            <View style={[styles.sectionHeader, { flexDirection: rowDirection }]}>
              <View style={[styles.sectionMark, { backgroundColor: colors.secondary }]} />
              <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
                {t('payments.history')}
              </Text>
            </View>
            <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {requests.map((req: any, i: number, arr: any[]) => {
                const dateStr = new Date(req.requested_at).toLocaleDateString(
                  locale === 'ar' ? 'ar-KW' : 'en-KW',
                  { month: 'short', day: 'numeric', year: 'numeric' },
                );
                const isLast = i === arr.length - 1;
                return (
                  <View
                    key={i}
                    style={[
                      styles.row,
                      {
                        flexDirection: rowDirection,
                        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                        borderBottomColor: colors.divider,
                      },
                    ]}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                        {t(`academics.${req.type}`)} · {toLatnDigits(String(req.copies))} {t('academics.copies')}
                      </Text>
                      <Text
                        variant="caption"
                        color={colors.textSecondary}
                        style={{ textAlign, writingDirection, marginTop: 2 }}
                      >
                        {toLatnDigits(dateStr)}
                      </Text>
                    </View>
                    <Badge
                      label={t(`academics.${req.status}`)}
                      variant={statusVariants[req.status as keyof typeof statusVariants] || 'neutral'}
                      size="sm"
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        {requests.length === 0 && !mutation.isSuccess && (
          <EmptyState icon="transcript" title={isAr ? 'لا طلبات سابقة' : 'No prior requests'} tone="neutral" />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },
  successBanner: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
  },
  feeNote: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 8,
  },

  sectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2 },

  list: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.md,
  },
  financeBlock: {
    borderWidth: 1,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  financeBlockHeader: { alignItems: 'center', gap: 8 },
});
