import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { PhysicsSystem, CollisionSystem, SpawnSystem, createPlayer, PLATFORM_Y, CANVAS_WIDTH } from '@/game/systems/index'
import { InputSystem } from '@/game/systems/InputSystem'
import { LEVELS } from '@/game/levels'
import { PLATFORM_LAYOUT } from '@/config/platforms'
import type { CollectibleEntity, LavaVentEntity, MeteorEntity, PlatformEntity } from '@/types'

afterEach(() => vi.restoreAllMocks())

describe('visible hazards', () => {
  it.each(LEVELS)('spawns downward meteors and ground vents in $name', (level) => {
    const spawn = new SpawnSystem(level, () => level.baseSpeedPx)
    const meteors: MeteorEntity[] = []
    const vents: LavaVentEntity[] = []
    spawn.tick(7000, meteors, vents, [], [], [], [], [])
    expect(meteors.length).toBeGreaterThan(0)
    expect(vents.length).toBeGreaterThan(0)
    for (const meteor of meteors) {
      expect(meteor.velocityY).toBeGreaterThan(0)
      expect(meteor.velocityX).toBeLessThan(0)
      expect(meteor.x).toBeGreaterThan(0)
      expect(meteor.x + meteor.width).toBeLessThan(CANVAS_WIDTH)
      expect(meteor.y + meteor.velocityY * 0.5).toBeGreaterThan(0)
    }
    expect(vents[0].y).toBe(PLATFORM_Y - 10)
  })
})

