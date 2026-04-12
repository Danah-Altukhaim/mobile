import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Button, Badge, ScreenSkeleton, Icon } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { academicApi } from '../../services/api';
import { localized, currentLocale, toLatnDigits, formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

export function PaymentDashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const rightAlign = isRTL ? 'flex-start' : 'flex-end';

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'fees'],
    queryFn: () => academicApi.getFees(),
  });

  if (isLoading) return <ScreenSkeleton />;

  const dashboard = data?.data;
  const currency = dashboard?.currency || 'KWD';
  const locale = currentLocale();
  const formatter = { format: (n: number) => formatCurrency(n, currency) };
  const formatDate = (d: Date) => toLatnDigits(d.toLocaleDateString(locale));

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <View style={styles.header}>
        <Text variant="body" color={colors.textInverse}>{t('payments.balance')}</Text>
        <Text
          variant="h1"
          color={colors.secondary}
          style={[styles.amount, { fontFamily: isRTL ? 'Cairo_400Regular' : 'Montserrat_500Medium' }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {dashboard?.balance_due != null ? formatter.format(dashboard.balance_due) : '—'}
        </Text>
        {dashboard?.next_due_date && (
          <Text variant="caption" color={colors.textInverse}>
            {t('payments.dueDate')}: {formatDate(new Date(dashboard.next_due_date))}
          </Text>
        )}
        <Button
          title={t('payments.payNow')}
          onPress={() => navigation.navigate('PaymentMethod', {
            amount: dashboard?.balance_due ?? 0,
            feeIds: (dashboard?.fees ?? [])
              .filter((f: any) => parseFloat(f.paid_amount ?? 0) < parseFloat(f.amount ?? 0))
              .map((f: any) => f.id),
          })}
          variant="secondary"
          style={styles.payButton}
          disabled={!dashboard?.balance_due || dashboard.balance_due <= 0}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Quick Links */}
        <View style={[styles.quickLinks, { flexDirection: rowDirection }]}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            <View style={styles.quickLinkIcon}>
              <Icon name="payment-history" size={26} color={colors.primary} />
            </View>
            <Text variant="caption" style={styles.quickLinkLabel}>
              {t('payments.history')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('InstallmentPlans')}
          >
            <View style={styles.quickLinkIcon}>
              <Icon name="installment" size={26} color={colors.primary} />
            </View>
            <Text variant="caption" style={styles.quickLinkLabel}>
              {t('payments.installments')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('FinancialAid')}
          >
            <View style={styles.quickLinkIcon}>
              <Icon name="financial-aid" size={26} color={colors.primary} />
            </View>
            <Text variant="caption" style={styles.quickLinkLabel}>
              {t('payments.financialAid')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => navigation.navigate('RefundTracking')}
          >
            <View style={styles.quickLinkIcon}>
              <Icon name="refund" size={26} color={colors.primary} />
            </View>
            <Text variant="caption" style={styles.quickLinkLabel}>
              {t('payments.refunds')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fee Breakdown */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>{t('payments.feeDetails')}</Text>
          {dashboard?.fees?.map((fee: any, i: number) => {
            const isPaid = parseFloat(fee.paid_amount) >= parseFloat(fee.amount);
            return (
              <View key={i} style={[styles.feeRow, { flexDirection: rowDirection }]}>
                <Text variant="body" style={{ textAlign, writingDirection }}>
                  {localized(fee, 'description')}
                </Text>
                <View style={[styles.feeRight, { alignItems: rightAlign }]}>
                  <Text variant="bodyBold">{formatter.format(parseFloat(fee.amount))}</Text>
                  <Badge
                    label={isPaid ? t('payments.paid') : t('payments.pending')}
                    variant={isPaid ? 'success' : 'warning'}
                  />
                </View>
              </View>
            );
          })}
        </Card>

        {/* Payment History */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>{t('payments.history')}</Text>
          {dashboard?.recent_payments?.length > 0 ? (
            dashboard.recent_payments.map((payment: any, i: number) => (
              <View key={i} style={[styles.feeRow, { flexDirection: rowDirection }]}>
                <View>
                  <Text variant="body" style={{ textAlign, writingDirection }}>
                    {formatter.format(parseFloat(payment.amount))}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
                    {formatDate(new Date(payment.created_at))} • {payment.method || 'KNET'}
                  </Text>
                </View>
                <Badge
                  label={payment.status === 'completed' ? t('payments.paid') : t('payments.pending')}
                  variant={payment.status === 'completed' ? 'success' : 'warning'}
                />
              </View>
            ))
          ) : (
            <Text variant="body" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
              {t('common.noData')}
            </Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  amount: {
    fontSize: 40,
    lineHeight: 60,
    marginVertical: spacing.sm,
    includeFontPadding: false,
    paddingTop: 8,
  },
  payButton: { marginTop: spacing.base, width: '100%' },
  scroll: { padding: spacing.base },
  card: { marginBottom: spacing.base },
  sectionTitle: { marginBottom: spacing.sm },
  feeRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  feeRight: { alignItems: 'flex-end', gap: 4 },
  quickLinks: {
    marginBottom: spacing.base,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  quickLinkIcon: {
    marginBottom: spacing.xs,
  },
  quickLinkLabel: {
    textAlign: 'center',
  },
});
