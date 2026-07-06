// Deterministic course color from course code — every same code maps to the same accent.
// Calendar-app convention. Keeps the schedule glanceable.

// Brand-only palette — CCK Green + New Growth lime tints (branding book).
// Red is reserved for urgent moments and intentionally excluded here.
const PALETTE = [
  { fg: '#006341', wash: '#E6F2E2' }, // cck green
  { fg: '#5A9020', wash: '#EFF7E0' }, // new growth lime (dark)
  { fg: '#004D32', wash: '#DCEBD7' }, // deep green
  { fg: '#76B82A', wash: '#EFF7E0' }, // new growth lime
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function courseColor(code: string | undefined | null) {
  if (!code) return PALETTE[0];
  return PALETTE[hash(code) % PALETTE.length];
}
