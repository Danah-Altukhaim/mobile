import React, { ReactNode } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from './ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useDirection } from '../hooks/useDirection';
import { GeometricPattern } from './common/GeometricPattern';
import { useAuthStore } from '../store/auth.store';
import { useProfileSheet } from '../store/profile-sheet.store';
import { dateLocale, toLatnDigits } from '../i18n/helpers';
import { haptic } from '../utils/haptics';

interface ScreenHeaderProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  showDate?: boolean;
  hideAvatar?: boolean;
  children?: ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  showDate = false,
  hideAvatar = false,
  children,
  style,
  compact = false,
}: ScreenHeaderProps) {
  const { i18n } = useTranslation();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const openSheet = useProfileSheet((s) => s.open);
  const isAr = i18n.language === 'ar';
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const displayName = isAr ? user?.name_ar : user?.name_en;
  const initials = (displayName || 'C')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('');

  let dateNode: ReactNode = null;
  if (showDate) {
    const now = new Date();
    const hijri = toLatnDigits(
      new Intl.DateTimeFormat(dateLocale('islamic-umalqura'), {
        day: 'numeric',
        month: 'long',
      }).format(now),
    );
    const greg = toLatnDigits(
      new Intl.DateTimeFormat(dateLocale('gregory'), { day: 'numeric', month: 'short' }).format(now),
    );
    dateNode = (
      <View style={[styles.dateBadge, { flexDirection: rowDirection }]}>
        <Text variant="caption" color={colors.textInverse}>
          {hijri}
        </Text>
        <View style={styles.dateBadgeDot} />
        <Text variant="caption" color={colors.secondaryLight}>
          {greg}
        </Text>
      </View>
    );
  }

  const topPad = insets.top + (compact ? 8 : 14);

  return (
    <View
      style={[
        compact ? styles.headerCompact : styles.header,
        { paddingTop: topPad },
        style,
      ]}
    >
      <StatusBar style="light" />

      {/* Single corner wedge — only brand decoration */}
      <GeometricPattern
        variant="cornerWedge"
        width={220}
        height={180}
        tone="light"
        opacity={0.08}
        style={[
          styles.cornerAccent,
          isRTL ? { left: -12, transform: [{ scaleX: -1 }] } : { right: -12 },
        ]}
      />

      {/* Leading red maple bar */}
      <View style={[styles.mapleBar, isRTL ? { right: 0 } : { left: 0 }]} />

      <View style={[styles.topRow, { flexDirection: rowDirection }]}>
        {!hideAvatar && (
          <Pressable
            onPress={() => {
              haptic.light();
              openSheet();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials} color={colors.textInverse}>
                {initials}
              </Text>
            </View>
          </Pressable>
        )}
        <View style={[styles.dateSlot, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
          {dateNode}
        </View>
      </View>

      <View style={styles.body}>
        {!!eyebrow && (
          <Text
            variant="overline"
            color={colors.secondaryLight}
            style={[
              styles.eyebrow,
              { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 },
            ]}
          >
            {eyebrow}
          </Text>
        )}
        {!!title && (
          <Text
            variant="h1"
            color={colors.textInverse}
            numberOfLines={2}
            accessibilityRole="header"
            style={[styles.title, { textAlign, writingDirection }]}
          >
            {title}
          </Text>
        )}
        {!!subtitle && (
          <Text
            variant="small"
            color="rgba(255,255,255,0.78)"
            numberOfLines={2}
            style={[styles.subtitle, { textAlign, writingDirection }]}
          >
            {subtitle}
          </Text>
        )}
        {children}
      </View>

      {/* Canadian-red microline */}
      <View style={styles.redStripe} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primaryDeep,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  headerCompact: {
    backgroundColor: colors.primaryDeep,
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  cornerAccent: {
    position: 'absolute',
    top: -10,
  },
  mapleBar: {
    position: 'absolute',
    top: 0,
    width: 3,
    height: 64,
    backgroundColor: colors.brandRed,
  },
  redStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: colors.brandRed,
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    gap: spacing.sm,
  },
  dateSlot: {
    flex: 1,
    justifyContent: 'center',
  },
  dateBadge: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    gap: spacing.sm,
  },
  dateBadgeDot: {
    width: 3,
    height: 3,
    backgroundColor: colors.secondaryLight,
    opacity: 0.7,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  avatarInner: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 14,
  },
  body: {
    marginTop: spacing.base,
    minWidth: 0,
  },
  eyebrow: {
    opacity: 0.9,
  },
  title: {
    marginTop: 4,
    fontFamily: 'Almarai_800ExtraBold',
  },
  subtitle: {
    marginTop: 4,
  },
});
