import React from 'react';
import { ScrollView, View, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Text, Badge, ScreenSkeleton, EmptyState, Icon, Triangle } from '../../components/ui';
import { InnerScreenHeader } from '../../components/InnerScreenHeader';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { useUIStore } from '../../store/ui.store';
import { servicesApi } from '../../services/api';
import { toLatnDigits } from '../../i18n/helpers';
import { haptic } from '../../utils/haptics';
import type { ServiceRequest, ServiceRequestStatus } from '@masari/shared';
import type { ServicesStackParamList } from '../../navigation/types';

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

export function ServiceRequestListScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ServicesStackParamList, 'ServiceRequestList'>>();
  const locale = useUIStore((s) => s.locale);
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const bottomInset = useContentBottomInset();

  const { titleKey, descriptionKey, types, formRoute, formParams } = route.params;
  const goToForm = () => navigation.navigate(formRoute as never, formParams as never);

  const addButton = (
    <TouchableOpacity onPress={goToForm} activeOpacity={0.85} style={styles.addBtn}>
      <Icon name="plus" size={14} color={colors.textInverse} />
      <Text variant="smallBold" color={colors.textInverse} style={{ marginHorizontal: 4 }}>
        {t('services.addNew')}
      </Text>
    </TouchableOpacity>
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['service-requests'],
    queryFn: () => servicesApi.list(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const all: ServiceRequest[] = Array.isArray(data?.data) ? (data.data as ServiceRequest[]) : [];
  const requests = all.filter((r) => types.includes(r.type));

  return (
    <View style={styles.container}>
      <InnerScreenHeader
        eyebrow={isAr ? 'الطلبات السابقة' : 'Previous requests'}
        title={t(titleKey)}
        subtitle={descriptionKey ? t(descriptionKey) : undefined}
        trailing={addButton}
      />
      {isError ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="document"
            title={t('common.error')}
            message={t('common.error')}
            tone="error"
          />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="document"
            title={t('services.previousRequests')}
            message={t('services.noRequestsForService')}
            actionLabel={t('services.addNew')}
            onAction={goToForm}
            tone="neutral"
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset }]} showsVerticalScrollIndicator={false}>
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
  listContent: { padding: spacing.base },
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
  emptyWrap: { flex: 1, justifyContent: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
