import type { Decor, Obstacle, Particle } from '../types'
import type { GameEngine } from './GameEngine'
import { GROUND_HEIGHT, PICKUP_SIZE, PICKUP_Y, PLAYER_SIZE, PLAYER_X } from './constants'

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

const stripeCache = new Map<string, CanvasPattern>()

function getStripePattern(ctx: CanvasRenderingContext2D, colorA: string, colorB: string): CanvasPattern {
  const key = colorA + colorB
  const cached = stripeCache.get(key)
  if (cached) return cached

  const tile = document.createElement('canvas')
  tile.width = 28
  tile.height = 28
  const tctx = tile.getContext('2d')!
  tctx.fillStyle = colorB
  tctx.fillRect(0, 0, 28, 28)
  tctx.fillStyle = colorA
  tctx.save()
  tctx.translate(14, 14)
  tctx.rotate((-45 * Math.PI) / 180)
  tctx.fillRect(-28, -7, 56, 14)
  tctx.restore()

  const pattern = ctx.createPattern(tile, 'repeat')!
  stripeCache.set(key, pattern)
  return pattern
}

/** Desenha as duas faixas de perigo (assinatura visual da marca), no topo e na base da tela. */
export function drawHazardBar(ctx: CanvasRenderingContext2D, y: number, width: number, height: number) {
  ctx.fillStyle = getStripePattern(ctx, '#f4c300', '#0d0b10')
  ctx.fillRect(0, y, width, height)
}

export function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, bgTop: string, bgBottom: string) {
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, bgTop)
  grad.addColorStop(1, bgBottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
}

export function drawGround(ctx: CanvasRenderingContext2D, width: number, groundScreenY: number, groundA: string, groundB: string, accent: string) {
  ctx.fillStyle = getStripePattern(ctx, groundA, groundB)
  ctx.fillRect(0, groundScreenY, width, GROUND_HEIGHT)
  ctx.fillStyle = accent
  ctx.fillRect(0, groundScreenY, width, 3)
}

