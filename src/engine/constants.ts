// Física do pulo
export const GRAVITY = 2600
export const JUMP_VELOCITY = 780
export const GROUND_Y = 0
export const PLAYER_SIZE = 34
export const HITBOX_PADDING = 6
export const MAX_JUMPS = 2
export const PLAYER_X = 56
export const GROUND_HEIGHT = 64

// Curva de dificuldade por fase (velocidade e frequência de obstáculos)
export function getDifficultyForLevel(level: number) {
  const speed = Math.min(190 + (level - 1) * 46, 900)
  const spawnInterval = Math.max(1550 - (level - 1) * 75, 620)
  return { speed, spawnInterval }
}

// Sistema de fases: fase 1 pede 5 obstáculos, sobe 2 a cada fase
export const LEVEL_1_REQUIREMENT = 5
export const LEVEL_REQUIREMENT_STEP = 2
export const THEMES_PER_WORLD = 6 // atualizado depois de themes.ts carregar (ver phaseLabel)

export function phaseLabel(level: number, themeCount: number): string {
  const stage = ((level - 1) % themeCount) + 1
  const world = Math.floor((level - 1) / themeCount) + 1
  return `${world}-${stage}`
}

// Buraco (pit)
export const PIT_SAFE_HEIGHT = 24

// Obstáculo aéreo
export const AIR_SIZE = 26
export const AIR_SPAWN_MIN = 3500
export const AIR_SPAWN_MAX = 6500
export const AIR_START_LEVEL = 2

// Lobo caçador
export const HUNTER_MAX_GAP = 220
export const HUNTER_BASE_CATCHUP = 6
export const HUNTER_LEVEL_CATCHUP_STEP = 1.4
export const HUNTER_WARNING_GAP = 70
export const HUNTER_LEVELUP_RELIEF = 40

// Itens colecionáveis
export const PICKUP_Y = 78
export const PICKUP_SIZE = 24
export const MAX_ITEMS = 3
export const ITEM_GAP_BOOST = 90
export const ITEM_SLOW_DURATION = 3000
export const ITEM_SLOW_FACTOR = 0.4
export const PICKUP_SPAWN_MIN = 4500
export const PICKUP_SPAWN_MAX = 7500

// Decoração de fundo (parallax)
export const DECOR_SPEED = 110
export const DECOR_SPAWN_INTERVAL = 700

// Esmagamento ao pousar
export const LAND_SQUASH_MS = 180

export const STORAGE_KEYS = {
  highScore: '1pi_highscore',
  attempts: '1pi_attempts',
  animal: '1pi_animal',
  color: '1pi_color',
  sound: '1pi_sound',
}

export const ACCENT_COLORS = ['#f4c300', '#37d67a', '#ff4136', '#00e5ff', '#c9c9ff', '#ffffff']

export function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function pickWeighted<T extends { weight?: number }>(list: T[]): T {
  const total = list.reduce((sum, item) => sum + (item.weight ?? 1), 0)
  let r = Math.random() * total
  for (const item of list) {
    r -= item.weight ?? 1
    if (r <= 0) return item
  }
  return list[list.length - 1]
}
