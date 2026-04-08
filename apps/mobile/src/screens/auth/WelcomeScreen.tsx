import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../services/api/auth.api';
import { apiClient } from '../../services/api/client';

export function WelcomeScreen() {
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // In production: initiate SSO flow → redirect → callback
      // For dev: simulate SSO callback with the seeded student
      const response = await authApi.ssoCallback('noura@gust.edu.kw', 'gust');

      if (response.success && response.data) {
        const { access_token, refresh_token, expires_in, user } = response.data;
        apiClient.setAccessToken(access_token);
        setAuth(
          {
            id: user.id,
            university_id: user.university_id,
            role: user.role as any,
            email: user.email,
            name_ar: user.name_ar,
            name_en: user.name_en,
          },
          { access_token, refresh_token, expires_in },
        );
      }
    } catch (error: any) {
      // Fallback to mock auth if backend is not running
      console.log('Backend not available, using mock auth:', error.message);
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
    } finally {
      setLoading(false);
    }
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
        <Button
          title={t('auth.ssoLogin')}
          onPress={handleLogin}
          variant="primary"
          loading={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: { fontSize: 48, marginBottom: 4 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  welcome: { textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { textAlign: 'center' },
  actions: { paddingHorizontal: spacing.xl, paddingBottom: 48 },
});
