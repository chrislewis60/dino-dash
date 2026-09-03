# Dino Dash: Extinction Run — Game Design Document

This document gives AI agents and contributors shared context about the game's intended design.
It is the single source of truth for mechanics, progression, and content decisions.

---

## Concept

A fast-paced, auto-scrolling side-scrolling platform runner set at the end of the Cretaceous period.
The player controls a dinosaur sprinting through prehistoric environments, dodging extinction-level events
and collecting fossils and eggs to survive.

---

## Core Mechanics

### Movement
| Action | Input |
|---|---|
| Jump | Space / Up arrow / Tap |
| Double jump | Space / Up again mid-air |
| Slide | Down arrow / Swipe down |

### Player States
`running → jumping → doubleJumping → sliding → dead`

- The player is always moving right (auto-scroll)
- Sliding reduces hitbox height to duck under pterodactyls
- Double jump gives a second chance over wide hazards

### Lives & Damage
- Start with **3 lives**, maximum **5**
- Brief **1.5s invincibility** after taking damage
- Eggs collected grant +1 life (up to max)

---

## Scoring

| Source | Points |
|---|---|
| Distance travelled | `pixels × 0.05` |
| Fossil collected | 50 |
| Enemy stomped | 200 |
| Enemy cleared by Roar | 150 |
| Egg collected | +1 life (no score) |

Each level has a `scoreMultiplier` applied to all points earned in that level.

---

## Power-Ups

| Type | Effect |
|---|---|
| `shield` | Absorbs one hit |
| `sprint` | Temporary speed boost |
| `magnet` | Auto-collects nearby fossils/eggs |
| `roar` | Clears all on-screen hazards |

---

## Hazards

| Type | Behaviour |
|---|---|
| `meteor` | Falls diagonally from top-right; shadow warns of impact point |
| `lavaVent` | Ground-based; cycles idle → warning → erupting → cooling |
| `pterodactyl` | Flies horizontally at head height; player must slide |
| `spikePit` | Static ground obstacle; player must jump over; deals damage on contact |

## Platforms

Elevated rectangular surfaces that scroll with the world. The player can jump onto them from below (one-way: land on top only). Landing on a platform resets the player's double jump.

- Spawned by `SpawnSystem` like other entities — scroll left and despawn off-screen
- Two height tiers: **low** (~110px above ground — one jump) and **mid** (~190px — two jumps)
- Width varies from 100–220px per spawn
- Defined via `spawnRules` in `LevelConfig` using `entityType: 'platform'`
- `crumbling` field exists on `PlatformEntity` but is not yet active

---

## Levels

| # | Name | Theme | Duration | Base Speed | Max Speed | Multiplier |
|---|---|---|---|---|---|---|
| 1 | Jurassic Jungle | Dense green forest | 60s | 260 px/s | 480 px/s | ×1.0 |
| 2 | Volcanic Badlands | Dark volcanic terrain with lava pools | 75s | 320 px/s | 560 px/s | ×1.5 |
| 3 | Meteor Impact Zone | Night sky, craters, constant barrage | TBD | TBD | TBD | TBD |

Speed increases continuously within a level via `speedRampPerSecond`.

### Planned / Future Levels
- **Ice Age Tundra** — Slippery ground mechanic, blizzard visibility reduction
- **Asteroid Belt** — Zero-gravity floaty jumps, dense meteor storms
- **Underground Caves** — Low ceiling, tight platforms, bioluminescent collectibles

---

## Entity Spawn Rules (per level)

Defined in `src/game/levels/index.ts` as `spawnRules[]`:
- `intervalMs` — base time between spawns
- `intervalVariance` — random ± variation
- `quantity` — how many to spawn per trigger

---

## Architecture Overview

```
GameEngine          — main loop, coordinates all systems
  StateMachine      — menu | playing | paused | levelComplete | gameOver
  SpawnSystem       — entity spawning driven by LevelConfig.spawnRules
  PhysicsSystem     — gravity, velocity, ground collision
  CollisionSystem   — player vs hazards, player vs collectibles
  InputSystem       — keyboard + touch input
  CanvasRenderer    — all drawing (no DOM elements in game loop)
```

React owns the **UI shell** (HUD, menus, overlays) and passes a `<canvas>` ref to `GameEngine`.
`GameContext` bridges engine stats → React state via a callback.

---

## Conventions for New Content

- New levels → add to `src/game/levels/index.ts`, export in `LEVELS` array
- New hazard types → add interface to `src/types/index.ts`, implement in `SpawnSystem`, `PhysicsSystem` (if it has surface collision), `CollisionSystem`, `CanvasRenderer`
- New power-ups → add to `PowerUpType` union in `src/types/index.ts`, handle in `CollisionSystem` and player state
- Platforms and spike pits → tune spawn frequency via `spawnRules` in each level config
- All new string identifiers → define as constants in `src/config/` (no magic strings)
- All new files → TypeScript, named exports, UK English
