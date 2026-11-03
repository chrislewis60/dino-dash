# SPEC-005: Shared file-backed leaderboard

Version: 1
Recorded: 2026-11-03
Size: Significant - introduces a backend, persistent filesystem and browser/server trust boundary.
Status: Draft for review; no implementation or acceptance tests authorised.
Baseline: `3f3dcb3881d4f60d3e3a10b583dc1f52b99df324`; clean worktree before this documentation.
Baseline caveat: concurrent work subsequently changed gameplay/results. Following
explicit coordination, SPEC-005 is reserved for this leaderboard and SPEC-006 for
the level change. The inspected baseline is preserved; revalidation against the
combined candidate is required.
ADR: [ADR-0006 v1](../adr/0006-shared-file-leaderboard.md), Proposed.
Run: [Understand-only run v1](../delivery/2026-11-03-shared-file-leaderboard/run.md).
Rules: DD-DELIVERY / 1 (proposed), DD-01 through DD-07, DD-10 through DD-15.

## Context and inspected evidence

Players want to compare completed runs on different devices. The initially chosen
device-local file design was explicitly superseded during clarification by a
server-owned shared file. Local file pickers and reconnect-on-reload are no longer
requirements. Other agreed gameplay, naming, ranking and viewing choices remain.

| Surface inspected | Current fact / proposed impact |
|---|---|
| [Engine](../../src/game/GameEngine.ts), [scoring baseline](0001-core-gameplay.md), [earned-score ADR](../adr/0004-earned-score-ledger.md) | Engine accumulates earned distance/fossil/stomp/roar points under the multiplier active when earned. Preserve this ledger; do not reconstruct rewards from counts. |
| [ScoreBreakdown](../../src/components/ScoreBreakdown.tsx), [existing tests](../../src/components/ScoreBreakdown.test.tsx) | Results display `Math.floor(stats.score)`. Use that same integer for submission and ranking. Category display rounding is not another leaderboard score formula. |
| [GameOver](../../src/components/GameOver.tsx), [LevelComplete](../../src/components/LevelComplete.tsx) | Death shows final score; level completion currently offers Next Level and Menu. New terminal completion needs distinct final-result treatment. |
| [StateMachine](../../src/game/StateMachine.ts), [levels baseline](0002-levels-and-platforms.md) | Final-level continuation requests a rejected `levelComplete -> gameOver` transition. Include only the correction needed to expose successful terminal results, without requiring an extra Next Level click or incrementing beyond the final level. |
| [GameContext](../../src/context/GameContext.tsx), [App](../../src/App.tsx) | Context bridges engine snapshots/state to React; returning to menu clears stats. Capture final run identity, eligibility and score before this reset. Keep network/file work out of simulation updates. |
| [MainMenu](../../src/components/MainMenu.tsx) | Start Game begins at level 1; Level 2 shortcut starts a fresh run. Preserve shortcut gameplay but exclude it from submission. |
| [Manifest](../../package.json), [Vite config](../../vite.config.ts), [architecture](../architecture/overview.md) | Browser React/TypeScript/Vite application, no application backend or persistence. Vite development/preview servers are not a production persistence service. |
| [Engine tests](../../src/game/GameEngine.test.ts), [context tests](../../src/context/GameContext.test.tsx), [result artwork tests](../../src/components/ResultArtwork.test.tsx) | Existing regression surfaces inspected, not executed as feature evidence. New leaderboard tests deferred by user request. |

A browser cannot silently write a project/server text file. Static assets are not
a writable data store. A backend must own the file on persistent writable storage.
Ephemeral serverless disks and independent replica disks do not meet this contract.
No localStorage, IndexedDB, cookies or download is a substitute for the requested
durable server file.

## Agreed scope and limitations

One shared, casual, unauthenticated board. Browser score submissions are untrusted:
validation cannot prove a score was earned or a name belongs to a person. The user
explicitly selected this limitation for the draft, not formal release risk approval.
Names and retained scores are visible to everyone who can access the board.

In scope: eligibility and immutable final-score capture, optional submission,
shared read/refresh UI, strict validation, idempotency, top-10 ranking, one-writer
file persistence and explicit failures. Narrow successful-run result wiring is
included because it is necessary for the agreed qualification rule.

Explicitly out of scope:

- Accounts, identity verification, name ownership, competitive anti-cheat or
  server-authoritative gameplay/replay and a replacement score calculation.
