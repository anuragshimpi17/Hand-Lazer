import { useEffect, useRef, useCallback, useState } from 'react';
import { createHandDetector, detectHands } from '../engine/handDetector.js';
import { smoothAllHands } from '../engine/interpolation.js';
import { detectAllGestures } from '../engine/gestureDetector.js';
import { Renderer } from '../engine/renderer.js';
import { VIDEO_WIDTH, VIDEO_HEIGHT, DETECTION_INTERVAL } from '../utils/constants.js';

export default function HandTracker({ settings }) {
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const fxCanvasRef = useRef(null);
  const rendererRef = useRef(null);
  const prevLandmarksRef = useRef(null);
  const lastDetectionRef = useRef(null); // cache last detection result
  const animFrameRef = useRef(null);
  const frameCountRef = useRef(0);
  const [status, setStatus] = useState('Initializing...');
  const [fps, setFps] = useState(0);

  // FPS tracking — lightweight, no array shifting
  const fpsCounterRef = useRef({ count: 0, lastTime: 0 });

  const updateFps = useCallback((timestamp) => {
    const counter = fpsCounterRef.current;
    counter.count++;
    if (timestamp - counter.lastTime >= 1000) {
      setFps(counter.count);
      counter.count = 0;
      counter.lastTime = timestamp;
    }
  }, []);

  // Sync settings
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    let stopped = false;

    async function init() {
      try {
        setStatus('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: VIDEO_WIDTH },
            height: { ideal: VIDEO_HEIGHT },
            facingMode: 'user',
          },
        });

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        setStatus('Loading hand tracking model...');
        await createHandDetector();

        const renderer = new Renderer({
          videoCanvas: videoCanvasRef.current,
          trailCanvas: trailCanvasRef.current,
          fxCanvas: fxCanvasRef.current,
          videoElement: video,
        });
        renderer.updateSettings(settings);
        rendererRef.current = renderer;

        setStatus('');

        // ─── Throttled Main Loop ───
        function loop() {
          if (stopped) return;

          const timestamp = performance.now();
          updateFps(timestamp);
          frameCountRef.current++;

          // Only run MediaPipe every N frames
          let smoothedHands;
          if (frameCountRef.current % DETECTION_INTERVAL === 0) {
            const { landmarks: rawHands } = detectHands(video, timestamp);
            smoothedHands = smoothAllHands(rawHands, prevLandmarksRef.current);
            prevLandmarksRef.current = smoothedHands;
            lastDetectionRef.current = smoothedHands;
          } else {
            // Reuse last detection result
            smoothedHands = lastDetectionRef.current || [];
          }

          const gestures = detectAllGestures(smoothedHands);
          renderer.renderFrame(smoothedHands, gestures, timestamp);

          animFrameRef.current = requestAnimationFrame(loop);
        }

        animFrameRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error('Initialization error:', err);
        setStatus(`Error: ${err.message}`);
      }
    }

    init();

    return () => {
      stopped = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      const video = videoRef.current;
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fpsColor = fps >= 45 ? '#39ff14' : fps >= 30 ? '#ffff00' : '#ff3333';

  return (
    <div className="tracker-container" id="tracker-container">
      <video
        ref={videoRef}
        className="tracker-video"
        playsInline
        muted
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <canvas
        ref={videoCanvasRef}
        className="tracker-canvas"
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        id="video-canvas"
      />
      <canvas
        ref={trailCanvasRef}
        className="tracker-canvas"
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        id="trail-canvas"
      />
      <canvas
        ref={fxCanvasRef}
        className="tracker-canvas"
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        id="fx-canvas"
      />
      <div className="fps-counter" id="fps-counter" style={{ color: fpsColor }}>
        {fps} FPS
      </div>
      {status && (
        <div className="status-overlay" id="status-overlay">
          <div className="status-spinner" />
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
