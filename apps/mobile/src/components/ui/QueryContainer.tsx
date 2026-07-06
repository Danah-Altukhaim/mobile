import React, { ReactNode } from 'react';
import { RefreshControl, ScrollView, View, StyleSheet } from 'react-native';
import { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScreenSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';

interface QueryContainerProps {
  query: UseQueryResult<any, any>;
  children: ReactNode;
  emptyIcon?: IconName;
  emptyTitle?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  scrollable?: boolean;
}

export function QueryContainer({
  query,
  children,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  isEmpty = false,
  scrollable = false,
}: QueryContainerProps) {
  const colors = useColors();
  const { t } = useTranslation();

  if (query.isLoading && !query.data) {
    return <ScreenSkeleton />;
  }

  if (query.isError && !query.data) {
    return (
      <View style={styles.errorContainer}>
        <View style={[styles.errorIconWrap, { backgroundColor: colors.brandRedWash }]}>
          <Icon name="cloud-offline" size={36} color={colors.error} />
        </View>
        <Text variant="h3" color={colors.textPrimary} style={styles.errorTitle}>
          {t('common.connectionError')}
        </Text>
        <Text variant="body" color={colors.textTertiary} style={styles.errorMessage}>
          {query.error?.message || t('common.couldNotLoad')}
        </Text>
        <Button title={t('common.tryAgain')} onPress={() => query.refetch()} variant="primary" />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle || t('common.noData')}
        message={emptyMessage}
        actionLabel={query.isError ? t('common.tryAgain') : undefined}
        onAction={query.isError ? () => query.refetch() : undefined}
      />
    );
  }

  if (scrollable) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {children}
      </ScrollView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  errorIconWrap: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  errorTitle: { marginBottom: spacing.xs, textAlign: 'center' },
  errorMessage: { marginBottom: spacing.xl, textAlign: 'center', maxWidth: 280 },
});