- Multiplayer gameplay, seasons, per-player best-only rules, tied-rank expansion,
  live push/polling, pagination and historical-score browsing.
- In-game editing, deletion, moderation or reset controls; an operator reset/restore
  procedure remains a prerequisite, not an implemented administration feature.
- Offline submission queues, recovery of unsaved runs after navigation/reload,
  multi-instance/multi-process writers, external file editing while running.
- Backend implementation, dependency installation, infrastructure provisioning,
  authentication setup, deployment, release, feature tests or gameplay remediation
  unrelated to terminal-result handling in this documentation-only task.

## Requirements

| ID | Observable requirement |
|---|---|
| SPEC-005-R01 | Only a fresh run starting at level 1 and ending in death or completion of the last configured level is eligible; preserve existing scoring and submit the displayed integer final score. |
| SPEC-005-R02 | Offer optional explicit Save score on terminal results; freeze one run identity and score, and preserve the existing return-to-menu journey. |
| SPEC-005-R03 | Require and validate a trimmed 1-20 character ASCII player name; allow multiple genuine runs using the same name and render names as plain text. |
| SPEC-005-R04 | Persist each run ID at most once using durable submission receipts; retries are idempotent and conflicting reuse is rejected. |
| SPEC-005-R05 | Retain/display the top 10 by descending integer score, equal scores in earlier server-commit order, with sequential positions. |
| SPEC-005-R06 | Provide the shared board from the main menu and final results; fetch on opening and manual Refresh, with explicit loading, empty and unavailable states. |
| SPEC-005-R07 | Persist one versioned UTF-8 JSON text file in a configured server data directory outside public assets; use one backend writer, never browser-storage substitution. |
| SPEC-005-R08 | Initialise only an absent file in an existing writable directory; preserve malformed/unreadable/unsupported files, expose failures and never claim an uncommitted save succeeded. |
| SPEC-005-R09 | Serialise the complete update transaction and atomically replace the file; concurrent clients cannot lose committed scores or observe partial JSON. |
| SPEC-005-R10 | Validate untrusted requests and file contents, expose only public top-10 data, and provide keyboard-accessible labelled UI with announced status/errors. |

## Behaviour and data contract

### Eligibility and submission

A run identifier is generated once per fresh browser run, not once per render,
level transition or save attempt. Proposed representation: a canonical UUID v4.
Starting at level 1 is recorded at run start, not inferred from the final level.
On death or last-level completion, stop simulation and freeze `Math.floor(stats.score)`.
Death/completion races create one terminal result, never two submissions.
Intermediate completions continue normally; leaving through Menu is abandonment.
Exclusion of shortcut/abandoned runs is enforced by the ordinary client journey,
not claimed as tamper-proof server validation.

On eligible results, Save score validates the name then sends the frozen run ID,
name and score. Disable repeated submission while pending. A committed result
locks the submitted name and prevents further saves of that run. Invalid input
does not write anything. Cancel/leave without saving is allowed.
Returning to menu or reloading discards an unsaved result; disclose this in the UI.
An in-flight request may still commit after navigation or a connection failure;
client cancellation cannot revoke a committed server write.

### Name and score boundaries

Trim leading/trailing whitespace first, then require 1-20 characters from
`A-Z`, `a-z`, `0-9`, space, hyphen and underscore. Preserve case and internal
spaces; whitespace-only and accented/non-Latin names are invalid in v1.
Names are not unique; `Dino` and `dino` may each have many independent runs.
Display helper text before submission; do not silently truncate or strip characters.

The score must be a non-negative JavaScript safe integer, including zero and
excluding fractions, numeric strings, negative values, NaN and infinity.
The maximum accepted representation is `Number.MAX_SAFE_INTEGER`; this is an
encoding boundary, not a credible gameplay maximum or anti-cheat check.
Client and server apply the same payload rules; server rejection causes no mutation.

### Ranking, receipts and retries

Rank stored entries by score descending. For equal scores, earlier committed
submission wins; do not use client clocks, names or hidden fractional score.
Positions are 1-10, not competition ranks. Keep exactly `min(10, qualifying entries)`.
At a tied cutoff, keep the earlier ten; ties do not expand retention.

Persist a receipt for every valid committed submission, including a score that
does not enter the top 10. Receipt payload: run ID, normalised name, integer score.
Receipts remain until an operator deliberately resets this board; they are not
exposed by the public read response. They grow without bound in this design:
top-10 retention does not bound file size or whole-file rewrite cost.
No pruning, expiry or reset policy is silently assumed.

