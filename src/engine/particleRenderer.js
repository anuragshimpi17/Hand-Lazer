import { FINGERTIPS, MAX_PARTICLES } from '../utils/constants.js';

/**
 * Lightweight object-pooled particle system.
 * NO shadowBlur — uses simple filled circles with alpha.
 */

const particles = new Array(MAX_PARTICLES);
for (let i = 0; i < MAX_PARTICLES; i++) {
  particles[i] = { alive: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 0, size: 0, hue: 0 };
}

let spawnCooldown = 0;

function spawnParticle(x, y, speed, hue) {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particles[i];
    if (!p.alive) {
      const angle = Math.random() * Math.PI * 2;
      const vel = (0.3 + Math.random() * 1.5) * (1 + speed * 2);
      p.alive = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * vel;
      p.vy = Math.sin(angle) * vel - 0.5;
      p.life = 1;
      p.maxLife = 0.3 + Math.random() * 0.5;
      p.size = 1 + Math.random() * 2;
      p.hue = hue;
      return;
    }
  }
}

/**
 * Spawn particles — throttled: only every other frame equivalent.
 */
export function emitParticles(allLandmarks, allGestures, width, height, time) {
  spawnCooldown++;
  if (spawnCooldown % 2 !== 0) return; // skip every other call

  allLandmarks.forEach((landmarks, handIndex) => {
    if (!landmarks || landmarks.length < 21) return;

    const gesture = allGestures[handIndex] || { speed: 0 };
    // Only 1 particle per fingertip per emission cycle
    FINGERTIPS.forEach((tipIdx, fingerIndex) => {
      const lm = landmarks[tipIdx];
      const hue = (handIndex * 180 + fingerIndex * 60 + time * 40) % 360;
      spawnParticle(lm.x * width, lm.y * height, gesture.speed, hue);
    });
  });
}

/**
 * Update particle physics — simple and fast.
 */
export function updateParticles(dt) {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particles[i];
    if (!p.alive) continue;

    p.life -= dt / p.maxLife;
    if (p.life <= 0) { p.alive = false; continue; }

    p.vy += 20 * dt;
    p.x += p.vx;
    p.y += p.vy;
    p.size *= 0.98;
  }
}

/**
 * Render particles — NO shadowBlur, simple filled arcs.
 */
export function drawParticles(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < MAX_PARTICLES; i++) {
    const p = particles[i];
    if (!p.alive || p.size < 0.3) continue;

    ctx.globalAlpha = Math.max(0, p.life) * 0.8;
    ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
