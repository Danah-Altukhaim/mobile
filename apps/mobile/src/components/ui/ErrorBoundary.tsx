import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';
import { useColors } from '../../theme/useColors';
import { spacing, borderRadius } from '../../theme/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  resetKey: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleRetry = () => {
    this.setState((s) => ({ hasError: false, error: undefined, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return <View key={this.state.resetKey} style={{ flex: 1 }}>{this.props.children}</View>;
  }
}

function ErrorFallback({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.brandRedWash }]}>
          <Icon name="warning" size={36} color={colors.error} />
        </View>
        <Text variant="h2" color={colors.textPrimary} style={styles.title}>
          {t('common.somethingWentWrong')}
        </Text>
        <Text variant="body" color={colors.textTertiary} style={styles.message}>
          {error?.message || t('common.unexpectedError')}
        </Text>
        <Button title={t('common.tryAgain')} onPress={onRetry} variant="primary" icon="refresh" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  content: { alignItems: 'center', maxWidth: 320 },
  iconWrap: {
    width: 80, height: 80, borderRadius: borderRadius.xl,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: { marginBottom: spacing.sm, textAlign: 'center' },
  message: { marginBottom: spacing.xl, textAlign: 'center' },
});
