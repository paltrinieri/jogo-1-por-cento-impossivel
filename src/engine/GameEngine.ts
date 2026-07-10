import type { Animal, DeathReason, Decor, GameStatus, Obstacle, ObstacleShape, Particle, Pickup, PlayerState, Theme } from '../types'
import { unlockedAnimals } from './animals'
import { sfx, ensureAudio } from './audio'
import {
  ACCENT_COLORS, AIR_SIZE, AIR_SPAWN_MAX, AIR_SPAWN_MIN, AIR_START_LEVEL,
  DECOR_SPAWN_INTERVAL, DECOR_SPEED, GRAVITY, GROUND_HEIGHT, GROUND_Y,
  HUNTER_BASE_CATCHUP, HUNTER_LEVELUP_RELIEF, HUNTER_LEVEL_CATCHUP_STEP, HUNTER_MAX_GAP, HUNTER_WARNING_GAP,
  ITEM_GAP_BOOST, ITEM_SLOW_DURATION, ITEM_SLOW_FACTOR, JUMP_VELOCITY,
  LAND_SQUASH_MS, LEVEL_1_REQUIREMENT, LEVEL_REQUIREMENT_STEP, MAX_ITEMS, MAX_JUMPS,
  PICKUP_SIZE, PICKUP_SPAWN_MAX, PICKUP_SPAWN_MIN, PICKUP_Y, PIT_SAFE_HEIGHT,
  PLAYER_SIZE, PLAYER_X, HITBOX_PADDING, OBSTACLE_HITBOX_PADDING, DEBUG_COLLISION, STORAGE_KEYS, getDifficultyForLevel, phaseLabel as computePhaseLabel,
  pickWeighted, randRange,
} from './constants'
import { spawnDust, spawnHitBurst, spawnScorePop, updateParticles } from './particles'
import { readNum, readStr, writeVal } from './storage'
import { THEMES } from './themes'

export interface EngineCallbacks {
  onStatusChange?: (status: GameStatus) => void
  onScoreChange?: (score: number) => void
  onLevelUp?: (level: number, themeName: string, phaseLabel: string) => void
  onItemsChange?: (items: number) => void
  onProgressChange?: (ratio: number) => void
  onGameOver?: (reason: DeathReason, score: number, isNewRecord: boolean) => void
}

export class GameEngine {
  status: GameStatus = 'idle'
  score = 0
  level = 1
  levelRequirement = LEVEL_1_REQUIREMENT
  obstaclesThisLevel = 0
  themeIndex = 0

  highScore: number
  attempts: number
  soundOn: boolean
  animalIndex = 0
  colorIndex: number
  items = 0

  hunterGap = HUNTER_MAX_GAP
  hunterSlowTimer = 0
  landSquashTimer = 0
  gameClock = 0
  wasAirborne = false
  deathReason: DeathReason | null = null
  isNewRecordThisRun = false
  postDeathElapsed = 0

  player: PlayerState = { y: 0, vy: 0, jumpsUsed: 0 }
  obstacles: Obstacle[] = []
  decor: Decor[] = []
  pickups: Pickup[] = []
  particles: Particle[] = []

  canvasWidth = 360
  // estado temporário para destacar a colisão antes de efetivar o fim de jogo
  highlightingDeath: { obsId: number; reason: DeathReason; elapsed: number } | null = null

  private idCounter = 0
  private spawnTimer = 0
  private airSpawnTimer = 0
  private nextAirSpawnIn = 4000
  private decorTimer = 0
  private pickupTimer = 0
  private nextPickupIn = 4000
  private callbacks: EngineCallbacks

  constructor(callbacks: EngineCallbacks = {}) {
    this.callbacks = callbacks
    this.highScore = readNum(STORAGE_KEYS.highScore, 0)
    this.attempts = readNum(STORAGE_KEYS.attempts, 0)
    this.soundOn = readNum(STORAGE_KEYS.sound, 1) === 1
    this.colorIndex = readNum(STORAGE_KEYS.color, 0)
    if (this.colorIndex < 0 || this.colorIndex >= ACCENT_COLORS.length) this.colorIndex = 0

    const savedAnimalId = readStr(STORAGE_KEYS.animal)
    const unlocked = unlockedAnimals(this.highScore)
    const idx = unlocked.findIndex((a) => a.id === savedAnimalId)
    this.animalIndex = idx >= 0 ? idx : 0
  }

