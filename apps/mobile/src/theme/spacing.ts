export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// CCK radius — tight 3px across all interactive elements.
// No pill buttons, no large rounded cards. `full` reserved for avatars.
export const borderRadius = {
  sm: 3,
  md: 3,
  lg: 4,
  xl: 6,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
