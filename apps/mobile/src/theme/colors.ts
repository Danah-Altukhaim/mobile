// CCK Brand — Canadian College of Kuwait
// Source of truth: "branding book updated.pdf".
//   Primary  CCK Green        #006341 — main colour, headlines, flat backgrounds, CTAs
//   Accent   New Growth Green #76B82A — buttons, separators, secondary backgrounds
//   Sparing  CCK Red (PMS 032)#FF0000 — leaf moments, urgent CTAs only
//
// "Editorial" palette: warmer paper surfaces, deeper ink scale, restrained accents.
// Greens carry the app; red is precision punctuation; lime celebrates progress.

export const lightColors = {
  // ── Primary — CCK Green ───────────────────────────────────────────────
  primary: '#006341',
  primaryLight: '#3EB75E',
  primaryDark: '#004D32',
  primaryDeep: '#003421',          // hero gradients, deepest band
  primaryWash: '#E6F2E2',          // tinted card / chip wash
  primarySoft: '#F2F8F0',          // hairline tint, hover surfaces

  // ── Secondary — Lime accent ───────────────────────────────────────────
  secondary: '#76B82A',
  secondaryLight: '#A8D968',
  secondaryDark: '#5A9020',

  // Legacy alias kept stable for existing consumers
  accent: '#E6F2E2',

  // ── Brand Red — Canadian identity, urgent CTAs only ───────────────────
  brandRed: '#FF0000',
  brandRedDark: '#C70000',
  brandRedWash: '#FFE9E9',
  brandRedTint: '#FFF5F5',         // softest red surface

  // ── Navigation arrows — universal red per design direction ────────────
  chevron: '#FF0000',

  // ── Surfaces — warm paper system ──────────────────────────────────────
  background: '#FBFAF6',           // app paper
  backgroundElevated: '#FFFFFF',   // surfaces that sit on paper
  surface: '#FFFFFF',
  surfaceVariant: '#F4F2EC',       // subtle warm grey wash
  surfaceMuted: '#EFEDE6',         // chips, segmented tracks
  surfaceRaised: '#FFFFFF',
  surfaceInk: '#0E1A14',           // dark surfaces (rare, for inverse moments)

  // ── Borders & Dividers ────────────────────────────────────────────────
  border: '#E6E2D8',               // warm paper border
  borderStrong: '#D6D2C8',         // form fields at rest
  borderActive: '#006341',
  divider: '#EEEBE3',
  dividerStrong: '#E2DED4',

  // ── Text — Ink scale ──────────────────────────────────────────────────
  textPrimary: '#1A1F1A',          // deep ink (warmer than #222 against paper)
  textSecondary: '#5C615C',
  textTertiary: '#8A8E86',
  textQuiet: '#A8ABA3',             // metadata, captions
  textPlaceholder: '#B5B8AF',
  textInverse: '#FFFFFF',
  textInverseDim: 'rgba(255,255,255,0.72)',

  // ── Semantic ──────────────────────────────────────────────────────────
  success: '#3EB75E',
  successWash: '#E6F4E9',
  warning: '#E07A1F',
  warningWash: '#FCEEDB',
  error: '#FF0000',
  errorWash: '#FFE9E9',
  info: '#0E6E97',
  infoWash: '#E1EEF5',

  // ── Risk levels ───────────────────────────────────────────────────────
  riskCritical: '#FF0000',
  riskWarning: '#E07A1F',
  riskWatch: '#F5D4A0',

  // ── Course-tint scale (kept for compatibility) ────────────────────────
  blue900: '#003421',
  blue800: '#004D32',
  blue700: '#006341',
  blue400: '#3EB75E',
  blue300: '#76B82A',
  blue200: '#E6F2E2',
  blue100: '#F2F8F0',
};

export const darkColors = {
  primary: '#3EB75E',
  primaryLight: '#76B82A',
  primaryDark: '#006341',
  primaryDeep: '#003421',
  primaryWash: '#0E2A1B',
  primarySoft: '#0A1F14',

  secondary: '#76B82A',
  secondaryLight: '#A8D968',
  secondaryDark: '#5A9020',

  accent: '#0E2A1B',

  brandRed: '#FF3B3B',
  brandRedDark: '#FF0000',
  brandRedWash: '#3A0F12',
  brandRedTint: '#22090B',

  chevron: '#FF3B3B',

  background: '#0F1411',
  backgroundElevated: '#171D19',
  surface: '#171D19',
  surfaceVariant: '#1F2622',
  surfaceMuted: '#252C28',
  surfaceRaised: '#1F2622',
  surfaceInk: '#0A0E0B',

  border: '#262D29',
  borderStrong: '#333B36',
  borderActive: '#76B82A',
  divider: '#1F2622',
  dividerStrong: '#262D29',

  textPrimary: '#F4F2EC',
  textSecondary: '#B8BBB1',
  textTertiary: '#7E8278',
  textQuiet: '#5E625A',
  textPlaceholder: '#5E625A',
  textInverse: '#0E1A14',
  textInverseDim: 'rgba(14,26,20,0.72)',

  success: '#3EB75E',
  successWash: '#0E2A1B',
  warning: '#E89656',
  warningWash: '#2C1B0E',
  error: '#FF3B3B',
  errorWash: '#3A0F12',
  info: '#3FB1E0',
  infoWash: '#0E2632',

  riskCritical: '#FF3B3B',
  riskWarning: '#E89656',
  riskWatch: '#5C4A2A',

  blue900: '#F2F8F0',
  blue800: '#E6F2E2',
  blue700: '#76B82A',
  blue400: '#3EB75E',
  blue300: '#006341',
  blue200: '#0E2A1B',
  blue100: '#0A1F14',
};

export const colors = lightColors;
export type Colors = typeof lightColors;