describe('platform routes', () => {
  beforeEach(() => {
    const values = [0.05, 0.95, 0.3, 0.8, 0.1, 0.7, 0.4]
    let randomIndex = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const value = values[randomIndex % values.length]
      randomIndex += 1
      return value
    })
  })

  it('places fossils above every platform, including the highest route', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const spawn = new SpawnSystem(LEVELS[0], () => LEVELS[0].baseSpeedPx)
    const platforms: PlatformEntity[] = []
    const collectibles: CollectibleEntity[] = []
    spawn.tick(700, [], [], [], collectibles, [], platforms, [])
    for (let step = 0; step < 5; step++) {
      spawn.tick(2000, [], [], [], collectibles, [], platforms, [])
    }

    for (const platform of platforms) {
      expect(collectibles.some((collectible) =>
        collectible.x === platform.x + (platform.width - collectible.width) / 2 &&
        collectible.y + collectible.height === platform.y - 12
      )).toBe(true)
    }
    expect(collectibles.some((collectible) => collectible.y < PLATFORM_Y - 280)).toBe(true)
    expect(collectibles.some((collectible) => collectible.y > PLATFORM_Y - 135)).toBe(true)
  })

  it.each(LEVELS.flatMap((level) => [
    { ...level, accelerating: false },
    { ...level, accelerating: true },
  ]))('spawns dense routes in $name (accelerating: $accelerating)', (level) => {
    let speed = level.accelerating ? level.baseSpeedPx : level.maxSpeedPx
    const spawn = new SpawnSystem(level, () => speed)
    const platforms: PlatformEntity[] = []
    const heights = new Set<number>()
    const widths: number[] = []
    const stepMs = 1000 / 60
    let previousPlatform: PlatformEntity | undefined

    for (let elapsed = 0; elapsed < 15_000; elapsed += stepMs) {
      speed = Math.min(level.maxSpeedPx, speed + level.speedRampPerSecond * stepMs / 1000)
      for (const platform of platforms) platform.x -= speed * stepMs / 1000
      spawn.tick(stepMs, [], [], [], [], [], platforms, [])
      const newest = platforms[platforms.length - 1]
      if (!newest || newest === previousPlatform) continue
      heights.add(PLATFORM_Y - newest.y)
      widths.push(newest.width)
      expect(newest.width).toBeGreaterThanOrEqual(PLATFORM_LAYOUT.MIN_WIDTH)
      expect(newest.width).toBeLessThanOrEqual(PLATFORM_LAYOUT.MAX_WIDTH)
      expect(PLATFORM_Y - newest.y).toBeGreaterThanOrEqual(PLATFORM_LAYOUT.MIN_ELEVATION)
      expect(PLATFORM_Y - newest.y).toBeLessThanOrEqual(PLATFORM_LAYOUT.MAX_ELEVATION)
      if (previousPlatform) {
        const gap = newest.x - previousPlatform.x - previousPlatform.width
        expect(gap).toBeGreaterThanOrEqual(PLATFORM_LAYOUT.GAP - 0.001)
        expect(gap).toBeLessThanOrEqual(PLATFORM_LAYOUT.GAP + speed * stepMs / 1000)
        expect(Math.abs(newest.y - previousPlatform.y)).toBeLessThanOrEqual(PLATFORM_LAYOUT.MAX_HEIGHT_CHANGE)
      }
      previousPlatform = newest
    }

    expect(platforms.length).toBeGreaterThanOrEqual(9)
    expect(heights.size).toBeGreaterThan(3)
    expect(Math.max(...widths) - Math.min(...widths)).toBeGreaterThan(100)
    expect(level.lengthMs).toBeGreaterThanOrEqual(180_000)
  })

  it('restarts the route at a reachable low platform when changing levels', () => {
    const spawn = new SpawnSystem(LEVELS[0], () => LEVELS[0].baseSpeedPx)
    const platforms: PlatformEntity[] = []
    spawn.tick(700, [], [], [], [], [], platforms, [])
    spawn.tick(2000, [], [], [], [], [], platforms, [])
    spawn.updateLevel(LEVELS[1])
    spawn.tick(700, [], [], [], [], [], platforms, [])
    expect(platforms[platforms.length - 1]?.y).toBe(PLATFORM_Y - PLATFORM_LAYOUT.MIN_ELEVATION)
  })

  it.each([PLATFORM_LAYOUT.MIN_ELEVATION, PLATFORM_LAYOUT.MAX_ELEVATION])('can land after jumping up %i pixels or less', (offset) => {
    const physics = new PhysicsSystem()
    const player = createPlayer()
    const rise = Math.min(offset, 80)
    const platform: PlatformEntity = {
      id: PLATFORM_LAYOUT.ENTITY_TYPE,
      type: PLATFORM_LAYOUT.ENTITY_TYPE,
      x: player.x,
      y: PLATFORM_Y - offset,
      width: PLATFORM_LAYOUT.MIN_WIDTH,
      height: PLATFORM_LAYOUT.HEIGHT,
      active: true,
      crumbling: false,
      crumbleTimer: 0,
    }
    player.y = platform.y + rise - player.height
    physics.updatePlayer(player, { ...InputSystem.defaultState(), jumpPressed: true }, 1000 / 60, 300, [platform])
    for (let frame = 0; frame < 60; frame++) {
      physics.updatePlayer(player, InputSystem.defaultState(), 1000 / 60, 300, [platform])
    }
    expect(player.y + player.height).toBe(platform.y)
    expect(player.jumpsRemaining).toBe(2)
  })
})

