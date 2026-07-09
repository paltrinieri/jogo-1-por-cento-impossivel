import type { Particle } from '../types'

export function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  color: string,
  opts: { speed?: number; life?: number; size?: number; gravity?: boolean } = {}
) {
  const speed = opts.speed ?? 160
  const life = opts.life ?? 0.5
  const size = opts.size ?? 4
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const mag = speed * (0.4 + Math.random() * 0.6)
    particles.push({
      x, y,
      vx: Math.cos(angle) * mag,
      vy: Math.sin(angle) * mag,
      life,
      maxLife: life,
      size: size * (0.6 + Math.random() * 0.8),
      color,
      gravity: opts.gravity ?? true,
    })
  }
}

export function spawnDust(particles: Particle[], x: number, y: number) {
  spawnBurst(particles, x, y, 8, 'rgba(255,255,255,0.7)', { speed: 70, life: 0.35, size: 4, gravity: false })
}

export function spawnHitBurst(particles: Particle[], x: number, y: number, color = '#ff4136') {
  spawnBurst(particles, x, y, 18, color, { speed: 220, life: 0.55, size: 5, gravity: true })
}

export function spawnScorePop(particles: Particle[], x: number, y: number, color: string) {
  spawnBurst(particles, x, y, 6, color, { speed: 90, life: 0.4, size: 3, gravity: false })
}

export function updateParticles(particles: Particle[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.life -= dt
    if (p.life <= 0) {
      particles.splice(i, 1)
      continue
    }
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (p.gravity) p.vy += 900 * dt
    p.vx *= 1 - Math.min(dt * 2, 1)
  }
}
