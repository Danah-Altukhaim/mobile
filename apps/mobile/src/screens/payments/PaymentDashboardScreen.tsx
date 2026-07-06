import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, Button, Badge, ScreenSkeleton, Icon, type IconName } from '../../components/ui';
import { GeometricPattern } from '../../components/common/GeometricPattern';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { localized, currentLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';
import { useContentBottomInset } from '../../hooks/useContentInset';
import { haptic } from '../../utils/haptics';

const QUICK_LINKS: Array<{ route: string; icon: IconName; labelKey: string }> = [
  { route: 'PaymentHistory', icon: 'payment-history', labelKey: 'payments.history' },
  { route: 'InstallmentPlans', icon: 'installment', labelKey: 'payments.installments' },
  { route: 'FeeSchedule', icon: 'fee-schedule', labelKey: 'payments.feeSchedule' },
  { route: 'FeeCalculator', icon: 'fee-calculator', labelKey: 'payments.feeCalculator' },
];

export function PaymentDashboardScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isAr = i18n.language === 'ar';
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const rightAlign = isRTL ? 'flex-start' : 'flex-end';
  const bottomInset = useContentBottomInset();

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'fees'],
    queryFn: () => academicApi.getFees(),
  });

  if (isLoading) return <ScreenSkeleton />;

  const dashboard = data?.data;
  const currency = dashboard?.currency || 'KWD';
  const locale = currentLocale();
  const formatDate = (d: Date) => toLatnDigits(d.toLocaleDateString(locale));
  const balanceDue = dashboard?.balance_due ?? 0;
  const recentPayments = dashboard?.recent_payments ?? [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Hero balance — solid green deep, single wedge */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <GeometricPattern
          variant="cornerWedge"
          width={240}
          height={200}
          tone="light"
          opacity={0.10}
          style={[
            styles.heroWedge,
            isRTL ? { left: -18, transform: [{ scaleX: -1 }] } : { right: -18 },
          ]}
        />
        <Text
          variant="overline"
          color={colors.secondaryLight}
          style={[styles.heroEyebrow, { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 }]}
        >
          {t('payments.balance')}
        </Text>
        <Text
          color={colors.textInverse}
          style={[styles.heroAmount, { textAlign, writingDirection }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {dashboard?.balance_due != null ? formatCurrency(balanceDue, currency) : '—'}
        </Text>
        {dashboard?.next_due_date && (
          <Text
            variant="small"
            color="rgba(255,255,255,0.78)"
            style={{ textAlign, writingDirection, marginTop: 2 }}
          >
            {t('payments.dueDate')}: {formatDate(new Date(dashboard.next_due_date))}
          </Text>
        )}
        <View style={styles.heroCTA}>
          <Button
            title={t('payments.payNow')}
            onPress={() =>
              navigation.navigate('PaymentMethod', {
                amount: balanceDue,
                feeIds: (dashboard?.fees ?? [])
                  .filter((f: any) => parseFloat(f.paid_amount ?? 0) < parseFloat(f.amount ?? 0))
                  .map((f: any) => f.id),
              })
            }
            variant="secondary"
            disabled={!balanceDue || balanceDue <= 0}
            fullWidth
            size="large"
          />
        </View>
        <View style={[styles.heroStripe, { backgroundColor: colors.brandRed }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick links — sharp tile row */}
        <View style={[styles.quickRow, { flexDirection: rowDirection }]}>
          {QUICK_LINKS.map((link) => (
            <Pressable
              key={link.route}
              onPress={() => {
                haptic.selection();
                navigation.navigate(link.route);
              }}
              style={({ pressed }) => [styles.quickItem, pressed && { transform: [{ scale: 0.97 }] }]}
              accessibilityRole="button"
            >
              <View style={styles.quickTile}>
                <View style={styles.quickIconWedge}>
                  <Icon name={link.icon} size={20} color={colors.primary} />
                </View>
                <Text
                  variant="caption"
                  color={colors.textPrimary}
                  style={styles.quickLabel}
                  numberOfLines={2}
                >
                  {t(link.labelKey)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Clearance status — read-only departmental clearance (Finance doc) */}
        <Pressable
          onPress={() => {
            haptic.selection();
            navigation.navigate('Clearance');
          }}
          style={({ pressed }) => [styles.clearanceRow, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
        >
          <View style={[styles.clearanceInner, { flexDirection: rowDirection }]}>
            <View style={styles.quickIconWedge}>
              <Icon name="document" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                {isAr ? 'حالة إخلاء الطرف' : 'Clearance Status'}
              </Text>
              <Text
                variant="caption"
                color={colors.textSecondary}
                style={{ textAlign, writingDirection, marginTop: 2 }}
              >
                {isAr
                  ? 'حالة الأقسام للتخرج أو الانسحاب'
                  : 'Department status for graduation or withdrawal'}
              </Text>
            </View>
            <Icon
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={colors.chevron}
            />
          </View>
        </Pressable>

        {/* Fee breakdown */}
        <SectionEyebrow label={t('payments.feeDetails')} />
        <View style={styles.list}>
          {(dashboard?.fees?.length ?? 0) > 0 ? (
            dashboard!.fees!.map((fee: any, i: number, arr: any[]) => {
              const isPaid = parseFloat(fee.paid_amount) >= parseFloat(fee.amount);
              const isLast = i === arr.length - 1;
              return (
                <View
                  key={i}
                  style={[
                    styles.row,
                    {
                      flexDirection: rowDirection,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Text
                    variant="bodyBold"
                    style={{ flex: 1, textAlign, writingDirection }}
                    numberOfLines={2}
                  >
                    {localized(fee, 'description')}
                  </Text>
                  <View style={[styles.rowEnd, { alignItems: rightAlign }]}>
                    <Text variant="bodyBold">{formatCurrency(parseFloat(fee.amount), currency)}</Text>
                    <Badge
                      label={isPaid ? t('payments.paid') : t('payments.pending')}
                      variant={isPaid ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.empty}>
              <Text variant="small" color={colors.textTertiary}>
                {t('common.noData')}
              </Text>
            </View>
          )}
        </View>

        {/* Recent payments */}
        <SectionEyebrow label={t('payments.history')} />
        <View style={styles.list}>
          {recentPayments.length > 0 ? (
            recentPayments.map((payment: any, i: number) => {
              const isLast = i === recentPayments.length - 1;
              return (
                <View
                  key={i}
                  style={[
                    styles.row,
                    {
                      flexDirection: rowDirection,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
                      {formatCurrency(parseFloat(payment.amount), currency)}
                    </Text>
                    <Text
                      variant="caption"
                      color={colors.textSecondary}
                      style={{ textAlign, writingDirection, marginTop: 2 }}
                    >
                      {formatDate(new Date(payment.created_at))} · {payment.method || 'KNET'}
                    </Text>
                  </View>
                  <Badge
                    label={payment.status === 'completed' ? t('payments.paid') : t('payments.pending')}
                    variant={payment.status === 'completed' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              );
            })
          ) : (
            <View style={styles.empty}>
              <Text variant="small" color={colors.textTertiary}>
                {t('common.noData')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionEyebrow({ label }: { label: string }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  return (
    <View style={styles.eyebrowWrap}>
      <View style={styles.eyebrowMark} />
      <Text variant="overline" color={colors.textTertiary} style={{ letterSpacing: isAr ? 0 : 1 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  hero: {
    backgroundColor: colors.primaryDeep,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  heroWedge: { position: 'absolute', top: -10 },
  heroEyebrow: { marginBottom: 6 },
  heroAmount: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 44,
    lineHeight: 52,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  heroCTA: { marginTop: spacing.base },
  heroStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  scroll: { padding: spacing.base },

  quickRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  quickItem: { flex: 1 },
  quickTile: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 8,
    minHeight: 84,
  },
  quickIconWedge: {
    width: 38,
    height: 38,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 11, lineHeight: 14, textAlign: 'center' },

  clearanceRow: { marginTop: spacing.sm },
  clearanceInner: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
  },

  eyebrowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    gap: 8,
  },
  eyebrowMark: { width: 12, height: 2, backgroundColor: colors.secondary },

  list: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
    borderBottomColor: colors.divider,
  },
  rowEnd: { gap: 4 },
  empty: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
