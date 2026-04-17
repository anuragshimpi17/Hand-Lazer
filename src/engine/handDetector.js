import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarker = null;

/**
 * Initialize and return the MediaPipe HandLandmarker.
 * Loads the model from the Google CDN. Reuses singleton.
 */
export async function createHandDetector() {
  if (handLandmarker) return handLandmarker;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return handLandmarker;
}

/**
 * Run detection on a video frame.
 * @param {HTMLVideoElement} video
 * @param {number} timestamp - performance.now() timestamp
 * @returns {{ landmarks: Array, handedness: Array }}
 */
export function detectHands(video, timestamp) {
  if (!handLandmarker) return { landmarks: [], handedness: [] };
  const results = handLandmarker.detectForVideo(video, timestamp);
  return {
    landmarks: results.landmarks || [],
    handedness: results.handednesses || [],
  };
}
