import type {
  MeteorEntity,
  LavaVentEntity,
  PterodactylEntity,
  PlatformEntity,
  SpikePitEntity,
  CollectibleEntity,
  PowerUpEntity,
  GameStats,
} from '@/types'
import { StateMachine } from './StateMachine'
import {
  SpawnSystem,
  PhysicsSystem,
  CollisionSystem,
  createPlayer,
  PLATFORM_Y,
} from './systems/index'
import { InputSystem } from './systems/InputSystem'
import { CanvasRenderer } from '@/canvas/CanvasRenderer'
import { LEVELS } from './levels/index'
import { clamp } from '@/utils'

const FIXED_TIMESTEP_MS = 1000 / 60  // 60 fps fixed timestep
const MAX_FRAME_MS = 200             // cap to prevent spiral-of-death
const MAX_LIVES = 5
const INITIAL_LIVES = 3
const INVINCIBILITY_MS = 1500        // brief invincibility after taking damage
const DISTANCE_SCORE_FACTOR = 0.05   // score per pixel scrolled
const FOSSIL_SCORE = 50
const EGG_SCORE = 0                  // eggs give a life, not score
const ENEMY_STOMP_SCORE = 200
const ROAR_SCORE = 150               // per entity cleared by roar

export class GameEngine {
  readonly stateMachine = new StateMachine()

  private renderer: CanvasRenderer
  private input: InputSystem

  private meteors: MeteorEntity[] = []
  private vents: LavaVentEntity[] = []
  private pterodactyls: PterodactylEntity[] = []
  private collectibles: CollectibleEntity[] = []
  private powerups: PowerUpEntity[] = []
  private platforms: PlatformEntity[] = []
  private spikePits: SpikePitEntity[] = []

  private physics = new PhysicsSystem()
  private collision = new CollisionSystem()
  private spawn: SpawnSystem

  private levelIndex = 0
  private worldOffset = 0      // total pixels scrolled (used for scoring)
  private levelTimer = 0       // ms elapsed in current level
  private worldSpeed = 0       // current scroll speed px/s
  private invincibilityTimer = 0

  private stats: GameStats
  private onStatsChange: (stats: GameStats) => void

  // rAF bookkeeping
  private rafId = 0
  private lastTimestamp = 0
  private accumulator = 0

  constructor(
    canvas: HTMLCanvasElement,
    onStatsChange: (stats: GameStats) => void,
  ) {
    this.renderer = new CanvasRenderer(canvas)
    this.input = new InputSystem()
    this.input.attachTouchListeners(canvas)

    const firstLevel = LEVELS[0]
    this.worldSpeed = firstLevel.baseSpeedPx
    this.spawn = new SpawnSystem(firstLevel, () => this.worldSpeed)

    this.stats = {
      score: 0,
      lives: INITIAL_LIVES,
      level: 1,
      distance: 0,
      fossils: 0,
      enemiesStomped: 0,
      activeLevel: firstLevel,
    }
    this.onStatsChange = onStatsChange
    this.setupStateMachine()
  }

  private _player = createPlayer()

  // ─── State Machine Hooks ───────────────────────────────────────────────────

