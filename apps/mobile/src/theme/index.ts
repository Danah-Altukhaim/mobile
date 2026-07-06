import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

// Shadows — green-tinted, lower opacity, longer y-offset.
// Reads as a soft "lift" rather than a heavy drop.
const SHADOW_TINT = '#0E2A1B';

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: SHADOW_TINT,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: SHADOW_TINT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  md: {
    shadowColor: SHADOW_TINT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  lg: {
    shadowColor: SHADOW_TINT,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 8,
  },
  xl: {
    shadowColor: SHADOW_TINT,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.14,
    shadowRadius: 44,
    elevation: 14,
  },
} as const;

// Motion presets — spring-feeling but predictable.
export const motion = {
  springGentle: { speed: 18, bounciness: 4 },
  springQuick: { speed: 26, bounciness: 6 },
  springTight: { speed: 32, bounciness: 0 },
  fadeIn: 220,
  fadeOut: 160,
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  motion,
} as const;

export type Theme = typeof theme;
export { colors, lightColors, darkColors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';
