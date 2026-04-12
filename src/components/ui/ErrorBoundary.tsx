import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { spacing } from '../../theme/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text variant="h2" style={styles.title}>Something went wrong</Text>
            <Text variant="body" style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button title="Try Again" onPress={this.handleRetry} variant="primary" />
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  content: { alignItems: 'center', maxWidth: 300 },
  title: { marginBottom: spacing.sm, textAlign: 'center' },
  message: { marginBottom: spacing.xl, textAlign: 'center', opacity: 0.7 },
});