  // ---------- getters derivados ----------
  get theme(): Theme {
    return THEMES[this.themeIndex]
  }

  get currentAnimal(): Animal {
    const unlocked = unlockedAnimals(this.highScore)
    if (this.animalIndex >= unlocked.length) this.animalIndex = 0
    return unlocked[this.animalIndex]
  }

  get accentColor(): string {
    return ACCENT_COLORS[this.colorIndex]
  }

  get phaseLabel(): string {
    return computePhaseLabel(this.level, THEMES.length)
  }

  get hunterNear(): boolean {
    return this.hunterGap < HUNTER_WARNING_GAP
  }

  // ---------- customização ----------
  setViewport(width: number) {
    this.canvasWidth = width
  }

  cycleAnimal(dir: number) {
    const unlocked = unlockedAnimals(this.highScore)
    this.animalIndex = (this.animalIndex + dir + unlocked.length) % unlocked.length
    writeVal(STORAGE_KEYS.animal, unlocked[this.animalIndex].id)
  }

  setColor(index: number) {
    this.colorIndex = index
    writeVal(STORAGE_KEYS.color, index)
  }

  toggleSound(): boolean {
    this.soundOn = !this.soundOn
    writeVal(STORAGE_KEYS.sound, this.soundOn ? 1 : 0)
    return this.soundOn
  }

  // ---------- fluxo do jogo ----------
  private setStatus(s: GameStatus) {
    this.status = s
    this.callbacks.onStatusChange?.(s)
  }

  start() {
    this.attempts += 1
    writeVal(STORAGE_KEYS.attempts, this.attempts)

    this.score = 0
    this.level = 1
    this.levelRequirement = LEVEL_1_REQUIREMENT
    this.obstaclesThisLevel = 0
    this.themeIndex = 0
    this.items = 0
    this.hunterGap = HUNTER_MAX_GAP
    this.hunterSlowTimer = 0
    this.landSquashTimer = 0
    this.gameClock = 0
    this.wasAirborne = false
    this.deathReason = null
    this.isNewRecordThisRun = false
    this.postDeathElapsed = 0

    this.player = { y: GROUND_Y, vy: 0, jumpsUsed: 0 }
    this.obstacles = []
    this.decor = []
    this.pickups = []
    this.particles = []

    this.spawnTimer = 0
    this.airSpawnTimer = 0
    this.nextAirSpawnIn = randRange(AIR_SPAWN_MIN, AIR_SPAWN_MAX)
    this.decorTimer = 0
    this.pickupTimer = 0
    this.nextPickupIn = randRange(3000, 5000)

    ensureAudio()
    this.setStatus('playing')
    this.callbacks.onScoreChange?.(0)
    this.callbacks.onItemsChange?.(0)
    this.callbacks.onProgressChange?.(0)
  }

  pause() {
    if (this.status !== 'playing') return
    this.setStatus('paused')
  }

  resume() {
    if (this.status !== 'paused') return
    this.setStatus('playing')
  }

  goToMenu() {
    this.setStatus('idle')
  }

  jump() {
    if (this.status !== 'playing') return
    if (this.player.jumpsUsed < MAX_JUMPS) {
      this.player.vy = JUMP_VELOCITY
      this.player.jumpsUsed += 1
      sfx.jump(this.soundOn)
    }
  }

  useItem() {
    if (this.status !== 'playing' || this.items <= 0) return
    this.items -= 1
    this.hunterGap = Math.min(HUNTER_MAX_GAP, this.hunterGap + ITEM_GAP_BOOST)
    this.hunterSlowTimer = ITEM_SLOW_DURATION
    sfx.itemUse(this.soundOn)
    this.callbacks.onItemsChange?.(this.items)
  }

  // ---------- spawn ----------
  private spawnGroundObstacle() {
    const variant = pickWeighted(this.theme.obstacleVariants)
    this.idCounter += 1
    const width = randRange(variant.minW, variant.maxW)
    const height = variant.type === 'pit' ? 0 : randRange(variant.minH ?? 20, variant.maxH ?? 40)
    let color = variant.color
    if (variant.type === 'car' && variant.colors) {
      color = variant.colors[Math.floor(Math.random() * variant.colors.length)]
    }
    this.obstacles.push({
      id: this.idCounter,
      x: this.canvasWidth,
      width, height,
      type: variant.type,
      shape: (variant.shape ?? variant.type) as ObstacleShape,
      color,
      passed: false,
      age: 0,
    })
  }

