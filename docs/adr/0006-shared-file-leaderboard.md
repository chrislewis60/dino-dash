# ADR-0006: One server-owned text file for a shared casual leaderboard

Version: 1
Status: Proposed
Recorded: 2026-11-03
Deciders: Unknown; named product/technical authorities not yet assigned.
Related specification/version: [SPEC-005 v1](../specs/0005-shared-file-leaderboard.md).
Baseline: `3f3dcb3881d4f60d3e3a10b583dc1f52b99df324`, initially clean worktree.
Concurrent gameplay work subsequently changed the candidate; the user directed
preserving this inspection baseline and revalidating it before implementation.

## Context

Dino Dash currently runs in a browser using React, TypeScript, Vite and canvas,
with no backend, accounts or persistent state. The user requests a real text file
shared across devices. A locally selected file was considered first, then explicitly
superseded by server storage. Static hosting cannot accept persistent file writes.
Browser storage or downloadable exports do not meet the revised requirement.

Reuse the engine's earned score and the final screen's existing integer display.
The server cannot prove that a client earned that score without a much larger
authoritative simulation/replay design. The user chose a casual unauthenticated
board and acknowledged forged-score/name-impersonation limitations for this draft.
That choice is not formal gate approval or unrestricted public-operation approval.

## Decision

Propose one backend instance owning one UTF-8 JSON file, schema version 1, on
persistent local writable storage outside web assets. Browser UI uses a small
read/submit API, preferably same-origin; no network/file IO in the simulation loop.
Exact backend runtime, framework, host, routing and absolute data path remain open.
A minimal TypeScript/Node service is a candidate given the existing stack, not an
approved dependency/runtime selection.

The file contains the top 10 and ordered durable submission receipts. A single
writer queue covers read, validation, duplicate check, ranking and commit.
Write a complete temporary file on the same filesystem and atomically replace
the destination. Readers see complete committed snapshots. Do not acknowledge
success before the commit boundary. Restart must recover from the last committed
file; receipt-based retries resolve lost acknowledgements.

Validate file contents and request payloads independently; never accept a browser
path. Missing file may initialise only in an existing writable configured directory.
Corrupt/unreadable/unsupported files fail explicitly without reset. Do not fall
back to localStorage or volatile success-shaped storage.

Support one writer process only. Filesystem replacement alone does not prevent
lost updates from multiple writers. Operator/startup exclusivity must be specified
and verified before deployment; external editing while running is unsupported.
Power-loss durability, flush semantics, replacement behaviour, temporary-file
cleanup and recovery need qualification on the actual operating system/filesystem.
Do not equate atomic visibility with guaranteed survival of storage failure.

## Options considered

| Option | Benefits | Costs / fit |
|---|---|---|
| User-selected local file with browser permission | No backend, real file, private device-local board | Not shared across devices; browser support/permission/reconnection constraints; superseded by user |
| Manual text import/export | Broad browser support, no server | Manual merging and no authoritative shared state; does not meet revised requirement |
| Static JSON in public assets | Simple read-only distribution | Cannot accept durable browser writes; exposing write credentials is unacceptable |
| localStorage / IndexedDB | Simple device-local persistence | Not the requested text file or shared board; explicitly rejected as substitution |
| One persistent server file (proposed) | Meets real-file requirement; small service and inspectable data | Single writer/host, permission/durability/backup burden, whole-file rewrite and receipt growth |
| Database or managed leaderboard | Transactions, indexing, scalable concurrent access | Different persistence requirement and service/operational footprint; future option only with explicit scope change |
| Shared file with multiple writers/replicas | Potential service redundancy | Requires cross-process coordination and qualified shared-storage semantics; unnecessary complexity, unsupported in this version |
| Server-authoritative scoring/identity | Stronger competitive integrity | Substantial gameplay/authentication redesign; outside casual-board scope |

## Consequences

- New runtime deployment and trust boundary: static Vite hosting alone no longer
  suffices. Persistent storage cannot be assumed on serverless/ephemeral disks.
  No infrastructure, dependency installation or deployment is authorised now.
- Rank only existing displayed integer scores. Eligibility is ordinary client
  behaviour, not a security guarantee; forged requests can bypass it.
- Top-10 retention alone cannot guarantee indefinite idempotency. Durable receipts
  resolve retries after displacement/restart, but grow until deliberate operator
  reset and make every whole-file update more expensive. A bounded receipt policy
  would change the contract; do not silently add TTL/pruning.
- The Critical Thinking consultation highlighted this lifetime/growth trade-off.
  The user's selected policy retains receipts until reset; capacity limits,
  backup/reset procedure and resource protection remain open, not solved by top 10.
- Network failure may leave a committed submission with no acknowledgement.
  Retry the same identity/payload; never create a new identity to hide uncertainty.
  No durable browser queue or cross-reload recovery is promised.
- New public data is player-supplied name and score. Render plain text, expose
  only ranked data, protect paths/receipts, and agree privacy/abuse controls.
  Validation and UUIDs do not provide authentication, rate limiting or anti-cheat.
- A narrow final-level results correction is necessary; unrelated mechanics and
  existing historical specs remain unchanged.
- Test isolated temporary files, malformed/denied/full-disk conditions, parallel
  submissions, interrupted writes/restarts and dropped responses before claiming
  reliability. Public hosting additionally needs agreed limits and HTTPS.

Unresolved choices are owned in SPEC-005 QL-01 through QL-07. Recommendation:
review the proposal, then select operational bounds and runtime before Build.
This record is not Accepted and authorises no implementation or release.
