// ─── Neon Color Utilities ──────────────────────────────────────────

/**
 * Returns a rainbow HSL color string cycling from 0-360° based on t (0-1).
 */
export function getRainbowColor(t, saturation = 100, lightness = 55) {
  const hue = (t * 360) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Curated neon color palette.
 */
export const NEON_PALETTE = [
  '#00f5ff', // cyan
  '#ff00ff', // magenta
  '#39ff14', // neon green
  '#ff6600', // neon orange
  '#bf00ff', // violet
  '#ff1493', // deep pink
  '#00ff88', // spring green
  '#ffff00', // yellow
];

/**
 * Returns a neon color for a given hand index.
 */
export function getHandColor(handIndex) {
  const colors = [
    { h: 180, s: 100, l: 50 }, // cyan for hand 0
    { h: 300, s: 100, l: 50 }, // magenta for hand 1
  ];
  const c = colors[handIndex % 2];
  return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
}

/**
 * Get HSLA string for per-joint rainbow cycling.
 */
export function getJointColor(jointIndex, time, handIndex = 0) {
  const baseHue = handIndex === 0 ? 180 : 300;
  const hue = (baseHue + jointIndex * 15 + time * 60) % 360;
  return `hsl(${hue}, 100%, 55%)`;
}

/**
 * Linearly interpolate between two hex colors.
 */
export function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
