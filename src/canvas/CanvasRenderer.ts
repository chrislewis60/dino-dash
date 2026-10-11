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
  GameStats,
  BackgroundLayerConfig,
} from '@/types'
import { PLATFORM_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/game/systems/index'

export interface RenderPayload {
  player: PlayerEntity
  meteors: MeteorEntity[]
  vents: LavaVentEntity[]
  pterodactyls: PterodactylEntity[]
  collectibles: CollectibleEntity[]
  powerups: PowerUpEntity[]
  platforms: PlatformEntity[]
  spikePits: SpikePitEntity[]
  levelConfig: LevelConfig
  worldOffset: number
  stats: GameStats
  damageActive: boolean
}

const GROUND_HEIGHT = 80
const POWERUP_COLORS: Record<string, string> = {
  shield: '#00ccff',
  sprint: '#ffcc00',
  magnet: '#cc66ff',
  roar:   '#ff6600',
}
const POWERUP_LABELS: Record<string, string> = {
  shield: '🛡',
  sprint: '⚡',
  magnet: '🧲',
  roar:   '🦖',
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D
  private readonly backgroundImages = new Map<string, HTMLImageElement>()

  constructor(_canvas: HTMLCanvasElement) {
    const ctx = _canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    this.ctx = ctx
  }

  render(payload: RenderPayload): void {
    const { ctx } = this
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    this.drawBackground(payload.levelConfig, payload.worldOffset)
    this.drawGround(payload.levelConfig)
    this.drawPlatforms(payload.platforms, payload.levelConfig)
    this.drawSpikePits(payload.spikePits)
    this.drawMeteorWarnings(payload.meteors)
    this.drawVents(payload.vents)
    this.drawMeteors(payload.meteors)
    this.drawPterodactyls(payload.pterodactyls)
    this.drawCollectibles(payload.collectibles)
    this.drawPowerUps(payload.powerups)
    this.drawPlayer(payload.player, payload.damageActive)
  }

  // ─── Background ────────────────────────────────────────────────────────────

  private drawBackground(config: LevelConfig, worldOffset: number): void {
    const { ctx } = this

    if (config.backgroundImage) {
      const backgroundImage = this.getBackgroundImage(config.backgroundImage)
      if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
        this.drawCoverImage(backgroundImage, worldOffset, config.backgroundScrollFactor ?? 0)
        return
      }
    }

    // Sky fill
    ctx.fillStyle = config.skyColor
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Parallax layers
    for (const layer of config.backgroundLayers) {
      const offsetX = -(worldOffset * layer.scrollFactor) % CANVAS_WIDTH
      for (let pass = 0; pass < 2; pass++) {
        const dx = offsetX + pass * CANVAS_WIDTH
        ctx.save()
        ctx.translate(dx, 0)
        this.drawLayerShapes(layer, ctx)
        ctx.restore()
      }
    }
  }

  private getBackgroundImage(source: string): HTMLImageElement {
    const cachedImage = this.backgroundImages.get(source)
    if (cachedImage) return cachedImage

    const image = new Image()
    image.src = source
    this.backgroundImages.set(source, image)
    return image
  }

  private drawCoverImage(
    image: HTMLImageElement,
    worldOffset: number,
    scrollFactor: number,
  ): void {
    const { ctx } = this
    const scale = Math.max(CANVAS_WIDTH / image.naturalWidth, CANVAS_HEIGHT / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    const availableHorizontalPan = Math.max(0, width - CANVAS_WIDTH)
    const x = -((worldOffset * scrollFactor) % (availableHorizontalPan || 1))
    const y = (CANVAS_HEIGHT - height) / 2

    ctx.drawImage(image, x, y, width, height)
  }

  private drawLayerShapes(layer: BackgroundLayerConfig, ctx: CanvasRenderingContext2D): void {
    for (const shape of layer.shapes) {
      ctx.fillStyle = shape.color
      ctx.beginPath()
      switch (shape.type) {
        case 'rect':
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
          break
        case 'circle':
          ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2,
                  shape.width / 2, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'triangle':
          ctx.moveTo(shape.x + shape.width / 2, shape.y)
          ctx.lineTo(shape.x, shape.y + shape.height)
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height)
          ctx.closePath()
          ctx.fill()
          break
      }
    }
  }

  // ─── Ground ────────────────────────────────────────────────────────────────

  private drawGround(config: LevelConfig): void {
    if (config.showGround === false) return

    const { ctx } = this
    ctx.fillStyle = config.groundColor
    ctx.fillRect(0, PLATFORM_Y, CANVAS_WIDTH, GROUND_HEIGHT)
    // Ground line
    ctx.fillStyle = config.platformColor
    ctx.fillRect(0, PLATFORM_Y, CANVAS_WIDTH, 6)
  }

  private drawPlatforms(platforms: PlatformEntity[], config: LevelConfig): void {
    const { ctx } = this
    for (const p of platforms) {
      if (!p.active) continue
      // Platform body
      ctx.fillStyle = config.platformColor
      ctx.fillRect(p.x, p.y, p.width, p.height)
      // Top surface highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.fillRect(p.x, p.y, p.width, 3)
      // Bottom shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(p.x, p.y + p.height - 3, p.width, 3)
    }
  }

  private drawSpikePits(spikePits: SpikePitEntity[]): void {
    const { ctx } = this
    for (const s of spikePits) {
      if (!s.active) continue
      const spikeCount = Math.max(2, Math.floor(s.width / 16))
      const spikeWidth = s.width / spikeCount
      ctx.fillStyle = '#555566'
      for (let i = 0; i < spikeCount; i++) {
        const sx = s.x + i * spikeWidth
        ctx.beginPath()
        ctx.moveTo(sx, s.y + s.height)          // bottom-left
        ctx.lineTo(sx + spikeWidth / 2, s.y)     // tip
        ctx.lineTo(sx + spikeWidth, s.y + s.height) // bottom-right
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  // ─── Hazards ───────────────────────────────────────────────────────────────

  private drawMeteorWarnings(meteors: MeteorEntity[]): void {
    const { ctx } = this
    for (const m of meteors) {
      if (!m.active) continue
      // Ground shadow ellipse
      const alpha = Math.max(0, Math.min(0.6, 1 - m.y / 300))
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#ff4400'
      ctx.beginPath()
      ctx.ellipse(m.warningX + m.width / 2, PLATFORM_Y - 2, 20, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  private drawMeteors(meteors: MeteorEntity[]): void {
    const { ctx } = this
    for (const m of meteors) {
      if (!m.active) continue
      ctx.save()
      // Glow
      ctx.shadowColor = '#ff6600'
      ctx.shadowBlur = 15
      ctx.fillStyle = '#cc3300'
      ctx.beginPath()
      ctx.arc(m.x + m.width / 2, m.y + m.height / 2, m.width / 2, 0, Math.PI * 2)
      ctx.fill()
      // Core
      ctx.shadowBlur = 0
      ctx.fillStyle = '#ff9900'
      ctx.beginPath()
      ctx.arc(m.x + m.width / 2 - 4, m.y + m.height / 2 - 4, m.width / 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  private drawVents(vents: LavaVentEntity[]): void {
    const { ctx } = this
    for (const v of vents) {
      if (!v.active) continue
      // Vent base
      const glowIntensity = v.phase === 'warning' ? 20 : v.phase === 'erupting' ? 35 : 5
      ctx.save()
      ctx.shadowColor = '#ff4400'
      ctx.shadowBlur = glowIntensity
      ctx.fillStyle = v.phase === 'cooling' ? '#554433' : '#cc3300'
      ctx.fillRect(v.x, v.y, v.width, v.height)
      // Lava column
      if (v.column) {
        const gradient = ctx.createLinearGradient(0, v.column.y, 0, v.column.y + v.column.height)
        gradient.addColorStop(0, 'rgba(255, 200, 0, 0.9)')
        gradient.addColorStop(1, 'rgba(255, 60, 0, 0.7)')
        ctx.fillStyle = gradient
        ctx.fillRect(v.column.x - 10, v.column.y, 20, v.column.height)
      }
      ctx.restore()
    }
  }

  private drawPterodactyls(pterodactyls: PterodactylEntity[]): void {
    const { ctx } = this
    for (const p of pterodactyls) {
      if (!p.active) continue
      ctx.save()
      ctx.fillStyle = p.phase === 'diving' ? '#884400' : '#664422'
      // Body
      ctx.beginPath()
      ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2)
      ctx.fill()
      // Wings
      ctx.fillStyle = '#553311'
      ctx.beginPath()
      ctx.moveTo(p.x + p.width / 2, p.y + p.height / 2)
      ctx.lineTo(p.x - 20, p.y)
      ctx.lineTo(p.x + p.width / 2, p.y + p.height / 3)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(p.x + p.width / 2, p.y + p.height / 2)
      ctx.lineTo(p.x + p.width + 20, p.y)
      ctx.lineTo(p.x + p.width / 2, p.y + p.height / 3)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }

  // ─── Collectibles & Power-ups ──────────────────────────────────────────────

  private drawCollectibles(collectibles: CollectibleEntity[]): void {
    const { ctx } = this
    for (const c of collectibles) {
      if (!c.active || c.collected) continue
      ctx.save()
      if (c.type === 'fossil') {
        ctx.fillStyle = '#d4a843'
        ctx.shadowColor = '#ffcc66'
        ctx.shadowBlur = 8
        // Diamond shape
        ctx.beginPath()
        ctx.moveTo(c.x + c.width / 2, c.y)
        ctx.lineTo(c.x + c.width, c.y + c.height / 2)
        ctx.lineTo(c.x + c.width / 2, c.y + c.height)
        ctx.lineTo(c.x, c.y + c.height / 2)
        ctx.closePath()
        ctx.fill()
      } else {
        // Egg — oval
        ctx.fillStyle = '#e8d44d'
        ctx.shadowColor = '#ffffaa'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.ellipse(c.x + c.width / 2, c.y + c.height / 2, c.width / 2, c.height / 2, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }
  }

  private drawPowerUps(powerups: PowerUpEntity[]): void {
    const { ctx } = this
    for (const p of powerups) {
      if (!p.active || p.collected) continue
      ctx.save()
      const color = POWERUP_COLORS[p.powerType] ?? '#ffffff'
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 16
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(p.x, p.y, p.width, p.height, 6)
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.font = '16px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(POWERUP_LABELS[p.powerType] ?? '?', p.x + p.width / 2, p.y + p.height / 2)
      ctx.restore()
    }
  }

  // ─── Player ────────────────────────────────────────────────────────────────

  private drawPlayer(player: PlayerEntity, damageActive: boolean): void {
    const { ctx } = this
    if (player.state === 'dead') return

    ctx.save()

    // Invincibility flicker (roar or shield)
    if (player.shield || player.roarActive) {
      ctx.globalAlpha = Math.sin(Date.now() / 80) > 0 ? 1 : 0.4
      ctx.shadowColor = player.shield ? '#00ccff' : '#ff6600'
      ctx.shadowBlur = 20
    }

    const drawHeight = player.state === 'sliding' ? player.height + 12 : player.height + 32
    const drawWidth = drawHeight
    const drawY = player.y + player.height - drawHeight
    const drawX = player.x + player.width / 2 - drawWidth / 2
    const runningFrame = player.state === 'running' ? Math.floor(Date.now() / 120) % 2 : 0

    ctx.translate(drawX, drawY)
    ctx.scale(drawWidth / 100, drawHeight / 100)
    this.drawDinosaur(runningFrame, damageActive)

    // Sprint trail effect
    if (player.sprintActive) {
      for (let i = 1; i <= 3; i++) {
        ctx.globalAlpha = 0.2 * (4 - i) / 3
        ctx.fillStyle = '#ffcc00'
        ctx.fillRect(player.x - i * 12, player.y, player.width, player.height)
      }
    }

    ctx.restore()
  }

  private drawDinosaur(runningFrame: number, damageActive: boolean): void {
    const { ctx } = this
    const bodyColor = damageActive ? '#f07854' : '#63bd4c'
    const shadowColor = damageActive ? '#a83e32' : '#347d38'
    const legOffset = runningFrame === 0 ? 0 : 7

    ctx.fillStyle = shadowColor
    ctx.beginPath()
    ctx.moveTo(32, 57)
    ctx.lineTo(7, 45)
    ctx.lineTo(28, 69)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = bodyColor
    ctx.beginPath()
    ctx.roundRect(22, 43, 52, 35, 15)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(42, 48)
    ctx.lineTo(46, 37)
    ctx.lineTo(54, 43)
    ctx.lineTo(61, 31)
    ctx.lineTo(68, 41)
    ctx.lineTo(76, 39)
    ctx.lineTo(72, 53)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(52, 15, 35, 31, 10)
    ctx.fill()
    ctx.fillRect(72, 31, 22, 11)

    ctx.fillStyle = '#d8ed9a'
    ctx.beginPath()
    ctx.ellipse(51, 61, 18, 10, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = shadowColor
    ctx.fillRect(39 + legOffset, 70, 10, 23)
    ctx.fillRect(59 - legOffset, 70, 10, 23)
    ctx.fillRect(34 + legOffset, 88, 18, 7)
    ctx.fillRect(55 - legOffset, 88, 18, 7)
    ctx.fillRect(57, 50, 15, 5)

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(76, 25, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#172a1c'
    ctx.beginPath()
    ctx.arc(78, 25, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }
}
