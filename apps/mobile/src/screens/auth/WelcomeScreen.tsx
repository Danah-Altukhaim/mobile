import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text, Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../services/api/auth.api';
import { apiClient } from '../../services/api/client';
import { changeLanguage } from '../../i18n';
import { useDirection } from '../../hooks/useDirection';

export function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const { isRTL } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const isArabic = i18n.language === 'ar';
  const toggleLanguage = () => {
    changeLanguage(isArabic ? 'en' : 'ar');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // In production: initiate SSO flow → redirect → callback
      // For dev: simulate SSO callback with the seeded student
      const response = await authApi.ssoCallback('noura@cck.edu.kw', 'gust');

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
          email: 'noura@cck.edu.kw',
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
      {/* Language toggle */}
      <TouchableOpacity style={[styles.langToggle, { flexDirection: rowDirection, [isRTL ? 'left' : 'right']: 20 }]} onPress={toggleLanguage}>
        <Text
          style={[styles.langOption, !isArabic && styles.langActive]}
          color={!isArabic ? colors.primary : colors.textTertiary}
        >
          EN
        </Text>
        <Text style={styles.langDivider} color={colors.textTertiary}> | </Text>
        <Text
          style={[styles.langOption, isArabic && styles.langActive]}
          color={isArabic ? colors.primary : colors.textTertiary}
        >
          {isArabic ? 'عربي' : 'AR'}
        </Text>
      </TouchableOpacity>
      {/* Hero header — CCK Green */}
      <View style={styles.header}>
        <View style={styles.logoMark}>
          {isArabic ? (
            <>
              <Text style={styles.logoAr} color={colors.textInverse}>
                مساري
              </Text>
              <Text style={styles.logoEn} color={colors.secondary}>
                Masari
              </Text>
            </>
          ) : (
            <Text style={styles.logoEnLarge} color={colors.textInverse}>
              Masari
            </Text>
          )}
          <View style={styles.wordmarkBar} />
        </View>
        {/* Decorative haze circle */}
        <View style={styles.decorCircle} />
        {/* Canadian maple-leaf accent stripe */}
        <View style={styles.headerRedStripe} />
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
          size="large"
          loading={loading}
          style={styles.loginBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, position: 'relative' as const },
  langToggle: {
    position: 'absolute' as const,
    top: 56,
    zIndex: 10,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  langOption: { fontFamily: 'Almarai_700Bold', fontSize: 14 },
  langActive: { fontFamily: 'Almarai_700Bold' },
  langDivider: { fontSize: 14 },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 100,
    paddingBottom: 52,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerRedStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: colors.brandRed,
  },
  wordmarkBar: {
    width: 64,
    height: 3,
    marginTop: 10,
    backgroundColor: colors.brandRed,
    borderRadius: 2,
  },
  logoMark: { alignItems: 'center', zIndex: 1 },
  logoAr: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 52,
    lineHeight: 64,
    letterSpacing: 0,
  },
  logoEn: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 18,
    letterSpacing: 4,
    marginTop: -4,
  },
  logoEnLarge: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 52,
    lineHeight: 64,
    letterSpacing: 4,
  },
  decorCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#76B82A',
    opacity: 0.12,
    top: -60,
    right: -60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  welcome: { textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { textAlign: 'center' },
  actions: { paddingHorizontal: spacing.xl, paddingBottom: 52 },
  loginBtn: { width: '100%' },
});
