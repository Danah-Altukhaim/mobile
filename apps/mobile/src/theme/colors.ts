// CCK Brand — Canadian College of Kuwait
// Primary green #006341, lime accent #76B82A, red #E20613
// Tokens extracted from cck.edu.kw CSS custom properties (see CCK_BRAND.md).

export const lightColors = {
  // Primary — CCK Green
  primary: '#006341',
  primaryLight: '#3EB75E',
  primaryDark: '#004D32',

  // Secondary — Lime accent
  secondary: '#76B82A',
  secondaryLight: '#A8D968',
  secondaryDark: '#5A9020',

  // Accent — Light growth green wash
  accent: '#E6F2E2',

  // Brand Red — Canadian identity / maple leaf moments, urgent CTAs
  // (CCK_BRAND.md §Colors — --rt-red-primary-2 / --rt-red-secondary)
  brandRed: '#E20613',
  brandRedDark: '#A30010',
  brandRedWash: '#FDECEE',

  // Surfaces
  background: '#F6F6F6',
  surface: '#FFFFFF',
  surfaceVariant: '#F6F6F6',
  surfaceRaised: '#FFFFFF',

  // Borders & Dividers
  border: '#D9D9D9',
  borderActive: '#737477',
  divider: '#EEEEEE',

  // Text
  textPrimary: '#222222',
  textSecondary: '#737477',
  textTertiary: '#8A8A8A',
  textPlaceholder: '#B0B0B0',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#3EB75E',
  warning: '#FF8F3C',
  error: '#E20613',
  info: '#1BA2DB',

  // Risk levels
  riskCritical: '#E20613',
  riskWarning: '#FF8F3C',
  riskWatch: '#F5D4A0',

  // Scale (names kept for API compatibility — remapped to CCK green spectrum)
  blue900: '#003D27',
  blue800: '#004D32',
  blue700: '#006341',
  blue400: '#3EB75E',
  blue300: '#76B82A',
  blue200: '#E6F2E2',
  blue100: '#F0F7EE',
};

export const darkColors = {
  // Primary — lighter green in dark mode
  primary: '#3EB75E',
  primaryLight: '#76B82A',
  primaryDark: '#006341',

  // Secondary
  secondary: '#76B82A',
  secondaryLight: '#A8D968',
  secondaryDark: '#5A9020',

  // Accent
  accent: '#004D32',

  // Brand Red — same hue in dark mode (maple leaf stays red)
  brandRed: '#E20613',
  brandRedDark: '#A30010',
  brandRedWash: '#3A0B10',

  // Surfaces — CCK footer black + copyright-border shade
  background: '#181818',
  surface: '#242424',
  surfaceVariant: '#2D2D2D',
  surfaceRaised: '#242424',

  // Borders & Dividers
  border: '#2D2D2D',
  borderActive: '#737477',
  divider: '#242424',

  // Text
  textPrimary: '#F6F6F6',
  textSecondary: '#A0A0A0',
  textTertiary: '#737477',
  textPlaceholder: '#6B6B6B',
  textInverse: '#222222',

  // Semantic
  success: '#3EB75E',
  warning: '#FF8F3C',
  error: '#E20613',
  info: '#1BA2DB',

  // Risk levels
  riskCritical: '#E20613',
  riskWarning: '#FF8F3C',
  riskWatch: '#F5D4A0',

  // Scale (inverted — lighter values at top for dark mode)
  blue900: '#F0F7EE',
  blue800: '#E6F2E2',
  blue700: '#76B82A',
  blue400: '#3EB75E',
  blue300: '#006341',
  blue200: '#004D32',
  blue100: '#003D27',
};

// Default export for direct imports (light mode)
export const colors = lightColors;

export type Colors = typeof lightColors;
