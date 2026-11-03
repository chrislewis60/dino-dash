# SPEC-002: Levels and platform routes

| Property | Value |
|---|---|
| Version / size | 1 / Standard behaviour slice |
| Status | Observed baseline; awaiting product approval |
| Recorded | 2026-11-03, `e29a2cf` plus pre-existing dirty changes |
| Decisions | [ADR-0002](../adr/0002-fixed-timestep.md), [ADR-0003](../adr/0003-typed-level-configuration.md) |
| Rules | DD-DELIVERY v1, DD-02 through DD-05; DD-12 |

## Context and scope

Three increasingly fast levels combine ground hazards and elevated collectible
routes. This slice covers existing level configuration, pause/progress and route
geometry. Ice Age Tundra, Asteroid Belt, Underground Caves, crumbling platforms,
seeded replays and a victory screen are not implemented scope.

## Requirements

| ID | Observable requirement |
|---|---|
| SPEC-002-R01 | Existing levels use the durations, speed ranges, ramps and multipliers in the table below. |
| SPEC-002-R02 | Fresh starts reset run statistics; continuation preserves run totals/lives while resetting entities, player state, timers, speed and route generation. |
| SPEC-002-R03 | Pausing freezes simulation and progress; resuming through the UI preserves the run. |
| SPEC-002-R04 | Ordinary one-way platforms form bounded climbs/drops with safe landing widths and collectible incentives. |
| SPEC-002-R05 | Every sixth platform covers a long spike bed and is followed by a floor-return gap. |
| SPEC-002-R06 | The simulated world advances at fixed 60Hz increments, caps long frame contributions, and uses level-driven spawning. |

| Level | Duration | Base/max px/s | Ramp px/s per second | Multiplier |
|---|---|---|---|---|
| Jurassic Jungle | 90s | 260 / 480 | 8 | 1 |
| Volcanic Badlands | 120s | 320 / 560 | 10 | 1.5 |
| Meteor Impact Zone | 150s | 400 / 700 | 14 | 2 |

## Acceptance criteria

### SPEC-002-AC01

Covers: SPEC-002-R01.
Given each level, then speed starts at its base and ramps without exceeding its
maximum. When elapsed time reaches its duration, then enter levelComplete,
publish capped progress and stop simulation. Level durations and multipliers match
the table, rather than older proposed lengths.

### SPEC-002-AC02

Covers: SPEC-002-R02.
Given Start Game or the Level 2 shortcut, then start a fresh run at the selected
level with five lives, zero totals and zero elapsed time. An unknown starting
level throws RangeError. Continuing from level 1 or 2 resets the next level's
progress/entities/player/route but preserves cumulative score, distance and lives.

The final-level continuation currently requests an invalid state transition.
**No successful completion/victory contract is claimed**; see Q-05.

### SPEC-002-AC03

Covers: SPEC-002-R03.
Given active play, when paused, then pending updates do not advance progress or
lives; when resumed using the pause UI, then continue the same run. Keyboard pause
publishes state immediately. Keyboard resume is not guaranteed because the paused
engine loop does not poll input; see Q-06.

### SPEC-002-AC04

Covers: SPEC-002-R04.
Given ordinary route generation, then the first platform is 80px above ground,
elevations remain 80-320px, width is 160-440px, height 18px and ordinary gap is 50px.
Climbs are at most 80px, drops at most 240px and changes at least 40px unless
limited by elevation bounds. Where both directions are possible, climb/drop
selection uses equal probability. Each platform has a fossil 12px above its top.

For a drop, minimum landing width includes
`level.maxSpeedPx * sqrt(2 * drop / 1800) + 44`.
The player lands only while descending across the top and regains two jumps.
A partly offscreen platform remains until its right edge leaves the canvas.

### SPEC-002-AC05

Covers: SPEC-002-R05.
Given a route section, then its sixth platform is one continuous 1800-2200px bridge.
Its ground spike bed starts/ends 180px inside the bridge boundaries. The subsequent
platform gap is 2200px and the next section restarts at 80px elevation.
At the fastest configured world speed, including rightward player motion, the
minimum bed exceeds maximum double-jump travel and the floor gap exceeds airborne
travel from the highest platform. Check this by simulation, not visual impression.

Spawn timing can quantise gaps by at most one fixed-step scroll increment.

A follow-on observation during reconstruction: commit `c5cf14c` keeps spike beds
until `x + width <= -80`, allowing trailing artwork to leave the screen, and
removes inactive beds immediately. This supersedes the earlier left-edge-only
pruning observed at the start; it was concurrent gameplay work, not implemented
by the documentation task.

### SPEC-002-AC06

Covers: SPEC-002-R06.
Given animation frames, then simulation consumes `1000 / 60`ms steps, with each
frame contribution capped at 200ms. Each level supplies entity type, interval,
variance and quantity; ordinary entities use those timers. Platforms switch to
distance-based spacing after the initial timed spawn so acceleration preserves
the configured gaps.

## Verification

| AC | Evidence | Coverage / gap |
|---|---|---|
| SPEC-002-AC01 | [Levels](../../src/game/levels/index.ts), [engine tests](../../src/game/GameEngine.test.ts), [systems tests](../../src/test/systems.test.ts) | Duration and completion tests; exact ramp/cap boundary matrix Unverified |
| SPEC-002-AC02 | [Engine tests](../../src/game/GameEngine.test.ts), [context tests](../../src/context/GameContext.test.tsx) | Fresh Level 2, normal restart, next-level reset; invalid ID and final-level path Unverified |
| SPEC-002-AC03 | [Engine tests](../../src/game/GameEngine.test.ts) | Pause/resume persistence and immediate keyboard pause |
| SPEC-002-AC04 | [Systems tests](../../src/test/systems.test.ts), [utility tests](../../src/test/utils.test.ts) | Fossils, heights, maximum drops/landing widths across levels and partial-left-edge retention; probability distribution not statistically certified |
| SPEC-002-AC05 | [Systems tests](../../src/test/systems.test.ts), [engine tests](../../src/game/GameEngine.test.ts) | “alternates covered spikes and floor gaps” at max speed/acceleration and “makes spike beds and floor gaps longer than the maximum airborne travel”; concurrent engine tests cover trailing-artwork retention/inactive removal |
| SPEC-002-AC06 | [Engine](../../src/game/GameEngine.ts), [systems](../../src/game/systems/index.ts), [systems tests](../../src/test/systems.test.ts) | Fixed-step/cap source evidence; distance-spacing tests; isolated long-frame boundary test Unverified |

## Non-functional needs and questions

No measured 60fps rendering guarantee follows from a 60Hz simulation.
Per-device performance targets are owner to set, not a release claim.
Random route generation is tested with controlled random inputs, not a seeded
production replay system. See [Q-05 and Q-06](../registers/open-questions.md).

Definition of Ready: scope, exact geometry and mappings present; final-level
intent and several boundary tests remain Unverified. No historical red/green
acceptance cycle is asserted.