  private spawnAirObstacle() {
    const av = this.theme.air
    this.idCounter += 1
    const bandY = randRange(av.bandMin, av.bandMax)
    this.obstacles.push({
      id: this.idCounter,
      x: this.canvasWidth,
      width: av.width,
      height: 0,
      type: 'air',
      face: av.face,
      passed: false,
      age: 0,
      bandMin: bandY - AIR_SIZE / 2,
      bandMax: bandY + AIR_SIZE / 2,
    })
  }

  private spawnDecor() {
    const variant = pickWeighted(this.theme.decorVariants)
    this.idCounter += 1
    let w: number, h: number
    if (variant.kind === 'building') {
      w = randRange(variant.minW ?? 26, variant.maxW ?? 46)
      h = randRange(variant.minH ?? 70, variant.maxH ?? 150)
    } else {
      const s = randRange(variant.min ?? 24, variant.max ?? 50)
      w = s
      h = s
    }
    this.decor.push({
      id: this.idCounter,
      x: this.canvasWidth + Math.random() * 80,
      kind: variant.kind,
      color: variant.color,
      face: variant.face,
      w, h,
      phase: Math.random() * Math.PI * 2,
    })
  }

  private spawnPickup() {
    this.idCounter += 1
    this.pickups.push({ id: this.idCounter, x: this.canvasWidth })
  }

  // ---------- fim de jogo ----------
  private endGame(reason: DeathReason) {
    this.deathReason = reason
    sfx.death(this.soundOn)

    const isNewRecord = this.score > this.highScore
    this.isNewRecordThisRun = isNewRecord
    if (isNewRecord) {
      this.highScore = this.score
      writeVal(STORAGE_KEYS.highScore, this.highScore)
    }

    const hitX = PLAYER_X + PLAYER_SIZE / 2
    const hitY = GROUND_HEIGHT + this.player.y + PLAYER_SIZE / 2
    if (reason !== 'pit') {
      spawnHitBurst(this.particles, hitX, hitY, reason === 'hunter' ? '#ff4136' : this.theme.accent)
    }

    this.setStatus('gameover')
    this.callbacks.onGameOver?.(reason, this.score, isNewRecord)
  }