Identical retry means the same run ID, normalised name and score. Return a
confirmed already-processed outcome and current board without adding a receipt,
changing tie order or recreating a displaced entry. Same ID with different name
or score is a conflict, not an edit. A previously retained but now displaced score
must not be described as currently ranked. After an uncertain response, retry
uses the original payload, not a new identity; until resolved, do not permit edits
to that payload. Known pre-commit validation failures may be corrected.

| Precedence | Condition | Observable outcome / AC |
|---|---|---|
| 1 | Invalid payload | Validation error; no file change / AC03, AC10 |
| 2 | Storage unavailable or invalid | Unavailable; preserve data; no success / AC08 |
| 3 | Existing ID, different normalised payload | Conflict; no change / AC04 |
| 4 | Existing ID, identical payload | Already processed; current board; no change / AC04 |
| 5 | New valid ID, inside cutoff | Commit receipt and updated top 10; Saved / AC05, AC09 |
| 6 | New valid ID, outside cutoff | Commit receipt; Not in top 10, not Saved as a ranked entry / AC05, AC09 |
| 7 | Commit outcome uncertain to client | No confirmed success; retry original ID/payload / AC04, AC08 |

### File and API boundary (proposed technical contract)

Suggested file: `<configured-data-directory>/dino-dash-leaderboard.json`.
The operator supplies an absolute data-directory path with persistent local
filesystem semantics. The browser never supplies a filename or path. The file is
not inside `public`, source assets or an ephemeral build output directory.
Exact runtime, configuration key, host and production path remain open in QL-01.

Proposed schema v1:

```json
{
  "schemaVersion": 1,
  "entries": [
    { "runId": "123e4567-e89b-42d3-a456-426614174000", "name": "Dino", "score": 1200 }
  ],
  "receipts": [
    { "runId": "123e4567-e89b-42d3-a456-426614174000", "name": "Dino", "score": 1200 }
  ]
}
```

Receipts are in committed submission order; retained entries are in rank order.
The server validates schema, unique IDs, names, scores, matching receipts and
top-10 consistency, including tie order, before trusting a file. Empty board:
version 1 with both arrays empty. Blank/truncated files are malformed, not empty.
Unsupported versions are rejected without automatic migration.
No timestamps, IP addresses, accounts or gameplay breakdowns are required.

Proposed same-origin API, subject to technical review:

- `GET /api/leaderboard`: only positions, names and integer scores (maximum ten).
- `POST /api/leaderboard`: run ID, name and score; returns committed/already-processed
  outcome, whether currently ranked, and current public board.
- Distinguish invalid request, conflicting ID and unavailable storage; raw paths,
  stack traces and receipt history never enter browser responses.

Public deployment requires HTTPS and request/resource limits to be agreed.
No new API is implemented by this draft.

## Acceptance criteria

### SPEC-005-AC01

Covers: SPEC-005-R01.
Given a run starting at level 1, when it ends in death or completes the final
configured level, then exactly one eligible terminal result exposes the frozen
integer already displayed by ScoreBreakdown. Given `stats.score = 1200.9`, the
submission score is 1200. Earlier level multipliers/rewards remain unchanged.
Intermediate completion, abandonment and direct Level 2 starts never offer Save.
Final-level completion needs no invalid transition, extra click or out-of-range index.

### SPEC-005-AC02

Covers: SPEC-005-R02.
Given eligible final results, when the player chooses Save score, then one pending
request uses the frozen score and stable run ID; double-clicks do not start extra
saves. Choosing Return to Menu without saving submits nothing and clears the result.
Returning from the leaderboard to the same final results preserves unsaved input.
Before leaving unsaved results, the UI explains that they cannot be recovered.
After a committed outcome no second save/name edit is offered for that run.

### SPEC-005-AC03

Covers: SPEC-005-R03.
Given name input, when validated, then ` Dino ` becomes `Dino`; lengths 1 and 20
using allowed characters pass, while empty, whitespace-only, length 21, newline
within a name, `<script>`, `Dino!` and `Dinó` fail without a write.
Two distinct run IDs using the same valid name are both eligible.
Names appear as literal text, never markup.

### SPEC-005-AC04

