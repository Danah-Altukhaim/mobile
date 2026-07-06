import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Polygon, G, Path } from 'react-native-svg';
import { colors } from '../../theme/colors';

type Variant =
  | 'chevron'
  | 'triangleGrid'
  | 'cornerWedge'
  | 'swoosh'
  | 'swooshDouble'
  | 'triangleCluster'
  | 'diagonalStripe';
type Tone = 'light' | 'dark';

interface Props {
  variant?: Variant;
  width?: number;
  height?: number;
  tone?: Tone;
  /** Override the dominant colour. Default: tone-aware brand green. */
  color?: string;
  /** Accent colour for secondary triangles / lime moments. */
  accent?: string;
  /** Sparing red marker for one-off highlights. */
  redMark?: boolean;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * GeometricPattern — every shape from the CCK brand book.
 *
 *   chevron          leftward < < < arrows (book's chevron pattern)
 *   triangleGrid     4×2 grid of 45° triangles (book's lime triangle pattern)
 *   cornerWedge      single dominant triangle, for hero corners
 *   swoosh           single sweeping curve (book's signature)
 *   swooshDouble     paired green-over-red swoosh (book template element)
 *   triangleCluster  mixed-colour scattered cluster (book's printed-collateral motif)
 *   diagonalStripe   45° green band with thin red line
 *
 * Triangles are pure polygons — no rounded corners anywhere.
 */
export function GeometricPattern({
  variant = 'chevron',
  width = 120,
  height = 40,
  tone = 'dark',
  color,
  accent,
  redMark = false,
  opacity = 1,
  style,
}: Props) {
  const baseColor = color ?? (tone === 'light' ? '#FFFFFF' : colors.primary);
  const accentColor = accent ?? colors.secondary;

  return (
    <View pointerEvents="none" style={[{ width, height, opacity } as ViewStyle, style]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {variant === 'chevron' && <Chevrons w={width} h={height} fill={baseColor} redMark={redMark} />}
        {variant === 'triangleGrid' && (
          <TriangleGrid w={width} h={height} primary={baseColor} accent={accentColor} />
        )}
        {variant === 'cornerWedge' && (
          <CornerWedge w={width} h={height} fill={baseColor} accent={accentColor} />
        )}
        {variant === 'swoosh' && <Swoosh w={width} h={height} fill={baseColor} />}
        {variant === 'swooshDouble' && <SwooshDouble w={width} h={height} green={baseColor} />}
        {variant === 'triangleCluster' && (
          <TriangleCluster w={width} h={height} green={baseColor} lime={accentColor} red={colors.brandRed} />
        )}
        {variant === 'diagonalStripe' && (
          <DiagonalStripe w={width} h={height} green={baseColor} red={colors.brandRed} lime={accentColor} />
        )}
      </Svg>
    </View>
  );
}

function Chevrons({ w, h, fill, redMark }: { w: number; h: number; fill: string; redMark: boolean }) {
  const count = 3;
  const gap = w * 0.04;
  const cellW = (w - gap * (count - 1)) / count;
  const cellH = h;
  const triW = cellW * 0.5;
  const tailW = cellW * 0.5;
  const items = Array.from({ length: count });
  return (
    <G>
      {items.map((_, i) => {
        const x = i * (cellW + gap);
        const yMid = cellH / 2;
        const isRed = redMark && i === 1;
        const c = isRed ? colors.brandRed : fill;
        const tri = `${x},${yMid} ${x + triW},0 ${x + triW},${cellH}`;
        const tail = `${x + triW},0 ${x + triW + tailW},0 ${x + cellW},${yMid} ${x + triW + tailW},${cellH} ${x + triW},${cellH} ${x + triW + tailW * 0.5},${yMid}`;
        return (
          <G key={i}>
            <Polygon points={tri} fill={c} />
            <Polygon points={tail} fill={c} />
          </G>
        );
      })}
    </G>
  );
}

function TriangleGrid({
  w, h, primary, accent,
}: { w: number; h: number; primary: string; accent: string }) {
  const cols = 4;
  const rows = 2;
  const cellW = w / cols;
  const cellH = h / rows;
  const tiles: Array<{ x: number; y: number; fill: string; orientation: 0 | 1 }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({
        x: c * cellW,
        y: r * cellH,
        fill: (r + c) % 2 === 0 ? primary : accent,
        orientation: ((r + c) % 2) as 0 | 1,
      });
    }
  }
  return (
    <G>
      {tiles.map((t, i) => {
        const pts =
          t.orientation === 0
            ? `${t.x},${t.y} ${t.x + cellW},${t.y} ${t.x},${t.y + cellH}`
            : `${t.x + cellW},${t.y} ${t.x + cellW},${t.y + cellH} ${t.x},${t.y + cellH}`;
        return <Polygon key={i} points={pts} fill={t.fill} />;
      })}
    </G>
  );
}

function CornerWedge({ w, h, fill, accent }: { w: number; h: number; fill: string; accent: string }) {
  const big = `${w},0 ${w},${h} ${w * 0.35},0`;
  const small = `${w * 0.62},${h} ${w},${h} ${w},${h * 0.55}`;
  return (
    <G>
      <Polygon points={big} fill={fill} opacity={0.18} />
      <Polygon points={small} fill={accent} opacity={0.35} />
    </G>
  );
}

/** The signature CCK swoosh — a single sweeping curve. */
function Swoosh({ w, h, fill }: { w: number; h: number; fill: string }) {
  const t = h * 0.34; // band thickness
  // Cubic bezier sweep: rises in first third, dips in last third.
  const top = `M 0 ${h * 0.55} C ${w * 0.30} ${h * 0.05}, ${w * 0.65} ${h * 0.95}, ${w} ${h * 0.45}`;
  const bottom = `L ${w} ${h * 0.45 + t} C ${w * 0.65} ${h * 0.95 + t}, ${w * 0.30} ${h * 0.05 + t}, 0 ${h * 0.55 + t} Z`;
  return <Path d={top + bottom} fill={fill} />;
}

/** Brand-book paired swoosh: green over red. */
function SwooshDouble({ w, h, green }: { w: number; h: number; green: string }) {
  const t = h * 0.22;
  const greenTop = `M 0 ${h * 0.30} C ${w * 0.30} ${-h * 0.05}, ${w * 0.65} ${h * 0.65}, ${w} ${h * 0.20}`;
  const greenBot = `L ${w} ${h * 0.20 + t} C ${w * 0.65} ${h * 0.65 + t}, ${w * 0.30} ${-h * 0.05 + t}, 0 ${h * 0.30 + t} Z`;
  const redOffset = h * 0.32;
  const redTop = `M 0 ${h * 0.30 + redOffset} C ${w * 0.30} ${-h * 0.05 + redOffset}, ${w * 0.65} ${h * 0.65 + redOffset}, ${w} ${h * 0.20 + redOffset}`;
  const redBot = `L ${w} ${h * 0.20 + t + redOffset} C ${w * 0.65} ${h * 0.65 + t + redOffset}, ${w * 0.30} ${-h * 0.05 + t + redOffset}, 0 ${h * 0.30 + t + redOffset} Z`;
  return (
    <G>
      <Path d={greenTop + greenBot} fill={green} />
      <Path d={redTop + redBot} fill={colors.brandRed} />
    </G>
  );
}

/** Mixed-colour scattered triangle cluster — book's printed-collateral motif. */
function TriangleCluster({
  w, h, green, lime, red,
}: { w: number; h: number; green: string; lime: string; red: string }) {
  // Hand-placed triangles — diagonal flow from top-left to bottom-right.
  const u = Math.min(w, h) / 10;
  const tris = [
    { p: `${1 * u},${1 * u} ${3 * u},${1 * u} ${1 * u},${3 * u}`, fill: green },
    { p: `${4 * u},${0.5 * u} ${5.5 * u},${0.5 * u} ${4 * u},${2 * u}`, fill: lime, opacity: 0.9 },
    { p: `${3 * u},${4 * u} ${5 * u},${4 * u} ${3 * u},${6 * u}`, fill: red },
    { p: `${5.5 * u},${3 * u} ${7 * u},${3 * u} ${5.5 * u},${4.5 * u}`, fill: green },
    { p: `${6 * u},${5.5 * u} ${8 * u},${5.5 * u} ${6 * u},${7.5 * u}`, fill: lime },
    { p: `${7.5 * u},${1.5 * u} ${9 * u},${1.5 * u} ${7.5 * u},${3 * u}`, fill: green, opacity: 0.4 },
    { p: `${8 * u},${7 * u} ${9 * u},${7 * u} ${8 * u},${8 * u}`, fill: red, opacity: 0.7 },
  ];
  return (
    <G>
      {tris.map((t, i) => (
        <Polygon key={i} points={t.p} fill={t.fill} opacity={t.opacity ?? 1} />
      ))}
    </G>
  );
}

/** 45° green band with a thin red parallel line + lime accent triangle. */
function DiagonalStripe({
  w, h, green, red, lime,
}: { w: number; h: number; green: string; red: string; lime: string }) {
  const t = h * 0.16;
  const offset = h * 0.10;
  // Green band sweeps bottom-left → top-right
  const greenPts = `0,${h * 0.85} ${w},${h * 0.15} ${w},${h * 0.15 + t} 0,${h * 0.85 + t}`;
  // Red parallel line below
  const redOffsetY = t + offset;
  const redThickness = t * 0.35;
  const redPts = `0,${h * 0.85 + redOffsetY} ${w},${h * 0.15 + redOffsetY} ${w},${h * 0.15 + redOffsetY + redThickness} 0,${h * 0.85 + redOffsetY + redThickness}`;
  // Small lime accent triangle
  const limeTri = `${w * 0.10},${h * 0.92} ${w * 0.20},${h * 0.92} ${w * 0.10},${h - 1}`;
  return (
    <G>
      <Polygon points={greenPts} fill={green} />
      <Polygon points={redPts} fill={red} />
      <Polygon points={limeTri} fill={lime} />
    </G>
  );
}
