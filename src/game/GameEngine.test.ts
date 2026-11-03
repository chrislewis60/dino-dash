import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GameEngine } from '@/game/GameEngine'
import { LEVELS } from '@/game/levels'
import { SpawnSystem, CANVAS_WIDTH, PLATFORM_Y } from '@/game/systems'
import type { GameStats, LavaVentEntity, MeteorEntity } from '@/types'

vi.mock('@/canvas/CanvasRenderer', () => ({
  CanvasRenderer: class {
    render = vi.fn()
  },
}))

interface EngineTestControls {
  update: (deltaMs: number) => void
  loop: (timestamp: number) => void
  updateHazards: (deltaMs: number) => void
  meteors: MeteorEntity[]
  vents: LavaVentEntity[]
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
    vi.unstubAllGlobals()
  })

  it('preserves progress and lives when pausing and resuming', () => {
    controls.update(100)
    engine.togglePause()
    expect(engine.stateMachine.state).toBe('paused')
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(100)
    expect(cancelAnimationFrame).toHaveBeenCalled()
    engine.togglePause()
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(100)
    expect(snapshots[snapshots.length - 1].lives).toBe(3)
    controls.update(100)
    expect(snapshots[snapshots.length - 1].levelElapsedMs).toBe(200)
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