# Spec-driven development and the Playbook

## What was found in the reference project

The supplied reference project was inspected locally on 2026-11-03. Its Playbook
is a repository-local Copilot integration, not an npm library, autonomous server
or special model. The useful chain is:

```text
prompt -> custom agent -> focused skills -> standards + project context
                                      -> specs, ADRs, tests and evidence
                                      -> explicit human gate decisions
```

Its `/initiate` and `/evolves` prompts select Onboarding; `/deliver` selects
Playbook. Onboarding discovers the project, establishes a profile and records G0
readiness. Playbook follows delivery stages, invoking skills such as
`write-specification`, `write-acceptance-tests` and `evidence-pack`.

The reference's requirements standard scales work as Small, Standard or Significant.
The specification skill drafts an ADR for Significant changes using the architecture
standard's ADR template. ADR generation is therefore an instruction to the agent
to write and link a Markdown record, **not an automatic consequence of running Git**.
Existing decisions need retrospective labels; generated proposals need a human decision.

Its evidence packs collect acceptance results, reviews, limitations and recommendations.
G0-G5 record different human decisions. Pending gates do not halt local Build/Test,
but unresolved blockers prevent release. Source files and PowerShell adoption checks
make the workflow reviewable; they do not prove Copilot discovery or enforce remote
branch protection.

## What is installed here

This is an original, Dino Dash-specific adaptation of that pattern. No reference
application code, private business policies, personal approvers, infrastructure
configuration or proprietary templates have been copied. It retains the same
onboarding/delivery commands, stage names, sizing, focused skill names and G0-G5
decision model. Local rules are consolidated in one
[delivery standard](../standards/delivery.md), rather than importing a suite of
enterprise standards unrelated to a browser game.

There is no new runtime dependency, cloud service, scanner subscription, hook,
deployment pipeline or automatic release. Existing specialist agents and authoring
prompts remain available. No agent model is pinned.

## A worked change

For example, “make touch taps jump” should become a **new proposal**, because the
current code handles vertical swipes, despite the old design promising taps.

1. Run `/deliver Make a touch tap jump, preserving swipe-down slide`.
2. Understand: inspect input handling; define “tap” boundaries with the owner,
   including accidental gestures, double jump and scrolling behaviour.
3. Write a versioned spec with stable requirement and acceptance IDs. For example:
   “Given an agreed tap gesture during play, when it ends, then one jump press is
   emitted; holding a touch must not repeatedly jump.”
4. Write tests that fail for the new behaviour; preserve existing keyboard tests.
   Record actual failure output. Do not invent a passing result or a tap threshold.
5. Request G1 for the exact spec version. Local implementation/testing may continue
   while approval is pending, at the risk of rework.
6. Implement, review input/listener lifecycle and accessibility, run targeted tests,
   and perform a real touch-device or suitable browser walkthrough.
7. Prepare evidence, request G2-G4, and stop before release if decisions or required
   evidence are missing. G5 needs its own release-owner approval and a verified
   deployment/rollback procedure.

Not every change needs an ADR. A new input abstraction or rendering architecture
might; a small agreed gesture fix normally does not.

## Daily operation

| Stage | Skills, in order | Durable output |
|---|---|---|
| Onboard | discover-project, enable-toolkit, assess-delivery-readiness | Profile, architecture, readiness and G0 request |
| Understand | analyse-context, challenge-solution (unless Small), define-acceptance-criteria, write-specification, write-acceptance-tests | Spec, ADR when Significant, failing tests, G1 evidence |
| Build | implement-code | Scoped implementation and test results |
| Review | review-code, assess-security, review-accessibility (UI changes) | Findings and G2 evidence |
| Test | validate-tests, visual-walkthrough (UI/journey changes) | Actual results and G3 evidence |
| Handover | build-handover | Summary, residual risks and G4 request |
| Release | Approved project-specific procedure only | G5 decision and deployment/rollback evidence |

Use evidence-pack at G1-G3 and harvest-learnings after each stage. These are
sequential procedures, not an instruction to spawn a separate agent for every skill.
Use existing specialists only when their expertise is needed.

## Human decisions

Record a decision in the [run](../templates/run.md) with the person's name, actual
role/authority, timestamp, outcome, exact spec/evidence version, reason and conditions.
One person can hold multiple roles only when explicitly confirmed. Starting a task,
choosing a baseline or asking to install this workflow is not gate approval.

Unknowns have owners and affected criteria. A recommendation is not a decision.
An exception needs an explicit scope, risk, compensating control, expiry and
authorised acceptance; an empty register grants nothing.

## Keeping specs useful

- Use the [spec template](../templates/specification.md) and
  [ADR template](../templates/adr.md); add only sections needed for the size.
- Describe observable behaviour and boundaries, not a prescribed implementation
  unless it is an actual constraint.
- Keep requirements -> acceptance criteria -> test/evidence mappings current.
- For a new behaviour, tag tests with its acceptance IDs. For this retrospective
  baseline, retain honest test-name mappings and explicit coverage gaps.
- Supersede ADRs instead of rewriting their history; invalidate affected approvals
  when requirements or evidence change.
- Never convert a discrepancy or proposed performance target into an approved
  requirement merely because the implementation currently behaves that way.

## Limits

Instructions guide an AI agent probabilistically. The local automated checks verify
file structure, links, traceability shape and selected workflow contracts, not actual
agent compliance, historical intent, accessibility conformance or gameplay correctness.
Run a representative change in the real host with a human before describing the
workflow as operationally verified. Prompt/skill availability can vary by host and
global customisation scope. No remote controls have been configured.
