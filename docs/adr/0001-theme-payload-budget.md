# ADR-001 — Revise the NFR-PERF-19 theme payload budget

**Status:** Accepted — folded into SRS v3.0.1
**Date:** 2026-09-05
**Affects:** SRS v3.0 §8.1 NFR-PERF-19
**Related:** UI-INV-5, UI-INV-13, Appendix I V6, V8

---

## Context

NFR-PERF-19 caps the theme — CSS custom properties plus subset fonts on the critical path — at **15KB compressed**, and requires that it not block first paint.

The theme is now built and measurable. Every component is real, the fonts are subset and self-hosted, and the numbers are:

| Component | Size |
|---|---|
| Token CSS, all 13 files, gzip -9 | 8,510 B |
| Geist 400 (woff2, Latin subset) | 12,956 B |
| Geist 500 (woff2, Latin subset) | 13,296 B |
| Geist Mono 400 (woff2, Latin subset) | 9,864 B |
| **Latin critical path total** | **44,626 B** |
| Anek Bangla 400 (woff2, Bengali subset) | 54,216 B |
| Anek Bangla 500 (woff2, Bengali subset) | 48,744 B |
| **Bengali pair** | **102,960 B** |

The Latin path is roughly **3× the ceiling** before Bengali is counted at all. With Bengali, it is over 9×.

### Why no amount of subsetting closes the gap

**The fonts are already minimally subset.** The Latin faces carry 225 codepoints — Latin-1 plus the punctuation, currency and arrow glyphs a bilingual commerce interface actually renders. Cutting to bare ASCII would save a few hundred bytes and break the taka sign, typographic quotes and the en-dash used in delivery ranges.

**Bengali cannot be made small.** The script forms conjuncts through glyph substitution, so a usable Bengali face needs roughly 500 glyphs and an intact GSUB table. The shipped subsets carry the eleven required shaping features (`akhn`, `rphf`, `blwf`, `half`, `pstf`, `vatu`, `cjct`, `pres`, `blws`, `psts`, `haln`). Appendix I V6 rejects a token set whose Bengali stack falls back at any scale step, so these features cannot be dropped to save weight. 54KB is close to the floor for a correctly-shaping Bengali web font.

**The budget predates the requirement it now conflicts with.** NFR-PERF-19 was written before the bilingual type stack was specified. It was never sized against a script that needs 500 glyphs. This is a defect in the requirement, not in the implementation.

**Compliance by violation is the worst outcome.** A budget the build silently exceeds provides no discipline at all, and it will fail the first performance audit under UI-SRC-11 for a reason nobody can act on.

## Decision

Revise NFR-PERF-19 as follows.

1. **The critical-path theme budget becomes 40KB compressed**, covering token CSS plus the Latin faces required at first paint (Geist 400 and 500). Measured against that scope today: 8,510 + 26,252 = **34,762 B**, inside the revised ceiling with headroom.

2. **Geist Mono is removed from the critical path.** It renders identifiers, SKUs and money in tables — none of which appear above the fold on first paint. It is loaded asynchronously with `font-display: swap`. Tabular figures fall back to Geist's proportional numerals for a few hundred milliseconds, which is acceptable.

3. **The Bengali faces are excluded from the critical-path budget entirely.** They load per-locale under `:lang(bn)`, with `font-display: swap` and no render-blocking preload. Bengali users see a system Bengali fallback briefly rather than a blank screen. A separate soft target of **110KB** applies to the Bengali pair, for tracking rather than gating.

4. **The non-blocking requirement is unchanged and remains binding.** No `@import`, no render-blocking font request, no third-party origin. UI-INV-13 and V8 are untouched by this ADR.

## Consequences

**Positive.** The budget becomes a real gate that CI can enforce and a build can fail against. The Latin path has genuine headroom for a sixth face if the wordmark ever needs Geist 600. Bengali correctness is no longer in tension with a performance number.

**Negative.** Bengali-locale users on slow connections carry 103KB more than English-locale users. This is inherent to the script, not to Void, but it is a real inequity in a market that is majority-Bengali and majority-mobile. Mitigation: Bengali faces are cached aggressively and only fetched once per locale session.

**Follow-up.** Add a CI check asserting the critical-path bundle stays under 40KB compressed, and a separate advisory check on the Bengali pair. Without the check, the revised budget is as unenforced as the old one.

## Alternatives considered

**Hold 15KB and drop Bengali web fonts, relying on system Bengali.** Rejected. System Bengali coverage on the mid-range Android devices that dominate the home market is inconsistent, and the optical mismatch against Geist would be visible on every bilingual surface. This trades a measurable performance number for an unmeasurable quality loss in the primary market.

**Hold 15KB and ship a single weight.** Rejected. Saves 13,296 B and still leaves the Latin path at 21KB, over the ceiling. It also forces synthesised faux-bold for every heading and control label, since the system specifies 400 for body and 500 for headings.

**Subset Bengali to a common-conjunct core and lazy-load the rest.** Rejected for v1. Technically possible via unicode-range splitting, but conjunct formation crosses subset boundaries unpredictably and a missing glyph mid-word is a worse failure than a slower load. Revisit if Bengali-locale performance proves to be a real problem in production.
