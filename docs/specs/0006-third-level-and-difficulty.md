# SPEC-006: Third-level artwork, shortcuts and difficulty

Version: 1
Size: Standard; changed player behaviour across level configuration and menus,
without an architectural or dependency change.
Status: Proposed; Waiting for human G1
Baseline: clean `3f3dcb3881d4f60d3e3a10b583dc1f52b99df324`, 2026-11-03
Rules: DD-DELIVERY / 1, DD-01 through DD-16

## Context and scope

Players want the supplied third background, direct access to level 3 and a
noticeable but manageable obstacle progression. Level 3 already exists as
Meteor Impact Zone, with primitive scenery and harsh double waves.
Reuse that level rather than adding a fourth or rewriting spawning.

Affected surfaces: asset metadata, typed level data, homepage, completion UI,
engine final-level guard, tests and player documentation. Rendering, input,
collision bounds, platform geometry, level 1 and scoring remain unchanged.

Alternative rejected: increasing speed and wave quantities together makes the
requested obstacle increase harder to read and compounds difficulty. Instead,
increase frequency moderately and retain single-hazard waves. No ADR required.

## Requirements

| ID | Observable requirement |
|---|---|
| SPEC-006-R01 | Level 3 uses the newly supplied JPEG panorama and existing cover/pan rendering. |
| SPEC-006-R02 | Level 2 has more obstacles; level 3 has moderately more again without extreme speed or double waves. |
| SPEC-006-R03 | Homepage Level 3 starts a fresh run directly at level 3; existing starts and progression remain functional. |
| SPEC-006-R04 | Finishing level 3 retains results, says All Levels Complete!, offers Menu and never offers a nonexistent next level. |

### Proposed balance targets

Product owner to validate through play; numeric settings are implementation
proposals, not an assertion that subjective difficulty is certified.

| Setting | Level 2 | Level 3 |
|---|---|---|
| Meteor interval / variance | 2400 / 600ms | 2100 / 500ms |
| Vent interval / variance | 3000 / 700ms | 2600 / 600ms |
| Bird interval / variance | 4200 / 900ms | 3600 / 800ms |
| Spike interval / variance | 4800 / 1000ms | 4200 / 900ms |
| Hazard wave quantities | 1 each | 1 each |
| Base / maximum speed | 320 / 560px/s | 350 / 600px/s |
| Speed ramp | 10px/s per second | 10px/s per second |

Retain durations 90/120/150 seconds, eggs/power-ups, platform safety geometry,
five starting lives and damage immunity. Level 2's mean timed-hazard rate increases
about 17% over its previous configuration; level 3 adds about 15% over level 2.
Random overlap remains possible; no guarantee that every random layout is solvable.

## Acceptance criteria

### SPEC-006-AC01

Covers: SPEC-006-R01.
Given level 3, when rendered, then its background is the supplied
`e457c491-6959-4161-9888-58ac73e45a92.jpeg`, using scroll factor 0.108 and
hidden synthetic ground, consistent with levels 1 and 2. The asset loads locally.

### SPEC-006-AC02

Covers: SPEC-006-R02.
Given the three levels, then each hazard type has a shorter mean interval in
each later level, all waves have quantity one and minimum random intervals are
at least 1500ms. Level 3's combined mean timed-hazard rate is 10-25% above level 2.
Given 60 seconds with midpoint randomness, then actual spawned meteor, vent,
bird and standalone spike counts increase at each level.
Speed/duration/resource and platform rules match the table and retained values.

### SPEC-006-AC03

Covers: SPEC-006-R03.
Given the homepage, when activating Level 3 by mouse or keyboard, then startGame(3)
is called. A fresh engine run starts playing with level 3 metadata, five lives,
zero score/distance/collectibles and zero progress. Invalid IDs still throw.
Level 2 completion still advances to level 3 preserving cumulative statistics.

### SPEC-006-AC04

Covers: SPEC-006-R04.
Given final-level completion, then retain capped progress and cumulative results,
show All Levels Complete! and Menu but no Next Level. A direct engine continuation
request at the final level remains at its valid completion state without warning
or changing statistics. Menu permits a fresh run. Earlier results retain Next Level.
The user explicitly selected this completion behaviour on 2026-11-03; that
scope answer is not gate approval or a confirmed authority assignment.

## Verification and risks

| AC | Evidence plan |
|---|---|
| SPEC-006-AC01 | Level configuration tests and local browser asset/render check |
| SPEC-006-AC02 | Configuration and fixed-step spawning tests; existing platform simulation; browser play sample |
| SPEC-006-AC03 | MainMenu and GameEngine tests; browser shortcut and keyboard check |
| SPEC-006-AC04 | ScoreBreakdown and GameEngine tests; results UI checks |

Security: local static content only; no new dependencies, network destinations,
user input or trust boundary. Accessibility: native labelled buttons, existing
wrapping layout; keyboard/narrow viewport walkthrough required. Screen-reader
certification and real-device difficulty validation are Unverified.

Definition of Ready: context, scope, ACs, risks and mappings Present; ADR not
applicable; failing tests to be recorded in the run; named authority and G0/G1
Missing. Numeric balance approval and supplied artwork distribution rights remain
product/project-owner decisions. See readiness version 1 and the run's blockers.
