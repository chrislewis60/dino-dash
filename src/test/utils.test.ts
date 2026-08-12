import { describe, it, expect } from 'vitest'
import { clamp, lerp, randomBetween, randomInt, aabbOverlap, generateId, msToSec } from '@/utils'

describe('utils', () => {
  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })
    it('clamps to min', () => {
      expect(clamp(-1, 0, 10)).toBe(0)
    })
    it('clamps to max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('lerp', () => {
    it('returns a at t=0', () => {
      expect(lerp(10, 20, 0)).toBe(10)
    })
    it('returns b at t=1', () => {
      expect(lerp(10, 20, 1)).toBe(20)
    })
    it('returns midpoint at t=0.5', () => {
      expect(lerp(0, 100, 0.5)).toBe(50)
    })
  })

  describe('randomBetween', () => {
    it('returns value within range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomBetween(5, 10)
        expect(val).toBeGreaterThanOrEqual(5)
        expect(val).toBeLessThan(10)
      }
    })
  })

  describe('randomInt', () => {
    it('returns integer within inclusive range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomInt(1, 6)
        expect(val).toBeGreaterThanOrEqual(1)
        expect(val).toBeLessThanOrEqual(6)
        expect(Number.isInteger(val)).toBe(true)
      }
    })
  })

  describe('aabbOverlap', () => {
    it('detects overlapping rects', () => {
      expect(aabbOverlap(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true)
    })
    it('detects non-overlapping rects', () => {
      expect(aabbOverlap(0, 0, 10, 10, 20, 20, 10, 10)).toBe(false)
    })
    it('detects edge-touching as non-overlapping', () => {
      expect(aabbOverlap(0, 0, 10, 10, 10, 0, 10, 10)).toBe(false)
    })
  })

  describe('generateId', () => {
    it('generates unique strings', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('msToSec', () => {
    it('converts milliseconds to seconds', () => {
      expect(msToSec(1000)).toBe(1)
      expect(msToSec(500)).toBe(0.5)
    })
  })
})