export function drawDecor(ctx: CanvasRenderingContext2D, decor: Decor, groundScreenY: number, gameClock: number) {
  const sway = Math.sin(gameClock * 1.6 + decor.phase) * (Math.PI / 36)
  const baseX = decor.x + decor.w / 2
  const baseY = groundScreenY

  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.translate(baseX, baseY)
  ctx.rotate(sway)

  if (decor.kind === 'tree') {
    ctx.fillStyle = decor.color ?? '#1d3b22'
    ctx.beginPath()
    ctx.moveTo(-decor.w / 2, 0)
    ctx.lineTo(decor.w / 2, 0)
    ctx.lineTo(0, -decor.h)
    ctx.closePath()
    ctx.fill()
  } else if (decor.kind === 'rock') {
    ctx.fillStyle = decor.color ?? '#3f6b34'
    roundRectPath(ctx, -decor.w / 2, -decor.h, decor.w, decor.h, decor.h * 0.4)
    ctx.fill()
  } else if (decor.kind === 'crystal') {
    ctx.fillStyle = decor.color ?? '#cfeeff'
    const w = decor.w, h = decor.h
    ctx.beginPath()
    ctx.moveTo(0, -h)
    ctx.lineTo(w / 2, -h * 0.65)
    ctx.lineTo(w * 0.28, 0)
    ctx.lineTo(-w * 0.28, 0)
    ctx.lineTo(-w / 2, -h * 0.65)
    ctx.closePath()
    ctx.fill()
  } else if (decor.kind === 'building') {
    ctx.fillStyle = decor.color ?? '#242c3d'
    roundRectPath(ctx, -decor.w / 2, -decor.h, decor.w, decor.h, 2)
    ctx.fill()
    // janelas
    ctx.fillStyle = 'rgba(255,224,130,0.75)'
    const cols = Math.max(2, Math.floor(decor.w / 9))
    const rows = Math.max(2, Math.floor(decor.h / 12))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) continue
        const wx = -decor.w / 2 + 3 + c * (decor.w / cols)
        const wy = -decor.h + 6 + r * (decor.h / rows)
        ctx.fillRect(wx, wy, 4, 4)
      }
    }
    // porta
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(-decor.w * 0.17, -decor.h * 0.2, decor.w * 0.34, decor.h * 0.2)
  } else if (decor.kind === 'emoji' && decor.face) {
    ctx.rotate(-sway) // emojis não balançam, só deslizam
    ctx.font = `${decor.h}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(decor.face, 0, 2)
  }
  ctx.restore()
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, groundScreenY: number, accent: string, gameClock: number) {
  const popScale = obs.age >= 160 ? 1 : 0.45 + 0.55 * (obs.age / 160)

  if (obs.type === 'pit') {
    ctx.fillStyle = '#000000'
    ctx.fillRect(obs.x, groundScreenY, obs.width, GROUND_HEIGHT)
    ctx.fillStyle = accent
    ctx.fillRect(obs.x, groundScreenY, obs.width, 4)
    return
  }

  if (obs.type === 'air') {
    const bandCenter = ((obs.bandMin ?? 0) + (obs.bandMax ?? 0)) / 2
    const flap = Math.sin(gameClock * 8 + obs.x * 0.05) * 6
    const screenY = groundScreenY - bandCenter + flap
    ctx.save()
    ctx.translate(obs.x + obs.width / 2, screenY)
    ctx.scale(popScale, popScale)
    ctx.font = '22px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(obs.face ?? '🐦', 0, 0)
    ctx.restore()
    return
  }

  const screenY = groundScreenY - obs.height
  ctx.save()
  ctx.translate(obs.x + obs.width / 2, groundScreenY)
  ctx.scale(popScale, popScale)
  ctx.translate(-obs.width / 2, -groundScreenY)

  ctx.fillStyle = obs.color ?? '#5c3a21'

  if (obs.type === 'car') {
    roundRectPath(ctx, obs.x, screenY, obs.width, obs.height, 7)
    ctx.fill()
    // janela
    ctx.fillStyle = 'rgba(190,225,255,0.92)'
    ctx.fillRect(obs.x + 2, screenY + 2, obs.width - 4, obs.height * 0.36)
    // linha de porta
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.fillRect(obs.x + obs.width / 2 - 1, screenY, 2, obs.height)
    // rodas
    ctx.fillStyle = '#161616'
    ctx.beginPath()
    ctx.arc(obs.x + 6, groundScreenY, 4, 0, Math.PI * 2)
    ctx.arc(obs.x + obs.width - 6, groundScreenY, 4, 0, Math.PI * 2)
    ctx.fill()
  } else if (obs.shape === 'crystal') {
    const w = obs.width, h = obs.height
    ctx.beginPath()
    ctx.moveTo(obs.x + w / 2, screenY)
    ctx.lineTo(obs.x + w, screenY + h * 0.35)
    ctx.lineTo(obs.x + w * 0.78, screenY + h)
    ctx.lineTo(obs.x + w * 0.22, screenY + h)
    ctx.lineTo(obs.x, screenY + h * 0.35)
    ctx.closePath()
    ctx.fill()
  } else if (obs.shape === 'spike') {
    ctx.beginPath()
    ctx.moveTo(obs.x + obs.width / 2, screenY)
    ctx.lineTo(obs.x, groundScreenY)
    ctx.lineTo(obs.x + obs.width, groundScreenY)
    ctx.closePath()
    ctx.fill()
  } else {
    // rock (padrão)
    roundRectPath(ctx, obs.x, screenY, obs.width, obs.height, obs.height * 0.3)
    ctx.fill()
  }

  // contorno cartoon
  ctx.strokeStyle = 'rgba(0,0,0,0.22)'
  ctx.lineWidth = 2
  if (obs.type !== 'car' && obs.shape !== 'crystal' && obs.shape !== 'spike') {
    roundRectPath(ctx, obs.x, screenY, obs.width, obs.height, obs.height * 0.3)
    ctx.stroke()
  }
  ctx.restore()
}

export function drawShadow(ctx: CanvasRenderingContext2D, x: number, groundScreenY: number, heightAboveGround: number) {
  const t = Math.min(heightAboveGround / 140, 1)
  const scale = 1 - t * 0.55
  const opacity = 0.32 * (1 - t * 0.75)
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(x, groundScreenY + 4, 14 * scale, 4 * scale, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  face: string,
  ringColor: string,
  groundScreenY: number,
  playerY: number,
  scaleX: number,
  scaleY: number,
  rotationDeg: number,
  fallProgress = 0
) {
  const cx = PLAYER_X + PLAYER_SIZE / 2
  let cy = groundScreenY - playerY - PLAYER_SIZE / 2
  let extraRotation = 0
  let extraScale = 1
  let alpha = 1

  if (fallProgress > 0) {
    cy += fallProgress * 100
    extraRotation = fallProgress * 65
    extraScale = 1 - fallProgress * 0.6
    alpha = 1 - fallProgress
  }

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(cx, cy)
  ctx.rotate(((rotationDeg + extraRotation) * Math.PI) / 180)
  ctx.scale(scaleX * extraScale, scaleY * extraScale)

  ctx.beginPath()
  ctx.arc(0, 0, PLAYER_SIZE / 2, 0, Math.PI * 2)
  ctx.strokeStyle = ringColor
  ctx.lineWidth = 3
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 3
  ctx.stroke()
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  ctx.font = '22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(face, 0, 1)
  ctx.restore()
}

export function drawHunter(ctx: CanvasRenderingContext2D, x: number, groundScreenY: number, gameClock: number, near: boolean) {
  const wiggle = Math.sin(gameClock * 13) * 6
  ctx.save()
  ctx.translate(x, groundScreenY - PLAYER_SIZE / 2)
  ctx.rotate((wiggle * Math.PI) / 180)
  ctx.scale(-1, 1)
  if (near) {
    ctx.shadowColor = '#ff4136'
    ctx.shadowBlur = 10 + Math.sin(gameClock * 20) * 6
  }
  ctx.font = '22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🐺', 0, 1)
  ctx.restore()
}

export function drawPickup(ctx: CanvasRenderingContext2D, x: number, groundScreenY: number, gameClock: number, accent: string) {
  const bob = Math.sin(gameClock * 6 + x * 0.02) * 4
  const spin = (gameClock * 160) % 360
  const cx = x + PICKUP_SIZE / 2
  const cy = groundScreenY - PICKUP_Y + bob
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((spin * Math.PI) / 180)
  ctx.shadowColor = accent
  ctx.shadowBlur = 8
  ctx.font = '19px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⭐', 0, 0)
  ctx.restore()
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], groundScreenY: number) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, groundScreenY - p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

export function drawHunterWarningVignette(ctx: CanvasRenderingContext2D, width: number, height: number, gameClock: number) {
  const pulse = 0.35 + Math.sin(gameClock * 12) * 0.25
  const grad = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height * 0.75)
  grad.addColorStop(0, 'rgba(255,65,54,0)')
  grad.addColorStop(1, `rgba(255,65,54,${pulse})`)
  ctx.save()
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

const HAZARD_BAR_HEIGHT = 8

/** Orquestra o desenho de um frame inteiro do jogo. */
export function renderFrame(ctx: CanvasRenderingContext2D, engine: GameEngine, width: number, height: number) {
  ctx.clearRect(0, 0, width, height)

  const gameHeight = height - HAZARD_BAR_HEIGHT * 2
  const theme = engine.theme
  const groundScreenY = gameHeight - GROUND_HEIGHT
  const hunterX = PLAYER_X - engine.hunterGap - PLAYER_SIZE * 0.6

  ctx.save()
  ctx.translate(0, HAZARD_BAR_HEIGHT)

  drawBackground(ctx, width, gameHeight, theme.bgTop, theme.bgBottom)

  for (const d of engine.decor) drawDecor(ctx, d, groundScreenY, engine.gameClock)

  drawGround(ctx, width, groundScreenY, theme.groundA, theme.groundB, theme.accent)

  drawShadow(ctx, PLAYER_X + PLAYER_SIZE / 2, groundScreenY, engine.player.y)
  drawShadow(ctx, hunterX, groundScreenY, 0)

  for (const obs of engine.obstacles) drawObstacle(ctx, obs, groundScreenY, theme.accent, engine.gameClock)
  for (const pk of engine.pickups) drawPickup(ctx, pk.x, groundScreenY, engine.gameClock, theme.accent)

  drawHunter(ctx, hunterX, groundScreenY, engine.gameClock, engine.hunterNear)

  const visual = engine.getPlayerVisual()
  const fallProgress = engine.getFallProgress()
  drawPlayer(
    ctx, engine.currentAnimal.face, engine.accentColor, groundScreenY,
    engine.player.y + visual.bobY, visual.scaleX, visual.scaleY, visual.rotation, fallProgress
  )

  drawParticles(ctx, engine.particles, groundScreenY)

  if (engine.status === 'playing' && engine.hunterNear) {
    drawHunterWarningVignette(ctx, width, gameHeight, engine.gameClock)
  }

  ctx.restore()

  drawHazardBar(ctx, 0, width, HAZARD_BAR_HEIGHT)
  drawHazardBar(ctx, height - HAZARD_BAR_HEIGHT, width, HAZARD_BAR_HEIGHT)
}
