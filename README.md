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
| Pause | Escape | Pause control in the game UI |

The dinosaur runs automatically from left to right. Use the double jump to
clear wider hazards and slide beneath pterodactyls flying at head height.

## Gameplay

- Start with 3 lives, with a maximum of 5.
- Collect eggs to restore one life, up to the maximum.
- Collect fossils for 50 points each.
- Stomp enemies for 200 points.
- Use power-ups such as shields, sprint boosts, magnets, and roars.
- Each level increases speed over time and applies its own score multiplier.

The current level themes and detailed mechanics are documented in
[GAME_DESIGN.md](GAME_DESIGN.md).

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

## Project Status

Dino Dash is under active development. The design document describes planned
content as well as mechanics currently represented in the codebase, so some
levels and systems may still be in progress.