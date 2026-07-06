import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './ui';
import { GeometricPattern } from './common/GeometricPattern';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useDirection } from '../hooks/useDirection';

/**
 * Inner-screen header — white-dominant per CCK brand book, **sharp** decoration.
 *
 *   [eyebrow • green]
 *   [TITLE — H1 BOLD INK]
 *   [optional subtitle]
 *   [▰▰▰] short triangle-pair mark (lime + green) — the brand book's chevron motif
 *   ↘ diagonal triangle scatter in the top-right (NEVER a swoosh — too round)
 *
 * The hero green-band ScreenHeader is for HUB screens only; everything else
 * (lists, details, forms) sits on white paper with this lighter header.
 */
interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Show the triangle-cluster decoration in the top corner. Defaults true. */
  decoration?: boolean;
  /** Right-side slot for actions (filter button, share, etc). */
  trailing?: ReactNode;
  style?: ViewStyle;
}

export function InnerScreenHeader({
  eyebrow,
  title,
  subtitle,
  decoration = true,
  trailing,
  style,
}: Props) {
  const { i18n } = useTranslation();
  const { isRTL, textAlign, writingDirection } = useDirection();
  const isAr = i18n.language === 'ar';
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={[styles.wrap, style]}>
      {decoration && (
        <GeometricPattern
          variant="triangleCluster"
          width={120}
          height={100}
          color={colors.primary}
          accent={colors.secondary}
          opacity={0.18}
          style={[
            styles.cluster,
            isRTL ? { left: -8, transform: [{ scaleX: -1 }] } : { right: -8 },
          ]}
        />
      )}

      <View style={[styles.row, { flexDirection: rowDirection }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          {!!eyebrow && (
            <Text
              variant="overline"
              color={colors.primary}
              style={[
                styles.eyebrow,
                { textAlign, writingDirection, letterSpacing: isAr ? 0 : 1 },
              ]}
            >
              {eyebrow}
            </Text>
          )}
          <Text
            variant="h1"
            color={colors.textPrimary}
            accessibilityRole="header"
            style={[styles.title, { textAlign, writingDirection }]}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text
              variant="small"
              color={colors.textSecondary}
              style={[styles.subtitle, { textAlign, writingDirection }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {trailing && <View style={styles.trailing}>{trailing}</View>}
      </View>

      {/* Sharp triangle-pair mark — brand-book chevron motif at miniature scale.
          Two flush triangles: a green wedge + a lime wedge, hard edges, no curves. */}
      <View style={[styles.markRow, { flexDirection: rowDirection }]}>
        <View style={[styles.markTriangleGreen, { borderRightColor: colors.primary }]} />
        <View style={[styles.markTriangleLime, { borderRightColor: colors.secondary }]} />
        <View style={[styles.markBar, { backgroundColor: colors.brandRed }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cluster: {
    position: 'absolute',
    top: 0,
  },
  row: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  trailing: {
    paddingTop: spacing.sm,
  },
  eyebrow: {
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Almarai_800ExtraBold',
  },
  subtitle: {
    marginTop: 4,
  },

  // Triangle-pair brand mark — pure geometric, no curves.
  markRow: {
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 3,
  },
  markTriangleGreen: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  markTriangleLime: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  markBar: {
    width: 14,
    height: 2,
    marginStart: 2,
  },
});