describe('PhysicsSystem', () => {
  const physics = new PhysicsSystem()

  function makeIdleInput() {
    return InputSystem.defaultState()
  }

  it('applies gravity to player when in air', () => {
    const player = createPlayer()
    player.y = 200  // above ground
    player.velocityY = 0
    physics.updatePlayer(player, makeIdleInput(), 16, 300, [])
    expect(player.velocityY).toBeGreaterThan(0)
  })

  it('stops player on ground', () => {
    const player = createPlayer()
    player.y = PLATFORM_Y  // below ground
    player.velocityY = 100
    physics.updatePlayer(player, makeIdleInput(), 16, 300, [])
    expect(player.velocityY).toBe(0)
    expect(player.y).toBe(PLATFORM_Y - player.height)
  })

  it('makes player jump when jumpPressed', () => {
    const player = createPlayer()
    player.y = PLATFORM_Y - player.height
    player.jumpsRemaining = 2
    const input = { ...makeIdleInput(), jumpPressed: true, jump: true }
    physics.updatePlayer(player, input, 16, 300, [])
    expect(player.velocityY).toBeLessThan(0) // going up
    expect(player.jumpsRemaining).toBe(1)
  })

  it('enters slide state on slidePressed', () => {
    const player = createPlayer()
    player.state = 'running'
    const input = { ...makeIdleInput(), slidePressed: true, slide: true }
    physics.updatePlayer(player, input, 16, 300, [])
    expect(player.state).toBe('sliding')
    expect(player.height).toBe(30) // SLIDE_HEIGHT
  })

  it('moves the player horizontally within the screen bounds', () => {
    const player = createPlayer()
    const input = { ...makeIdleInput(), moveRight: true }

    physics.updatePlayer(player, input, 1000, 300, [])

    expect(player.x).toBeGreaterThan(120)
  })

  it('keeps the player within the screen bounds', () => {
    const player = createPlayer()
    player.x = CANVAS_WIDTH - 10
    const input = { ...makeIdleInput(), moveRight: true }

    physics.updatePlayer(player, input, 1000, 300, [])

    expect(player.x + player.width).toBeLessThan(CANVAS_WIDTH)
  })

  it('supports the player on a platform partially off the left edge', () => {
    const player = createPlayer()
    const platform: PlatformEntity = {
      id: PLATFORM_LAYOUT.ENTITY_TYPE,
      type: PLATFORM_LAYOUT.ENTITY_TYPE,
      x: -100,
      y: PLATFORM_Y - 80,
      width: 320,
      height: PLATFORM_LAYOUT.HEIGHT,
      active: true,
      crumbling: false,
      crumbleTimer: 0,
    }
    player.y = platform.y - player.height
    physics.updatePlayer(player, makeIdleInput(), 16, 300, [platform])
    expect(player.y + player.height).toBe(platform.y)
    expect(player.velocityY).toBe(0)
  })

  it('does not apply physics when dead', () => {
    const player = createPlayer()
    player.state = 'dead'
    const prevY = player.y
    physics.updatePlayer(player, makeIdleInput(), 16, 300, [])
    expect(player.y).toBe(prevY)
  })
})

describe('CollisionSystem', () => {
  const collision = new CollisionSystem()

  it('detects meteor hit', () => {
    const player = createPlayer()
    const meteor: MeteorEntity = {
      id: 'm1', type: 'meteor',
      x: player.x, y: player.y,
      width: 32, height: 32,
      active: true,
      velocityX: 0, velocityY: 0,
      warningX: player.x,
    }
    const hit = collision.checkHazards(player, [meteor], [], [], [])
    expect(hit).toBe(true)
  })

  it('ignores inactive meteors', () => {
    const player = createPlayer()
    const meteor: MeteorEntity = {
      id: 'm1', type: 'meteor',
      x: player.x, y: player.y,
      width: 32, height: 32,
      active: false,
      velocityX: 0, velocityY: 0,
      warningX: player.x,
    }
    const hit = collision.checkHazards(player, [meteor], [], [], [])
    expect(hit).toBe(false)
  })

  it('ignores hazards when shield is active', () => {
    const player = createPlayer()
    player.shield = true
    const meteor: MeteorEntity = {
      id: 'm1', type: 'meteor',
      x: player.x, y: player.y,
      width: 32, height: 32,
      active: true,
      velocityX: 0, velocityY: 0,
      warningX: player.x,
    }
    const hit = collision.checkHazards(player, [meteor], [], [], [])
    expect(hit).toBe(false)
  })

  it('detects collectible pickup', () => {
    const player = createPlayer()
    const fossil = {
      id: 'f1', type: 'fossil' as const,
      x: player.x, y: player.y,
      width: 20, height: 20,
      active: true, collected: false, magnetPull: false,
    }
    const picked = collision.checkCollectibles(player, [fossil])
    expect(picked).toHaveLength(1)
    expect(fossil.collected).toBe(true)
  })
})
