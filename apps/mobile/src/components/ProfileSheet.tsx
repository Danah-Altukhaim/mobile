import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { haptic } from '../utils/haptics';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Text, Icon, BottomSheet, Triangle, type IconName } from './ui';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { useAuthStore } from '../store/auth.store';
import { useProfileSheet } from '../store/profile-sheet.store';
import { useDirection } from '../hooks/useDirection';
import { academicApi } from '../services/api';
import { localized, toLatnDigits } from '../i18n/helpers';

export function ProfileSheet() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const visible = useProfileSheet((s) => s.visible);
  const close = useProfileSheet((s) => s.close);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { isRTL, textAlign, writingDirection } = useDirection();
  const isAr = i18n.language === 'ar';
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const { data: summary } = useQuery({
    queryKey: ['student', 'summary'],
    queryFn: () => academicApi.getStudentSummary(),
  });

  const student = summary?.data?.student;
  const term = summary?.data?.current_term;
  const nameEn = user?.name_en || student?.name_en || '';
  const nameAr = user?.name_ar || student?.name_ar || '';
  const primaryName = isAr ? nameAr : nameEn;
  const secondaryName = isAr ? nameEn : nameAr;
  const initials = (primaryName || 'C')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('');

  const studentNumber = student?.student_number || '—';
  const cohort = student?.cohort_year ? toLatnDigits(String(student.cohort_year)) : '—';
  const gpa = student?.gpa_cumulative != null ? Number(student.gpa_cumulative).toFixed(2) : '—';
  const major = student ? localized(student, 'major_name') : '';
  const fundingType = user?.funding_type || student?.funding_type;
  const fundingShort = fundingType
    ? (fundingType === 'puc'
        ? 'PUC'
        : fundingType === 'self'
          ? (isAr ? 'ذاتي' : 'Self')
          : t(`profile.fundingTypes.${fundingType}`))
    : '—';

  const goTo = (route: string, params?: object) => {
    close();
    setTimeout(() => navigation.navigate('Account', { screen: route, params }), 80);
  };

  const handleLogout = () => {
    haptic.warning();
    close();
    setTimeout(() => clearAuth(), 80);
  };

  return (
    <BottomSheet visible={visible} onClose={close} style={styles.sheet}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Digital CCK Student ID Card */}
        <View style={styles.idCard}>
          <Image
            source={require('../../assets/cck-logo.png')}
            style={[styles.watermark, isRTL ? { left: -32 } : { right: -32 }]}
            resizeMode="contain"
          />
          <View style={[styles.idHeader, { flexDirection: rowDirection }]}>
            <View style={styles.idMapleSquare} />
            <Text variant="overline" color="rgba(255,255,255,0.85)">
              {isAr ? 'بطاقة طالب · CCK' : 'Student ID · CCK'}
            </Text>
          </View>

          <View style={[styles.idBody, { flexDirection: rowDirection }]}>
            <View style={styles.idAvatar}>
              <Text style={styles.idAvatarInitials} color={colors.textInverse}>
                {initials}
              </Text>
            </View>
            <View style={styles.idNames}>
              <Text
                variant="h3"
                color={colors.textInverse}
                numberOfLines={1}
                style={[styles.idPrimaryName, { textAlign, writingDirection }]}
              >
                {primaryName}
              </Text>
              {!!secondaryName && (
                <Text
                  variant="small"
                  color="rgba(255,255,255,0.78)"
                  numberOfLines={1}
                  style={[{ textAlign, writingDirection, marginTop: 2 }]}
                >
                  {secondaryName}
                </Text>
              )}
              {!!major && (
                <Text
                  variant="caption"
                  color={colors.secondaryLight}
                  numberOfLines={1}
                  style={[{ textAlign, writingDirection, marginTop: 6 }]}
                >
                  {major}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.idFooter, { flexDirection: rowDirection }]}>
            <View style={styles.idMeta}>
              <Text variant="overline" color="rgba(255,255,255,0.65)">
                {t('profile.studentId')}
              </Text>
              <Text style={styles.idNumber} color={colors.textInverse}>
                {toLatnDigits(studentNumber)}
              </Text>
            </View>
            <View style={[styles.idMeta, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
              <Text variant="overline" color="rgba(255,255,255,0.65)">
                {t('profile.cohort')}
              </Text>
              <Text style={styles.idNumber} color={colors.textInverse}>
                {cohort}
              </Text>
            </View>
          </View>

          <View style={styles.idStripe} />
        </View>

        {/* Stat tiles */}
        <View style={[styles.statRow, { flexDirection: rowDirection }]}>
          <StatTile label={t('profile.statGpa')} value={gpa} accent={colors.primary} />
          <StatTile
            label={t('profile.statTerm')}
            value={
              term
                ? toLatnDigits(localized(term, 'name').replace(/Semester|الفصل الدراسي/g, '').trim())
                : '—'
            }
            accent={colors.secondary}
            small
          />
          <StatTile label={t('profile.statFunding')} value={fundingShort} accent={colors.brandRed} />
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <SheetMenuItem
            icon="payments"
            label={t('payments.title')}
            onPress={() => goTo('PaymentDashboard')}
          />
          <SheetMenuItem
            icon="settings"
            label={t('profile.settings')}
            onPress={() => goTo('Settings')}
            isLast
          />
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [
            styles.logout,
            { flexDirection: rowDirection, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t('profile.logout')}
        >
          <Icon name="logout" size={16} color={colors.brandRed} />
          <Text variant="bodyBold" color={colors.brandRed} style={{ textAlign, writingDirection }}>
            {t('profile.logout')}
          </Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

function StatTile({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent: string;
  small?: boolean;
}) {
  const { textAlign, writingDirection } = useDirection();
  return (
    <View style={styles.statTile}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text variant="overline" color={colors.textSecondary} style={{ textAlign, writingDirection }}>
        {label}
      </Text>
      <Text
        style={[small ? styles.statValueSmall : styles.statValue, { textAlign, writingDirection }]}
        color={colors.textPrimary}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function SheetMenuItem({
  icon,
  label,
  onPress,
  isLast,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const { isRTL, textAlign, writingDirection } = useDirection();
  const rowDirection = isRTL ? 'row-reverse' : 'row';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        {
          flexDirection: rowDirection,
          opacity: pressed ? 0.7 : 1,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
      onPress={() => {
        haptic.selection();
        onPress();
      }}
      accessibilityRole="button"
    >
      <View style={[styles.menuItemLeft, { flexDirection: rowDirection }]}>
        <View style={styles.menuIcon}>
          <Icon name={icon} size={16} color={colors.primary} />
        </View>
        <Text variant="bodyBold" style={{ textAlign, writingDirection }}>
          {label}
        </Text>
      </View>
      <Triangle size={7} color={colors.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 0,
    paddingBottom: spacing.xl,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // ID Card
  idCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: 0,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  watermark: {
    position: 'absolute',
    top: -28,
    width: 200,
    height: 200,
    opacity: 0.07,
  },
  idHeader: {
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    gap: 8,
  },
  idMapleSquare: {
    width: 8,
    height: 8,
    backgroundColor: colors.brandRed,
  },
  idBody: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.base,
  },
  idAvatar: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idAvatarInitials: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 24,
    includeFontPadding: false,
  },
  idNames: {
    flex: 1,
    minWidth: 0,
  },
  idPrimaryName: {
    fontFamily: 'Almarai_800ExtraBold',
  },
  idFooter: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  idMeta: {
    gap: 2,
  },
  idNumber: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 18,
    letterSpacing: 1.5,
  },
  idStripe: {
    height: 3,
    backgroundColor: colors.brandRed,
    marginHorizontal: -spacing.lg,
  },

  // Stats
  statRow: {
    marginTop: spacing.base,
    gap: spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    overflow: 'hidden',
    minWidth: 0,
  },
  statAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    start: 0,
    width: 3,
  },
  statValue: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 22,
    marginTop: 4,
  },
  statValueSmall: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 14,
    marginTop: 4,
  },

  // Menu
  menu: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: colors.divider,
  },
  menuItemLeft: {
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logout
  logout: {
    marginTop: spacing.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandRedWash,
    backgroundColor: colors.brandRedTint,
  },
});
