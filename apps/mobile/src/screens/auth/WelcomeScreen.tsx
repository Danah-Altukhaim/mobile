import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';

export function WelcomeScreen() {
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = () => {
    // Mock SSO login for development
    setAuth(
      {
        id: 'student-001',
        university_id: 'uni-001',
        role: 'student',
        email: 'noura@gust.edu.kw',
        name_ar: 'نورة الصباح',
        name_en: 'Noura Al-Sabah',
      },
      {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 900,
      },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" color={colors.textInverse} style={styles.title}>
          مساري
        </Text>
        <Text variant="h3" color={colors.secondary}>
          Masari
        </Text>
      </View>

      <View style={styles.content}>
        <Text variant="h2" style={styles.welcome}>
          {t('auth.welcome')}
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          {t('auth.subtitle')}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title={t('auth.ssoLogin')} onPress={handleLogin} variant="primary" />
        <Button
          title={t('auth.getStarted')}
          onPress={handleLogin}
          variant="outline"
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    fontSize: 48,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  welcome: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
  },
  secondaryButton: {
    marginTop: spacing.md,
  },
});
