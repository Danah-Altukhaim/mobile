import { TextStyle } from 'react-native';

// CCK Brand typography
// English headings & UI: Gotham (proprietary) — Montserrat used as geometric substitute
// English body: Hind — Outfit used as humanist-sans substitute until Hind is bundled
// Arabic (all): Cairo (stands in for Noto Sans Arabic)
// CCK rhythm: H1 900 Black · H2/H3 700 Bold · H4 600 SemiBold · body 400 Regular
// Arabic body minimum 16px, +0.1–0.2 line-height over English, zero letter-spacing.

export const typography = {
  // Display — hero headlines (CCK H1 scale = 64px 900 Black)
  display: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: 0,
  } as TextStyle,

  // Page titles
  h1: {
    fontFamily: 'Montserrat_900Black',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  } as TextStyle,

  // Section headers
  h2: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  } as TextStyle,

  // Subsection headers
  h3: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0,
  } as TextStyle,

  // Card titles, sidebar headers
  h4: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  // Default body
  body: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  // Body bold
  bodyBold: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  // Secondary info, metadata
  small: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  // Labels, timestamps, badges
  caption: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  } as TextStyle,

  // Category labels (uppercase)
  overline: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  // Buttons — CCK uses Gotham Bold for CTAs
  button: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  // Tab bar labels
  tabLabel: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,

  // Arabic body — Cairo, minimum 16px, extra line height for ligatures
  bodyAr: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 17,
    lineHeight: 30,
    letterSpacing: 0,
  } as TextStyle,

  bodyBoldAr: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 17,
    lineHeight: 30,
    letterSpacing: 0,
  } as TextStyle,
};

export type Typography = typeof typography;
