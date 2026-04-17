import { HAND_CONNECTIONS } from '../utils/constants.js';
import { getJointColor } from '../utils/colors.js';

/**
 * Draw neon skeleton — single-pass, NO shadowBlur.
 * Uses wider semi-transparent stroke behind a thin bright stroke for faux glow.
 */
export function drawSkeleton(ctx, landmarks, handIndex, width, height, time) {
  if (!landmarks || landmarks.length < 21) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Batch: draw all outer glows first, then all inner lines
  // OUTER GLOW PASS (wide, semi-transparent — no shadowBlur)
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 6;
  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    const color = getJointColor(startIdx, time, handIndex);
    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  // INNER BRIGHT PASS (thin, opaque white)
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
  }
  ctx.stroke();

  // Joint dots — batched into a single path
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
