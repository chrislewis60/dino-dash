import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GameEngine } from '@/game/GameEngine'
import { LEVELS } from '@/game/levels'
import { SpawnSystem, PhysicsSystem, CANVAS_WIDTH, PLATFORM_Y } from '@/game/systems'
import { PLAYER_HEALTH } from '@/config/gameplay'
import type { CollectibleEntity, GameStats, LavaVentEntity, MeteorEntity, PlayerEntity, PowerUpEntity, PterodactylEntity, SpikePitEntity } from '@/types'

vi.mock('@/canvas/CanvasRenderer', () => ({
  CanvasRenderer: class {
    render = vi.fn()
  },
}))

interface EngineTestControls {
  update: (deltaMs: number) => void
  loop: (timestamp: number) => void
  updateHazards: (deltaMs: number) => void
  prune: () => void
  spikePits: SpikePitEntity[]
  meteors: MeteorEntity[]
  vents: LavaVentEntity[]
  pterodactyls: PterodactylEntity[]
  collectibles: CollectibleEntity[]
  powerups: PowerUpEntity[]
  _player: PlayerEntity
}

describe('GameEngine progress', () => {
  let engine: GameEngine
  let controls: EngineTestControls
  const snapshots: GameStats[] = []

  beforeEach(() => {
    snapshots.length = 0
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    engine = new GameEngine(document.createElement('canvas'), (stats) => snapshots.push(stats))
    controls = engine as unknown as EngineTestControls
    engine.startGame()
  })

  afterEach(() => {
    engine.destroy()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  function isolateCollisions() {
    vi.spyOn(SpawnSystem.prototype, 'tick').mockImplementation(() => {})
    vi.spyOn(PhysicsSystem.prototype, 'updatePlayer').mockImplementation(() => {})
    vi.spyOn(controls, 'updateHazards').mockImplementation(() => {})
  }

  it('keeps scrolling a wide spike bed until its trailing artwork has left the screen', () => {
    const spikes: SpikePitEntity = {
      id: 'wide-spikes', type: 'spikePit', active: true,
      x: -81, y: PLATFORM_Y - 20, width: 1800, height: 20,
    }
    controls.spikePits.push(spikes)
    controls.prune()
    expect(controls.spikePits).toContain(spikes)

    controls.updateHazards(1000)
    controls.prune()
    expect(spikes.x).toBe(-81 - LEVELS[0].baseSpeedPx)
    expect(controls.spikePits).toContain(spikes)

    spikes.x = -spikes.width - 1
    controls.prune()
    expect(controls.spikePits).toContain(spikes)

    spikes.x = -spikes.width - 80
    controls.prune()
    expect(controls.spikePits).not.toContain(spikes)
  })

  it('removes inactive spike beds even when they are still visible', () => {
    controls.spikePits.push({
      id: 'inactive-spikes', type: 'spikePit', active: false,
      x: 100, y: PLATFORM_Y - 20, width: 1800, height: 20,
    })
    controls.prune()
    expect(controls.spikePits).toEqual([])
  })

  it('records actual category points with multipliers, preserving totals across levels and resets', () => {
    isolateCollisions()
    const player = controls._player
    controls.collectibles.push({
      id: 'fossil', type: 'fossil', x: player.x, y: player.y,
      width: 20, height: 20, active: true, collected: false, magnetPull: false,
    })
    controls.update(16)
    const level1Stats = snapshots[snapshots.length - 1]
    expect(level1Stats.scoreBreakdown.fossils).toBe(50)
    expect(level1Stats.scoreBreakdown.distance).toBeGreaterThan(0)
    controls.update(LEVELS[0].lengthMs)
    engine.proceedToNextLevel()
    const nextPlayer = controls._player
    controls.collectibles.push({
      id: 'fossil2', type: 'fossil', x: nextPlayer.x, y: nextPlayer.y,
      width: 20, height: 20, active: true, collected: false, magnetPull: false,
    })
    controls.powerups.push({
      id: 'roar', type: 'powerup', powerType: 'roar', x: nextPlayer.x, y: nextPlayer.y,
      width: 28, height: 28, active: true, collected: false,
    })
    controls.meteors.push({
      id: 'meteor', type: 'meteor', x: 800, y: 100, width: 32, height: 32,
      active: true, velocityX: 0, velocityY: 0, warningX: 800,
    })
    controls.update(16)
    const result = snapshots[snapshots.length - 1]
    expect(result.scoreBreakdown.fossils).toBe(125)
    expect(result.scoreBreakdown.roar).toBe(225)
    expect(result.score).toBe(Object.values(result.scoreBreakdown).reduce((sum, value) => sum + value, 0))
    expect(level1Stats.scoreBreakdown.fossils).toBe(50)
    engine.togglePause()
    engine.returnToMenu()
    engine.startGame(2)
    expect(snapshots[snapshots.length - 1].scoreBreakdown).toEqual({
      distance: 0, fossils: 0, stomps: 0, roar: 0,
    })
  })

  it('awards a diving stomp before checking damage and does not award it twice', () => {
    isolateCollisions()
    const player = controls._player
    player.y = 200 - player.height - 20
    player.velocityY = 600
    const enemy: PterodactylEntity = {
      id: 'enemy', type: 'pterodactyl', active: true,
      x: player.x, y: 200, width: 50, height: 30,
      velocityX: 0, velocityY: 0, phase: 'diving',
      patrolStartX: player.x, patrolEndX: player.x + 100,
    }
    controls.pterodactyls.push(enemy)
    vi.spyOn(PhysicsSystem.prototype, 'updatePlayer').mockImplementation((entity) => {
      entity.y += 45
    })
    controls.update(16)
    const result = snapshots[snapshots.length - 1]
    expect(result.lives).toBe(PLAYER_HEALTH.MAX_LIVES)
    expect(result.enemiesStomped).toBe(1)
    expect(result.scoreBreakdown.stomps).toBe(200)
    expect(enemy.active).toBe(false)
    expect(player.velocityY).toBeLessThan(0)
    controls.update(16)
    expect(snapshots[snapshots.length - 1].scoreBreakdown.stomps).toBe(200)
  })

  it('preserves progress and lives when pausing and resuming', () => {
    controls.update(100)
    engine.togglePause()
    expect(engine.stateMachine.state).toBe('paused')
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(100)
    expect(cancelAnimationFrame).toHaveBeenCalled()
    engine.togglePause()
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(100)
    expect(snapshots[snapshots.length - 1].lives).toBe(PLAYER_HEALTH.MAX_LIVES)
    controls.update(100)
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(200)
  })

  it('starts and restarts at 100% health', () => {
    controls.update(16)
    expect(snapshots[snapshots.length - 1].lives).toBe(PLAYER_HEALTH.MAX_LIVES)
    engine.togglePause()
    engine.returnToMenu()
    engine.startGame()
    controls.update(16)
    expect(snapshots[snapshots.length - 1].lives).toBe(PLAYER_HEALTH.MAX_LIVES)
  })

  it('moves meteors through the visible sky and erupts vents onscreen', () => {
    const spawn = new SpawnSystem(LEVELS[0], () => LEVELS[0].baseSpeedPx)
    spawn.tick(7000, controls.meteors, controls.vents, [], [], [], [], [])
    let meteorVisible = false
    let eruptionVisible = false
    for (let frame = 0; frame < 240; frame++) {
      controls.updateHazards(1000 / 60)
      meteorVisible ||= controls.meteors.some((meteor) =>
        meteor.active && meteor.x > 0 && meteor.x < CANVAS_WIDTH && meteor.y > 0 && meteor.y < PLATFORM_Y
      )
      eruptionVisible ||= controls.vents.some((vent) =>
        vent.column !== null && vent.x > 0 && vent.x < CANVAS_WIDTH
      )
    }
    expect(meteorVisible).toBe(true)
    expect(eruptionVisible).toBe(true)
  })

  it('starts level 2 with fresh stats and continues to level 3', () => {
    controls.update(100)
    engine.togglePause()
    engine.returnToMenu()
    engine.startGame(2)
    expect(engine.stateMachine.state).toBe('playing')
    expect(snapshots[snapshots.length - 1]).toEqual({
      scoreBreakdown: { distance: 0, fossils: 0, stomps: 0, roar: 0 },
      score: 0,
      lives: PLAYER_HEALTH.MAX_LIVES,
      level: 2,
      distance: 0,
      fossils: 0,
      enemiesStomped: 0,
      levelElapsedMs: 0,
      activeLevel: LEVELS[1],
    })
    controls.update(100)
    expect(snapshots[snapshots.length - 1].distance).toBe(3)
    controls.update(LEVELS[1].lengthMs)
    expect(engine.stateMachine.state).toBe('levelComplete')
    engine.proceedToNextLevel()
    expect(snapshots[snapshots.length - 1].level).toBe(3)
    expect(snapshots[snapshots.length - 1].activeLevel).toBe(LEVELS[2])

    engine.togglePause()
    engine.returnToMenu()
    engine.startGame()
    expect(snapshots[snapshots.length - 1].level).toBe(1)
    expect(snapshots[snapshots.length - 1].activeLevel).toBe(LEVELS[0])
  })

  it.each([0, 4, 1.5, NaN])('rejects unknown starting level %s without changing state', (level) => {
    engine.togglePause()
    engine.returnToMenu()
    expect(() => engine.startGame(level)).toThrow(RangeError)
    expect(engine.stateMachine.state).toBe('menu')
  })

  it('SPEC-006-AC03/AC04 starts level 3 fresh and safely retains final completion until Menu', () => {
    engine.togglePause()
    engine.returnToMenu()
    engine.startGame(3)
    const initial = snapshots[snapshots.length - 1]
    expect(engine.stateMachine.state).toBe('playing')
    expect(initial).toEqual({
      scoreBreakdown: { distance: 0, fossils: 0, stomps: 0, roar: 0 },
      score: 0, lives: PLAYER_HEALTH.MAX_LIVES, level: 3,
      distance: 0, fossils: 0, enemiesStomped: 0,
      levelElapsedMs: 0, activeLevel: LEVELS[2],
    })
    isolateCollisions()
    controls.update(100)
    controls.update(LEVELS[2].lengthMs - 100)
    expect(engine.stateMachine.state).toBe('levelComplete')
    const final = snapshots[snapshots.length - 1]
    expect(final.levelElapsedMs).toBe(LEVELS[2].lengthMs)
    expect(final.score).toBeGreaterThan(0)
    const warning = vi.spyOn(console, 'warn')
    engine.proceedToNextLevel()
    engine.proceedToNextLevel()
    expect(warning).not.toHaveBeenCalled()
    expect(engine.stateMachine.state).toBe('levelComplete')
    expect(snapshots[snapshots.length - 1]).toEqual(final)
    engine.returnToMenu()
    engine.startGame()
    expect(snapshots[snapshots.length - 1].activeLevel).toBe(LEVELS[0])
  })

  it('publishes keyboard pause immediately without advancing pending frames', () => {
    controls.loop(100)
    globalThis.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    controls.loop(200)
    expect(engine.stateMachine.state).toBe('paused')
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(0)
  })

  it('reports completion and immediately resets progress for the next level', () => {
    controls.update(LEVELS[0].lengthMs)
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(LEVELS[0].lengthMs)
    engine.proceedToNextLevel()
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(0)
    expect(snapshots[snapshots.length - 1].activeLevel).toBe(LEVELS[1])
  })
})