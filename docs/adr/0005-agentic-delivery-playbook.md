# ADR-0005: Adopt a repository-local agentic delivery Playbook

Status: Proposed; awaiting human review.
Recorded: 2026-11-03. Deciders: product/project owner and technical lead, names to confirm.
Related: [SPEC-004](../specs/0004-playbook-adoption.md).

## Context

The user wants to learn spec-driven AI development from an existing reference and
adopt its full practical workflow here, including missing initial specs and ADRs.
This project already has specialist agents and authoring prompts. Its gameplay
working tree is dirty and must be preserved.

## Decision

Propose an original local adaptation using Onboarding/Playbook agents, initiate,
evolves and deliver prompts, 17 focused skills, project context, reusable templates,
explicit G0-G5 human decisions and static adoption tests.

Reconstruct the initial product baseline from current source/tests with honest
retrospective labels. Keep mismatches as owned questions, not silent code fixes.
Do not copy the reference's private policies, application, approvers or cloud setup.

## Options considered

| Option | Benefit | Cost |
|---|---|---|
| Documentation only | Small footprint | No repeatable entry points or evidence/decision lifecycle |
| Copy the full reference project bundle | Similar file layout quickly | Unrelated policies, ownership, tooling and licensing assumptions |
| Original project-specific Playbook (proposed) | Preserves the useful lifecycle and actual game context | Local maintenance and live-host verification still required |
| Add a separate executable orchestration platform | Potential stronger automation | New dependency/service without a demonstrated need |

## Consequences

The workflow is versioned and reviewable without new runtime packages. Instructions
do not enforce remote controls; tests cannot prove model compliance or historical
intent. Human role assignment, host discovery, a representative live run and a
deployment/rollback decision remain outstanding.

User permission to implement this setup and use the dirty baseline is recorded,
but is **not** G0-G5 approval or acceptance of retrospective ADR rationale.
