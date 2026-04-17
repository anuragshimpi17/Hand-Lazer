import { THUMB_TIP, INDEX_TIP, WRIST, PINCH_THRESHOLD } from '../utils/constants.js';

// Store previous wrist positions for velocity calculation
const prevWristPositions = [null, null];

/**
 * Compute Euclidean distance between two 2D landmark points.
 */
function distance2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Detect gestures for a single hand.
 *
 * @param {Array} landmarks - 21 smoothed landmarks for one hand
 * @param {number} handIndex - 0 or 1
 * @returns {{ isPinching: boolean, pinchStrength: number, speed: number, pulseFactor: number }}
 */
export function detectGestures(landmarks, handIndex) {
  if (!landmarks || landmarks.length < 21) {
    return { isPinching: false, pinchStrength: 0, speed: 0, pulseFactor: 0 };
  }

  const thumbTip = landmarks[THUMB_TIP];
  const indexTip = landmarks[INDEX_TIP];
  const wrist = landmarks[WRIST];

  // ─── Pinch Detection ───
  const pinchDist = distance2D(thumbTip, indexTip);
  const isPinching = pinchDist < PINCH_THRESHOLD;
  // 1.0 = fully pinched, 0.0 = far apart. Clamped to 0-1.
  const pinchStrength = Math.max(0, Math.min(1, 1 - pinchDist / (PINCH_THRESHOLD * 3)));

  // ─── Movement Speed ───
  let speed = 0;
  const prevWrist = prevWristPositions[handIndex];
  if (prevWrist) {
    speed = distance2D(wrist, prevWrist);
  }
  prevWristPositions[handIndex] = { x: wrist.x, y: wrist.y };

  // Pulse factor: maps speed to 0-1 intensity (clamped)
  const pulseFactor = Math.min(1, speed / 0.03);

  return { isPinching, pinchStrength, speed, pulseFactor };
}

/**
 * Detect gestures for all hands.
 */
export function detectAllGestures(allLandmarks) {
  return allLandmarks.map((landmarks, i) => detectGestures(landmarks, i));
}
