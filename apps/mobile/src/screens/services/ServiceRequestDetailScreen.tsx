import React, { useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Text, Badge, Button, ScreenSkeleton, EmptyState, Icon, useToast } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi } from '../../services/api';
import { WorkflowTimeline } from './components/WorkflowTimeline';
import { toLatnDigits } from '../../i18n/helpers';
import { isServiceRequestOnFinanceHold } from '@masari/shared';
import type { ServiceRequest, ServiceRequestAttachment } from '@masari/shared';
import type { ServicesStackParamList } from '../../navigation/types';

export function ServiceRequestDetailScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<ServicesStackParamList, 'ServiceRequestDetail'>>();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const qc = useQueryClient();
  const toast = useToast();
  const bottomInset = useContentBottomInset();

  // Local map of attachment id → newly uploaded file once the student has
  // amended a rejected document. Used to optimistically reflect re-uploads
  // since the mock backend doesn't persist mutations.
  const [amended, setAmended] = useState<
    Record<string, { name: string; size_kb: number }>
  >({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['service-requests'],
    queryFn: () => servicesApi.list(),
  });

  const cancel = useMutation({
    mutationFn: () => servicesApi.cancel(route.params.requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-requests'] });
      navigation.goBack();
    },
  });

  const amendMutation = useMutation({
    mutationFn: (vars: { attachmentId: string; file: { name: string; size_kb: number } }) =>
      servicesApi.amendAttachment(route.params.requestId, vars.attachmentId, vars.file),
    onSuccess: (_res, vars) => {
      setAmended((m) => ({ ...m, [vars.attachmentId]: vars.file }));
      toast.show(t('services.amendSuccess'), { variant: 'success' });
    },
  });

  const resubmit = useMutation({
    mutationFn: () => servicesApi.cancel(route.params.requestId), // mock — would be a resubmit endpoint
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-requests'] });
      toast.show(t('services.amendSuccess'), { variant: 'success' });
      navigation.goBack();
    },
  });

  if (isLoading) return <ScreenSkeleton />;
  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="document" title={t('common.error')} tone="error" />
      </View>
    );
  }
  const list: ServiceRequest[] = Array.isArray(data?.data) ? (data.data as ServiceRequest[]) : [];
  const req = list.find((r) => r.id === route.params.requestId);
  if (!req) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState icon="document" title={t('common.noData')} tone="neutral" />
      </View>
    );
  }

  const title = locale === 'ar' ? req.title_ar : req.title_en;
  const financeHold = isServiceRequestOnFinanceHold(req);
  const outstanding = req.outstanding_balance_kwd ?? 0;
  const isRejected = req.status === 'rejected';
  const rejectedAttachments = req.attachments.filter((a) => a.status === 'rejected');
  const allRejectedAmended =
    rejectedAttachments.length > 0 &&
    rejectedAttachments.every((a) => amended[a.id]);
  const cancellable =
    req.status !== 'completed' &&
    req.status !== 'cancelled' &&
    req.status !== 'rejected';

  const rejectionReason = locale === 'ar' ? req.rejection_reason_ar : req.rejection_reason_en;
  const rejectedBy = locale === 'ar' ? req.rejected_by_ar : req.rejected_by_en;

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={req.reference_no}
        title={title}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.metaRow, { flexDirection: rowDir }]}>
          <Badge label={t(`services.category.${req.category}`)} variant="primary" size="sm" />
          <Badge
            label={t(`services.status.${req.status}`)}
            variant={
              req.status === 'completed'
                ? 'success'
                : req.status === 'rejected'
                  ? 'error'
                  : 'warning'
            }
            size="sm"
          />
        </View>

        {financeHold && (
          <View
            style={[
              styles.financeHoldBanner,
              { backgroundColor: colors.brandRedWash, borderColor: colors.brandRed },
            ]}
          >
            <View style={[styles.rejectionHeader, { flexDirection: rowDir }]}>
              <View style={[styles.rejectionIconWedge, { backgroundColor: colors.brandRed }]}>
                <Icon name="warning" size={14} color={colors.textInverse} />
              </View>
              <Text
                variant="bodyBold"
                color={colors.brandRedDark}
                style={{ flex: 1, textAlign, writingDirection }}
              >
                {t('services.financeHold.title')}
              </Text>
            </View>
            <Text
              variant="body"
              color={colors.brandRedDark}
              style={{ textAlign, writingDirection, marginTop: spacing.xs }}
            >
              {t('services.financeHold.body', { amount: toLatnDigits(outstanding.toFixed(3)) })}
            </Text>
            <Button
              title={t('services.financeHold.cta')}
              variant="outline"
              fullWidth
              onPress={() => navigation.navigate('PaymentsTab', { screen: 'PaymentDashboard' })}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        {isRejected && (
          <View
            style={[
              styles.rejectionBanner,
              { backgroundColor: colors.errorWash, borderColor: colors.error },
            ]}
          >
            <View style={[styles.rejectionHeader, { flexDirection: rowDir }]}>
              <View style={[styles.rejectionIconWedge, { backgroundColor: colors.error }]}>
                <Icon name="warning" size={14} color={colors.textInverse} />
              </View>
              <Text
                variant="bodyBold"
                color={colors.error}
                style={{ flex: 1, textAlign, writingDirection }}
              >
                {t('services.rejectionTitle')}
              </Text>
            </View>
            {rejectionReason && (
              <Text
                variant="body"
                color={colors.textPrimary}
                style={{ textAlign, writingDirection, marginTop: spacing.xs }}
              >
                {rejectionReason}
              </Text>
            )}
            {(rejectedBy || req.rejected_at) && (
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginTop: spacing.xs }}
              >
                {rejectedBy && t('services.rejectedBy', { by: rejectedBy })}
                {rejectedBy && req.rejected_at ? ' · ' : ''}
                {req.rejected_at &&
                  t('services.rejectedOn', {
                    date: new Date(req.rejected_at).toLocaleDateString(
                      locale === 'ar' ? 'ar-KW' : 'en-KW',
                    ),
                  })}
              </Text>
            )}
            {rejectedAttachments.length > 0 && (
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginTop: spacing.sm }}
              >
                {t('services.rejectionAttachmentsHint')}
              </Text>
            )}
          </View>
        )}

        <SectionEyebrow label={t('services.workflow')} isAr={isAr} />
        <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <WorkflowTimeline steps={req.workflow} />
        </View>

        {req.attachments.length > 0 && (
          <>
            <SectionEyebrow label={t('services.attachments')} isAr={isAr} />
            <View style={[styles.block, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {req.attachments.map((att, i, arr) => (
                <AttachmentRow
                  key={att.id}
                  attachment={att}
                  amendedFile={amended[att.id]}
                  isLast={i === arr.length - 1}
                  rowDir={rowDir}
                  textAlign={textAlign}
                  writingDirection={writingDirection}
                  onAmend={() =>
                    amendMutation.mutate({
                      attachmentId: att.id,
                      // FilePicker is a stub — generate a fake replacement file
                      // for parity with the rest of the upload flow.
                      file: {
                        name: att.name.replace(/(\.\w+)?$/, '-v2$1'),
                        size_kb: 240,
                      },
                    })
                  }
                  amending={
                    amendMutation.isPending &&
                    amendMutation.variables?.attachmentId === att.id
                  }
                  t={t}
                />
              ))}
            </View>
          </>
        )}

        {isRejected && allRejectedAmended && (
          <>
            <Text
              variant="caption"
              color={colors.textSecondary}
              style={{ textAlign, writingDirection, marginTop: spacing.lg }}
            >
              {t('services.allAmendedHint')}
            </Text>
            <Button
              title={t('services.resubmit')}
              variant="primary"
              onPress={() => resubmit.mutate()}
              loading={resubmit.isPending}
              fullWidth
              size="large"
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}

        {cancellable && (
          <Button
            title={t('services.cancelRequest')}
            variant="destructive"
            onPress={() => cancel.mutate()}
            loading={cancel.isPending}
            fullWidth
            size="large"
            style={{ marginTop: spacing.lg }}
          />
        )}
      </ScrollView>
    </View>
  );
}

interface AttachmentRowProps {
  attachment: ServiceRequestAttachment;
  amendedFile?: { name: string; size_kb: number };
  isLast: boolean;
  rowDir: 'row' | 'row-reverse';
  textAlign: 'left' | 'right';
  writingDirection: 'ltr' | 'rtl';
  onAmend: () => void;
  amending: boolean;
  t: (key: string) => string;
}

function AttachmentRow({
  attachment,
  amendedFile,
  isLast,
  rowDir,
  textAlign,
  writingDirection,
  onAmend,
  amending,
  t,
}: AttachmentRowProps) {
  const isRejected = attachment.status === 'rejected' && !amendedFile;
  const isApproved = attachment.status === 'approved';
  const justAmended = !!amendedFile;
  const reason =
    attachment.rejection_reason_en && attachment.rejection_reason_ar
      ? writingDirection === 'rtl'
        ? attachment.rejection_reason_ar
        : attachment.rejection_reason_en
      : attachment.rejection_reason_en || attachment.rejection_reason_ar;

  const displayName = amendedFile?.name ?? attachment.name;
  const displaySize = amendedFile?.size_kb ?? attachment.size_kb;

  return (
    <View
      style={[
        styles.attBlock,
        {
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <View style={[styles.attRow, { flexDirection: rowDir }]}>
        <View
          style={[
            styles.attIconWedge,
            {
              backgroundColor: isRejected
                ? colors.errorWash
                : justAmended
                  ? colors.successWash
                  : colors.primaryWash,
            },
          ]}
        >
          <Icon
            name={isRejected ? 'warning' : justAmended ? 'check' : 'document'}
            size={14}
            color={isRejected ? colors.error : justAmended ? colors.success : colors.primary}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            variant="bodyBold"
            style={{ textAlign, writingDirection }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {(isRejected || isApproved || justAmended) && (
            <View style={[styles.statusRow, { flexDirection: rowDir }]}>
              <Badge
                label={
                  justAmended
                    ? t('services.status.in_progress')
                    : isRejected
                      ? t('services.attachmentRejected')
                      : t('services.attachmentApproved')
                }
                variant={justAmended ? 'warning' : isRejected ? 'error' : 'success'}
                size="sm"
              />
            </View>
          )}
        </View>
        <Text variant="caption" color={colors.textTertiary}>
          {toLatnDigits(String(displaySize))} KB
        </Text>
      </View>

      {isRejected && reason && (
        <View
          style={[
            styles.reasonBox,
            { backgroundColor: colors.errorWash, borderColor: colors.error },
          ]}
        >
          <Text
            variant="caption"
            color={colors.brandRedDark}
            style={{ textAlign, writingDirection }}
          >
            {reason}
          </Text>
        </View>
      )}

      {isRejected && (
        <Pressable
          onPress={onAmend}
          disabled={amending}
          style={({ pressed }) => [
            styles.amendBtn,
            {
              backgroundColor: pressed ? colors.brandRedDark : colors.error,
              opacity: amending ? 0.6 : 1,
              flexDirection: rowDir,
            },
          ]}
        >
          <Icon name="attachment" size={14} color={colors.textInverse} />
          <Text variant="bodyBold" color={colors.textInverse}>
            {amending ? '…' : t('services.amend')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function SectionEyebrow({ label, isAr }: { label: string; isAr: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionMark} />
      <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },

  metaRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionMark: { width: 12, height: 2, backgroundColor: colors.secondary },

  block: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.base,
  },

  rejectionBanner: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
  },
  financeHoldBanner: {
    marginTop: spacing.base,
    padding: spacing.base,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
  },
  rejectionHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  rejectionIconWedge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  attBlock: {
    paddingVertical: spacing.sm,
  },
  attRow: {
    alignItems: 'center',
    gap: spacing.md,
  },
  attIconWedge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: {
    marginTop: 4,
    alignItems: 'center',
    gap: spacing.xs,
  },

  reasonBox: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderLeftWidth: 2,
  },

  amendBtn: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
});
