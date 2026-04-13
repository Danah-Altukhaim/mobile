import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Text, Card, Button, Icon } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { paymentApi } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function PaymentConfirmationScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const { paymentId } = route.params;

  const receiptMutation = useMutation({
    mutationFn: () => paymentApi.getReceipt(paymentId),
    onSuccess: (data) => {
      const url = data?.data?.receipt_url || data?.data?.pdf_url || paymentId;
      Alert.alert(t('payments.receiptReady'), `Ref: ${url}`);
    },
    onError: () => {
      Alert.alert(t('common.error'), t('common.retry'));
    },
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
        <Icon name="check" size={40} color={colors.textInverse} />
      </View>

      <Text variant="h2" color={colors.success} style={styles.title}>
        {t('payments.paymentSuccess')}
      </Text>

      <Card elevation="md" style={styles.card}>
        <View style={[styles.row, { flexDirection: rowDirection }]}>
          <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{t('payments.transactionRef')}</Text>
          <Text variant="body" color={colors.textPrimary} style={{ textAlign, writingDirection }}>{paymentId}</Text>
        </View>
        <View style={[styles.row, { flexDirection: rowDirection }]}>
          <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{t('payments.dueDate')}</Text>
          <Text variant="body" color={colors.textPrimary} style={{ textAlign, writingDirection }}>
            {new Date().toLocaleDateString('ar-KW')}
          </Text>
        </View>
      </Card>

      <Button
        title={t('payments.downloadReceipt')}
        onPress={() => receiptMutation.mutate()}
        variant="outline"
        style={styles.button}
        loading={receiptMutation.isPending}
      />

      <Button
        title={t('payments.backToDashboard')}
        onPress={() => navigation.navigate('PaymentDashboard')}
        style={styles.button}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100, alignItems: 'center' },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['3xl'],
    marginBottom: spacing.xl,
  },
  title: { marginBottom: spacing.xl, textAlign: 'center' },
  card: { width: '100%', marginBottom: spacing.xl },
  row: { justifyContent: 'space-between', paddingVertical: spacing.sm },
  button: { width: '100%', marginBottom: spacing.md },
});
