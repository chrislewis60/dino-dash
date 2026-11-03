# SPEC-001: Core gameplay

| Property | Value |
|---|---|
| Version / size | 1 / Standard behaviour slice of the reconstructed product |
| Status | Observed baseline; awaiting product approval |
| Recorded | 2026-11-03, `e29a2cf` plus pre-existing uncommitted gameplay changes |
| Decisions | [ADR-0001](../adr/0001-react-shell-and-canvas.md), [ADR-0004](../adr/0004-earned-score-ledger.md) |
| Rules | DD-DELIVERY v1, DD-02 through DD-05; DD-12 |

## Context and scope

A player controls a dinosaur in an automatically scrolling prehistoric world.
This initial slice covers movement, combat, health, pickups and points, not accounts,
saved games, leaderboards, multiplayer, sound or future biomes. Observed behaviour
below is not an approval of discrepancies in the older design.

## Requirements

| ID | Observable requirement |
|---|---|
| SPEC-001-R01 | During play, the player can jump twice before landing and can slide with a reduced hitbox. |
| SPEC-001-R02 | Horizontal input moves the player within screen bounds and changes facing; facing persists when released or both directions are held. |
| SPEC-001-R03 | A new run starts with five lives; damage removes one, grants 1500ms invincibility, and reaching zero enters game over. Eggs restore one up to five. |
| SPEC-001-R04 | Meteors, erupting vent columns, diving pterodactyls and spikes can cause contact damage; inactive hazards cannot. |
| SPEC-001-R05 | Falling onto a pterodactyl from above removes the first enemy crossed, bounces the player and scores before damage is considered. Side/underside contact is not a stomp. |
| SPEC-001-R06 | Points are recorded per category when earned, using the current level multiplier; earlier points do not change on level transition. |
| SPEC-001-R07 | Power-ups activate the currently implemented timed flags/effects, with the limitations explicitly recorded below. |
| SPEC-001-R08 | Input is edge-triggered for jumping/sliding; the implemented touch gestures are vertical swipes, not taps. |

## Acceptance criteria

### SPEC-001-AC01

Covers: SPEC-001-R01, SPEC-001-R08.
Given a living non-sliding player with two jumps, when distinct jump presses occur,
then two jumps are available; a third is unavailable until landing. A slide lasts
600ms and reduces height from 60px to 30px, preserving feet position on activation.
Jump presses during slide do not jump.

### SPEC-001-AC02

Covers: SPEC-001-R02.
Given directional input, when physics advances, then horizontal speed is 220px/s
and x is clamped between 32 and `1196 - player.width - 32`. Facing can change at
the boundary and in air; releasing or holding both directions retains facing.

### SPEC-001-AC03

Covers: SPEC-001-R03.
Given a new run, then lives are five. A damaging contact removes one life and starts
1500ms invincibility; further contact during that interval does not remove another.
An egg increases lives by one but never above five and awards no points.
At zero lives, the player is dead and the run enters game over.

### SPEC-001-AC04

Covers: SPEC-001-R04.
Given contact, then only active meteors, active vent columns, active **diving**
pterodactyls and active spikes count as hazards. Dead, shielded or roar-active
players are immune. A vent without a column and a patrolling bird do not damage.

### SPEC-001-AC05

Covers: SPEC-001-R05.
Given a falling player's bottom crosses an active bird's top, when their horizontal
bounds overlap at the interpolated impact time, then the earliest crossed bird is
removed once and vertical velocity becomes -400px/s. Fast crossings still count.
Side/underside hits and rising motion do not count. A successful stomp causes no
simultaneous damage from that bird.

### SPEC-001-AC06

Covers: SPEC-001-R06.
Given an earned reward, then add `base points * current multiplier` to its category.
Base points are 0.05 per world pixel, 50 per fossil, 200 per stomp and 150 per
meteor/bird cleared by roar. Total equals category sum. Continuing a level sequence
preserves prior points; starting a fresh run clears them.

