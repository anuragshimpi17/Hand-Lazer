/**
 * Web Audio API synthesized sound effects.
 * No external audio files — everything is generated on the fly.
 */

let audioCtx = null;
let masterGain = null;
let laserOsc = null;
let laserGain = null;
let isInitialized = false;

/**
 * Initialize AudioContext (must be called from a user gesture).
 */
export function initAudio() {
  if (isInitialized) return;

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(audioCtx.destination);

    // Laser hum oscillator (continuous, modulated by pinch)
    laserOsc = audioCtx.createOscillator();
    laserGain = audioCtx.createGain();
    laserGain.gain.value = 0;

    laserOsc.type = 'sawtooth';
    laserOsc.frequency.value = 80;
    laserOsc.connect(laserGain);
    laserGain.connect(masterGain);
    laserOsc.start();

    isInitialized = true;
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

/**
 * Update laser hum based on pinch strength.
 * @param {number} pinchStrength - 0 to 1
 */
export function updateLaserHum(pinchStrength) {
  if (!isInitialized || !laserGain) return;
  // Smoothly ramp the gain
  const targetGain = pinchStrength * 0.4;
  laserGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.05);
  // Modulate frequency with pinch
  laserOsc.frequency.setTargetAtTime(
    80 + pinchStrength * 200,
    audioCtx.currentTime,
    0.05
  );
}

/**
 * Trigger a short spark/crackle sound.
 * @param {number} intensity - 0 to 1
 */
export function triggerSpark(intensity) {
  if (!isInitialized || intensity < 0.3) return;

  try {
    const bufferSize = audioCtx.sampleRate * 0.05; // 50ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // White noise with exponential decay
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const sparkGain = audioCtx.createGain();
    sparkGain.gain.value = intensity * 0.2;

    // High-pass filter for crackle
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    source.connect(filter);
    filter.connect(sparkGain);
    sparkGain.connect(masterGain);
    source.start();
  } catch (e) {
    // Silently ignore if too many concurrent sounds
  }
}

/**
 * Set master volume (0-1).
 */
export function setVolume(volume) {
  if (masterGain) {
    masterGain.gain.setTargetAtTime(volume * 0.15, audioCtx.currentTime, 0.05);
  }
}

/**
 * Resume audio context if suspended (browser autoplay policy).
 */
export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
