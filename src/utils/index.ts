/**
 * Pure utility functions — no side effects, no external imports.
 */

/** Generate a unique entity ID */
export function generateId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Random float between min (inclusive) and max (exclusive) */
export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Random integer between min (inclusive) and max (inclusive) */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * AABB (Axis-Aligned Bounding Box) collision check.
 * Returns true when the two rectangles overlap.
 */
export function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

/** Convert milliseconds to seconds */
export function msToSec(ms: number): number {
  return ms / 1000
}
