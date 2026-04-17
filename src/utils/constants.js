// ─── Landmark Indices ──────────────────────────────────────────────
export const WRIST = 0;
export const THUMB_CMC = 1;
export const THUMB_MCP = 2;
export const THUMB_IP = 3;
export const THUMB_TIP = 4;
export const INDEX_MCP = 5;
export const INDEX_PIP = 6;
export const INDEX_DIP = 7;
export const INDEX_TIP = 8;
export const MIDDLE_MCP = 9;
export const MIDDLE_PIP = 10;
export const MIDDLE_DIP = 11;
export const MIDDLE_TIP = 12;
export const RING_MCP = 13;
export const RING_PIP = 14;
export const RING_DIP = 15;
export const RING_TIP = 16;
export const PINKY_MCP = 17;
export const PINKY_PIP = 18;
export const PINKY_DIP = 19;
export const PINKY_TIP = 20;

// ─── Useful Groups ────────────────────────────────────────────────
export const FINGERTIPS = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];

export const LASER_PAIRS = [
  [THUMB_TIP, INDEX_TIP],
  [INDEX_TIP, MIDDLE_TIP],
  [MIDDLE_TIP, RING_TIP],
  [RING_TIP, PINKY_TIP],
];

// Hand connections (matches MediaPipe HAND_CONNECTIONS)
export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // index
  [0, 9], [9, 10], [10, 11], [11, 12],  // middle
  [0, 13], [13, 14], [14, 15], [15, 16],// ring
  [0, 17], [17, 18], [18, 19], [19, 20],// pinky
  [5, 9], [9, 13], [13, 17],            // palm
];

// ─── Performance Tuning ───────────────────────────────────────────
export const MAX_PARTICLES = 150;       // reduced from 500
export const TRAIL_LENGTH = 20;         // reduced from 30
export const SMOOTHING_ALPHA = 0.4;
export const PINCH_THRESHOLD = 0.06;

// ─── Canvas Dimensions ───────────────────────────────────────────
// Render at half res for performance, CSS scales up
export const VIDEO_WIDTH = 640;
export const VIDEO_HEIGHT = 360;

// Detection throttle: run MediaPipe every N frames
export const DETECTION_INTERVAL = 3;
