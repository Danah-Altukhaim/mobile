import { TextStyle } from 'react-native';

// App typography — Almarai for all text (EN + AR).
// Almarai weights: 300 Light, 400 Regular, 700 Bold, 800 ExtraBold.
// Hierarchy comes from weight + size, not from letter-spacing tricks.
// NEVER set letter-spacing > 0 on Arabic — breaks ligatures.

export const typography = {
  // Hero numbers / display moments
  display: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -0.5,
  } as TextStyle,

  // Page titles
  h1: {
    fontFamily: 'Almarai_800ExtraBold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.4,
  } as TextStyle,

  // Section headers
  h2: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  } as TextStyle,

  // Subsection headers
  h3: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,

  // Card titles
  h4: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  // Body
  body: {
    fontFamily: 'Almarai_400Regular',
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  bodyBold: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  // Secondary, metadata
  small: {
    fontFamily: 'Almarai_400Regular',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  smallBold: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  // Labels, timestamps, badges
  caption: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,

  // Category labels (uppercase, English only — letterSpacing stripped on AR consumers)
  overline: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.0,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  // Buttons
  button: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  // Tab bar labels
  tabLabel: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0,
  } as TextStyle,

  // Arabic — extra line height for ligature breathing room
  bodyAr: {
    fontFamily: 'Almarai_400Regular',
    fontSize: 16,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,

  bodyBoldAr: {
    fontFamily: 'Almarai_700Bold',
    fontSize: 16,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,
};

export type Typography = typeof typography;
