import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { PhysicsSystem, CollisionSystem, SpawnSystem, createPlayer, PLATFORM_Y, CANVAS_WIDTH } from '@/game/systems/index'
import { InputSystem } from '@/game/systems/InputSystem'
import { LEVELS } from '@/game/levels'
import { PLATFORM_LAYOUT, SPIKE_LAYOUT } from '@/config/platforms'
import * as utils from '@/utils'
import type { CollectibleEntity, LavaVentEntity, MeteorEntity, PlatformEntity, SpikePitEntity, PterodactylEntity } from '@/types'

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
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
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
  ]))('alternates covered spikes and floor gaps in $name (accelerating: $accelerating)', (level) => {
    let speed = level.accelerating ? level.baseSpeedPx : level.maxSpeedPx
    const spawn = new SpawnSystem(level, () => speed)
    const platforms: PlatformEntity[] = []
    const spikePits: SpikePitEntity[] = []
    const heights = new Set<number>()
    const widths: number[] = []
    const stepMs = 1000 / 60
    let previousPlatform: PlatformEntity | undefined

    let bridges = 0
    let floorGaps = 0
    for (let elapsed = 0; elapsed < 60_000; elapsed += stepMs) {
      speed = Math.min(level.maxSpeedPx, speed + level.speedRampPerSecond * stepMs / 1000)
      for (const platform of platforms) platform.x -= speed * stepMs / 1000
      for (const spikes of spikePits) spikes.x -= speed * stepMs / 1000
      spawn.tick(stepMs, [], [], [], [], [], platforms, spikePits)
      const newest = platforms[platforms.length - 1]
      if (!newest || newest === previousPlatform) continue
      heights.add(PLATFORM_Y - newest.y)
      widths.push(newest.width)
      expect(newest.width).toBeGreaterThanOrEqual(PLATFORM_LAYOUT.MIN_WIDTH)
      const isBridge = newest.width >= PLATFORM_LAYOUT.BRIDGE_MIN_WIDTH
      expect(newest.width).toBeLessThanOrEqual(
        isBridge ? PLATFORM_LAYOUT.BRIDGE_MAX_WIDTH : PLATFORM_LAYOUT.MAX_WIDTH
      )
      if (isBridge) {
        bridges += 1
        const spikes = spikePits.find((pit) =>
          Math.abs(pit.x - newest.x - PLATFORM_LAYOUT.SPIKE_MARGIN) < 0.001
        )
        expect(spikes).toBeDefined()
        expect(spikes?.width).toBe(newest.width - PLATFORM_LAYOUT.SPIKE_MARGIN * 2)
      }
      for (const spikes of spikePits.filter((pit) => pit.width > SPIKE_LAYOUT.MAX_WIDTH)) {
        expect(platforms.some((platform) =>
          platform.active &&
          platform.x <= spikes.x &&
          platform.x + platform.width >= spikes.x + spikes.width &&
          platform.y + platform.height < spikes.y
        )).toBe(true)
      }
      expect(PLATFORM_Y - newest.y).toBeGreaterThanOrEqual(PLATFORM_LAYOUT.MIN_ELEVATION)
      expect(PLATFORM_Y - newest.y).toBeLessThanOrEqual(PLATFORM_LAYOUT.MAX_ELEVATION)
      if (previousPlatform) {
        const gap = newest.x - previousPlatform.x - previousPlatform.width
        const followsBridge = previousPlatform.width >= PLATFORM_LAYOUT.BRIDGE_MIN_WIDTH
        const expectedGap = followsBridge ? PLATFORM_LAYOUT.GROUND_GAP : PLATFORM_LAYOUT.GAP
        expect(gap).toBeGreaterThanOrEqual(expectedGap - 0.001)
        expect(gap).toBeLessThanOrEqual(expectedGap + speed * stepMs / 1000)
        if (followsBridge) {
          floorGaps += 1
          expect(newest.y).toBe(PLATFORM_Y - PLATFORM_LAYOUT.MIN_ELEVATION)
        } else {
          const rise = previousPlatform.y - newest.y
          expect(rise).toBeLessThanOrEqual(PLATFORM_LAYOUT.MAX_RISE)
          expect(-rise).toBeLessThanOrEqual(PLATFORM_LAYOUT.MAX_DROP)
        }
      }
      previousPlatform = newest
    }

    expect(platforms.length).toBeGreaterThanOrEqual(9)
    expect(bridges).toBeGreaterThan(0)
    expect(floorGaps).toBeGreaterThan(0)
    expect(heights.size).toBeGreaterThan(3)
    expect(Math.max(...widths) - Math.min(...widths)).toBeGreaterThan(100)
  })

  it('makes spike beds and floor gaps longer than the maximum airborne travel', () => {
    const physics = new PhysicsSystem()
    const fastestSpeed = Math.max(...LEVELS.map((level) => level.maxSpeedPx))
    const stepMs = 1000 / 60

    function airborneDistance(elevation: number): number {
      const player = createPlayer()
      player.y = PLATFORM_Y - player.height - elevation
      let distance = 0
      for (let frame = 0; frame < 300; frame++) {
        const nearFloor = player.velocityY >= 0 &&
          player.y + player.height + player.velocityY * stepMs / 1000 + 1 >= PLATFORM_Y
        const input = {
          ...InputSystem.defaultState(),
          moveRight: true,
          jumpPressed: nearFloor && player.jumpsRemaining > 0,
        }
        physics.updatePlayer(player, input, stepMs, fastestSpeed, [])
        distance += (fastestSpeed + player.velocityX) * stepMs / 1000
        if (player.y + player.height === PLATFORM_Y) return distance + player.width
      }
      throw new Error('Player did not return to the floor')
    }

    expect(PLATFORM_LAYOUT.BRIDGE_MIN_WIDTH - PLATFORM_LAYOUT.SPIKE_MARGIN * 2)
      .toBeGreaterThan(airborneDistance(1))
    expect(PLATFORM_LAYOUT.GROUND_GAP)
      .toBeGreaterThan(airborneDistance(PLATFORM_LAYOUT.MAX_ELEVATION))
  })

  it.each(LEVELS)('allows full-height drops with safe landing widths in $name', (level) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    vi.spyOn(utils, 'randomBetween').mockImplementation((min, max) =>
      max === PLATFORM_LAYOUT.MAX_WIDTH ? min : max
    )
    const spawn = new SpawnSystem({
      ...level,
      spawnRules: level.spawnRules.filter((rule) => rule.entityType === PLATFORM_LAYOUT.ENTITY_TYPE),
    }, () => level.maxSpeedPx)
    const platforms: PlatformEntity[] = []
    for (let step = 0; step < 5; step++) {
      spawn.tick(2000, [], [], [], [], [], platforms, [])
    }

    const upper = platforms[3]
    const lower = platforms[4]
    expect(lower.y - upper.y).toBe(PLATFORM_LAYOUT.MAX_DROP)
    expect(lower.width).toBeGreaterThan(PLATFORM_LAYOUT.MIN_WIDTH)
    expect(lower.width).toBeLessThanOrEqual(PLATFORM_LAYOUT.MAX_WIDTH)

    const player = createPlayer()
    upper.x = player.x + player.width - upper.width
    lower.x = upper.x + upper.width + PLATFORM_LAYOUT.GAP
    player.y = upper.y - player.height
    const physics = new PhysicsSystem()
    let landed = false
    for (let frame = 0; frame < 90; frame++) {
      upper.x -= level.maxSpeedPx / 60
      lower.x -= level.maxSpeedPx / 60
      physics.updatePlayer(player, InputSystem.defaultState(), 1000 / 60, level.maxSpeedPx, [upper, lower])
      if (player.y + player.height === lower.y && player.velocityY === 0) {
        landed = true
        break
      }
    }
    expect(landed).toBe(true)
    expect(player.jumpsRemaining).toBe(2)
  })

  it('halves each level duration', () => {
    expect(LEVELS.map((level) => level.lengthMs)).toEqual([90_000, 120_000, 150_000])
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

  it('faces the movement direction and retains it when released or both arrows are held', () => {
    const player = createPlayer()
    expect(player.facingLeft).toBe(false)
    physics.updatePlayer(player, { ...makeIdleInput(), moveLeft: true }, 16, 300, [])
    expect(player.facingLeft).toBe(true)
    physics.updatePlayer(player, makeIdleInput(), 16, 300, [])
    expect(player.facingLeft).toBe(true)
    physics.updatePlayer(player, { ...makeIdleInput(), moveLeft: true, moveRight: true }, 16, 300, [])
    expect(player.facingLeft).toBe(true)
    physics.updatePlayer(player, { ...makeIdleInput(), moveRight: true }, 16, 300, [])
    expect(player.facingLeft).toBe(false)
  })

  it('can turn at the screen boundary, whilst jumping and whilst sliding', () => {
    const player = createPlayer()
    player.x = 32
    physics.updatePlayer(player, { ...makeIdleInput(), moveLeft: true }, 16, 300, [])
    expect(player.x).toBe(32)
    expect(player.facingLeft).toBe(true)
    physics.updatePlayer(player, { ...makeIdleInput(), moveRight: true, jumpPressed: true }, 16, 300, [])
    expect(player.state).toBe('jumping')
    expect(player.facingLeft).toBe(false)
    player.y = PLATFORM_Y - player.height
    player.velocityY = 0
    player.state = 'running'
    physics.updatePlayer(player, { ...makeIdleInput(), moveLeft: true, slidePressed: true }, 16, 300, [])
    expect(player.state).toBe('sliding')
    expect(player.facingLeft).toBe(true)
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

  describe('stomping', () => {
    function setupStomp() {
      const player = createPlayer()
      player.x = 100
      player.y = 200 - player.height
      player.velocityY = 500
      const enemy: PterodactylEntity = {
        id: 'enemy', type: 'pterodactyl', active: true,
        x: 100, y: 200, width: 50, height: 30,
        velocityX: 0, velocityY: 0, phase: 'patrolling',
        patrolStartX: 100, patrolEndX: 200,
      }
      return {
        player, enemy,
        previousPlayer: { ...player, y: player.y - 20 },
        previousEnemies: new Map([[enemy.id, { ...enemy }]]),
      }
    }

    it.each(['patrolling', 'diving', 'retreating'] as const)(
      'bounces on a %s enemy when crossing its top, without taking contact damage',
      (phase) => {
        const { player, enemy, previousPlayer, previousEnemies } = setupStomp()
        enemy.phase = phase
        player.y += 25
        expect(collision.checkStomps(player, [enemy], previousPlayer, previousEnemies)).toBe(1)
        expect(enemy.active).toBe(false)
        expect(player.y + player.height).toBe(enemy.y)
        expect(player.velocityY).toBeLessThan(0)
        expect(collision.checkHazards(player, [], [], [enemy], [])).toBe(false)
      }
    )

    it('detects a fast landing even when the player passes fully through the enemy', () => {
      const { player, enemy, previousPlayer, previousEnemies } = setupStomp()
      player.y = enemy.y + enemy.height + 5
      expect(collision.checkStomps(player, [enemy], previousPlayer, previousEnemies)).toBe(1)
    })

    it.each(['rising', 'side', 'below', 'inactive', 'dead', 'miss'] as const)(
      'rejects %s contact',
      (scenario) => {
        const { player, enemy, previousPlayer, previousEnemies } = setupStomp()
        player.y += 10
        if (scenario === 'rising') player.velocityY = -100
        if (scenario === 'side') previousPlayer.y = player.y
        if (scenario === 'below') previousPlayer.y = enemy.y + enemy.height
        if (scenario === 'inactive') enemy.active = false
        if (scenario === 'dead') player.state = 'dead'
        if (scenario === 'miss') player.x = previousPlayer.x = 500
        expect(collision.checkStomps(player, [enemy], previousPlayer, previousEnemies)).toBe(0)
      }
    )

    it('uses the moving enemy position at impact rather than just its final position', () => {
      const { player, enemy, previousPlayer, previousEnemies } = setupStomp()
      player.y += 20
      enemy.x = 160
      expect(collision.checkStomps(player, [enemy], previousPlayer, previousEnemies)).toBe(1)
    })

    it('lands on the first enemy crossed rather than one below it', () => {
      const { player, enemy, previousPlayer, previousEnemies } = setupStomp()
      const lower = { ...enemy, id: 'lower', y: 230 }
      previousEnemies.set(lower.id, { ...lower })
      player.y += 60
      expect(collision.checkStomps(player, [lower, enemy], previousPlayer, previousEnemies)).toBe(1)
      expect(enemy.active).toBe(false)
      expect(lower.active).toBe(true)
    })
  })

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
