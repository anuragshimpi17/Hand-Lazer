import { FINGERTIPS, TRAIL_LENGTH } from '../utils/constants.js';
import { getRainbowColor } from '../utils/colors.js';

/**
 * Lightweight trail store using arrays (not Map for perf).
 */
const trails = {}; // key → [{x,y}]

/**
 * Apply fade to the trail canvas.
 */
export function fadeTrailCanvas(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Draw motion trails — NO shadowBlur, batched strokes.
 */
export function drawTrails(ctx, allLandmarks, width, height, time) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  allLandmarks.forEach((landmarks, handIndex) => {
    if (!landmarks || landmarks.length < 21) return;

    FINGERTIPS.forEach((tipIdx, fingerIndex) => {
      const key = `${handIndex}_${tipIdx}`;
      if (!trails[key]) trails[key] = [];

      const trail = trails[key];
      const lm = landmarks[tipIdx];
      trail.push({ x: lm.x * width, y: lm.y * height });

      if (trail.length > TRAIL_LENGTH) trail.shift();
      if (trail.length < 2) return;

      // Draw trail as a single polyline with gradient-like opacity
      const color = getRainbowColor(
        (time * 0.3 + handIndex * 0.5 + fingerIndex * 0.1) % 1
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for (let i = 1; i < trail.length; i++) {
        const t = i / trail.length;
        ctx.globalAlpha = t * 0.5;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    });
  });

  // Cleanup stale trails
  const activeKeys = new Set();
  allLandmarks.forEach((_, hi) => {
    FINGERTIPS.forEach((ti) => activeKeys.add(`${hi}_${ti}`));
  });
  for (const key in trails) {
    if (!activeKeys.has(key)) delete trails[key];
  }

  ctx.restore();
}