Covers: SPEC-005-R04.
Given a committed receipt, when the identical payload is retried concurrently,
after server restart or after its entry is displaced, then no extra receipt/entry
or tie-order change occurs. Different name/score with that ID returns conflict
without mutation. Given a lost response after a successful commit, retrying the
original payload confirms processing without duplication. No public receipt lookup
or durable browser queue is required.

### SPEC-005-AC05

Covers: SPEC-005-R05.
Given 0, 1, 10 or 11 valid submissions, when ranked, then display/retain 0, 1, 10
or 10 entries respectively. Integer scores descend; equal values retain commit
order with sequential positions. At ten equal scores a later equal score cannot
displace any of them. A higher eleventh score displaces the lowest entry.
An outside-cutoff submission commits its receipt and shows Not in top 10, not Saved
as a ranked entry. No extra fractional tie-break exists.

### SPEC-005-AC06

Covers: SPEC-005-R06.
Given the main menu or final results, when Leaderboard opens, then fetch the shared
server board and show loading followed by ranked rows, an explicit empty message,
or an error with Retry. Manual Refresh fetches anew, including another player's
committed score; no polling is required. Failed refresh must not relabel an old
snapshot as current. Returning restores the originating menu/final result without
starting/resetting gameplay. Intermediate results/pause do not gain board controls.

### SPEC-005-AC07

Covers: SPEC-005-R07.
Given a configured persistent data directory, when a submission commits and the
backend restarts, then the same file supplies the same board and receipts to
another browser/device. The file parses as schema v1 UTF-8 JSON.
No localStorage or other browser store can satisfy this check, and browser request
fields cannot change the path. The file cannot be downloaded as a static asset.

### SPEC-005-AC08

Covers: SPEC-005-R08.
Given an absent file in an existing writable directory, when initialised under the
writer lock, then create the empty valid board. Given a missing directory, denied
read/write, malformed JSON, blank file, invalid schema or unsupported version, then
show unavailable and do not reset/overwrite the source. Given a failed replacement,
then do not report Saved and preserve the prior committed file where the filesystem
guarantees permit. A read-only directory, disk-full and dropped-response scenario
must each be exercised; after an ambiguous commit, reload and retry by receipt.
Gameplay/menu remain usable when the board is unavailable; no browser fallback.

### SPEC-005-AC09

Covers: SPEC-005-R09.
Given simultaneous valid submissions from two clients, when both report committed,
then both receipts survive and the top 10 reflects both scores. Equal scores follow
the server's serial commit order, not request timestamps. Repeated reads during
replacement parse as complete old/new snapshots. An interrupted pre-replacement
write leaves the old board; a completed replacement followed by lost acknowledgement
is resolved by receipt. A second writer is rejected/prevented by the supported
operation procedure, not advertised as safe.

### SPEC-005-AC10

Covers: SPEC-005-R10.
Given a forged direct request, then the server rejects missing fields, invalid IDs,
invalid names and non-safe/non-integer/negative scores without file mutation;
0 and `Number.MAX_SAFE_INTEGER` are structurally valid but not proof of honest play.
Public responses expose only the top-10 public projection, not receipts or paths.
Given keyboard-only operation, then all view/refresh/save/back controls are reachable,
focus returns to the opener, form errors label the name field, and loading/save/error
status changes are announced without requiring canvas vision. Do not claim
screen-reader conformance without the planned manual check.

## Verification plan - not executed feature evidence

No acceptance tests have been written or run. These are future verification
obligations, not a retrospective red/green claim. Use existing Vitest/Testing Library
where applicable; agree server test/runtime integration before adding tooling.

