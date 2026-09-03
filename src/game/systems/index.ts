import type {
  PlayerEntity,
  MeteorEntity,
  LavaVentEntity,
  PterodactylEntity,
  PlatformEntity,
  SpikePitEntity,
  CollectibleEntity,
  PowerUpEntity,
  LevelConfig,
  InputState,
} from '@/types'
import { generateId, randomBetween, randomInt } from '@/utils'

const PLATFORM_Y = 435        // ground-level y position
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 500

// Spawn distances from right edge
const SPAWN_X = CANVAS_WIDTH + 60

export class SpawnSystem {
  private timers = new Map<string, number>()

  constructor(
    private levelConfig: LevelConfig,
    private worldSpeed: () => number,
  ) {
    this.resetTimers()
  }

  private resetTimers(): void {
    this.timers.clear()
    for (const rule of this.levelConfig.spawnRules) {
      this.timers.set(rule.entityType, rule.intervalMs)
    }
  }

  updateLevel(config: LevelConfig): void {
    this.levelConfig = config
    this.resetTimers()
  }

  tick(
    deltaMs: number,
    meteors: MeteorEntity[],
    vents: LavaVentEntity[],
    pterodactyls: PterodactylEntity[],
    collectibles: CollectibleEntity[],
    powerups: PowerUpEntity[],
    platforms: PlatformEntity[],
    spikePits: SpikePitEntity[],
  ): void {
    for (const rule of this.levelConfig.spawnRules) {
      const prev = this.timers.get(rule.entityType) ?? rule.intervalMs
      const next = prev - deltaMs
      if (next <= 0) {
        // Reset with variance
        const variance = randomBetween(-rule.intervalVariance, rule.intervalVariance)
        this.timers.set(rule.entityType, rule.intervalMs + variance)
        // Spawn
        for (let i = 0; i < rule.quantity; i++) {
          switch (rule.entityType) {
            case 'meteor':      meteors.push(this.createMeteor()); break
            case 'lavaVent':    vents.push(this.createLavaVent()); break
            case 'pterodactyl': pterodactyls.push(this.createPterodactyl()); break
            case 'fossil':      collectibles.push(this.createFossil()); break
            case 'egg':         collectibles.push(this.createEgg()); break
            case 'powerup':     powerups.push(this.createPowerUp()); break
            case 'platform':    platforms.push(this.createPlatform()); break
            case 'spikePit':    spikePits.push(this.createSpikePit()); break
          }
        }
      } else {
        this.timers.set(rule.entityType, next)
      }
    }
  }

  private createPlatform(): PlatformEntity {
    const width = randomBetween(100, 220)
    const height = 18
    // Platforms appear at varied heights: low (near ground), mid, or high
    const heightOptions = [
      PLATFORM_Y - 110,  // low — one jump up
      PLATFORM_Y - 190,  // mid — two jumps up
    ]
    const y = heightOptions[randomInt(0, heightOptions.length - 1)]
    return {
      id: generateId(),
      type: 'platform',
      x: SPAWN_X,
      y,
      width,
      height,
      active: true,
      crumbling: false,
      crumbleTimer: 0,
    }
  }

  private createSpikePit(): SpikePitEntity {
    const width = randomBetween(40, 90)
    return {
      id: generateId(),
      type: 'spikePit',
      x: SPAWN_X,
      y: PLATFORM_Y - 20,  // sits flush with ground surface
      width,
      height: 20,
      active: true,
    }
  }

  private createMeteor(): MeteorEntity {
    const x = SPAWN_X + randomBetween(0, 200)
    const y = -60
    const angle = randomBetween(200, 250) * (Math.PI / 180) // steep downward angle
    const speed = randomBetween(300, 500)
    return {
      id: generateId(),
      type: 'meteor',
      x, y,
      width: 32, height: 32,
      active: true,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      warningX: x + (PLATFORM_Y - y) * (Math.cos(angle) / Math.sin(angle)),
    }
  }

  private createLavaVent(): LavaVentEntity {
    return {
      id: generateId(),
      type: 'lavaVent',
      x: SPAWN_X + randomBetween(0, 300),
      y: PLATFORM_Y - 10,
      width: 40, height: 20,
      active: true,
      phase: 'idle',
      phaseTimer: randomBetween(800, 1500),
      column: null,
    }
  }

  private createPterodactyl(): PterodactylEntity {
    const startX = SPAWN_X + randomBetween(0, 100)
    return {
      id: generateId(),
      type: 'pterodactyl',
      x: startX,
      y: randomBetween(100, 250),
      width: 50, height: 30,
      active: true,
      velocityX: -this.worldSpeed() * 0.5,
      velocityY: 0,
      phase: 'patrolling',
      patrolStartX: startX,
      patrolEndX: startX - 200,
    }
  }

  private createFossil(): CollectibleEntity {
    return {
      id: generateId(),
      type: 'fossil',
      x: SPAWN_X + randomBetween(0, 400),
      y: randomBetween(PLATFORM_Y - 160, PLATFORM_Y - 40),
      width: 20, height: 20,
      active: true,
      collected: false,
      magnetPull: false,
    }
  }

