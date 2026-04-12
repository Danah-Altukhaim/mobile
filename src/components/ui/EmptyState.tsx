import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { useColors } from '../../theme/useColors';
import { spacing } from '../../theme/spacing';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'folder-open-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={64} color={colors.border} style={styles.icon} />
      <Text variant="h3" color={colors.textSecondary} style={styles.title}>{title}</Text>
      {message && (
        <Text variant="body" color={colors.textTertiary} style={styles.message}>{message}</Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="outline" style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, minHeight: 200 },
  icon: { marginBottom: spacing.base },
  title: { textAlign: 'center', marginBottom: spacing.xs },
  message: { textAlign: 'center', marginBottom: spacing.base, maxWidth: 280 },
  action: { marginTop: spacing.sm },
});
