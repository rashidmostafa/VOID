# ADR-0009 — The star rating fails WCAG 1.4.11 under the accent palette

**Status:** Open — needs a Product Owner decision. Waived until 2026-12-05.
**Date:** 2026-09-06
**Affects:** `color.commerce.rating`, `color.commerce.rating.empty`
**Related:** UI-INV-1, Appendix I V3, ADR-0007, `guidelines/contrast-report.md`

---

## The finding

A star rating distinguishes filled from empty stars by fill colour alone. That distinction *is* the
information, so WCAG 2.2 SC 1.4.11 (Non-text Contrast) requires 3:1 between the two states.

Measured from the shipping cascade:

| Scheme | `--commerce-rating` | `--commerce-rating-empty` | Ratio | Required |
| --- | --- | --- | --- | --- |
| Light | `oklch(0.66 0.20 50)` | `oklch(0.87 0 0)` | **2.24:1** | 3:1 |
| Dark | `oklch(0.74 0.19 52)` | `oklch(0.46 0 0)` | **2.84:1** | 3:1 |

Both fail.

## Why it was not caught

`guidelines/contrast-report.md` records this pairing as **13.36:1 PASS**, measuring
`commerce.rating` as `#0a0a0a` — near-black. That was correct before 2026-09-05.

The accent decision that day added `tokens/accent.css`, which by design *"deliberately overrides
link, price, badge, rating and indicator roles those files define"* (its own header comment). It
moved `--commerce-rating` from `--fg-primary` (L=0.145) to `--signal-500` (L=0.66) — a 0.5 jump in
lightness directly toward the empty star at L=0.87. The contrast report was not re-run, so a
measured, evidenced document has asserted a passing ratio for a pairing that has been failing since.

This is exactly the case the SRS anticipates in demanding the validator re-derive rather than trust
(UI-SRC-11), and it is the first thing gate 2 found.

## Why this is not a token nudge

The obvious fix — darken the empty star until it clears 3:1 — does not survive contact with the
design. The required value is **`oklch(0.38 0 0)`** in light. At that lightness an "empty" star
reads as a *filled dark* star, and the control now shows five filled stars in two colours. The dark
scheme is worse: it needs `oklch(0.30 0 0)`, darker than the canvas it sits on.

The pairing cannot be fixed by moving the empty star, because the constraint is lightness separation
and the accent sits in the middle of the range. Note that the greyscale placeholder set inherits the
same failure at the same ratios — removing chroma preserves lightness, and contrast follows
lightness. The hue is not the problem.

## Options

**A — Revert `--commerce-rating` to the neutral.** One line in `accent.css`. Restores 13.36:1.
Costs the accent one of the five roles readme.md assigned it, and the rating is arguably the most
natural of them.

**B — Carry the distinction by shape, not fill.** Empty stars become outlined rather than filled;
the boundary stops depending on fill contrast, and the accent keeps the filled star. This is the
conventional accessible pattern and the only option that keeps both the accent and the compliance.
Costs a change to how the star is drawn.

**C — Make the rating text primary and the stars decorative.** "4.6 out of 5" carries the value,
`aria-hidden` on the stars, and 1.4.11 no longer applies because nothing is conveyed by the graphic
alone. Some storefront surfaces already show the numeral.

**D — Accept and document.** Not available in the EU: EN 301 549 makes WCAG 2.2 AA a legal condition
of selling there (§8.8, FR-COMP-15), and the EU is a named target market.

## Recommendation

**B.** It is the only option that keeps the 2026-09-05 accent decision intact and satisfies 1.4.11,
and it does not require re-picking a token value — which ADR-0007 reserves to the Product Owner.

## Status while open

The failure is recorded in `packages/tokens/waivers.json` with an owner and a **2026-12-05 expiry**,
following the discipline FR-MKTS-14 applies to a waived market-readiness item. The waiver suppresses
the exit code, never the finding: both failing pairings print on every validator run. When the
waiver expires the gate fails hard.

The waiver is deliberately not scoped to one set, because `void-placeholder` inherits the pairing by
derivation.