  private createEgg(): CollectibleEntity {
    return {
      id: generateId(),
      type: 'egg',
      x: SPAWN_X + randomBetween(0, 300),
      y: PLATFORM_Y - 50,
      width: 24, height: 28,
      active: true,
      collected: false,
      magnetPull: false,
    }
  }

  private createPowerUp(): PowerUpEntity {
    const types: PowerUpEntity['powerType'][] = ['shield', 'sprint', 'magnet', 'roar']
    return {
      id: generateId(),
      type: 'powerup',
      x: SPAWN_X + randomBetween(0, 200),
      y: PLATFORM_Y - 80,
      width: 28, height: 28,
      active: true,
      powerType: types[randomInt(0, types.length - 1)],
      collected: false,
    }
  }
}

// ─── Physics System ───────────────────────────────────────────────────────────

const GRAVITY = 1800           // px/s²
const JUMP_VELOCITY = -620     // px/s (negative = up)
const SLIDE_DURATION_MS = 600
const SLIDE_HEIGHT = 30        // crouched hitbox height
const NORMAL_HEIGHT = 60
const NORMAL_WIDTH = 44
const SHIELD_DURATION_MS = 4000
const SPRINT_DURATION_MS = 5000
const MAGNET_DURATION_MS = 8000
const ROAR_DURATION_MS = 2000
const MAGNET_RADIUS = 150
const PLAYER_HORIZONTAL_SPEED = 220
const PLAYER_HORIZONTAL_BOUNDARY = 32

export class PhysicsSystem {
  updatePlayer(
    player: PlayerEntity,
    input: InputState,
    deltaMs: number,
    worldSpeed: number,
    platforms: PlatformEntity[],
  ): void {
    if (player.state === 'dead') return

    const dt = deltaMs / 1000   // convert to seconds

    // ── Power-up timers ──
    if (player.shield)  { player.shieldTimer  -= deltaMs; if (player.shieldTimer  <= 0) player.shield  = false }
    if (player.sprintActive) { player.sprintTimer -= deltaMs; if (player.sprintTimer <= 0) player.sprintActive = false }
    if (player.magnetActive) { player.magnetTimer -= deltaMs; if (player.magnetTimer <= 0) player.magnetActive = false }
    if (player.roarActive)   { player.roarTimer   -= deltaMs; if (player.roarTimer   <= 0) player.roarActive   = false }

    // ── Slide ──
    if (input.slidePressed && player.state !== 'sliding') {
      player.state = 'sliding'
      player.height = SLIDE_HEIGHT
      player.y += NORMAL_HEIGHT - SLIDE_HEIGHT  // shift down to keep feet on ground
      player.slideTimer = SLIDE_DURATION_MS
    }
    if (player.state === 'sliding') {
      player.slideTimer -= deltaMs
      if (player.slideTimer <= 0) {
        player.state = player.y >= PLATFORM_Y - NORMAL_HEIGHT ? 'running' : 'jumping'
        player.height = NORMAL_HEIGHT
        player.y -= NORMAL_HEIGHT - SLIDE_HEIGHT
      }
    }

    // ── Jump (only when not sliding) ──
    if (input.jumpPressed && player.state !== 'sliding' && player.jumpsRemaining > 0) {
      player.velocityY = JUMP_VELOCITY
      player.jumpsRemaining -= 1
      player.state = player.jumpsRemaining === 1 ? 'jumping' : 'doubleJumping'
    }

    // ── Gravity ──
    player.velocityY += GRAVITY * dt
    const prevBottom = player.y + player.height  // bottom before vertical movement
    player.y += player.velocityY * dt

    // ── Elevated platform collision (one-way: land on top only) ──
    for (const platform of platforms) {
      if (!platform.active) continue
      const playerBottom = player.y + player.height
      const horizontalOverlap =
        player.x + player.width > platform.x && player.x < platform.x + platform.width
      if (
        player.velocityY >= 0 &&
        horizontalOverlap &&
        playerBottom >= platform.y &&
        prevBottom <= platform.y + 4
      ) {
        player.y = platform.y - player.height
        player.velocityY = 0
        player.jumpsRemaining = 2
        if (player.state !== 'sliding') player.state = 'running'
      }
    }

    // ── Ground collision ──
    const groundY = PLATFORM_Y - player.height
    if (player.y >= groundY) {
      player.y = groundY
      player.velocityY = 0
      player.jumpsRemaining = 2
      if (player.state !== 'sliding') player.state = 'running'
    }

    // ── Horizontal player motion ──
    const horizontalDirection = Number(input.moveRight) - Number(input.moveLeft)
    player.velocityX = horizontalDirection * PLAYER_HORIZONTAL_SPEED
    const minX = PLAYER_HORIZONTAL_BOUNDARY
    const maxX = CANVAS_WIDTH - player.width - PLAYER_HORIZONTAL_BOUNDARY
    player.x = Math.min(maxX, Math.max(minX, player.x + player.velocityX * dt))
    void worldSpeed
  }

