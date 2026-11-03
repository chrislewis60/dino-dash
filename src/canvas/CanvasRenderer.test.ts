import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CanvasRenderer } from '@/canvas/CanvasRenderer'
import { BACKGROUND_IMAGES, COLLECTABLE_ICONS, DINOSAUR_ARTWORK, GAME_ICONS, HAZARD_ICONS } from '@/config/assets'
import { LEVELS } from '@/game/levels'
import { CANVAS_HEIGHT, CANVAS_WIDTH, PLATFORM_Y } from '@/game/systems'
import { SPIKE_LAYOUT } from '@/config/platforms'
import type { RenderPayload } from '@/canvas/CanvasRenderer'

class TestImage {
  static instances: TestImage[] = []
  src = ''
  complete = true
  naturalWidth = 512
  naturalHeight = 512
  onerror: (() => void) | null = null

  constructor() {
    TestImage.instances.push(this)
  }
}

function setup() {
  TestImage.instances = []
  vi.stubGlobal('Image', TestImage)
  const drawImage = vi.fn()
  const fillText = vi.fn()
  const ctx = new Proxy<Partial<CanvasRenderingContext2D>>({ drawImage, fillText }, {
    get(target, property) {
      if (property in target) return Reflect.get(target, property)
      return vi.fn()
    },
  })
  ctx.measureText = vi.fn(() => ({
    actualBoundingBoxLeft: 0, actualBoundingBoxRight: 100,
    actualBoundingBoxAscent: 90, actualBoundingBoxDescent: 10,
  }) as TextMetrics)
  const canvas = document.createElement('canvas')
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as CanvasRenderingContext2D)
  const renderer = new CanvasRenderer(canvas)
  const payload: RenderPayload = {
    player: {
      id: 'player', type: 'player', active: true, x: 100, y: 300, width: 40, height: 48,
      facingLeft: false, velocityX: 0, velocityY: 0, state: 'dead', jumpsRemaining: 2, slideTimer: 0,
      shield: false, shieldTimer: 0, sprintActive: false, sprintTimer: 0,
      magnetActive: false, magnetTimer: 0, roarActive: false, roarTimer: 0,
    },
    meteors: [], vents: [], pterodactyls: [], platforms: [], spikePits: [],
    collectibles: [
      { id: 'fossil', type: 'fossil', x: 200, y: 200, width: 20, height: 20,
        active: true, collected: false, magnetPull: false },
      { id: 'egg', type: 'egg', x: 230, y: 200, width: 24, height: 28,
        active: true, collected: false, magnetPull: false },
    ],
    powerups: (['shield', 'sprint', 'magnet', 'roar'] as const).map((powerType, index) => ({
      id: powerType, type: 'powerup', powerType, x: 300 + index * 40, y: 200,
      width: 28, height: 28, active: true, collected: false,
    })),
    levelConfig: { ...LEVELS[0], backgroundImage: undefined },
    worldOffset: 0,
    stats: { scoreBreakdown: { distance: 0, fossils: 0, stomps: 0, roar: 0 },
      score: 0, lives: 3, level: 1, distance: 0, fossils: 0,
      enemiesStomped: 0, levelElapsedMs: 0, activeLevel: null },
    damageActive: false,
  }
  return { renderer, payload, drawImage, fillText, ctx }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('game item artwork', () => {
  it('renders the supplied level 2 background with cover scaling and no ground overlay', () => {
    const { renderer, payload, drawImage, ctx } = setup()
    payload.levelConfig = LEVELS[1]
    payload.collectibles = []
    payload.powerups = []
    expect(payload.levelConfig.backgroundImage).toBe(BACKGROUND_IMAGES.VOLCANIC_BADLANDS)
    const png = readFileSync(resolve('public', BACKGROUND_IMAGES.VOLCANIC_BADLANDS.slice(1)))
    expect(png.subarray(1, 4).toString()).toBe('PNG')
    const width = png.readUInt32BE(16)
    const height = png.readUInt32BE(20)
    renderer.render(payload)
    const image = TestImage.instances.find(
      (instance) => instance.src === BACKGROUND_IMAGES.VOLCANIC_BADLANDS,
    )
    expect(image).toBeDefined()
    if (!image) throw new Error('Level 2 background was not loaded')
    image.naturalWidth = width
    image.naturalHeight = height
    drawImage.mockClear()
    const fillRect = vi.fn()
    ctx.fillRect = fillRect
    payload.worldOffset = 100
    renderer.render(payload)
    const scale = Math.max(CANVAS_WIDTH / width, CANVAS_HEIGHT / height)
    expect(drawImage).toHaveBeenCalledExactlyOnceWith(
      image,
      -(100 * 0.108) % (width * scale - CANVAS_WIDTH || 1),
      (CANVAS_HEIGHT - height * scale) / 2,
      width * scale,
      height * scale,
    )
    expect(fillRect).not.toHaveBeenCalled()
    expect(TestImage.instances.filter((instance) => instance.src === image.src)).toHaveLength(1)
  })

  it('bundles all ten transparent SVGs in the configured colours', () => {
    for (const icon of Object.values(GAME_ICONS)) {
      const svg = readFileSync(resolve('public', icon.source.slice(1)), 'utf8')
      expect(svg).toContain('viewBox="0 0 512 512"')
      expect(svg).toContain(`fill="${icon.colour}"`)
      expect(svg).not.toContain('M0 0h512v512H0z')
    }
  })

  describe('player artwork', () => {
    function setupPlayer() {
      const result = setup()
      result.payload.player.state = 'running'
      result.payload.collectibles = []
      result.payload.powerups = []
      return result
    }

    it('uses the welcome emoji, caches it and leaves the hitbox unchanged', () => {
      const { renderer, payload, drawImage, fillText } = setupPlayer()
      const before = structuredClone(payload.player)
      renderer.render(payload)
      expect(fillText).toHaveBeenCalledExactlyOnceWith(DINOSAUR_ARTWORK.GLYPH, 0, 90)
      expect(drawImage).toHaveBeenCalledTimes(3)
      expect(drawImage.mock.calls[0][0]).toBeInstanceOf(HTMLCanvasElement)
      renderer.render(payload)
      expect(fillText).toHaveBeenCalledTimes(1)
      expect(payload.player).toEqual(before)
    })

    it('mirrors the naturally left-facing emoji only when facing right', () => {
      const { renderer, payload, ctx } = setupPlayer()
      const scale = vi.fn()
      ctx.scale = scale
      renderer.render(payload)
      expect(scale).toHaveBeenCalledWith(-1, 1)
      scale.mockClear()
      payload.player.facingLeft = true
      renderer.render(payload)
      expect(scale).not.toHaveBeenCalledWith(-1, 1)
    })

    it('swings both legs in opposite directions whilst running', () => {
      const { renderer, payload, ctx } = setupPlayer()
      const transform = vi.fn()
      ctx.transform = transform
      vi.spyOn(Date, 'now').mockReturnValue(DINOSAUR_ARTWORK.STRIDE_MS / 4)
      renderer.render(payload)
      expect(transform).toHaveBeenNthCalledWith(1, 1, 0, DINOSAUR_ARTWORK.LEG_SWING, 1, 0, 0)
      expect(transform).toHaveBeenNthCalledWith(2, 1, 0, -DINOSAUR_ARTWORK.LEG_SWING, 1, 0, 0)
      transform.mockClear()
      vi.mocked(Date.now).mockReturnValue(DINOSAUR_ARTWORK.STRIDE_MS * 3 / 4)
      renderer.render(payload)
      expect(transform).toHaveBeenNthCalledWith(1, 1, 0, -DINOSAUR_ARTWORK.LEG_SWING, 1, 0, 0)
    })

    it('completes a stride in 320ms, 50% faster than the original 480ms cycle', () => {
      expect(DINOSAUR_ARTWORK.STRIDE_MS).toBe(480 / 1.5)
    })

    it.each(['jumping', 'doubleJumping', 'sliding'] as const)('keeps the legs still when %s', (state) => {
      const { renderer, payload, ctx } = setupPlayer()
      const transform = vi.fn()
      ctx.transform = transform
      payload.player.state = state
      renderer.render(payload)
      expect(transform).toHaveBeenNthCalledWith(1, 1, 0, 0, 1, 0, 0)
      expect(transform).toHaveBeenNthCalledWith(2, 1, 0, -0, 1, 0, 0)
    })

    it('draws sprint trails in world coordinates behind the facing direction', () => {
      const { renderer, payload, ctx } = setupPlayer()
      const fillRect = vi.fn()
      ctx.fillRect = fillRect
      payload.player.sprintActive = true
      renderer.render(payload)
      expect(fillRect).toHaveBeenCalledWith(88, 300, 40, 48)
      payload.player.facingLeft = true
      renderer.render(payload)
      expect(fillRect).toHaveBeenCalledWith(112, 300, 40, 48)
    })
  })

  it('preloads and reuses every icon at 150% size without changing pickup hitboxes', () => {
    const { renderer, payload, drawImage } = setup()
    const before = structuredClone([...payload.collectibles, ...payload.powerups])
    renderer.render(payload)
    const entities = [...payload.collectibles, ...payload.powerups]
    expect(drawImage).toHaveBeenCalledTimes(6)
    entities.forEach((entity, index) => {
      const type = entity.type === 'powerup' ? entity.powerType : entity.type
      const size = Math.min(entity.width, entity.height) * 1.5
      expect(drawImage).toHaveBeenNthCalledWith(
        index + 1,
        expect.objectContaining({ src: COLLECTABLE_ICONS[type].source }),
        entity.x + (entity.width - size) / 2,
        entity.y + (entity.height - size) / 2,
        size, size,
      )
    })
    renderer.render(payload)
    expect(TestImage.instances).toHaveLength(10)
    expect(entities).toEqual(before)
  })

  it('does not draw inactive or collected pickups', () => {
    const { renderer, payload, drawImage } = setup()
    payload.collectibles[0].collected = true
    payload.collectibles[1].active = false
    payload.powerups[0].collected = true
    payload.powerups[1].active = false
    renderer.render(payload)
    expect(drawImage).toHaveBeenCalledTimes(2)
  })

  it('draws fossils, eggs and every power-up as raw artwork without boxes or borders', () => {
    const { renderer, payload, drawImage, ctx } = setup()
    payload.levelConfig = {
      ...payload.levelConfig,
      backgroundLayers: [],
      showGround: false,
    }
    const fill = vi.fn()
    const stroke = vi.fn()
    const roundRect = vi.fn()
    ctx.fill = fill
    ctx.stroke = stroke
    ctx.roundRect = roundRect

    renderer.render(payload)

    expect(drawImage).toHaveBeenCalledTimes(Object.keys(COLLECTABLE_ICONS).length)
    expect(fill).not.toHaveBeenCalled()
    expect(stroke).not.toHaveBeenCalled()
    expect(roundRect).not.toHaveBeenCalled()
  })

  it('distinguishes loading from failed artwork and reports a failed asset', () => {
    const { renderer, payload, drawImage, fillText } = setup()
    TestImage.instances.forEach((image) => { image.complete = false })
    renderer.render(payload)
    expect(drawImage).not.toHaveBeenCalled()
    expect(fillText).toHaveBeenCalledWith('\u2026', 210, 210)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    TestImage.instances[0].onerror?.()
    renderer.render(payload)
    expect(error).toHaveBeenCalledWith('Unable to load game icon: /icons/fossil.svg')
    expect(fillText).toHaveBeenCalledWith('!', 210, 210)
  })

  it('tiles long spike beds without stretching the artwork or changing the hitbox', () => {
    const { renderer, payload, drawImage } = setup()
    payload.collectibles = []
    payload.powerups = []
    const spikes = {
      id: 'long-spikes', type: SPIKE_LAYOUT.ENTITY_TYPE, active: true,
      x: 100, y: PLATFORM_Y - SPIKE_LAYOUT.HEIGHT,
      width: 1440, height: SPIKE_LAYOUT.HEIGHT,
    }
    payload.spikePits = [spikes]
    const before = structuredClone(spikes)

    renderer.render(payload)

    expect(drawImage).toHaveBeenCalledTimes(16)
    for (let tile = 0; tile < 16; tile++) {
      expect(drawImage).toHaveBeenNthCalledWith(
        tile + 1,
        expect.objectContaining({ src: HAZARD_ICONS.spikePit.source }),
        spikes.x + tile * 90 - 22.5,
        spikes.y - 10,
        135,
        30,
      )
    }
    expect(spikes).toEqual(before)
  })

  it('uses matching hazard icons without changing hitboxes, shadows or lava columns', () => {
    const { renderer, payload, drawImage, ctx } = setup()
    payload.collectibles = []
    payload.powerups = []
    payload.meteors = [{
      id: 'meteor', type: 'meteor', active: true, x: 200, y: 100, width: 32, height: 32,
      velocityX: -200, velocityY: 300, warningX: 140,
    }]
    payload.vents = [{
      id: 'vent', type: 'lavaVent', active: true, x: 400, y: 390, width: 40, height: 20,
      phase: 'erupting', phaseTimer: 100, column: { x: 420, y: 300, height: 90 },
    }]
    payload.pterodactyls = [{
      id: 'ptero', type: 'pterodactyl', active: true, x: 500, y: 150, width: 50, height: 30,
      velocityX: -100, velocityY: 0, phase: 'diving', patrolStartX: 500, patrolEndX: 300,
    }]
    payload.spikePits = [{
      id: 'spikes', type: 'spikePit', active: true, x: 600, y: 380, width: 60, height: 20,
    }]
    const before = structuredClone(payload)
    const ellipse = vi.fn()
    const fillRect = vi.fn()
    const addColorStop = vi.fn()
    ctx.ellipse = ellipse
    ctx.fillRect = fillRect
    ctx.createLinearGradient = vi.fn(() => ({ addColorStop }) as CanvasGradient)

    renderer.render(payload)

    expect(drawImage).toHaveBeenCalledTimes(4)
    for (const hazard of [
      ...payload.spikePits, ...payload.vents, ...payload.meteors, ...payload.pterodactyls,
    ]) {
      expect(drawImage).toHaveBeenCalledWith(
        expect.objectContaining({ src: HAZARD_ICONS[hazard.type].source }),
        hazard.x - hazard.width * 0.25,
        hazard.y - hazard.height * (
          hazard.type === 'lavaVent' || hazard.type === 'spikePit' ? 0.5 : 0.25
        ),
        hazard.width * 1.5, hazard.height * 1.5,
      )
    }
    expect(ellipse).toHaveBeenCalledWith(156, PLATFORM_Y - 2, 20, 6, 0, 0, Math.PI * 2)
    expect(fillRect).toHaveBeenCalledWith(410, 300, 20, 90)
    expect(addColorStop).toHaveBeenCalledTimes(2)
    expect(payload).toEqual(before)

    drawImage.mockClear()
    payload.meteors[0].active = false
    payload.vents[0].active = false
    payload.pterodactyls[0].active = false
    payload.spikePits[0].active = false
    renderer.render(payload)
    expect(drawImage).not.toHaveBeenCalled()
  })
})
