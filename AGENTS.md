# Candlelight Repository Agent Instructions

These instructions apply to all AI-assisted work performed in this repository.

## Canonical Source Lock

For Candlelight work, use only the following sources as authoritative:

1. **Game rules:** `docs/CANDLELIGHT_RULES.md`
2. **Implementation status:** `docs/IMPLEMENTATION_STATUS.md`
3. **Actual implementation:** the current files, code, data models, templates, styles, workflows, and assets in this GitHub repository

No other source is authoritative unless the user explicitly promotes it into one of the two canonical documents above.

## Sources That Must Not Be Used as Authority

Do not use any of the following as factual Candlelight rules or implementation truth:

- older design specifications;
- deprecated files;
- PDFs or exported references;
- README release-history descriptions when they conflict with current code or the canonical documents;
- previous chat messages or conversational memory;
- model memory or general tabletop-RPG knowledge;
- comments in code as a substitute for checking executable behavior;
- external websites or web searches.

Historical material may be inspected only when the user explicitly asks for historical comparison, migration, or recovery. It must never silently override the canonical documents.

## Rules Questions

Before answering any question about an established Candlelight rule, mechanic, Keyword, Condition, Statistic, Challenge Roll, damage interaction, character option, progression rule, or similar subject:

1. Read the relevant section of `docs/CANDLELIGHT_RULES.md`.
2. Answer only from what that document establishes.
3. If the document does not answer the question, say that the rule is **undefined/TBD** and ask the user for a ruling.
4. Do not infer a missing Candlelight rule from common RPG conventions.

If the user's new ruling changes or completes a rule, update `docs/CANDLELIGHT_RULES.md` so the ruling becomes durable before treating it as established in later work.

## Implementation Questions

Before claiming that a Candlelight feature is implemented, partially implemented, broken, or absent:

1. Read the relevant section of `docs/IMPLEMENTATION_STATUS.md`.
2. Inspect the current repository code/assets that actually govern the feature.
3. Treat executable repository behavior as the source of truth for what the current Foundry system does.
4. If code behavior differs from `docs/CANDLELIGHT_RULES.md`, do **not** reinterpret the rule to match the code. The rules document defines intended behavior; record the mismatch in `docs/IMPLEMENTATION_STATUS.md` and fix the code when requested.
5. If implementation status changes, update `docs/IMPLEMENTATION_STATUS.md` in the same change whenever practical.

## Source Hierarchy

When sources conflict, use this hierarchy:

### Intended Candlelight rules
`docs/CANDLELIGHT_RULES.md` wins.

### What Foundry currently does
Current repository code/data/assets win, with `docs/IMPLEMENTATION_STATUS.md` serving as the audited inventory and discrepancy log.

### Everything else
Non-authoritative unless the user explicitly directs otherwise.

## Required Uncertainty Behavior

Never fill a Candlelight rules gap by guessing.

Use one of these outcomes instead:

- **Defined:** quote or accurately summarize the canonical rule.
- **Implemented:** verify the current repository behavior.
- **Rules/implementation mismatch:** state both separately.
- **Undefined/TBD:** ask the user for a ruling.
- **Unverified implementation:** inspect the relevant code before answering.

## Keyword Policy

Capitalized Candlelight terms may be formal Keywords. Preserve their capitalization. Definitions belong in the Keyword Glossary within `docs/CANDLELIGHT_RULES.md`.

When a new Keyword is established, add or update its glossary entry. Do not create competing standalone Keyword definitions elsewhere.

## Document Maintenance

Maintain exactly two canonical project documents:

- `docs/CANDLELIGHT_RULES.md` — complete intended game rules.
- `docs/IMPLEMENTATION_STATUS.md` — current Foundry implementation inventory, known gaps, and rules/code discrepancies.

Do not create a new versioned design specification as a competing authority. Deprecated references may remain only as redirects to the canonical files.

## Change Discipline

When implementing a rule:

1. Verify the rule in `docs/CANDLELIGHT_RULES.md`.
2. Inspect the current implementation before editing it.
3. Make the smallest coherent code change that implements the rule.
4. Update `docs/IMPLEMENTATION_STATUS.md` to reflect the new state.
5. Do not silently change game rules while fixing code.

When designing a new rule with the user:

1. Treat the discussion as provisional until the user confirms the ruling.
2. Once confirmed, write it into `docs/CANDLELIGHT_RULES.md`.
3. Only then use it as an established rule in implementation work.

## External Research

Do not use external research to answer Candlelight-specific rules or implementation questions unless the user explicitly asks for outside comparison or research. If external material is requested, clearly separate it from canonical Candlelight information and do not merge it into the rules without explicit user approval.
