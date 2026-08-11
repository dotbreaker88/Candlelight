# Candlelight Repository Agent Instructions

These instructions apply to all AI-assisted work performed in this repository.

## Canonical Source Lock

For Candlelight work, use only the following sources as authoritative:

1. **Game rules:** `docs/CANDLELIGHT_RULES.md`
2. **Implementation status:** `docs/IMPLEMENTATION_STATUS.md`
3. **Actual implementation:** the current files, code, data models, templates, styles, workflows, and assets in this GitHub repository

No other source is authoritative unless the user explicitly promotes it through the review workflow below.

## Mandatory Pending-Commit Safeguard

Candlelight uses a review-before-promotion workflow for both rules and implementation.

### Pending rules

`docs/PENDING_RULES.md` is the mandatory provisional queue for all new or changed rules, rulings, Keywords, Conditions, mechanics, corrections, and clarifications.

- New rules go into `PENDING_RULES.md` first.
- Pending rules are **not authoritative**.
- Do not edit `docs/CANDLELIGHT_RULES.md` until the user explicitly approves the pending entry for promotion.
- After approval, promote the approved wording into `CANDLELIGHT_RULES.md` and update the pending document's Promotion Log.
- Until promotion occurs, answers about established Candlelight rules must continue to use the existing canonical rules, not the pending proposal.

### Pending implementation

`docs/PENDING_IMPLEMENTATION.md` is the mandatory provisional queue for proposed Foundry system changes that have not yet been approved for implementation.

- Before modifying production code, data models, templates, styles, assets, workflows, or package metadata, create or update a pending implementation entry.
- Pending implementation entries are **plans, not current behavior**.
- Do not change production implementation until the user explicitly approves the pending entry.
- After approval, inspect the current repository again, make the approved code changes, verify them as practical, and update `docs/IMPLEMENTATION_STATUS.md`.
- If the user explicitly asks to bypass this safeguard for a specific emergency/direct change, record that explicit waiver in the pending entry before changing production files.

The two pending documents are workflow buffers and do not become additional canonical authorities.

## Sources That Must Not Be Used as Authority

Do not use any of the following as factual Candlelight rules or implementation truth:

- older design specifications;
- deprecated files;
- PDFs or exported references;
- README release-history descriptions when they conflict with current code or the canonical documents;
- previous chat messages or conversational memory;
- model memory or general tabletop-RPG knowledge;
- comments in code as a substitute for checking executable behavior;
- external websites or web searches;
- `docs/PENDING_RULES.md` as though its contents were already established;
- `docs/PENDING_IMPLEMENTATION.md` as though its contents were already implemented.

Historical material may be inspected only when the user explicitly asks for historical comparison, migration, or recovery. It must never silently override the canonical documents.

## Rules Questions

Before answering any question about an established Candlelight rule, mechanic, Keyword, Condition, Statistic, Challenge Roll, damage interaction, character option, progression rule, or similar subject:

1. Read the relevant section of `docs/CANDLELIGHT_RULES.md`.
2. Answer only from what that document establishes.
3. If the document does not answer the question, say that the rule is **undefined/TBD** and ask the user for a ruling.
4. Do not infer a missing Candlelight rule from common RPG conventions.
5. If there is a related entry in `docs/PENDING_RULES.md`, clearly identify it as pending if relevant, but do not treat it as established.

If the user's new ruling changes or completes a rule, write it to `docs/PENDING_RULES.md` for review. Do **not** immediately alter `docs/CANDLELIGHT_RULES.md`.

## Implementation Questions

Before claiming that a Candlelight feature is implemented, partially implemented, broken, or absent:

1. Read the relevant section of `docs/IMPLEMENTATION_STATUS.md`.
2. Inspect the current repository code/assets that actually govern the feature.
3. Treat executable repository behavior as the source of truth for what the current Foundry system does.
4. If code behavior differs from `docs/CANDLELIGHT_RULES.md`, do **not** reinterpret the rule to match the code. The rules document defines intended behavior; record the mismatch in `docs/IMPLEMENTATION_STATUS.md` when an approved implementation change is made.
5. If there is a related entry in `docs/PENDING_IMPLEMENTATION.md`, clearly distinguish the proposed state from the current verified state.

