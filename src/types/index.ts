export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover'

export type ObstacleType = 'wall' | 'car' | 'pit' | 'air'
export type ObstacleShape = 'rock' | 'crystal' | 'spike' | 'car' | 'pit' | 'air'

export interface ObstacleVariant {
  type: ObstacleType
  shape?: ObstacleShape
  color?: string
  colors?: string[]
  minH?: number
  maxH?: number
  minW: number
  maxW: number
  weight?: number
}

export interface AirVariant {
  face: string
  bandMin: number
  bandMax: number
  width: number
}

export type DecorKind = 'tree' | 'rock' | 'crystal' | 'building' | 'emoji'

export interface DecorVariant {
  kind: DecorKind
  color?: string
  face?: string
  min?: number
  max?: number
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
  weight?: number
}

export interface Theme {
  name: string
  bgTop: string
  bgBottom: string
  groundA: string
  groundB: string
  accent: string
  obstacleVariants: ObstacleVariant[]
  decorVariants: DecorVariant[]
  air: AirVariant
}

export interface Animal {
  id: string
  name: string
  unlock: number
  face: string
}

export interface PlayerState {
  y: number
  vy: number
  jumpsUsed: number
}

export interface Obstacle {
  id: number
  x: number
  width: number
  height: number
  type: ObstacleType
  shape?: ObstacleShape
  color?: string
  passed: boolean
  age: number
  bandMin?: number
  bandMax?: number
  face?: string
}

export interface Decor {
  id: number
  x: number
  kind: DecorKind
  color?: string
  face?: string
  w: number
  h: number
  phase: number
}

export interface Pickup {
  id: number
  x: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  gravity?: boolean
}

export type DeathReason = 'obstacle' | 'pit' | 'air' | 'hunter'

export interface GameSnapshot {
  status: GameStatus
  score: number
  level: number
  phaseLabel: string
  highScore: number
  attempts: number
  items: number
  isNewRecord: boolean
  deathReason: DeathReason | null
}
