# SPEC-003: Menus, HUD, results and artwork

| Property | Value |
|---|---|
| Version / size | 1 / Standard behaviour slice |
| Status | Observed baseline; awaiting product approval |
| Recorded | 2026-11-03, `e29a2cf` plus pre-existing dirty changes |
| Decision | [ADR-0001](../adr/0001-react-shell-and-canvas.md) |
| Rules | DD-DELIVERY v1, DD-02 through DD-05; DD-12 through DD-14 |

## Context and scope

Players need to understand pickups/hazards before starting, monitor survival and
progress, and understand their score afterwards. This slice includes the current
React shell and canvas assets, not a complete accessible alternative to canvas,
new artwork commissioning, localisation infrastructure or screen-reader certification.

## Requirements

| ID | Observable requirement |
|---|---|
| SPEC-003-R01 | The menu explains collectibles, hazards and keyboard controls and starts level 1 or a fresh level 2. |
| SPEC-003-R02 | During play, the HUD shows score, distance, current level, lives, fossils, health/progress and an accessible pause button. |
| SPEC-003-R03 | Both result overlays present cumulative earned categories whose displayed integer sum equals the displayed total. |
| SPEC-003-R04 | Artwork is shared consistently across canvas and UI without changing gameplay hitboxes. |
| SPEC-003-R05 | Local backgrounds use cover scaling/panning, and failed icon loading is distinguishable from pending loading. |

## Acceptance criteria

### SPEC-003-AC01

Covers: SPEC-003-R01.
Given the menu, then Start Game and Level 2 start fresh runs at the corresponding
level. Collect, Avoid and Controls describe all two collectible types, four
power-ups and four hazards; source artist/licence links are visible.
Do not treat the sprint/shield/roar descriptions as resolution of their known
mechanical discrepancies.

Concurrent uncommitted UI work observed at final validation adds a decorative
Jurassic Jungle image behind the menu, blurred/faded with empty alt text and
`aria-hidden`. This is a follow-on source observation, not an approved change
made by this documentation task.

### SPEC-003-AC02

Covers: SPEC-003-R02.
Given playing state, then show floored score, distance, level name, life icons,
fossil count and Pause. Health is rounded `clamp(lives / 5 * 100, 0, 100)`;
level progress is floored `clamp(elapsed / duration * 100, 0, 100)`.
Both meters have labels and progress semantics; decorative icons have empty alt text.
HUD is hidden outside playing. Full device/assistive-technology usability is Unverified.

### SPEC-003-AC03

Covers: SPEC-003-R03.
Given levelComplete or gameOver, then render one score summary with distance,
fossil count, distance points, fossil points, stomp bonus, roar bonus and total.
Category display uses cumulative flooring in that order; displayed categories sum
to `floor(score)`, including fractional carry. Do not recalculate points from
counts using the final level's multiplier. Show no duplicate “Enemies Stomped” row.
The relevant menu/continue buttons invoke their context actions.

Example: categories `10.75, 20.75, 30.75, 40.75` display `10, 21, 31, 41`, total 103.

### SPEC-003-AC04

Covers: SPEC-003-R04.
Given active entities, then reuse the ten configured transparent local SVG icons,
colours and associated UI artwork. In-world icons draw at 150% size without
altering collision bounds; vents/spikes remain base-anchored and other items
centred. Long spike beds tile artwork instead of stretching it. Meteor shadows
and vent warning/eruption cues remain.

The dinosaur uses the menu's emoji, cached for drawing, mirrored for right facing,
with running legs in opposite phases and a 320ms stride. Inactive/collected items
are not drawn.

### SPEC-003-AC05

Covers: SPEC-003-R05.
Given Jungle/Badlands, then use their bundled panoramic background, cover the
logical canvas, centre vertically and pan horizontally at factor 0.108 without
a ground overlay. Level 3 uses its configured shape layers.
If a background is not loaded, render configured sky/layers. If an icon fails,
record its failure and log its source; pending and failed states differ.

## Verification

| AC | Evidence | Coverage / gap |
|---|---|---|
| SPEC-003-AC01 | [Menu tests](../../src/components/MainMenu.test.tsx), [context tests](../../src/context/GameContext.test.tsx) | Menu content/actions and fresh selected-level integration |
| SPEC-003-AC02 | [HUD tests](../../src/components/HUD.test.tsx), [HUD](../../src/components/HUD.tsx) | Percent boundaries, labels/icons and pause action; hidden-state assertion and screen-reader/device walkthrough Unverified |
| SPEC-003-AC03 | [Score breakdown tests](../../src/components/ScoreBreakdown.test.tsx), [result artwork tests](../../src/components/ResultArtwork.test.tsx) | Both overlays, cumulative fractional allocation, zero scores, buttons and visibility |
| SPEC-003-AC04 | [Renderer tests](../../src/canvas/CanvasRenderer.test.ts), [asset config](../../src/config/assets.ts) | Ten SVGs, colours/transparency, scale/hitboxes, tiling, player facing/stride and hazard cues |
| SPEC-003-AC05 | [Renderer tests](../../src/canvas/CanvasRenderer.test.ts), [renderer](../../src/canvas/CanvasRenderer.ts) | Badlands cover/no-ground, caching and icon failure reporting; complete background/fallback matrix Unverified |

## Risks and open questions

Icon credits are present in [README](../../README.md) and menu; they are not
permission to remove attribution or apply the same licence to background images.
Canvas/emoji appearance varies by platform. Accessibility conformance, frame-rate,
responsive device targets and background rights need owner decisions; see
[Q-07 and Q-08](../registers/open-questions.md).

Definition of Ready: observable criteria, negative loading case and mappings present;
manual accessibility/device evidence remains Unverified. No new browser walkthrough
or test execution is implied by these source mappings.
