import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Text, Card, Badge, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useLocalizedField } from '../../hooks/useLocale';
import { paymentApi } from '../../services/api';
import { formatCurrency } from '../../i18n/helpers';
import { useDirection } from '../../hooks/useDirection';

export function FinancialAidScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const l = useLocalizedField();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data, isLoading } = useQuery({
    queryKey: ['financial-aid'],
    queryFn: () => paymentApi.getFinancialAid(),
  });

  if (isLoading) return <ScreenSkeleton />;
  const aids = Array.isArray(data?.data) ? data.data : [];

  const statusVariants = { active: 'success', pending_documents: 'warning' } as const;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="h2" style={styles.title}>{t('payments.financialAid')}</Text>

      {aids.map((aid: any) => {
        const amount = formatCurrency(aid.amount, aid.currency || 'KWD');

        return (
          <Card key={aid.id} elevation="md" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <Text variant="bodyBold" style={{ textAlign, writingDirection }}>{l(aid, 'name')}</Text>
              <Badge label={t(`payments.${aid.status === 'pending_documents' ? 'pendingDocuments' : 'active'}`)} variant={statusVariants[aid.status as keyof typeof statusVariants] || 'neutral'} />
            </View>
            <Text variant="h3" color={colors.primary} style={[styles.amount, { textAlign, writingDirection }]}>{amount}</Text>
            <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{aid.semester}</Text>
            {aid.missing_documents?.length > 0 && (
              <View style={styles.docs}>
                <Text variant="caption" color={colors.warning} style={{ textAlign, writingDirection }}>{t('payments.missingDocuments')}:</Text>
                {aid.missing_documents.map((doc: string, i: number) => (
                  <Text key={i} variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>• {doc}</Text>
                ))}
              </View>
            )}
          </Card>
        );
      })}

      {aids.length === 0 && (
        <Text variant="body" color={colors.textSecondary} style={styles.empty}>{t('common.emptyPayments')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.md },
  row: { justifyContent: 'space-between', alignItems: 'center' },
  amount: { marginVertical: spacing.sm },
  docs: { marginTop: spacing.sm },
  empty: { textAlign: 'center', marginTop: spacing.xl },
});
