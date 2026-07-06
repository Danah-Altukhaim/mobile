import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';
import { useDirection } from '../../hooks/useDirection';

type Direction = 'right' | 'left' | 'auto';

interface TriangleProps {
  /** Triangle "height" in points — also used to derive width (1.4× size). */
  size?: number;
  /** Solid fill color. Defaults to CCK red — the universal nav-arrow color. */
  color?: string;
  /** Pointing direction. `auto` flips with RTL (right in LTR, left in RTL). */
  direction?: Direction;
  style?: StyleProp<ViewStyle>;
}

/**
 * A solid filled triangle — sharp, no curves, no Ionicons.
 * Used as the universal navigation-arrow shape across the CCK Hub app
 * (back arrows, list-row trailing chevrons, inline "see all" arrows, etc.).
 *
 * Implementation uses the React Native border trick: a 0×0 box whose
 * coloured side-border becomes the triangle, with adjacent borders
 * transparent to "carve" the apex.
 */
export function Triangle({
  size = 8,
  color = colors.brandRed,
  direction = 'auto',
  style,
}: TriangleProps) {
  const { isRTL } = useDirection();
  const resolved: 'right' | 'left' =
    direction === 'auto' ? (isRTL ? 'left' : 'right') : direction;

  const half = size;
  const width = Math.round(size * 1.3);

  const base: ViewStyle = {
    width: 0,
    height: 0,
    borderTopWidth: half,
    borderBottomWidth: half,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  };

  // Right-pointing (▶): coloured LEFT border, with transparent top/bottom carving the apex.
  // Left-pointing  (◀): coloured RIGHT border instead.
  const directional: ViewStyle =
    resolved === 'right'
      ? { borderLeftWidth: width, borderLeftColor: color }
      : { borderRightWidth: width, borderRightColor: color };

  return <View style={[base, directional, style]} />;
}
