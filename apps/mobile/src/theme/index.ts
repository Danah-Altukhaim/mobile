import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows: {
    xs: {
      shadowColor: '#1E1E1E',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#1E1E1E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#1E1E1E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1E1E1E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 6,
    },
    xl: {
      shadowColor: '#1E1E1E',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 48,
      elevation: 10,
    },
  },
} as const;

export type Theme = typeof theme;
export { colors, lightColors, darkColors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';