## Source Hierarchy

When sources conflict, use this hierarchy:

### Intended Candlelight rules
`docs/CANDLELIGHT_RULES.md` wins.

### What Foundry currently does
Current repository code/data/assets win, with `docs/IMPLEMENTATION_STATUS.md` serving as the audited inventory and discrepancy log.

### Pending proposals
`docs/PENDING_RULES.md` and `docs/PENDING_IMPLEMENTATION.md` describe possible future states only. They never override canonical rules or current code until explicitly approved and promoted/implemented.

### Everything else
Non-authoritative unless the user explicitly directs otherwise.

## Required Uncertainty Behavior

Never fill a Candlelight rules gap by guessing.

Use one of these outcomes instead:

- **Defined:** quote or accurately summarize the canonical rule.
- **Pending:** identify a provisional proposal without presenting it as established.
- **Implemented:** verify the current repository behavior.
- **Rules/implementation mismatch:** state both separately.
- **Undefined/TBD:** ask the user for a ruling.
- **Unverified implementation:** inspect the relevant code before answering.

## Keyword Policy

Capitalized Candlelight terms may be formal Keywords. Preserve their capitalization. Final definitions belong in the Keyword Glossary within `docs/CANDLELIGHT_RULES.md`.

When a new Keyword is proposed, add or update it first in `docs/PENDING_RULES.md`. Only after explicit user approval should it be promoted into the canonical Keyword Glossary.

## Document Maintenance

Maintain exactly two canonical project documents:

- `docs/CANDLELIGHT_RULES.md` — complete intended game rules.
- `docs/IMPLEMENTATION_STATUS.md` — current Foundry implementation inventory, known gaps, and rules/code discrepancies.

Maintain exactly two provisional review buffers:

- `docs/PENDING_RULES.md` — unapproved rules proposals awaiting review/promotion.
- `docs/PENDING_IMPLEMENTATION.md` — unapproved implementation proposals awaiting review/implementation.

The pending files are deliberately non-authoritative and do not change the two-document canonical source model.

Do not create a new versioned design specification as a competing authority. Deprecated references may remain only as redirects to the canonical files.

## Change Discipline

When designing or changing a rule:

1. Read the current canonical rule first.
2. Treat discussion as provisional.
3. Write the proposed final wording into `docs/PENDING_RULES.md`.
4. Present it for user review.
5. Only after explicit approval, promote it into `docs/CANDLELIGHT_RULES.md`.
6. If implementation work follows, create a separate pending implementation entry before changing code.

When implementing or changing system behavior:

1. Verify the governing rule in `docs/CANDLELIGHT_RULES.md`.
2. Inspect the current implementation before planning the change.
3. Write the proposed implementation, expected files, risks, and verification plan into `docs/PENDING_IMPLEMENTATION.md`.
4. Present it for user review.
5. Do not modify production implementation until the user explicitly approves the pending entry.
6. After approval, inspect the latest code again and make the smallest coherent change.
7. Verify the change as practical.
8. Update `docs/IMPLEMENTATION_STATUS.md` to reflect the verified result.
9. Record the completed entry in the pending implementation log.
10. Do not silently change game rules while fixing code.

## Approval Language

Approval must be explicit enough to identify the pending entry or clearly indicate that the user wants the reviewed proposal promoted/implemented. Examples include:

- “Approve PRULE-012.”
- “Promote that rule.”
- “That wording is correct; add it to the rules.”
- “Approve PIMPL-007 and implement it.”
- “Proceed with the reviewed code plan.”

Discussion, agreement in principle, or answering clarification questions is not itself permission to promote a rule or modify production code.

## External Research

Do not use external research to answer Candlelight-specific rules or implementation questions unless the user explicitly asks for outside comparison or research. If external material is requested, clearly separate it from canonical Candlelight information and do not merge it into the rules without explicit user approval through the pending-rules workflow.