  private setupStateMachine(): void {
    this.stateMachine
      .on('playing', {
        onEnter: () => this.resetLevel(),
      })
      .on('gameOver', {
        onEnter: () => this.stopLoop(),
      })
      .on('menu', {
        onEnter: () => this.stopLoop(),
      })
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  startGame(): void {
    this.levelIndex = 0
    this.stats = {
      score: 0,
      lives: INITIAL_LIVES,
      level: 1,
      distance: 0,
      fossils: 0,
      enemiesStomped: 0,
      activeLevel: LEVELS[0],
    }
    this.stateMachine.transition('playing')
    this.startLoop()
  }

  togglePause(): void {
    if (this.stateMachine.is('playing')) this.stateMachine.transition('paused')
    else if (this.stateMachine.is('paused')) this.stateMachine.transition('playing')
  }

  proceedToNextLevel(): void {
    if (!this.stateMachine.is('levelComplete')) return
    this.levelIndex++
    if (this.levelIndex >= LEVELS.length) {
      this.stateMachine.transition('gameOver')
      return
    }
    this.stats.level = this.levelIndex + 1
    this.stats.activeLevel = LEVELS[this.levelIndex]
    this.stateMachine.transition('playing')
    this.startLoop()
  }

  returnToMenu(): void {
    this.stateMachine.transition('menu')
  }

  destroy(): void {
    this.stopLoop()
    this.input.destroy()
  }

  // ─── Game Loop ─────────────────────────────────────────────────────────────

  private startLoop(): void {
    this.lastTimestamp = 0
    this.accumulator = 0
    this.rafId = requestAnimationFrame(this.loop)
  }

  private stopLoop(): void {
    cancelAnimationFrame(this.rafId)
  }

  private loop = (timestamp: number): void => {
    if (!this.stateMachine.is('playing')) return

    if (this.lastTimestamp === 0) this.lastTimestamp = timestamp
    let frameTime = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp

    // Cap runaway frames
    if (frameTime > MAX_FRAME_MS) frameTime = MAX_FRAME_MS
    this.accumulator += frameTime

    // Fixed-timestep updates
    while (this.accumulator >= FIXED_TIMESTEP_MS) {
      this.update(FIXED_TIMESTEP_MS)
      this.accumulator -= FIXED_TIMESTEP_MS
    }

    this.renderer.render({
      player: this._player,
      meteors: this.meteors,
      vents: this.vents,
      pterodactyls: this.pterodactyls,
      collectibles: this.collectibles,
      powerups: this.powerups,
      platforms: this.platforms,
      spikePits: this.spikePits,
      levelConfig: LEVELS[this.levelIndex],
      worldOffset: this.worldOffset,
      stats: this.stats,
    })

    this.rafId = requestAnimationFrame(this.loop)
  }

  // ─── Core Update ──────────────────────────────────────────────────────────

  private update(deltaMs: number): void {
    const inputState = this.input.getState()

    // Pause
    if (inputState.pausePressed) {
      this.togglePause()
      this.input.commitFrame()
      return
    }

    const levelConfig = LEVELS[this.levelIndex]

    // Speed ramp
    this.worldSpeed = clamp(
      this.worldSpeed + levelConfig.speedRampPerSecond * (deltaMs / 1000),
      levelConfig.baseSpeedPx,
      levelConfig.maxSpeedPx,
    )

    // Level timer & length check
    this.levelTimer += deltaMs
    if (this.levelTimer >= levelConfig.lengthMs) {
      this.stateMachine.transition('levelComplete')
      this.stopLoop()
      this.onStatsChange({ ...this.stats })
      return
    }

    // Scroll world
    const scrollDelta = this.worldSpeed * (deltaMs / 1000)
    this.worldOffset += scrollDelta
    this.stats.distance = Math.floor(this.worldOffset / 10)  // in decametres

    // Score for distance
    this.stats.score += scrollDelta * DISTANCE_SCORE_FACTOR * levelConfig.scoreMultiplier

    // Spawn entities
    this.spawn.tick(deltaMs, this.meteors, this.vents, this.pterodactyls, this.collectibles, this.powerups, this.platforms, this.spikePits)

    // Physics
    this.physics.updatePlayer(this._player, inputState, deltaMs, this.worldSpeed, this.platforms)
    this.physics.updateMagnetCollectibles(this._player, this.collectibles, deltaMs)

    // Move hazards
    this.updateHazards(deltaMs)

    // Remove off-screen entities
    this.prune()

    // Collision — hazards
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= deltaMs
    } else {
      const hit = this.collision.checkHazards(this._player, this.meteors, this.vents, this.pterodactyls, this.spikePits)
      if (hit) this.handleDamage()
    }

    // Collision — stomps
    const stomps = this.collision.checkStomps(this._player, this.pterodactyls)
    if (stomps > 0) {
      this.stats.enemiesStomped += stomps
      this.stats.score += stomps * ENEMY_STOMP_SCORE * levelConfig.scoreMultiplier
    }

    // Collision — collectibles
    const picked = this.collision.checkCollectibles(this._player, this.collectibles)
    for (const c of picked) {
      if (c.type === 'fossil') {
        this.stats.fossils++
        this.stats.score += FOSSIL_SCORE * levelConfig.scoreMultiplier
      } else if (c.type === 'egg') {
        this.stats.lives = Math.min(this.stats.lives + 1, MAX_LIVES)
        this.stats.score += EGG_SCORE
      }
    }

    // Collision — power-ups
    const pickedPowerups = this.collision.checkPowerUps(this._player, this.powerups)
    for (const p of pickedPowerups) {
      this.physics.applyPowerUp(this._player, p.powerType)
      // Roar: clear all nearby active hazards
      if (p.powerType === 'roar') this.triggerRoar()
    }

    this.input.commitFrame()
    this.onStatsChange({ ...this.stats })
  }

