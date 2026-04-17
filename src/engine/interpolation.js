import { SMOOTHING_ALPHA } from '../utils/constants.js';

/**
 * Exponential Moving Average (EMA) filter for landmark smoothing.
 * Reduces jitter while preserving responsiveness.
 *
 * @param {Array} rawLandmarks - Current frame's raw landmarks (21 points)
 * @param {Array|null} prevLandmarks - Previous frame's smoothed landmarks
 * @param {number} alpha - Smoothing factor (0=max smooth, 1=no smooth). Default from constants.
 * @returns {Array} Smoothed landmarks
 */
export function smoothLandmarks(rawLandmarks, prevLandmarks, alpha = SMOOTHING_ALPHA) {
  if (!prevLandmarks || prevLandmarks.length !== rawLandmarks.length) {
    // First frame or hand just appeared — use raw values directly
    return rawLandmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }));
  }

  return rawLandmarks.map((lm, i) => {
    const prev = prevLandmarks[i];
    return {
      x: prev.x + alpha * (lm.x - prev.x),
      y: prev.y + alpha * (lm.y - prev.y),
      z: prev.z + alpha * (lm.z - prev.z),
    };
  });
}

/**
 * Smooth all hands' landmarks.
 * @param {Array<Array>} allRawLandmarks - Array of hand landmark arrays
 * @param {Array<Array>} prevAllLandmarks - Previous smoothed arrays
 * @param {number} alpha
 * @returns {Array<Array>} Smoothed arrays
 */
export function smoothAllHands(allRawLandmarks, prevAllLandmarks, alpha = SMOOTHING_ALPHA) {
  return allRawLandmarks.map((handLandmarks, i) => {
    const prev = prevAllLandmarks ? prevAllLandmarks[i] : null;
    return smoothLandmarks(handLandmarks, prev, alpha);
  });
}