  updateMagnetCollectibles(
    player: PlayerEntity,
    collectibles: CollectibleEntity[],
    deltaMs: number,
  ): void {
    if (!player.magnetActive) return
    const dt = deltaMs / 1000
    for (const c of collectibles) {
      if (c.collected || !c.active) continue
      const dx = player.x - c.x
      const dy = player.y - c.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MAGNET_RADIUS) {
        c.magnetPull = true
        c.x += (dx / dist) * 400 * dt
        c.y += (dy / dist) * 400 * dt
      }
    }
  }

  applyPowerUp(player: PlayerEntity, powerType: PowerUpEntity['powerType']): void {
    switch (powerType) {
      case 'shield':
        player.shield = true
        player.shieldTimer = SHIELD_DURATION_MS
        break
      case 'sprint':
        player.sprintActive = true
        player.sprintTimer = SPRINT_DURATION_MS
        break
      case 'magnet':
        player.magnetActive = true
        player.magnetTimer = MAGNET_DURATION_MS
        break
      case 'roar':
        player.roarActive = true
        player.roarTimer = ROAR_DURATION_MS
        break
    }
  }
}

// ─── Collision System ─────────────────────────────────────────────────────────

import { aabbOverlap } from '@/utils'

export class CollisionSystem {
  checkHazards(
    player: PlayerEntity,
    meteors: MeteorEntity[],
    vents: LavaVentEntity[],
    pterodactyls: PterodactylEntity[],
    spikePits: SpikePitEntity[],
  ): boolean {
    if (player.state === 'dead' || player.shield || player.roarActive) return false

    for (const m of meteors) {
      if (!m.active) continue
      if (aabbOverlap(player.x, player.y, player.width, player.height,
                       m.x, m.y, m.width, m.height)) return true
    }
    for (const v of vents) {
      if (!v.active || !v.column) continue
      const col = v.column
      if (aabbOverlap(player.x, player.y, player.width, player.height,
                       col.x - 10, col.y, 20, col.height)) return true
    }
    for (const p of pterodactyls) {
      if (!p.active || p.phase !== 'diving') continue
      if (aabbOverlap(player.x, player.y, player.width, player.height,
                       p.x, p.y, p.width, p.height)) return true
    }
    for (const s of spikePits) {
      if (!s.active) continue
      if (aabbOverlap(player.x, player.y, player.width, player.height,
                       s.x, s.y, s.width, s.height)) return true
    }
    return false
  }

  checkStomps(
    player: PlayerEntity,
    pterodactyls: PterodactylEntity[],
  ): number {
    if (player.velocityY <= 0) return 0
    let count = 0
    for (const p of pterodactyls) {
      if (!p.active) continue
      // Player must be falling AND land on top of pterodactyl
      const playerBottom = player.y + player.height
      const headRoom = 15
      if (
        aabbOverlap(player.x, player.y, player.width, player.height,
                     p.x, p.y, p.width, p.height) &&
        playerBottom <= p.y + headRoom
      ) {
        p.active = false
        player.velocityY = -400  // bounce
        count++
      }
    }
    return count
  }

  checkCollectibles(
    player: PlayerEntity,
    collectibles: CollectibleEntity[],
  ): CollectibleEntity[] {
    const picked: CollectibleEntity[] = []
    for (const c of collectibles) {
      if (c.collected || !c.active) continue
      if (aabbOverlap(player.x, player.y, player.width, player.height,
                       c.x, c.y, c.width, c.height)) {
        c.collected = true
        picked.push(c)
      }
    }
    return picked
  }

  checkPowerUps(
    player: PlayerEntity,
    powerups: PowerUpEntity[],
  ): PowerUpEntity[] {
    const picked: PowerUpEntity[] = []
    for (const p of powerups) {
      if (p.collected || !p.active) continue
      if (aabbOverlap(player.x, player.y, player.width, player.height,
                       p.x, p.y, p.width, p.height)) {
        p.collected = true
        picked.push(p)
      }
    }
    return picked
  }
}

// ─── Player factory ───────────────────────────────────────────────────────────

export function createPlayer(): PlayerEntity {
  return {
    id: 'player',
    type: 'player',
    x: 120,
    y: PLATFORM_Y - NORMAL_HEIGHT,
    width: NORMAL_WIDTH,
    height: NORMAL_HEIGHT,
    active: true,
    velocityX: 0,
    velocityY: 0,
    state: 'running',
    jumpsRemaining: 2,
    slideTimer: 0,
    shield: false,
    shieldTimer: 0,
    sprintActive: false,
    sprintTimer: 0,
    magnetActive: false,
    magnetTimer: 0,
    roarActive: false,
    roarTimer: 0,
  }
}

export { PLATFORM_Y, CANVAS_WIDTH, CANVAS_HEIGHT }