  private handleDamage(): void {
    this.stats.lives -= 1
    this.invincibilityTimer = INVINCIBILITY_MS
    if (this.stats.lives <= 0) {
      this._player.state = 'dead'
      this.stateMachine.transition('gameOver')
      this.stopLoop()
      this.onStatsChange({ ...this.stats })
    }
  }

  private triggerRoar(): void {
    let cleared = 0
    for (const m of this.meteors) { if (m.active) { m.active = false; cleared++ } }
    for (const p of this.pterodactyls) { if (p.active) { p.active = false; cleared++ } }
    this.stats.score += cleared * ROAR_SCORE * LEVELS[this.levelIndex].scoreMultiplier
  }

  private updateHazards(deltaMs: number): void {
    const dt = deltaMs / 1000
    const scroll = this.worldSpeed * dt

    // Meteors
    for (const m of this.meteors) {
      if (!m.active) continue
      m.x += m.velocityX * dt - scroll
      m.y += m.velocityY * dt
      m.warningX -= scroll
      if (m.y > PLATFORM_Y) m.active = false
    }

    // Lava vents (scroll with world, then animate phases)
    for (const v of this.vents) {
      if (!v.active) continue
      v.x -= scroll
      v.phaseTimer -= deltaMs
      if (v.phaseTimer <= 0) {
        switch (v.phase) {
          case 'idle':
            v.phase = 'warning'
            v.phaseTimer = 800
            break
          case 'warning':
            v.phase = 'erupting'
            v.phaseTimer = 500
            v.column = { x: v.x + v.width / 2, y: PLATFORM_Y - 200, height: 200 }
            break
          case 'erupting':
            v.phase = 'cooling'
            v.phaseTimer = 600
            v.column = null
            break
          case 'cooling':
            v.phase = 'idle'
            v.phaseTimer = 2000
            break
        }
      }
      if (v.column) {
        v.column.x = v.x + v.width / 2
      }
    }

    // Pterodactyls
    for (const p of this.pterodactyls) {
      if (!p.active) continue
      p.x -= scroll
      p.patrolStartX -= scroll
      p.patrolEndX -= scroll

      switch (p.phase) {
        case 'patrolling': {
          p.x += p.velocityX * dt
          // Dive if player is roughly below
          if (Math.abs(p.x - this._player.x) < 80 && p.y < this._player.y) {
            p.phase = 'diving'
            p.velocityY = 300
          }
          if (p.x <= p.patrolEndX) { p.velocityX = Math.abs(p.velocityX) }
          if (p.x >= p.patrolStartX) { p.velocityX = -Math.abs(p.velocityX) }
          break
        }
        case 'diving':
          p.y += p.velocityY * dt
          if (p.y >= PLATFORM_Y - p.height - 10) {
            p.phase = 'retreating'
            p.velocityY = -400
          }
          break
        case 'retreating':
          p.y += p.velocityY * dt
          if (p.y < -100) p.active = false
          break
      }
    }

    // Collectibles scroll
    for (const c of this.collectibles) {
      if (!c.active || c.collected) continue
      if (!c.magnetPull) c.x -= scroll
    }

    // Powerups scroll
    for (const p of this.powerups) {
      if (!p.active || p.collected) continue
      p.x -= scroll
    }

    // Platforms scroll
    for (const platform of this.platforms) {
      if (!platform.active) continue
      platform.x -= scroll
    }

    // Spike pits scroll
    for (const s of this.spikePits) {
      if (!s.active) continue
      s.x -= scroll
    }
  }

  private prune(): void {
    const offscreen = -80
    this.meteors      = this.meteors.filter(e => e.active && e.x > offscreen)
    this.vents        = this.vents.filter(e => e.active && e.x > offscreen)
    this.pterodactyls = this.pterodactyls.filter(e => e.active)
    this.collectibles = this.collectibles.filter(e => e.active && !e.collected && e.x > offscreen)
    this.powerups     = this.powerups.filter(e => e.active && !e.collected && e.x > offscreen)
    this.platforms    = this.platforms.filter(e => e.active && e.x > offscreen)
    this.spikePits    = this.spikePits.filter(e => e.active && e.x > offscreen)
  }

  private resetLevel(): void {
    this._player = createPlayer()
    this.meteors = []
    this.vents = []
    this.pterodactyls = []
    this.collectibles = []
    this.powerups = []
    this.platforms = []
    this.spikePits = []
    this.levelTimer = 0
    this.invincibilityTimer = 0
    const config = LEVELS[this.levelIndex]
    this.worldSpeed = config.baseSpeedPx
    this.spawn.updateLevel(config)
    this.stats.activeLevel = config
  }
}
