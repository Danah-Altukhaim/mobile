import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';
import { useDirection } from '../../hooks/useDirection';

interface MasariTextProps extends TextProps {
  variant?: keyof typeof typography;
  color?: string;
}

export function Text({
  variant = 'body',
  color = colors.textPrimary,
  style,
  children,
  ...props
}: MasariTextProps) {
  const { writingDirection, textAlign } = useDirection();
  return (
    <RNText
      style={[typography[variant], { color, writingDirection, textAlign }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
