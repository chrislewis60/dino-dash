# Dino Dash: Extinction Run — Game Design Document

This document gives AI agents and contributors shared context about the game's intended design.
It is the narrative design reference for mechanics, progression, and content decisions.
The [retrospective specifications and ADRs](docs/README.md) separately document the
observed implementation and inferred rationale as of 2026-11-03, pending human review.
Where this design and the code disagree, see the
[open questions](docs/registers/open-questions.md); neither observation nor a generated
proposal implies product approval. Future changes should update the relevant spec.

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
| Move / face left or right | Left / Right arrow |

### Player States
`running → jumping → doubleJumping → sliding → dead`

- The world auto-scrolls; arrow keys move the player and set its facing direction
- The welcome screen's dinosaur emoji is reused in-game, with animated running legs
- Sliding reduces hitbox height to duck under pterodactyls
- Double jump gives a second chance over wide hazards

### Lives & Damage
- Start at **100% health (5 lives)**, maximum **5**
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
Result screens show cumulative distance, fossil, stomp and roar points, recorded
when earned so changing level multipliers do not alter earlier rewards. Integer
display rounding is allocated across categories so they add up to the final score.

To stomp a pterodactyl, fall onto its back from above. Landing checks follow the
player and enemy between frames, including fast falls that pass through the
enemy's top in one frame. A successful stomp removes the enemy and bounces the
player before contact damage is checked; side and underside contact do not count.

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
| `spikePit` | Short ground obstacles can be jumped; long beds require the covering platform; deals damage on contact |

## Platforms

Elevated rectangular surfaces that scroll with the world. The player can jump onto them from below (one-way: land on top only). Landing on a platform resets the player's double jump.

- Spawned by `SpawnSystem` like other entities — scroll left and despawn off-screen
- Heights vary randomly from 80–320px above ground, starting at 80px
- Random climbs are capped at 80px; descents can drop up to 240px
- Height changes are at least 40px unless approaching the elevation limits
- Climbing and descending are chosen with equal probability where both are possible
- Ordinary platforms vary from 160–440px wide, with 50px gaps
- Every sixth platform is an 1800–2200px continuous bridge covering a long spike bed,
  with 180px of safe platform at either end. Even at maximum speed, the spike bed
  exceeds the distance covered by a double jump
- Long spike artwork repeats across the bed rather than stretching a single icon
- Spike beds remain until their trailing edge and artwork have scrolled off-screen
- Each bridge is followed by a 2200px platform-free gap, forcing a return to the
  floor. The next section restarts at the reachable 80px elevation
- Descending platforms have a minimum landing width based on fall time and the level's
  maximum scroll speed, so even the largest drops remain landable
- Fossils appear above platforms to reward elevated routes
- Defined via `spawnRules` in `LevelConfig` using `entityType: 'platform'`
- `crumbling` field exists on `PlatformEntity` but is not yet active

---

## Levels

| # | Name | Theme | Duration | Base Speed | Max Speed | Multiplier |
|---|---|---|---|---|---|---|
| 1 | Jurassic Jungle | Dense green forest | 90s | 260 px/s | 480 px/s | ×1.0 |
| 2 | Volcanic Badlands | Dark volcanic terrain with lava pools | 120s | 320 px/s | 560 px/s | ×1.5 |
| 3 | Meteor Impact Zone | Night sky, craters, constant barrage | 150s | 400 px/s | 700 px/s | ×2.0 |

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
