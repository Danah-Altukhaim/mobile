import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';

type Tone = 'neutral' | 'success' | 'warning' | 'info' | 'error';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: Tone;
}

export function EmptyState({
  icon = 'document',
  title,
  message,
  actionLabel,
  onAction,
  tone = 'neutral',
}: EmptyStateProps) {
  const colors = useColors();
  const t = {
    neutral: { wash: colors.primaryWash, ring: colors.primary, fg: colors.primary },
    success: { wash: colors.successWash, ring: colors.success, fg: colors.success },
    warning: { wash: colors.warningWash, ring: colors.warning, fg: colors.warning },
    info:    { wash: colors.infoWash, ring: colors.info, fg: colors.info },
    error:   { wash: colors.errorWash, ring: colors.error, fg: colors.error },
  }[tone];

  return (
    <View style={styles.container}>
      {/* Stacked geometric mark — outer wash square + inner solid wedge */}
      <View style={[styles.iconWedge, { backgroundColor: t.wash }]} importantForAccessibility="no-hide-descendants">
        <View style={[styles.iconCore, { backgroundColor: colors.surface }]}>
          <Icon name={icon} size={28} color={t.fg} />
        </View>
      </View>
      <Text variant="h3" color={colors.textPrimary} style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {message && (
        <Text variant="body" color={colors.textSecondary} style={styles.message}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="compact"
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 240,
  },
  iconWedge: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    transform: [{ rotate: '8deg' }],
  },
  iconCore: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  title: { textAlign: 'center', marginBottom: 6 },
  message: { textAlign: 'center', marginBottom: spacing.base, maxWidth: 300 },
  action: { marginTop: spacing.sm },
});
