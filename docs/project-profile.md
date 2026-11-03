# Dino Dash project profile

| Property | Value |
|---|---|
| Profile version | 1 |
| Assessed | 2026-11-03 |
| Status | Evidenced draft; pending G0 |
| Baseline | `e29a2cf` plus existing dirty working tree, selected by the user |
| Purpose | A browser-based prehistoric auto-scrolling runner; learn and extend the game safely |
| Intended outcomes | Playable keyboard journeys, understandable mechanics, traceable future changes |
| Authority | Named product, technical, quality and release roles Unknown; do not infer from Git author |
| Context | [Architecture](architecture/overview.md), [baseline specs](README.md), [open questions](registers/open-questions.md) |

## Stack and boundaries

The initial dirty baseline was subsequently committed by concurrent work as
`cdbfe4a`. During reconstruction HEAD advanced to `c5cf14c` (spike-bed trailing-edge
retention); a separate menu-background edit remained uncommitted. These follow-on
observations are noted in SPEC-002/SPEC-003. The initial observation is not being
silently presented as a frozen release candidate.

Evidence: [package manifest](../package.json), [Vite configuration](../vite.config.ts),
[application entry](../src/App.tsx).

- React `^19.1.0`, TypeScript `~5.8.3`, Vite `^6.3.5`, React SWC plugin.
  These are manifest ranges, not a claim about latest upstream releases.
- Browser canvas 2D simulation; React DOM UI and plain CSS. No Tailwind, Radix,
  React Router or configured React Compiler is evidenced in this application.
- No application backend, account/SSO, database, external AI inference or network
  API integration is evidenced. AI **delivery tools** do not make this an AI product.
- Random spawning is not a seeded/replayable contract. No measured frame-rate or
  browser/device support target has been agreed.
- Assets are local; icon attribution remains in the menu and
  [README](../README.md). Background provenance/licensing needs owner confirmation.

Some inherited generic Copilot examples mention tools and services absent from this
project. Do not install them or invent imports to satisfy those examples.

## Commands

Run at repository root; the current environment uses Windows PowerShell.
These commands are sourced from the manifest, not all executed evidence.

| Capability | Invocation |
|---|---|
| Development server | `npm run dev` |
| Type-check and production bundle | `npm run build` |
| ESLint | `npm run lint` |
| Focused tests | `npm test -- <test-path> [other-test-path]` |
| All tests | `npm test` |
| Coverage when needed | `npm run test:coverage -- <test-path>` |
| Documentation adoption contracts | `npm test -- tests/deliveryWorkflow.test.ts` |
| Preview built application | `npm run preview` |

Prefer available VS Code test/task integration. `npm test` already uses `vitest run`;
no extra `--run` is required. There is no `format` script in the manifest.
Install dependencies only on a missing-dependency failure or an authorised manifest change.

## Toolkit and applicability

| Capability | Current evidence / limit |
|---|---|
| Source inspection | Local repository inspected; dirty changes preserved |
| Unit/integration tests | Vitest + jsdom + Testing Library configured |
| Browser | Shared local Vite page inspected at onboarding; no device certification |
| Security | Scope review required; no verified mandatory scanner, remote policy or scan result |
| Accessibility | Semantic HUD controls evidenced; full keyboard/device/screen-reader review Unverified |
| Product AI evaluation | Not applicable: no in-product AI behaviour evidenced |
| Toolkit research | Initial inventory only; new external capabilities/research and any setup require explicit scoped authorisation |
| Remote controls | CI, branch protection, release enforcement and hosting not verified |

Use official vendor sources if researching a new capability, record date/version,
applicability, alternatives, approved invocation and actual per-machine verification.
Do not install Snyk, SonarQube or any other product simply because a skill mentions checks.

## Effective Copilot mapping

| Purpose | Local entry point |
|---|---|
| New project onboarding | `/initiate` -> Onboarding |
| Existing project / readiness refresh | `/evolves` -> Onboarding |
| Deliver one change | `/deliver` -> Playbook |
| Procedures | All 17 local skill names match their folders under `.github/skills/` |

Workspace names were checked before adding files. Visible user skill folders were
absent and the inspected VS Code user prompt directory had no matching names.
Other configured prompt locations, synced extensions, hidden host scopes and live
discovery remain Unverified. Check the command picker; resolve collisions by renaming
file/frontmatter names and all references together, never by overwriting another asset.

## Delivery and release

Evidence lives in versioned `docs/delivery/<run-id>/` Markdown, with specs and ADRs
alongside the change. Approver access, retention and handling of large browser
artefacts need owner decisions; do not embed personal data or secrets.

Production hosting, target environments, named release owner, deployment procedure
and tested rollback are **Unknown**. Vite preview is not a production release method.
CI is optional for adoption; its absence is not evidence that local checks passed.
No release is authorised by this profile.
