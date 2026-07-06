import React from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Text, Badge, ScreenSkeleton, EmptyState, Triangle } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi } from '../../services/api';
import { haptic } from '../../utils/haptics';
import { toLatnDigits } from '../../i18n/helpers';
import type { ServiceRequest, ServiceRequestStatus } from '@masari/shared';

const STATUS_VARIANT: Record<ServiceRequestStatus, 'success' | 'warning' | 'error' | 'neutral'> = {
  submitted: 'neutral',
  in_progress: 'warning',
  pending_advisor: 'warning',
  pending_finance: 'warning',
  pending_puc: 'warning',
  pending_payment: 'warning',
  rejected: 'error',
  cancelled: 'error',
  completed: 'success',
};

export function MyRequestsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['service-requests'],
    queryFn: () => servicesApi.list(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const requests: ServiceRequest[] = Array.isArray(data?.data) ? (data.data as ServiceRequest[]) : [];

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'كل الطلبات' : 'All requests'}
        title={t('services.myRequests')}
      />
      {isError ? (
        <EmptyState
          icon="document"
          title={t('common.error')}
          message={t('common.error')}
          tone="error"
        />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="document"
          title={t('services.myRequests')}
          message={t('services.noRequests')}
          actionLabel={t('services.newRequest')}
          onAction={() => navigation.navigate('ServicesHub')}
          tone="neutral"
        />
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {requests.map((req, i) => {
              const title = locale === 'ar' ? req.title_ar : req.title_en;
              const date = new Date(req.updated_at).toLocaleDateString(
                locale === 'ar' ? 'ar-KW' : 'en-KW',
                { month: 'short', day: 'numeric', year: 'numeric' },
              );
              const isLast = i === requests.length - 1;
              return (
                <Pressable
                  key={req.id}
                  onPress={() => {
                    haptic.selection();
                    navigation.navigate('ServiceRequestDetail', { requestId: req.id });
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      flexDirection: rowDir,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                      backgroundColor: pressed ? colors.primarySoft : 'transparent',
                    },
                  ]}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyBold" style={{ textAlign, writingDirection }} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text
                      variant="caption"
                      color={colors.textSecondary}
                      style={{ textAlign, writingDirection, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {req.reference_no} · {toLatnDigits(date)}
                    </Text>
                  </View>
                  <Badge label={t(`services.status.${req.status}`)} variant={STATUS_VARIANT[req.status]} size="sm" />
                  <Triangle size={7} color={colors.chevron} />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.base },
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
});
