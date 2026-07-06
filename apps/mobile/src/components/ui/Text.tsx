import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { useDirection } from '../../hooks/useDirection';

interface MasariTextProps extends TextProps {
  variant?: keyof typeof typography;
  color?: string;
}

// Dynamic Type caps (HIG). Tight, layout-bearing variants scale less so fixed-height
// rows/chips/tabs don't blow out; reading variants are allowed more headroom.
// Per-variant default; callers can still override via maxFontSizeMultiplier prop.
const MAX_SCALE: Partial<Record<keyof typeof typography, number>> = {
  display: 1.15,
  h1: 1.2,
  h2: 1.25,
  h3: 1.3,
  h4: 1.3,
  body: 1.35,
  bodyBold: 1.35,
  bodyAr: 1.35,
  bodyBoldAr: 1.35,
  small: 1.3,
  smallBold: 1.3,
  caption: 1.2,
  overline: 1.15,
  button: 1.2,
  tabLabel: 1.1,
};

export function Text({
  variant = 'body',
  color = colors.textPrimary,
  style,
  children,
  maxFontSizeMultiplier,
  ...props
}: MasariTextProps) {
  const { writingDirection, textAlign, isRTL } = useDirection();
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? MAX_SCALE[variant] ?? 1.3}
      style={[
        typography[variant],
        { color, writingDirection, textAlign },
        style,
        isRTL && { letterSpacing: 0 },
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
