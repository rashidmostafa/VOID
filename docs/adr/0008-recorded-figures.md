# ADR-0008 — Correct four recorded figures, and stop recording them by hand

**Status:** Accepted
**Date:** 2026-09-06
**Affects:** `packages/tokens/sets/void-default.json` → `validation`, ADR-0001, `design-system/readme.md`
**Related:** UI-SRC-11, Appendix I V2/V6/V7/V11

---

## Context

Appendix I's validation block is self-reported, and `docs/HANDOFF.md` says so plainly: *"the
statuses in the file are self-reported; the validator must re-derive them."* Building the validator
(gate 2) re-derived all twelve rules for the first time. Four recorded figures were wrong.

None was a fabrication. Each was true when written and went stale when something downstream changed
without the record being re-run — which is the failure mode the whole exercise predicts.

### 1. Critical-path payload — recorded 34,762 B, actually 31,492 B

ADR-0001 and V7 both recorded token CSS at **8,510 B** gzip. The hand-authored `tokens/*.css`
actually gzip to **10,675 B** — the recorded figure was 2,165 B light, probably measured before the
accent layer and the commerce group landed.

The number that matters is different again. What ships is now the *generated* theme, which carries
no authoring comments: **5,240 B**. So the real critical path is **31,492 B of 40,960 B (76.9%)**,
with 9,468 B of headroom rather than the 6,198 B ADR-0001 implies.

The budget is in better shape than recorded. The point is that nobody knew that.

### 2. Contrast pairings — recorded 100, report says 92, validator evaluates 98

`readme.md` and V7's evidence both say "100 pairings". `guidelines/contrast-report.md` says 92 in
its own heading. The validator derives 98 from role structure. Three different numbers for the same
claim, none reconcilable without re-running the measurement.

### 3. Bengali shaping features — recorded eleven, ten are present

V6's evidence claims the subsets "carry all eleven shaping features" and lists them. Decompressing
the woff2 table directory and reading the layout tables shows **`akhn` is absent from both Bengali
faces**. The other ten are present.

This is not fatal and does not change the design: `akhn` governs akhand ligatures (ক্ষ, জ্ঞ),
neither test string contains one, and `cjct`/`pres` cover the conjuncts that do appear. But "all
eleven" was checked against the intent of the subsetting command, not against the resulting binary.

### 4. Geist's OFL text — recorded missing, was actually deleted

ADR-0007, `HANDOFF.md` and the kickoff brief all carry this as an open item requiring a drop from
upstream. It was not missing from the project: `assets/fonts/OFL-Geist.txt` is in git at commit
`9602085` and had been deleted from the working tree by the design tooling. Restoring the file and
copying it into `docs/licences/` closed the item in one command. V11 now passes.

## Decision

1. **Correct all four figures** in the token set's `validation` block, each marked `CORRECTED` with
   what the previous statement said and why it was wrong. The block is retained for history and
   explicitly demoted: `validate.mjs` is authoritative.
2. **Stop maintaining these figures by hand.** Every one is now emitted by a gate that computes it
   on each run. `npm run gate:budget` prints the payload, `gate:tokens` prints the pairing count and
   the feature audit.
3. **Revise ADR-0001's recorded number** to 31,492 B, and record that it is measured against the
   generated theme rather than the authored sources — these are legitimately different artefacts and
   the budget applies to the one that ships.
4. **The budget gate also compares each face's recorded `bytes` against the file on disk** and warns
   on a mismatch, so a resubsetted font cannot silently invalidate the record again.

## Consequences

**Positive.** Four figures that were quietly wrong are right, and none of them can go stale again
without a gate saying so. The payload has more headroom than anyone thought.

**Negative.** The `validation` block is now a historical artefact carrying corrections, which is
slightly awkward to read. Deleting it would be tidier but would erase the evidence that
self-reported status is not a substitute for a check — and that evidence is worth more than the
tidiness. Appendix I requires the block to exist regardless.

**Follow-up.** `design-system/readme.md` and `guidelines/contrast-report.md` still say 100 pairings
and still measure `commerce.rating` pre-accent. They are reference documents rather than build
inputs, so no gate reads them; they should be regenerated when the rating decision in ADR-0009 is
made, rather than patched twice.