| AC | Planned verification | Current status |
|---|---|---|
| SPEC-005-AC01 | Engine/context/result tests: start modes, intermediate/final/death lifecycle, death/completion race, score 1200.9, mixed multipliers; preserve current scoring tests. | Unverified; tests deferred |
| SPEC-005-AC02 | UI integration: optional save, double-click, stable frozen payload, navigation, input preservation, unsaved warning and locked saved state. | Unverified; tests deferred |
| SPEC-005-AC03 | Shared validation boundary tests; UI errors and literal rendering. | Unverified; tests deferred |
| SPEC-005-AC04 | Backend temporary-file integration: retries, conflict, concurrent identical requests, restart, displacement and dropped response. | Unverified; tests deferred |
| SPEC-005-AC05 | Ranking cases 0/1/10/11, ties at cutoff, integer-only order, receipt for nonqualifier and displaced retry. | Unverified; tests deferred |
| SPEC-005-AC06 | UI fetch/loading/empty/error/refresh tests; two independent browser sessions see the same server board. | Unverified; tests/walkthrough deferred |
| SPEC-005-AC07 | Temporary configured directory, UTF-8/schema inspection, restart/read from second client, static-file/path isolation checks. | Unverified; tests deferred |
| SPEC-005-AC08 | Fault injection: missing file/directory, blank/corrupt/schema mismatch, denied access, disk full, rename failure and uncertain acknowledgement; verify file bytes preserved. | Unverified; tests deferred |
| SPEC-005-AC09 | Parallel clients, interleaved reads, termination before/after replacement, restart and unsupported-writer guard; qualify actual target filesystem. | Unverified; tests deferred |
| SPEC-005-AC10 | Direct API invalid-payload matrix, response redaction, keyboard/focus/status tests and manual screen-reader/browser check. Resource-limit checks depend on QL-03. | Unverified; tests/walkthrough deferred |

Future regression commands: focused existing engine/context/result tests plus new
AC-tagged tests, then `npm run build` and `npm run lint` for changed code.
Filesystem durability, HTTPS and operational checks must use the actual selected
host; local Vite preview is not release evidence.

## Open questions, risks and owners

Owner entries are roles to assign, not named human approval.

| ID | Question / decision still needed | Owner | Affects / provisional treatment |
|---|---|---|---|
| QL-01 | Backend runtime/framework, host, API origin/routing, configuration name and exact persistent absolute path? | Technical lead + project owner | AC07-AC10; single same-origin service proposed; no deployment selected |
| QL-02 | Which filesystem/OS guarantees atomic replacement and desired power-loss durability; how are exclusive ownership, backup/restore and intentional reset enforced? | Technical + release owner | AC04, AC07-AC09; same-directory temporary file + atomic replace proposed, not qualified |
| QL-03 | Public/private audience, expected traffic, maximum request/file/receipt sizes, request timeout, rate limits and overload response? | Product + technical lead | AC04, AC08-AC10; no numerical limits invented; receipt growth makes unrestricted public hosting unsafe to assume |
| QL-04 | Who owns inappropriate names, privacy notice, retention/reset permission and abuse handling for a public casual board? | Product/project owner | AC03, AC06, AC10; no moderation UI or identity proof |
| QL-05 | Supported browsers/devices and manual assistive-technology target? | Product + quality owner | AC02, AC06, AC10; existing Q-07 unresolved |
| QL-06 | Named gate authorities, readiness refresh, evidence handling, verified release/rollback procedure? | Project + release owner | G0-G5; readiness v1 remains Waiting for human |
| QL-07 | Revalidate inspected scoring, starting-level options and terminal-result gap against concurrent SPEC-006/gameplay work before implementation; which combined candidate is approved? | Technical lead + product owner | AC01, AC02; historical inspection retained, no concurrent changes reverted |

Receipt growth increases parse, memory and atomic rewrite costs. A casual trust
model permits forged scores, forged new run IDs and offensive but valid names.
Single-writer code does not protect against a second process or manual edits.
Disk loss/permissions/network errors can block leaderboard use without blocking
gameplay. No response-time/fps target or unrestricted scaling promise is made.

## Definition of Ready and review status

| Item | Status |
|---|---|
| Context, source revision, Significant size, user-agreed scope and exclusions | Present |
| Stable requirements, observable ACs, negative/boundary cases and mappings | Present |
| Proposed ADR with alternatives and trust/storage risks | Present |
| Exact backend/hosting/operational/resource-limit decisions | Missing; QL-01 through QL-04 |
| Browser/accessibility target and named authorities | Missing; QL-05, QL-06 |
| Combined-candidate revalidation after concurrent source changes | Missing; QL-07; inspected baseline deliberately preserved |
| Failing acceptance-test evidence | Intentionally deferred by user; no tests authored |
| G0/G1 approval | Waiting for human; no approval inferred from scope answers |

Recommendation: review this draft and ADR, resolve the owned technical/operational
questions, then separately authorise acceptance-test design/implementation.
This is not a request for G1 approval with nonexistent failing-test evidence.
Build, Review, Test, Handover and release have not begun. Missing G0-G4, open
questions, required Unverified checks and unknown release/rollback remain release
blockers. Stop here for the user's draft review.
