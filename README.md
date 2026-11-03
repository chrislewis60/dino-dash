# Dino Dash: Extinction Run

Dino Dash is a fast-paced, auto-scrolling platform runner set at the end of the
Cretaceous period. Guide a dinosaur through prehistoric environments, avoid
extinction-level hazards, and collect fossils and eggs to survive.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Install and run

```bash
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Jump | Space or Up arrow | Tap |
| Double jump | Space or Up arrow again while airborne | Tap again while airborne |
| Slide | Down arrow | Swipe down |
| Move / face left or right | Left / Right arrow | — |
| Pause | Escape | Pause control in the game UI |

The dinosaur runs automatically from left to right. Use the double jump to
clear wider hazards and slide beneath pterodactyls flying at head height.

## Gameplay

Choose **Start Game** to begin at Jurassic Jungle, **Level 2** to start a fresh
game in Volcanic Badlands, or **Level 3** to jump straight to Meteor Impact Zone.
The welcome screen shows a faded, blurred Jurassic Jungle background behind the menu.
Volcanic Badlands uses the supplied panoramic volcanic background, with the same
cover scaling and slow horizontal pan as Jurassic Jungle.
Meteor Impact Zone uses the newly supplied sunset volcanic panorama with the same
scaling and pan. Finishing it shows **All Levels Complete!**, your score breakdown
and a Menu button instead of a nonexistent next level.

Level 2 has more frequent obstacles than before. Level 3 adds roughly 15% more
timed hazards than level 2, but spawns meteors and birds individually rather than
in double waves. Its speed rises from 350 to a capped 600px/s (level 2: 320-560px/s).
Eggs, power-ups and covered spike bridges remain available; random hazards can
still overlap, so difficulty remains subject to play feedback.

- Start at 100% health (5 lives), with a maximum of 5.
- Collect eggs to restore one life, up to the maximum.
- Collect fossils for 50 points each.
- Stomp pterodactyls by jumping above them and landing on their backs while falling.
  Successful stomps bounce you upwards and award 200 points before the level multiplier.
  Landing detection follows movement between frames; side and underside hits are not stomps.
- Use power-ups such as shields, sprint boosts, magnets, and roars.
- Each level increases speed over time and applies its own score multiplier.
- Results show distance points, fossil points, stomp bonuses and roar bonuses,
  accumulated across levels using the multiplier in effect when each reward was earned.
  The displayed categories add up to the final score; eggs restore health, not points.
- Platforms vary in width and height: climbs are capped at 80px, whilst drops can reach
  240px with wider landing surfaces for safe descents. Fossils reward elevated routes.
- Long spike beds always have a continuous platform overhead. After each of these
  bridges, a long platform-free gap forces a return to the floor before a low platform
  starts the next climbing section.
- Jurassic Jungle lasts 90 seconds, Volcanic Badlands 120 seconds, and Meteor Impact Zone 150 seconds.
- The player uses the welcome screen's dinosaur emoji, with animated running legs and
  left/right facing controlled by the arrow keys (retained when released).

The current level themes and detailed mechanics are documented in
[GAME_DESIGN.md](GAME_DESIGN.md).

## Item Artwork

Fossils, eggs, all four power-ups and all four hazards use locally bundled SVGs from
[Game-icons.net](https://game-icons.net/), shared by the canvas pickups, menu key
and relevant HUD/result counters. Artwork is recoloured, with transparent
backgrounds and no decorative pickup boxes or borders; hitboxes, rewards and
hazard movement are unchanged. Meteor landing
shadows and lava warning/eruption cues are retained.
In-level artwork is rendered at 150% of its original size for readability,
extending beyond the unchanged collision bounds. Flying items remain centred,
while vents and spikes remain anchored at their bases. Menu and HUD icon sizes
are unchanged.

Icons made by **Lorc**, licensed under
[Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/):
[ammonite](https://game-icons.net/1x1/lorc/ammonite.html),
[dinosaur egg](https://game-icons.net/1x1/lorc/dinosaur-egg.html),
[edged shield](https://game-icons.net/1x1/lorc/edged-shield.html),
[power lightning](https://game-icons.net/1x1/lorc/power-lightning.html),
[magnet](https://game-icons.net/1x1/lorc/magnet.html) and
[dinosaur rex](https://game-icons.net/1x1/lorc/dinosaur-rex.html).
Hazard icons: **Lorc**'s
[burning meteor](https://game-icons.net/1x1/lorc/burning-meteor.html) and
[spiked fence](https://game-icons.net/1x1/lorc/spiked-fence.html), and **Delapouite**'s
[smoking volcano](https://game-icons.net/1x1/delapouite/smoking-volcano.html) and
[pterodactylus](https://game-icons.net/1x1/delapouite/pterodactylus.html), also CC BY 3.0.
Assets live in `public/icons/`; their paths and colours are defined in
`src/config/assets.ts`. Artist and licence credits are also shown in the main menu.

## Development Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
npm test          # Run the test suite once
npm run test:watch # Run Vitest in watch mode
```

## Architecture

The game loop is built around a canvas renderer and a small set of focused
systems:

- `GameEngine` coordinates the main loop and game systems.
- `StateMachine` manages menu, playing, paused, level complete, and game over states.
- `InputSystem` handles keyboard and touch input.
- `CanvasRenderer` draws the game world and entities.
- `GameContext` bridges engine statistics and React UI state.
- React components provide the HUD, menus, and game overlays.

Game content is organised in `src/game/levels/`, shared domain types live in
`src/types/`, and reusable canvas UI components are in `src/canvas/components/`.

## Spec-driven AI Development

The repository includes a local Copilot Playbook with onboarding, specifications,
Architecture Decision Records (ADRs), acceptance evidence and explicit human gates.
Start with the [documentation index](docs/README.md) and
[how the workflow works](docs/guides/spec-driven-development.md).

Use `/evolves` to refresh project readiness and `/deliver` for a new change.
The initial specs/ADRs were reconstructed on 2026-11-03 from the current working
game, including uncommitted changes. They are labelled observed/inferred and await
human review; they do not claim to be the original design history.
Known design/code disagreements are recorded as
[open questions](docs/registers/open-questions.md), not silently fixed.

Validate the documentation contracts with `npm test -- tests/deliveryWorkflow.test.ts`.

## Project Status

Dino Dash is under active development. The design document describes planned
content as well as mechanics currently represented in the codebase, so some
levels and systems may still be in progress.