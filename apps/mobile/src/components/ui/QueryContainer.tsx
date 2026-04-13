import React, { ReactNode } from 'react';
import { RefreshControl, ScrollView, View, StyleSheet } from 'react-native';
import { UseQueryResult } from '@tanstack/react-query';
import { ScreenSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { Text } from './Text';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface QueryContainerProps {
  query: UseQueryResult<any, any>;
  children: ReactNode;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  scrollable?: boolean;
}

export function QueryContainer({
  query,
  children,
  emptyIcon,
  emptyTitle = 'No data available',
  emptyMessage,
  isEmpty = false,
  scrollable = false,
}: QueryContainerProps) {
  const colors = useColors();

  if (query.isLoading && !query.data) {
    return <ScreenSkeleton />;
  }

  if (query.isError && !query.data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="cloud-offline-outline" size={64} color={colors.error} />
        <Text variant="h3" color={colors.textSecondary} style={styles.errorTitle}>
          Connection Error
        </Text>
        <Text variant="body" color={colors.textTertiary} style={styles.errorMessage}>
          {query.error?.message || 'Could not load data. Please check your connection.'}
        </Text>
        <Button title="Retry" onPress={() => query.refetch()} variant="primary" />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={query.isError ? 'Retry' : undefined}
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
  errorTitle: { marginTop: spacing.base, marginBottom: spacing.xs, textAlign: 'center' },
  errorMessage: { marginBottom: spacing.xl, textAlign: 'center', maxWidth: 280 },
});
