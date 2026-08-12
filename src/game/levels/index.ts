import type { LevelConfig } from '@/types'

export const level1: LevelConfig = {
  id: 1,
  name: 'Jurassic Jungle',
  skyColor: '#4a7c59',
  groundColor: '#5a3e1b',
  platformColor: '#7a5c2e',
  backgroundLayers: [
    {
      color: '#2d5a3d',
      scrollFactor: 0.1,
      shapes: [
        { type: 'triangle', x: 50,  y: 200, width: 80,  height: 180, color: '#1e4028' },
        { type: 'triangle', x: 160, y: 160, width: 100, height: 220, color: '#265235' },
        { type: 'triangle', x: 300, y: 180, width: 90,  height: 200, color: '#1e4028' },
        { type: 'triangle', x: 450, y: 150, width: 110, height: 240, color: '#265235' },
        { type: 'triangle', x: 600, y: 170, width: 95,  height: 210, color: '#1e4028' },
        { type: 'triangle', x: 720, y: 190, width: 85,  height: 190, color: '#265235' },
      ],
    },
    {
      color: '#3d6b4a',
      scrollFactor: 0.3,
      shapes: [
        { type: 'rect', x: 80,  y: 300, width: 30, height: 120, color: '#8B5E3C' },
        { type: 'rect', x: 250, y: 280, width: 25, height: 140, color: '#8B5E3C' },
        { type: 'rect', x: 430, y: 310, width: 35, height: 110, color: '#8B5E3C' },
        { type: 'rect', x: 600, y: 290, width: 28, height: 130, color: '#8B5E3C' },
      ],
    },
    {
      color: 'transparent',
      scrollFactor: 0.6,
      shapes: [
        { type: 'circle', x: 80,  y: 295, width: 70, height: 70, color: '#2a7a3a' },
        { type: 'circle', x: 250, y: 275, width: 80, height: 80, color: '#338844' },
        { type: 'circle', x: 430, y: 305, width: 65, height: 65, color: '#2a7a3a' },
        { type: 'circle', x: 600, y: 285, width: 75, height: 75, color: '#338844' },
      ],
    },
  ],
  spawnRules: [
    { entityType: 'meteor',       intervalMs: 4000, intervalVariance: 1500, quantity: 1 },
    { entityType: 'pterodactyl',  intervalMs: 6000, intervalVariance: 2000, quantity: 1 },
    { entityType: 'fossil',       intervalMs: 2500, intervalVariance: 800,  quantity: 2 },
    { entityType: 'egg',          intervalMs: 12000, intervalVariance: 3000, quantity: 1 },
    { entityType: 'powerup',      intervalMs: 18000, intervalVariance: 5000, quantity: 1 },
  ],
  baseSpeedPx: 260,
  maxSpeedPx: 480,
  speedRampPerSecond: 8,
  lengthMs: 60_000,
  scoreMultiplier: 1,
}

export const level2: LevelConfig = {
  id: 2,
  name: 'Volcanic Badlands',
  skyColor: '#2b1a0e',
  groundColor: '#3d1a00',
  platformColor: '#5c2a00',
  backgroundLayers: [
    {
      color: '#1a0d00',
      scrollFactor: 0.1,
      shapes: [
        { type: 'triangle', x: 60,  y: 220, width: 100, height: 200, color: '#4a1500' },
        { type: 'triangle', x: 220, y: 180, width: 130, height: 250, color: '#5c1a00' },
        { type: 'triangle', x: 400, y: 200, width: 110, height: 230, color: '#4a1500' },
        { type: 'triangle', x: 580, y: 190, width: 120, height: 240, color: '#5c1a00' },
        { type: 'triangle', x: 720, y: 210, width: 100, height: 210, color: '#4a1500' },
      ],
    },
    {
      color: 'transparent',
      scrollFactor: 0.4,
      shapes: [
        { type: 'circle', x: 100, y: 380, width: 20, height: 20, color: '#ff4400' },
        { type: 'circle', x: 280, y: 390, width: 15, height: 15, color: '#ff6600' },
        { type: 'circle', x: 460, y: 375, width: 25, height: 25, color: '#ff4400' },
        { type: 'circle', x: 640, y: 385, width: 18, height: 18, color: '#ff6600' },
      ],
    },
  ],
  spawnRules: [
    { entityType: 'meteor',       intervalMs: 2800, intervalVariance: 1000, quantity: 1 },
    { entityType: 'lavaVent',     intervalMs: 3500, intervalVariance: 1200, quantity: 1 },
    { entityType: 'pterodactyl',  intervalMs: 5000, intervalVariance: 1500, quantity: 1 },
    { entityType: 'fossil',       intervalMs: 2000, intervalVariance: 600,  quantity: 2 },
    { entityType: 'egg',          intervalMs: 10000, intervalVariance: 2500, quantity: 1 },
    { entityType: 'powerup',      intervalMs: 15000, intervalVariance: 4000, quantity: 1 },
  ],
  baseSpeedPx: 320,
  maxSpeedPx: 560,
  speedRampPerSecond: 10,
  lengthMs: 75_000,
  scoreMultiplier: 1.5,
}

export const level3: LevelConfig = {
  id: 3,
  name: 'Meteor Impact Zone',
  skyColor: '#0d0d1a',
  groundColor: '#1a0a0a',
  platformColor: '#2d0d0d',
  backgroundLayers: [
    {
      color: '#080812',
      scrollFactor: 0.05,
      shapes: [
        { type: 'circle', x: 150, y: 80,  width: 8,  height: 8,  color: '#ffffff' },
        { type: 'circle', x: 320, y: 50,  width: 4,  height: 4,  color: '#ccccff' },
        { type: 'circle', x: 500, y: 100, width: 6,  height: 6,  color: '#ffffff' },
        { type: 'circle', x: 680, y: 60,  width: 5,  height: 5,  color: '#ccccff' },
        { type: 'circle', x: 100, y: 130, width: 3,  height: 3,  color: '#ffffff' },
        { type: 'circle', x: 400, y: 30,  width: 7,  height: 7,  color: '#ffeecc' },
        { type: 'circle', x: 600, y: 120, width: 4,  height: 4,  color: '#ffffff' },
      ],
    },
    {
      color: 'transparent',
      scrollFactor: 0.2,
      shapes: [
        { type: 'circle', x: 80,  y: 350, width: 40, height: 20, color: '#331100' },
        { type: 'circle', x: 260, y: 370, width: 60, height: 25, color: '#441500' },
        { type: 'circle', x: 450, y: 355, width: 50, height: 22, color: '#331100' },
        { type: 'circle', x: 640, y: 362, width: 45, height: 20, color: '#441500' },
      ],
    },
  ],
  spawnRules: [
    { entityType: 'meteor',       intervalMs: 1800, intervalVariance: 700,  quantity: 2 },
    { entityType: 'lavaVent',     intervalMs: 2800, intervalVariance: 900,  quantity: 1 },
    { entityType: 'pterodactyl',  intervalMs: 4000, intervalVariance: 1200, quantity: 2 },
    { entityType: 'fossil',       intervalMs: 1500, intervalVariance: 500,  quantity: 2 },
    { entityType: 'egg',          intervalMs: 8000, intervalVariance: 2000, quantity: 1 },
    { entityType: 'powerup',      intervalMs: 12000, intervalVariance: 3000, quantity: 1 },
  ],
  baseSpeedPx: 400,
  maxSpeedPx: 700,
  speedRampPerSecond: 14,
  lengthMs: 90_000,
  scoreMultiplier: 2,
}

export const LEVELS: LevelConfig[] = [level1, level2, level3]