  // ---------- loop principal ----------
  update(dtRaw: number) {
    if (this.status !== 'playing') return
    const dt = Math.min(dtRaw, 0.032)
    this.gameClock += dt

    // Se estamos mostrando destaque visual de colisão, incrementar timer e aguardar
    if (this.highlightingDeath) {
      this.highlightingDeath.elapsed += dt * 1000
      if (this.highlightingDeath.elapsed >= 1000) {
        const reason = this.highlightingDeath.reason
        this.highlightingDeath = null
        this.endGame(reason)
      }
      return
    }

    // física do jogador
    let vy = this.player.vy - GRAVITY * dt
    let y = this.player.y + vy * dt
    let jumpsUsed = this.player.jumpsUsed
    if (y <= GROUND_Y) { y = GROUND_Y; vy = 0; jumpsUsed = 0 }
    this.player = { y, vy, jumpsUsed }

    const isAirborne = this.player.y > 0.5
    if (this.wasAirborne && !isAirborne) {
      this.landSquashTimer = LAND_SQUASH_MS
      spawnDust(this.particles, PLAYER_X + PLAYER_SIZE / 2, GROUND_HEIGHT)
    }
    this.wasAirborne = isAirborne
    if (this.landSquashTimer > 0) this.landSquashTimer = Math.max(0, this.landSquashTimer - dt * 1000)

    const difficulty = getDifficultyForLevel(this.level)

    // lobo caçador
    let slowFactor = 1
    if (this.hunterSlowTimer > 0) {
      this.hunterSlowTimer -= dt * 1000
      slowFactor = ITEM_SLOW_FACTOR
    }
    const catchup = (HUNTER_BASE_CATCHUP + (this.level - 1) * HUNTER_LEVEL_CATCHUP_STEP) * slowFactor
    this.hunterGap -= catchup * dt
    if (this.hunterGap <= 0) {
      this.hunterGap = 0
      this.endGame('hunter')
      return
    }

    // cenário de fundo (parallax)
    this.decorTimer += dt * 1000
    if (this.decorTimer >= DECOR_SPAWN_INTERVAL) {
      this.decorTimer = 0
      this.spawnDecor()
    }
    this.decor = this.decor
      .map((d) => ({ ...d, x: d.x - DECOR_SPEED * dt }))
      .filter((d) => d.x > -80)

    // itens colecionáveis
    this.pickupTimer += dt * 1000
    if (this.pickupTimer >= this.nextPickupIn) {
      this.pickupTimer = 0
      this.nextPickupIn = randRange(PICKUP_SPAWN_MIN, PICKUP_SPAWN_MAX)
      this.spawnPickup()
    }
    const remainingPickups: Pickup[] = []
    for (const pk of this.pickups) {
      const px = pk.x - difficulty.speed * dt
      if (px + PICKUP_SIZE < 0) continue
      const overlapH = PLAYER_X < px + PICKUP_SIZE && PLAYER_X + PLAYER_SIZE > px
      const playerTop = this.player.y + PLAYER_SIZE
      const overlapV = playerTop > PICKUP_Y - 14 && this.player.y < PICKUP_Y + 14
      if (overlapH && overlapV) {
        this.items = Math.min(MAX_ITEMS, this.items + 1)
        sfx.collect(this.soundOn)
        spawnScorePop(this.particles, PLAYER_X + PLAYER_SIZE / 2, GROUND_HEIGHT + PICKUP_Y, this.theme.accent)
        this.callbacks.onItemsChange?.(this.items)
        continue
      }
      remainingPickups.push({ ...pk, x: px })
    }
    this.pickups = remainingPickups

    // spawn de obstáculos terrestres e aéreos
    this.spawnTimer += dt * 1000
    if (this.spawnTimer >= difficulty.spawnInterval) {
      this.spawnTimer = 0
      this.spawnGroundObstacle()
    }
    if (this.level >= AIR_START_LEVEL) {
      this.airSpawnTimer += dt * 1000
      if (this.airSpawnTimer >= this.nextAirSpawnIn) {
        this.airSpawnTimer = 0
        this.nextAirSpawnIn = randRange(AIR_SPAWN_MIN, AIR_SPAWN_MAX)
        this.spawnAirObstacle()
      }
    }

    // movimento, pontuação, fases e colisão
    let collided = false
    let reason: DeathReason = 'obstacle'
    let causingObs: Obstacle | null = null
    const remaining: Obstacle[] = []
    for (const obs of this.obstacles) {
      const newX = obs.x - difficulty.speed * dt
      if (newX + obs.width < 0) continue

      let passed = obs.passed
      if (!passed && newX + obs.width < PLAYER_X) {
        passed = true
        this.score += 1
        this.obstaclesThisLevel += 1
        sfx.point(this.soundOn)
        this.callbacks.onScoreChange?.(this.score)

        if (this.obstaclesThisLevel >= this.levelRequirement) {
          this.obstaclesThisLevel = 0
          this.level += 1
          this.levelRequirement += LEVEL_REQUIREMENT_STEP
          this.hunterGap = Math.min(HUNTER_MAX_GAP, this.hunterGap + HUNTER_LEVELUP_RELIEF)
          this.themeIndex = (this.level - 1) % THEMES.length
          this.callbacks.onLevelUp?.(this.level, this.theme.name, this.phaseLabel)
        }
        this.callbacks.onProgressChange?.(this.obstaclesThisLevel / this.levelRequirement)
      }

      
          // ignore obstacles already passed (behind player) or fully off-screen to the right
          const isRenderable = newX < this.canvasWidth && newX + obs.width > -50
          if (passed || !isRenderable) {
            remaining.push({ ...obs, x: newX, passed, age: obs.age + dt * 1000 })
            continue
          }

          // use hitbox circular para o jogador e retângulos reduzidos para obstáculos
          const visual = this.getPlayerVisual()
          const centerX = PLAYER_X + PLAYER_SIZE / 2
          const centerY = this.player.y + PLAYER_SIZE / 2 + visual.bobY
          const radius = Math.max(2, PLAYER_SIZE / 2 - HITBOX_PADDING)

          const obsLeft = newX + OBSTACLE_HITBOX_PADDING
          const obsRight = newX + Math.max(0, obs.width - OBSTACLE_HITBOX_PADDING)

          let closestX: number | null = null
          let closestY: number | null = null

          if (obs.type === 'pit') {
            const horizontalOverlap = centerX > obsLeft && centerX < obsRight
            if (horizontalOverlap && this.player.y < PIT_SAFE_HEIGHT) { collided = true; reason = 'pit'; causingObs = obs }
          } else if (obs.type === 'air') {
            // air obstacles use a band (bandMin/bandMax) measured em altura acima do solo
            const bandMin = (obs.bandMin ?? 0) + OBSTACLE_HITBOX_PADDING
            const bandMax = (obs.bandMax ?? 0) - OBSTACLE_HITBOX_PADDING
            const rectTop = bandMax
            const rectBottom = bandMin
            const rectLeft = obsLeft
            const rectRight = obsRight
            // circle-rect collision
            closestX = Math.max(rectLeft, Math.min(centerX, rectRight))
            closestY = Math.max(rectBottom, Math.min(centerY, rectTop))
            const dx = centerX - closestX
            const dy = centerY - closestY
            if (dx * dx + dy * dy <= radius * radius) { collided = true; reason = 'air'; causingObs = obs }
          } else {
            // ground obstacle: rect from ground (0) up to obs.height
            const rectLeft = obsLeft
            const rectRight = obsRight
            const rectBottom = 0 + OBSTACLE_HITBOX_PADDING
            const rectTop = Math.max(rectBottom, obs.height - OBSTACLE_HITBOX_PADDING)
            closestX = Math.max(rectLeft, Math.min(centerX, rectRight))
            closestY = Math.max(rectBottom, Math.min(centerY, rectTop))
            const dx = centerX - closestX
            const dy = centerY - closestY
            if (dx * dx + dy * dy <= radius * radius) { collided = true; causingObs = obs }
          }

          if (collided && DEBUG_COLLISION) {
            const distance = Math.sqrt((centerX - (closestX ?? 0)) ** 2 + (centerY - (closestY ?? 0)) ** 2)
            console.log('collision debug', {
              obsId: obs.id,
              obsType: obs.type,
              obsX: newX,
              obsWidth: obs.width,
              obsHeight: obs.height,
              obsPassed: passed,
              obsAge: obs.age,
              playerX: centerX,
              playerY: centerY,
              playerRadius: radius,
              closestX, closestY, distance,
              reason,
            })
          }

      remaining.push({ ...obs, x: newX, passed, age: obs.age + dt * 1000 })
    }
    this.obstacles = remaining

    updateParticles(this.particles, dt)

    if (collided) {
      if (!this.highlightingDeath && causingObs) {
        this.highlightingDeath = { obsId: causingObs.id, reason, elapsed: 0 }
      }
      return
    }
  }

