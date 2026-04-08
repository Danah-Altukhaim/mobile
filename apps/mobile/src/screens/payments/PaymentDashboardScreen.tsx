import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Card, Button, Badge } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const mockFees = [
  { type: 'الرسوم الدراسية', amount: '١,٠٠٠ د.ك', paid: false },
  { type: 'رسوم المختبر', amount: '١٥٠ د.ك', paid: false },
  { type: 'رسوم التسجيل', amount: '١٠٠ د.ك', paid: true },
];

const mockPayments = [
  { date: '١ مارس ٢٠٢٦', amount: '١,٢٠٠ د.ك', method: 'KNET', status: 'completed' },
  { date: '١ فبراير ٢٠٢٦', amount: '١,٢٠٠ د.ك', method: 'KNET', status: 'completed' },
];

export function PaymentDashboardScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Balance Header */}
      <View style={styles.header}>
        <Text variant="body" color={colors.textInverse}>
          {t('payments.balance')}
        </Text>
        <Text variant="h1" color={colors.secondary} style={styles.amount}>
          ١,٢٥٠ د.ك
        </Text>
        <Text variant="caption" color={colors.textInverse}>
          {t('payments.dueDate')}: ١٥ أبريل ٢٠٢٦
        </Text>
        <Button
          title={t('payments.payNow')}
          onPress={() => {}}
          variant="secondary"
          style={styles.payButton}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Fee Breakdown */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>
            تفاصيل الرسوم
          </Text>
          {mockFees.map((fee, i) => (
            <View key={i} style={styles.feeRow}>
              <Text variant="body">{fee.type}</Text>
              <View style={styles.feeRight}>
                <Text variant="bodyBold">{fee.amount}</Text>
                <Badge
                  label={fee.paid ? t('payments.paid') : t('payments.pending')}
                  variant={fee.paid ? 'success' : 'warning'}
                />
              </View>
            </View>
          ))}
        </Card>

        {/* Payment History */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h3" style={styles.sectionTitle}>
            {t('payments.history')}
          </Text>
          {mockPayments.map((payment, i) => (
            <View key={i} style={styles.feeRow}>
              <View>
                <Text variant="body">{payment.amount}</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {payment.date} • {payment.method}
                </Text>
              </View>
              <Badge label={t('payments.paid')} variant="success" />
            </View>
          ))}
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
  amount: { fontSize: 40, marginVertical: spacing.sm },
  payButton: { marginTop: spacing.base, width: '100%' },
  scroll: { padding: spacing.base },
  card: { marginBottom: spacing.base },
  sectionTitle: { marginBottom: spacing.sm },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  feeRight: { alignItems: 'flex-end', gap: 4 },
});
