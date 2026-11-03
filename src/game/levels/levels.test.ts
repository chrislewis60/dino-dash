import { describe, expect, it, vi } from 'vitest'
import { LEVELS, level1, level2, level3 } from '@/game/levels'
import { BACKGROUND_IMAGES } from '@/config/assets'
import { SpawnSystem } from '@/game/systems'
import type { LevelConfig, SpawnRule } from '@/types'

const HAZARDS = ['meteor', 'lavaVent', 'pterodactyl', 'spikePit'] as const

function ruleFor(level: LevelConfig, entityType: SpawnRule['entityType']) {
  const rule = level.spawnRules.find((candidate) => candidate.entityType === entityType)
  if (!rule) throw new Error(`Missing spawn rule: ${entityType}`)
  return rule
}

describe('SPEC-006 level progression', () => {
  it.each([
    { level: level2, intervals: [[2400, 600], [3000, 700], [4200, 900], [4800, 1000]] },
    { level: level3, intervals: [[2100, 500], [2600, 600], [3600, 800], [4200, 900]] },
  ])('SPEC-006-AC02 applies the proposed interval/variance table for $level.name', ({ level, intervals }) => {
    expect(HAZARDS.map((type) => {
      const rule = ruleFor(level, type)
      return [rule.intervalMs, rule.intervalVariance]
    })).toEqual(intervals)
  })

  it('SPEC-006-AC01 uses the supplied third panorama with consistent ground and pan settings', () => {
    expect(level3.backgroundImage).toBe(
      '/chrislewis60_create_a_background_for_a_platform_game_involving__e457c491-6959-4161-9888-58ac73e45a92.jpeg'
    )
    expect(Object.values(BACKGROUND_IMAGES)).toContain(level3.backgroundImage)
    expect(level3.backgroundScrollFactor).toBe(level2.backgroundScrollFactor)
    expect(level3.showGround).toBe(false)
  })

  it('SPEC-006-AC02 increases obstacle frequency with bounded single-hazard waves', () => {
    for (const type of HAZARDS) {
      const rules = LEVELS.map((level) => ruleFor(level, type))
      expect(rules[1].intervalMs).toBeLessThan(rules[0].intervalMs)
      expect(rules[2].intervalMs).toBeLessThan(rules[1].intervalMs)
      for (const rule of rules) {
        expect(rule.quantity).toBe(1)
        expect(rule.intervalMs - rule.intervalVariance).toBeGreaterThanOrEqual(1500)
      }
    }
    const rate = (level: LevelConfig) => HAZARDS.reduce(
      (sum, type) => sum + ruleFor(level, type).quantity / ruleFor(level, type).intervalMs, 0
    )
    expect(rate(level3) / rate(level2)).toBeGreaterThanOrEqual(1.1)
    expect(rate(level3) / rate(level2)).toBeLessThanOrEqual(1.25)
  })

  it('SPEC-006-AC02 retains resources, durations and safe geometry while moderating final speed', () => {
    expect(LEVELS.map((level) => level.lengthMs)).toEqual([90_000, 120_000, 150_000])
    expect([level2.baseSpeedPx, level2.maxSpeedPx, level2.speedRampPerSecond]).toEqual([320, 560, 10])
    expect([level3.baseSpeedPx, level3.maxSpeedPx, level3.speedRampPerSecond]).toEqual([350, 600, 10])
    expect(ruleFor(level3, 'egg').intervalMs).toBeLessThanOrEqual(ruleFor(level2, 'egg').intervalMs)
    expect(ruleFor(level3, 'powerup').intervalMs).toBeLessThanOrEqual(ruleFor(level2, 'powerup').intervalMs)
    expect(ruleFor(level3, 'platform')).toEqual(ruleFor(level1, 'platform'))
  })

  it('SPEC-006-AC02 spawns more of every hazard over one minute at each level', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    try {
      const counts = LEVELS.map((level) => {
        // Isolate timed hazards from the unchanged bridge/route spike beds.
        const spawn = new SpawnSystem({
          ...level,
          spawnRules: level.spawnRules.filter((rule) =>
            HAZARDS.some((type) => type === rule.entityType)
          ),
        }, () => level.baseSpeedPx)
        const entities: Parameters<SpawnSystem['tick']> = [1000 / 60, [], [], [], [], [], [], []]
        for (let frame = 0; frame < 3600; frame++) spawn.tick(...entities)
        return [entities[1].length, entities[2].length, entities[3].length, entities[7].length]
      })
      for (let type = 0; type < HAZARDS.length; type++) {
        expect(counts[1][type]).toBeGreaterThan(counts[0][type])
        expect(counts[2][type]).toBeGreaterThan(counts[1][type])
      }
    } finally {
      random.mockRestore()
    }
  })
})
