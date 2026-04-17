import { FINGERTIPS, THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP } from '../utils/constants.js';

// Joint before each fingertip — for direction
const DIP_FOR_TIP = {
  [THUMB_TIP]: 3,
  [INDEX_TIP]: 7,
  [MIDDLE_TIP]: 11,
  [RING_TIP]: 15,
  [PINKY_TIP]: 19,
};

const MCP_FOR_TIP = {
  [THUMB_TIP]: 2,
  [INDEX_TIP]: 5,
  [MIDDLE_TIP]: 9,
  [RING_TIP]: 13,
  [PINKY_TIP]: 17,
};

// Unique vivid color per finger [r, g, b]
const FINGER_RGB = [
  [255, 0, 68],    // thumb  — hot red
  [0, 229, 255],   // index  — cyan
  [0, 255, 102],   // middle — neon green
  [255, 136, 0],   // ring   — orange
  [204, 0, 255],   // pinky  — purple
];

/**
 * Get finger direction vector (normalized, in pixel space).
 */
function getFingerDir(landmarks, tipIdx, width, height) {
  const tip = landmarks[tipIdx];
  const dip = landmarks[DIP_FOR_TIP[tipIdx]];
  const mcp = landmarks[MCP_FOR_TIP[tipIdx]];

  let dx = (tip.x - dip.x) * width;
  let dy = (tip.y - dip.y) * height;
  let len = Math.sqrt(dx * dx + dy * dy);

  if (len < 2) {
    dx = (tip.x - mcp.x) * width;
    dy = (tip.y - mcp.y) * height;
    len = Math.sqrt(dx * dx + dy * dy);
  }
  if (len < 0.5) return null;
  return { dx: dx / len, dy: dy / len };
}

/**
 * Draw short, smooth glowing laser pulses from each fingertip.
 * Uses gradient-faded beams (60-90px) with pulsing glow orbs — no harsh long lines.
 */
export function drawLasers(ctx, landmarks, handIndex, width, height, time, gesture) {
  if (!landmarks || landmarks.length < 21) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  FINGERTIPS.forEach((tipIdx, fi) => {
    const dir = getFingerDir(landmarks, tipIdx, width, height);
    if (!dir) return;

    const tip = landmarks[tipIdx];
    const sx = tip.x * width;
    const sy = tip.y * height;
    const [r, g, b] = FINGER_RGB[fi];

    // Smooth pulsing based on time
    const pulse = 0.7 + 0.3 * Math.sin(time * 4 + fi * 1.2);

    // Pinch boost for index finger
    const boost = fi === 1 && gesture.isPinching ? 1 + gesture.pinchStrength * 1.5 : 1;

    // Short beam length: 50-80px, pulsing
    const beamLen = (55 + 25 * pulse) * boost;

    // End point
    const ex = sx + dir.dx * beamLen;
    const ey = sy + dir.dy * beamLen;

    // ── Gradient beam (fades from bright to transparent) ──
    const grad = ctx.createLinearGradient(sx, sy, ex, ey);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.8 * pulse})`);
    grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${0.4 * pulse})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    // Wide soft beam
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 8 * boost * pulse;
    ctx.globalAlpha = 1;
    ctx.stroke();

    // Thin bright core
    const coreGrad = ctx.createLinearGradient(sx, sy, ex, ey);
    coreGrad.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
    coreGrad.addColorStop(0.5, `rgba(255, 255, 255, 0.4)`);
    coreGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = coreGrad;
    ctx.lineWidth = 2 * boost;
    ctx.globalAlpha = 1;
    ctx.stroke();

    // ── Glowing orb at fingertip ──
    const orbRadius = (8 + 4 * pulse) * boost;
    const orbGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, orbRadius);
    orbGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * pulse})`);
    orbGrad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${0.6 * pulse})`);
    orbGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.beginPath();
    ctx.arc(sx, sy, orbRadius, 0, Math.PI * 2);
    ctx.fillStyle = orbGrad;
    ctx.globalAlpha = 1;
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Cross-hand energy link — short smooth beam between index fingertips.
 */
export function drawCrossHandLasers(ctx, hands, width, height, time) {
  if (hands.length < 2) return;

  const a = hands[0][INDEX_TIP];
  const b = hands[1][INDEX_TIP];
  const sx = a.x * width;
  const sy = a.y * height;
  const ex = b.x * width;
  const ey = b.y * height;

  const pulse = 0.6 + 0.4 * Math.sin(time * 3);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  // Gradient beam
  const grad = ctx.createLinearGradient(sx, sy, ex, ey);
  grad.addColorStop(0, `rgba(255, 0, 255, ${0.5 * pulse})`);
  grad.addColorStop(0.5, `rgba(255, 0, 255, ${0.3 * pulse})`);
  grad.addColorStop(1, `rgba(0, 229, 255, ${0.5 * pulse})`);

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 6 * pulse;
  ctx.globalAlpha = 1;
  ctx.stroke();

  // White core
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * pulse})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}
