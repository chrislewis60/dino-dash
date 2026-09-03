// ─── Geometry ────────────────────────────────────────────────────────────────

export interface Vec2 {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

// ─── Game State Machine ───────────────────────────────────────────────────────

export type GameState = 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver'

// ─── Entities ─────────────────────────────────────────────────────────────────

export type EntityType =
  | 'player'
  | 'meteor'
  | 'lavaVent'
  | 'pterodactyl'
  | 'platform'
  | 'spikePit'
  | 'fossil'
  | 'egg'
  | 'powerup'

export type PlayerState = 'running' | 'jumping' | 'doubleJumping' | 'sliding' | 'dead'

export type HazardType = 'meteor' | 'lavaVent' | 'pterodactyl' | 'spikePit'

export type PowerUpType = 'shield' | 'sprint' | 'magnet' | 'roar'

export interface Entity {
  id: string
  type: EntityType
  x: number
  y: number
  width: number
  height: number
  active: boolean
}

export interface PlayerEntity extends Entity {
  type: 'player'
  velocityX: number
  velocityY: number
  state: PlayerState
  jumpsRemaining: number
  slideTimer: number
  shield: boolean
  shieldTimer: number
  sprintActive: boolean
  sprintTimer: number
  magnetActive: boolean
  magnetTimer: number
  roarActive: boolean
  roarTimer: number
}

export interface MeteorEntity extends Entity {
  type: 'meteor'
  velocityX: number
  velocityY: number
  warningX: number  // x position of ground shadow
}

export interface LavaVentEntity extends Entity {
  type: 'lavaVent'
  phase: 'idle' | 'warning' | 'erupting' | 'cooling'
  phaseTimer: number
  column: { x: number; y: number; height: number } | null
}

export interface PterodactylEntity extends Entity {
  type: 'pterodactyl'
  velocityX: number
  velocityY: number
  phase: 'patrolling' | 'diving' | 'retreating'
  patrolStartX: number
  patrolEndX: number
}

export interface PlatformEntity extends Entity {
  type: 'platform'
  crumbling: boolean
  crumbleTimer: number
}

export interface SpikePitEntity extends Entity {
  type: 'spikePit'
}

export interface CollectibleEntity extends Entity {
  type: 'fossil' | 'egg'
  collected: boolean
  magnetPull: boolean
}

export interface PowerUpEntity extends Entity {
  type: 'powerup'
  powerType: PowerUpType
  collected: boolean
}

// ─── Level Config ─────────────────────────────────────────────────────────────

export interface SpawnRule {
  entityType: HazardType | 'fossil' | 'egg' | 'powerup' | 'platform'
  intervalMs: number
  intervalVariance: number  // ± ms randomisation
  quantity: number
}

export interface LevelConfig {
  id: number
  name: string
  backgroundImage?: string
  backgroundScrollFactor?: number
  showGround?: boolean
  backgroundLayers: BackgroundLayerConfig[]
  groundColor: string
  skyColor: string
  platformColor: string
  spawnRules: SpawnRule[]
  baseSpeedPx: number       // initial horizontal scroll speed in px/s
  maxSpeedPx: number        // speed cap
  speedRampPerSecond: number // px/s increase per second
  lengthMs: number           // how long the level lasts (ms) before level-complete
  scoreMultiplier: number
}

export interface BackgroundLayerConfig {
  color: string
  scrollFactor: number  // 0 = static, 1 = scrolls with world
  shapes: BackgroundShape[]
}

export interface BackgroundShape {
  type: 'rect' | 'circle' | 'triangle'
  x: number
  y: number
  width: number
  height: number
  color: string
}

// ─── Score & Game Stats ───────────────────────────────────────────────────────

export interface GameStats {
  score: number
  lives: number
  level: number
  distance: number
  fossils: number
  enemiesStomped: number
  activeLevel: LevelConfig | null
}

// ─── Input ────────────────────────────────────────────────────────────────────

export interface InputState {
  jump: boolean
  jumpPressed: boolean   // true only on the frame the key was pressed
  slide: boolean
  slidePressed: boolean
  pause: boolean
  pausePressed: boolean
}
