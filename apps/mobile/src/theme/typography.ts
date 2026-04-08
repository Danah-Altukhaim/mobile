import { TextStyle } from 'react-native';

// Cairo font for Arabic-first typography
// Minimum 16px for Arabic body text, line-height 1.6-1.8x
// Zero letter-spacing (breaks Arabic cursive connections)

export const typography = {
  h1: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 28,
    lineHeight: 44,
    letterSpacing: 0,
  } as TextStyle,

  h2: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 24,
    lineHeight: 38,
    letterSpacing: 0,
  } as TextStyle,

  h3: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: 0,
  } as TextStyle,

  body: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 16,
    lineHeight: 28, // 1.75x
    letterSpacing: 0,
  } as TextStyle,

  bodyBold: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 16,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,

  caption: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  } as TextStyle,

  small: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  button: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,

  tabLabel: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  } as TextStyle,
};

export type Typography = typeof typography;
