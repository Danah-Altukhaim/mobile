import { TextStyle } from 'react-native';

// App typography — Almarai for all text (EN + AR).
// Almarai ships four weights: 300 Light, 400 Regular, 700 Bold, 800 ExtraBold.
// CCK rhythm (H1 Black · H2/H3 Bold · H4 SemiBold · body Regular) is preserved
// by mapping Black/ExtraBold → 800, Bold/SemiBold → 700, Medium/Regular → 400.

export const typography = {
  // Display — hero headlines
  display: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: 0,
  } as TextStyle,

  // Page titles
  h1: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  } as TextStyle,

  // Section headers
  h2: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  } as TextStyle,

  // Subsection headers
  h3: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: 0,
  } as TextStyle,

  // Card titles, sidebar headers
  h4: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  // Default body
  body: {
    fontFamily: 'Almarai_400Regular',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  // Body bold
  bodyBold: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  } as TextStyle,

  // Secondary info, metadata
  small: {
    fontFamily: 'Almarai_400Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  // Labels, timestamps, badges
  caption: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  } as TextStyle,

  // Category labels (uppercase)
  overline: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  // Buttons
  button: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  // Tab bar labels
  tabLabel: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,

  // Arabic body — kept as aliases so existing consumers still resolve.
  // Extra line height preserved for ligature breathing room.
  bodyAr: {
    fontFamily: 'Almarai_400Regular',
    fontSize: 17,
    lineHeight: 30,
    letterSpacing: 0,
  } as TextStyle,

  bodyBoldAr: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 17,
    lineHeight: 30,
    letterSpacing: 0,
  } as TextStyle,
};

export type Typography = typeof typography;
