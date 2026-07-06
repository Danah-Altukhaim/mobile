import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Easing,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Text, Icon, Triangle } from '../../components/ui';
import { LanguageToggle } from '../../components/common/LanguageToggle';
import { GeometricPattern } from '../../components/common/GeometricPattern';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../services/api/auth.api';
import { apiClient } from '../../services/api/client';

export function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const isArabic = i18n.language === 'ar';

  // Single staged entrance — fewer moving parts, more weight.
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const fadeUp = (delay = 0) => ({
    opacity: enter.interpolate({
      inputRange: [0, Math.min(0.999, delay), 1],
      outputRange: [0, 0, 1],
    }),
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, Math.min(0.999, delay), 1],
          outputRange: [16, 16, 0],
        }),
      },
    ],
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
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
            funding_type: (user as any).funding_type ?? null,
          },
          { access_token, refresh_token, expires_in },
        );
      }
    } catch {
      setAuth(
        {
          id: 'student-001',
          university_id: 'uni-001',
          role: 'student',
          email: 'noura@cck.edu.kw',
          name_ar: 'نورة الصباح',
          name_en: 'Noura Al-Sabah',
          funding_type: 'puc',
        },
        { access_token: 'mock-jwt-token', refresh_token: 'mock-refresh-token', expires_in: 900 },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Calm solid CCK Green field — no stacked gradients */}
      <View style={styles.fill} />

      {/* ONE confident brand moment — large oblique wedge from top-right */}
      <GeometricPattern
        variant="cornerWedge"
        width={460}
        height={420}
        tone="light"
        opacity={0.08}
        style={styles.wedge}
      />

      {/* Lime accent stripe diagonal — book motif, used once */}
      <View style={styles.limeStripe} />

      {/* Top: brand mark + lang toggle */}
      <View style={[styles.topRow, { paddingTop: insets.top + 14 }]}>
        <View style={styles.brandRow}>
          <View style={styles.mapleSquare} />
          <Text variant="overline" color={colors.secondaryLight}>
            CCK
          </Text>
        </View>
        <LanguageToggle />
      </View>

      {/* Centerpiece */}
      <View style={styles.center}>
        <Animated.View style={[fadeUp(0), styles.logoLockup]}>
          <View style={styles.logoCard}>
            <Image
              source={require('../../../assets/cck-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.View style={[fadeUp(0.2), styles.identityBlock]}>
          <Text style={styles.wordmark} color={colors.textInverse}>
            CCK Hub
          </Text>
          <Text variant="small" color={colors.secondaryLight} style={styles.tagline}>
            {isArabic ? 'الكلية الكندية في الكويت' : 'Canadian College of Kuwait'}
          </Text>
        </Animated.View>

        <Animated.View style={[fadeUp(0.45), styles.welcomeBlock]}>
          <Text variant="h2" color={colors.textInverse} style={styles.welcomeTitle}>
            {t('auth.welcome')}
          </Text>
          <Text variant="body" color="rgba(255,255,255,0.78)" style={styles.welcomeSubtitle}>
            {t('auth.subtitle')}
          </Text>
        </Animated.View>
      </View>

      {/* CTA */}
      <Animated.View
        style={[
          fadeUp(0.6),
          styles.ctaBlock,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.cta,
            pressed && { transform: [{ scale: 0.985 }] },
            loading && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('auth.ssoLogin')}
        >
          {loading ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Text variant="button" color={colors.textInverse} style={styles.ctaText}>
                {t('auth.ssoLogin')}
              </Text>
              <View style={styles.ctaArrow}>
                <Triangle size={9} color={colors.brandRed} />
              </View>
            </>
          )}
        </Pressable>
        <Text variant="caption" color="rgba(255,255,255,0.55)" style={styles.ctaHint}>
          {isArabic
            ? 'تسجيل دخول آمن عبر بريد كلية الخليج'
            : 'Secure SSO via your CCK email'}
        </Text>
      </Animated.View>

      {/* Canadian-red microline */}
      <View style={styles.bottomStripe} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDeep },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDeep,
  },

  wedge: {
    position: 'absolute',
    top: -80,
    right: -80,
  },
  // Diagonal lime stripe — single brand-book accent
  limeStripe: {
    position: 'absolute',
    top: '32%',
    left: -60,
    width: 300,
    height: 6,
    backgroundColor: colors.secondary,
    opacity: 0.85,
    transform: [{ rotate: '-12deg' }],
  },

  topRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapleSquare: {
    width: 8,
    height: 8,
    backgroundColor: colors.brandRed,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  logoLockup: {
    alignItems: 'center',
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 10,
  },
  logo: {
    width: 84,
    height: 84,
  },

  identityBlock: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  wordmark: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 1.5,
  },
  tagline: {
    marginTop: 6,
    opacity: 0.95,
  },

  welcomeBlock: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  welcomeTitle: {
    textAlign: 'center',
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  ctaBlock: {
    paddingHorizontal: spacing.xl,
  },
  cta: {
    height: 58,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    shadowColor: '#76B82A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaText: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 16,
  },
  ctaArrow: {
    position: 'absolute',
    right: spacing.lg,
  },
  ctaHint: {
    textAlign: 'center',
    marginTop: spacing.md,
  },

  bottomStripe: {
    height: 4,
    backgroundColor: colors.brandRed,
  },
});
