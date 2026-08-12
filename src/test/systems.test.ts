import { describe, it, expect } from 'vitest'
import { PhysicsSystem, CollisionSystem, createPlayer, PLATFORM_Y } from '@/game/systems/index'
import { InputSystem } from '@/game/systems/InputSystem'
import type { MeteorEntity } from '@/types'

describe('PhysicsSystem', () => {
  const physics = new PhysicsSystem()

  function makeIdleInput() {
    return InputSystem.defaultState()
  }

  it('applies gravity to player when in air', () => {
    const player = createPlayer()
    player.y = 200  // above ground
    player.velocityY = 0
    physics.updatePlayer(player, makeIdleInput(), 16, 300)
    expect(player.velocityY).toBeGreaterThan(0)
  })

  it('stops player on ground', () => {
    const player = createPlayer()
    player.y = PLATFORM_Y  // below ground
    player.velocityY = 100
    physics.updatePlayer(player, makeIdleInput(), 16, 300)
    expect(player.velocityY).toBe(0)
    expect(player.y).toBe(PLATFORM_Y - player.height)
  })

  it('makes player jump when jumpPressed', () => {
    const player = createPlayer()
    player.y = PLATFORM_Y - player.height
    player.jumpsRemaining = 2
    const input = { ...makeIdleInput(), jumpPressed: true, jump: true }
    physics.updatePlayer(player, input, 16, 300)
    expect(player.velocityY).toBeLessThan(0) // going up
    expect(player.jumpsRemaining).toBe(1)
  })

  it('enters slide state on slidePressed', () => {
    const player = createPlayer()
    player.state = 'running'
    const input = { ...makeIdleInput(), slidePressed: true, slide: true }
    physics.updatePlayer(player, input, 16, 300)
    expect(player.state).toBe('sliding')
    expect(player.height).toBe(30) // SLIDE_HEIGHT
  })

  it('does not apply physics when dead', () => {
    const player = createPlayer()
    player.state = 'dead'
    const prevY = player.y
    physics.updatePlayer(player, makeIdleInput(), 16, 300)
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
    const hit = collision.checkHazards(player, [meteor], [], [])
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
    const hit = collision.checkHazards(player, [meteor], [], [])
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
    const hit = collision.checkHazards(player, [meteor], [], [])
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