### SPEC-001-AC07

Covers: SPEC-001-R07.
Given a pickup, then shield lasts 4000ms, sprint flag 5000ms, magnet 8000ms and roar
flag 2000ms. Shield is timed immunity, **not consumed on one hit**. Magnet attracts
fossils/eggs within 150px. Roar immediately clears active meteors and pterodactyls,
not vents or spikes. Sprint currently sets a flag used by rendering; physics and
world-speed calculation do **not** apply a speed boost.

These are observed limitations, not endorsed final mechanics; see Q-02 through Q-04.

### SPEC-001-AC08

Covers: SPEC-001-R08.
Given keyboard input, then Space/Up/W requests jump, Down/S slide, Left/A and
Right/D horizontal movement, and Escape/P pause during play. A held key does not
repeat its pressed edge. Given a touch-end displacement greater than 30px upwards
or downwards, then emit the corresponding temporary Up/Down flag; a stationary tap
currently does neither. Touch parity and lifecycle remain open under Q-01.

## Decision precedence

| Order | Condition | Outcome | AC |
|---|---|---|---|
| 1 | Valid downward crossing onto a bird | Stomp and bounce before hazard check | SPEC-001-AC05 |
| 2 | Dead, shield or roar flag active | No hazard damage | SPEC-001-AC04 |
| 3 | Damage invincibility timer positive | Advance timer, skip hazard damage | SPEC-001-AC03 |
| 4 | Eligible active hazard overlap | Lose one life | SPEC-001-AC03 |
| 5 | None of the above | No life change from hazards | SPEC-001-AC04 |

## Verification

Mappings identify existing tests, not newly executed proof. Partial coverage is
explicit; existing tests do not carry the retrospective IDs.

| AC | Evidence | Coverage / gap |
|---|---|---|
| SPEC-001-AC01 | [Systems tests](../../src/test/systems.test.ts) | “makes player jump when jumpPressed”, “enters slide state on slidePressed”; full double-jump/expiry boundary coverage Unverified |
| SPEC-001-AC02 | [Systems tests](../../src/test/systems.test.ts) | Movement, facing, screen bounds, airborne/sliding and boundary cases |
| SPEC-001-AC03 | [Engine tests](../../src/game/GameEngine.test.ts), [engine](../../src/game/GameEngine.ts) | “starts and restarts at 100% health”; egg cap, 1500ms boundaries and zero-life path need focused proof |
| SPEC-001-AC04 | [Systems tests](../../src/test/systems.test.ts), [collision implementation](../../src/game/systems/index.ts) | Meteor and shield tests; full hazard/phase matrix Unverified |
| SPEC-001-AC05 | [Systems tests](../../src/test/systems.test.ts), [engine tests](../../src/game/GameEngine.test.ts) | Fast and moving crossings, first enemy, stomp-before-damage and no duplicate score |
| SPEC-001-AC06 | [Engine tests](../../src/game/GameEngine.test.ts) | “records actual category points with multipliers, preserving totals across levels and resets” |
| SPEC-001-AC07 | [Physics/collision](../../src/game/systems/index.ts), [engine](../../src/game/GameEngine.ts) | Source-observed timers/effects; dedicated expiry/magnet/roar matrix tests Unverified |
| SPEC-001-AC08 | [InputSystem](../../src/game/systems/InputSystem.ts), [engine tests](../../src/game/GameEngine.test.ts) | Keyboard pause integration present; touch and full key-edge tests Unverified |

## Risks, non-functional needs and questions

No product AI, authorisation endpoint or external dependency is introduced.
Input accessibility/device compatibility needs manual proof; no target device matrix
or measured frame-rate is agreed. Random generation does not establish replay determinism.

See [Q-01 through Q-04 and Q-06](../registers/open-questions.md) for intent conflicts.
All eight criteria are source-observed; incomplete test evidence and product approval
remain open. Definition of Ready: scope/IDs present, negative cases present,
precedence present, test mappings present but partial; historical failing tests absent.
