import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Text, Card, Badge, Button, Select, ScreenSkeleton } from '../../components/ui';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { useUIStore } from '../../store/ui.store';
import { API_PATHS } from '@masari/shared';
import { apiClient } from '../../services/api';
import { useDirection } from '../../hooks/useDirection';

export function TranscriptRequestScreen() {
  const { t } = useTranslation();
  const locale = useUIStore((s) => s.locale);
  const colors = useColors();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  const [type, setType] = useState('official');

  const { data, isLoading } = useQuery({
    queryKey: ['transcript-requests'],
    queryFn: () => apiClient.get<any[]>(API_PATHS.TRANSCRIPT_REQUESTS),
  });

  const mutation = useMutation({
    mutationFn: () => apiClient.post(API_PATHS.TRANSCRIPT_REQUEST, { type, copies: 1, delivery: 'email' }),
  });

  if (isLoading) return <ScreenSkeleton />;
  const requests = Array.isArray(data?.data) ? data.data : [];

  const statusVariants = { ready: 'success', processing: 'warning' } as const;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="h2" style={[styles.title, { textAlign, writingDirection }]}>{t('academics.transcriptRequest')}</Text>

      <Card elevation="md" style={styles.card}>
        <Select
          label={t('common.status')}
          options={[
            { label: t('academics.official'), value: 'official' },
            { label: t('academics.unofficial'), value: 'unofficial' },
          ]}
          value={type}
          onChange={setType}
        />
        <Button
          title={t('academics.requestTranscript')}
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          style={styles.button}
        />
        {mutation.isSuccess && (
          <Text variant="body" color={colors.success} style={styles.success}>
            {t('academics.processing')}
          </Text>
        )}
      </Card>

      {requests.length > 0 && (
        <Text variant="bodyBold" style={styles.sectionTitle}>{t('payments.history')}</Text>
      )}
      {requests.map((req: any, i: number) => {
        const dateStr = new Date(req.requested_at).toLocaleDateString(
          locale === 'ar' ? 'ar-KW' : 'en-KW', { month: 'short', day: 'numeric', year: 'numeric' },
        );
        return (
          <Card key={i} elevation="sm" style={styles.card}>
            <View style={[styles.row, { flexDirection: rowDirection }]}>
              <View>
                <Text variant="body" style={{ textAlign, writingDirection }}>{t(`academics.${req.type}`)} • {req.copies} {t('academics.copies')}</Text>
                <Text variant="caption" color={colors.textSecondary} style={{ textAlign, writingDirection }}>{dateStr}</Text>
              </View>
              <Badge label={t(`academics.${req.status}`)} variant={statusVariants[req.status as keyof typeof statusVariants] || 'neutral'} />
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.base, paddingBottom: 100 },
  title: { marginBottom: spacing.base },
  card: { marginBottom: spacing.md },
  button: { marginTop: spacing.base },
  success: { marginTop: spacing.sm, textAlign: 'center' },
  sectionTitle: { marginBottom: spacing.sm, marginTop: spacing.base },
  row: { justifyContent: 'space-between', alignItems: 'center' },
});
