// 4px base scale.
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
  '5xl': 64,
} as const;

// Radius — SHARP and GEOMETRIC by design.
// CCK identity is precise / institutional / chevron-and-triangle.
// Rounded corners read as generic; everything sits at the floor:
//   sm   0  — chips, badges, pills, segmented controls (totally sharp)
//   md   2  — buttons, inputs, list rows (barely-there tap softening)
//   lg   4  — cards, sheets (minimal containment)
//   xl   8  — top of bottom sheets only (shape recognition)
//   full     — avatars, status dots, genuine circles only
export const borderRadius = {
  none: 0,
  sm: 0,
  md: 2,
  lg: 4,
  xl: 8,
  '2xl': 12,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
