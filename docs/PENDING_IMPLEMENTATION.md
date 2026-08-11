# Candlelight — Pending Implementation Changes

**Status:** Provisional implementation queue. **Not a statement of current behavior.**

This file is the mandatory review buffer for proposed Foundry VTT system changes that have not yet been approved for implementation.

Nothing listed here should be treated as implemented until the user explicitly approves the change, the repository code is actually modified, and `docs/IMPLEMENTATION_STATUS.md` is updated to reflect the verified result.

## Safeguard Rules

1. Before changing production system code, data models, templates, styles, assets, workflows, or package metadata, create or update an entry here.
2. Do **not** modify production implementation merely because a code change was discussed or appears obvious.
3. The user must explicitly approve the pending implementation entry before code changes are applied.
4. Each entry should reference the canonical rule it implements when applicable.
5. After approval, inspect the current code again before editing so the patch is based on the latest repository state.
6. Apply the smallest coherent change, test/inspect it as practical, then update `docs/IMPLEMENTATION_STATUS.md`.
7. Only after code is changed and verified may the entry be marked Implemented and moved to the Implementation Log.
8. A pending entry never overrides current repository behavior or `docs/IMPLEMENTATION_STATUS.md`.
9. If the user explicitly instructs an emergency/direct code change and explicitly waives this safeguard for that change, record that waiver in the entry before applying it.

## Entry Template

### PIMPL-XXX — Short Title

**Status:** Draft | Awaiting Review | Approved for Implementation | Implemented | Rejected  
**Date proposed:** YYYY-MM-DD  
**Canonical rule reference:** Section / Keyword / N/A

**Goal**  
Describe the intended user-visible or rules-visible result.

**Current verified behavior**  
Summarize what the current repository actually does after inspecting the relevant code.

**Proposed implementation**  
Describe the code/data/template/style changes at a useful review level before touching production files.

**Expected files affected**  
List likely repository paths. This is a plan, not permission to modify them.

**Risks / compatibility concerns**  
Call out migration, validation, Foundry-version, UI, or rules-interaction risks.

**Verification plan**  
State what should be checked after implementation.

**Review notes**  
Record user-requested edits, approval, or rejection.

---

## Active Pending Implementation Changes

_No pending implementation changes at this time._

---

## Implementation Log

| ID | Title | Implemented Date | Commit / Notes |
|---|---|---|---|
