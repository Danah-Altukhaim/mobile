import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

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
  return (
    <RNText
      style={[typography[variant], { color, writingDirection: 'rtl' }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