  /** Avança um pequeno relógio mesmo após o game over, só para animar a queda no buraco. */
  tickPostDeath(dt: number) {
    if (this.status === 'gameover') this.postDeathElapsed += dt * 1000
  }

  /** Squash & stretch procedural do personagem, calculado a partir da física atual. */
  getPlayerVisual(): { scaleX: number; scaleY: number; rotation: number; bobY: number } {
    const vy = this.player.vy
    const grounded = this.player.y <= 0.5
    let scaleX = 1
    let scaleY = 1
    let rotation = 0
    let bobY = 0

    if (this.landSquashTimer > 0) {
      const remain = this.landSquashTimer / LAND_SQUASH_MS
      scaleY = 1 - remain * 0.32
      scaleX = 1 + remain * 0.26
    } else if (!grounded && vy > 0) {
      const stretchAmt = Math.min(vy / JUMP_VELOCITY, 1) * 0.16
      scaleY = 1 + stretchAmt
      scaleX = 1 - stretchAmt * 0.6
      rotation = -14
    } else if (!grounded && vy < -420) {
      const fallAmt = Math.min((-vy - 420) / 500, 1) * 0.12
      scaleY = 1 - fallAmt
      scaleX = 1 + fallAmt * 0.6
      rotation = 6
    } else if (grounded && this.status === 'playing') {
      bobY = Math.sin(this.gameClock * 11) * 2
      scaleY = 1 + Math.sin(this.gameClock * 11) * 0.025
      scaleX = 1 - Math.sin(this.gameClock * 11) * 0.015
    }

    return { scaleX, scaleY, rotation, bobY }
  }

  /** Progresso (0→1) da animação de queda quando a morte foi por buraco. */
  getFallProgress(): number {
    if (this.deathReason !== 'pit') return 0
    return Math.min(this.postDeathElapsed / 550, 1)
  }
}
