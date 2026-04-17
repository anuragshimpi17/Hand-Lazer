import { drawSkeleton } from './skeletonRenderer.js';
import { drawLasers, drawCrossHandLasers } from './laserRenderer.js';
import { fadeTrailCanvas, drawTrails } from './trailRenderer.js';
import { emitParticles, updateParticles, drawParticles } from './particleRenderer.js';
import { updateLaserHum, triggerSpark } from './soundEngine.js';

/**
 * Main render loop orchestrator.
 * Manages 3 canvas layers: video, trail, FX.
 * 
 * MIRROR STRATEGY: No per-canvas mirroring here.
 * The CSS on .tracker-container applies transform: scaleX(-1) to mirror
 * the ENTIRE stack uniformly, so landmarks always align with the video.
 */
export class Renderer {
  constructor({ videoCanvas, trailCanvas, fxCanvas, videoElement }) {
    this.videoCtx = videoCanvas.getContext('2d');
    this.trailCtx = trailCanvas.getContext('2d');
    this.fxCtx = fxCanvas.getContext('2d');
    this.video = videoElement;

    this.width = videoCanvas.width;
    this.height = videoCanvas.height;

    this.settings = {
      showSkeleton: true,
      showLasers: true,
      showParticles: true,
      showTrails: true,
      soundEnabled: false,
    };

    this.lastTime = 0;
    this.startTime = performance.now() / 1000;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  renderFrame(smoothedHands, gestures, timestamp) {
    const dt = this.lastTime ? (timestamp - this.lastTime) / 1000 : 1 / 60;
    this.lastTime = timestamp;
    const time = timestamp / 1000 - this.startTime;

    // ─── Layer 1: Video (draw UNMIRRORED — CSS handles mirroring) ───
    this.videoCtx.drawImage(this.video, 0, 0, this.width, this.height);

    // ─── Layer 2: Trails ───
    if (this.settings.showTrails) {
      fadeTrailCanvas(this.trailCtx, this.width, this.height);
      drawTrails(this.trailCtx, smoothedHands, this.width, this.height, time);
    }

    // ─── Layer 3: FX ───
    this.fxCtx.clearRect(0, 0, this.width, this.height);

    if (this.settings.showSkeleton) {
      smoothedHands.forEach((landmarks, handIndex) => {
        drawSkeleton(this.fxCtx, landmarks, handIndex, this.width, this.height, time);
      });
    }

    if (this.settings.showLasers) {
      smoothedHands.forEach((landmarks, handIndex) => {
        const gesture = gestures[handIndex] || {};
        drawLasers(this.fxCtx, landmarks, handIndex, this.width, this.height, time, gesture);
      });
      drawCrossHandLasers(this.fxCtx, smoothedHands, this.width, this.height, time);
    }

    if (this.settings.showParticles) {
      emitParticles(smoothedHands, gestures, this.width, this.height, time);
      updateParticles(dt);
      drawParticles(this.fxCtx);
    }

    // ─── Sound ───
    if (this.settings.soundEnabled && gestures.length > 0) {
      const maxPinch = Math.max(...gestures.map((g) => g.pinchStrength || 0));
      const maxSpeed = Math.max(...gestures.map((g) => g.speed || 0));
      updateLaserHum(maxPinch);
      triggerSpark(maxSpeed);
    } else {
      updateLaserHum(0);
    }
  }
}
