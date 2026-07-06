import React from 'react';
import Svg, { G, Polygon } from 'react-native-svg';

type Direction = 'left' | 'right' | 'up' | 'down';

interface BrandArrowProps {
  /** Pointing direction. Default 'left' (matches the source mark). */
  direction?: Direction;
  /** Square size in px. Default 24. */
  size?: number;
  /** Colour of the main triangle. Default brand red. */
  color?: string;
  /** Colour of the small accent wedge. Default CCK green. */
  accent?: string;
}

/**
 * BrandArrow — the CCK chevron mark used in place of stock arrows.
 * A red triangular arrowhead with a small detached green wedge.
 * Background is transparent; size/colour are caller-controlled.
 *
 * The base geometry is drawn pointing LEFT, then rotated by `direction`.
 */
export function BrandArrow({
  direction = 'left',
  size = 24,
  color = '#C9352F',
  accent = '#1F5C42',
}: BrandArrowProps) {
  const rotation =
    direction === 'left' ? 0 : direction === 'up' ? 90 : direction === 'right' ? 180 : 270;

  // Base orientation = pointing left. Drawn into a 130×130 square viewBox
  // so the mark stays square-aligned in flex rows while preserving the
  // taller-than-wide aspect of the brand chevron. Coordinates traced
  // directly from the brand reference:
  //   - large red leftward chevron, vertical right edge, apex at vertical mid
  //   - smaller green chevron (same shape) sitting above and slightly left,
  //     overlapping the red's top-right area so the marks visually interlock
  const arrowhead = '97,30 97,126 10,78';
  const accentWedge = '70,5 70,55 38,30';

  return (
    <Svg width={size} height={size} viewBox="0 0 130 130">
      <G origin="65, 65" rotation={rotation}>
        <Polygon points={arrowhead} fill={color} />
        <Polygon points={accentWedge} fill={accent} />
      </G>
    </Svg>
  );
}
