# ADR-0007 — Design source for the Void interface

**Status:** Accepted
**Date:** 2026-09-05 (intake opened 2026-09-03)
**Satisfies:** SRS v3.0 UI-SRC-1 … UI-SRC-6, UI-SRC-12
**Referenced by:** `tokens.json` → `meta.sourceRef`
**Related:** ADR-0001 (theme payload budget), `docs/licences/README.md`

---

## Context

SRS v3.0 §9.1 removed the visual identity that v2.0 prescribed and replaced it with a blocking
intake gate: no colour, font, radius, shadow, spacing value or motion curve may be written until
the Product Owner has supplied the design direction. Inferring a palette from the brand name or
reusing v2.0's is a defect.

The gate was presented and answered. This record exists because a design source that cannot be
traced to a recorded decision may not be activated (UI-SRC-3).

## The intake

The Design Source Request of UI-SRC-2 was presented before any styling was authored. The Product
Owner answered in **mode B — a code/asset bundle**, with two mode-A references supplied for feel
only. The full response, in the order it arrived:

| Date | What was supplied | Mode | Role |
| --- | --- | --- | --- |
| 2026-09-03 | A Tailwind v4 / shadcn `@theme inline` block plus `:root` and `.dark` token sets — `--background`, `--primary`, `--radius: 0.625rem`, `--font-geist-sans`, `--font-geist-mono`, chart and sidebar ramps | B | **The design to reproduce.** Every value in `tokens/` traces to it; nothing was rounded or re-derived. |
| 2026-09-03 | Company description: cross-border fashion and lifestyle, Bangladesh home market, India/UAE/UK phased rollout, bilingual English/Bengali throughout | — | Context |
| 2026-09-04 | Two e-commerce screenshots — a fashion concept and a tactical/utility site | A | **Reference for the feel only.** Explicitly not reproduced; see "Trade dress" below. |
| 2026-09-04 | SRS v3.0 Chapter 9 + Appendix I | — | Governing document |
| 2026-09-05 | AdminCN free admin template (Next.js/shadcn, MIT) | A | **Layout vocabulary for the back office only.** No colour, size, radius or file taken. |
| 2026-09-05 | ADR-001 revising the NFR-PERF-19 payload budget from 15KB to 40KB | — | Binding constraint |

### What was re-asked (UI-SRC-4)

The bundle was incomplete against Appendix I in three specific ways, and each was raised as a
targeted question rather than filled by inference:

1. **No Bengali type.** The theme block named two Latin faces and nothing for Bengali, which
   UI-INV-5 requires. Asked; answered "propose one".
2. **No palette premise.** The theme block supplied neutrals and a chart ramp but no statement of
   whether the interface should carry a brand colour. My initial reading — that the greyscale
   neutrals *were* the premise, with colour coming only from merchandise — was **wrong and was
   rejected on 2026-09-05**. See "The accent decision" below.
3. **No component inventory.** No source defined one. The standard set was built and the four
   Void-specific additions were named as such (`Icon`, `ProductCard`, `SideNav`, `DataTable`).

### Trade dress

The two screenshots are inspiration, not designs to reproduce. The tactical/utility reference
contributed *labelling discipline, column alignment and data-forward presentation* — structural
habits, not identity. Explicitly not taken: camouflage, stencil or military display type, khaki,
tactical iconography, "loadout" language. Reproducing another company's distinctive trade dress
is a legal exposure rather than a shortcut, and is recorded here as declined rather than quietly
done.

The same applies to AdminCN. It supplied the back office's *layout vocabulary* — persistent
sidebar with uppercase tracked group labels, slim topbar with breadcrumb, thin-bordered surfaces
with an icon chip on each statistic, nested metric tiles, a donut for goal progress. Every colour,
size and radius in the built admin resolves through a Void token (UI-SRC-9). No AdminCN file is
copied into the project or redistributed.

## Decision

Adopt the supplied theme block as the primitive tier, derive the semantic tier from Appendix I, and
publish the whole as `tokens.json` — a validated data file, versioned and immutable once activated.
`tokens/*.css` is the emitted artefact; `tokens.json` is the contract.

Direction, stated so it can be argued with: **tactical/utility structure carrying fashion
imagery** — the labelling discipline and precise alignment of technical gear, at the imagery scale
and whitespace of editorial fashion. Every value is labelled and aligned to a column; identifiers
and money are monospaced; specs read as a ruled table rather than prose; the photograph is the only
thing on screen allowed to be large and soft. Light is the default scheme, dark the alternate.

### The accent decision

Decided 2026-09-05, replacing my inference. **Signal orange, always on.**

`--accent-text` is `oklch(0.52 0.19 45)` (5.94:1 on canvas) and `--accent-fill` is
`oklch(0.66 0.20 50)` carrying near-black type (5.39:1). The same hue cannot do both jobs at one
lightness, so the roles are split by lightness and the pairing rules are absolute: type on the
canvas uses `.text` and never `.fill`; a fill uses `.fill` and carries `.onFill`, never white.

Scope is the commerce and data layer — links, sale price, sale badge, rating, active indicator —
plus exactly one fill per view, reserved for the single most important commerce action. Black
remains the primary action colour, because UI-INV-12 makes product supremacy a commerce
requirement rather than a taste.

There is no `data-palette` attribute, no toggle and no greyscale variant of the accent tokens.
Anything that reaches an implementer renders one way only.

**Rejected alternative:** the achromatic system as originally built, with accent tokens resolving
to neutrals so components read identically under either palette. It was defensible and it was not
what the Product Owner wanted. Preserved for reference in `explorations/accent-decision.html` and
`explorations/palette-decision.html`; neither is shipped and neither is reachable from the kits.

## Adaptations made for invariant compliance (UI-SRC-12)

The Product Owner is entitled to know what changed and why. `tokens.json` → `meta.adaptations`
carries the machine-readable list; in prose, the ones that alter the supplied theme's intent:

- **Font strategy replaced wholesale (UI-INV-9).** The theme named `--font-geist-sans` and
  `--font-geist-mono` with no delivery strategy. Five faces are now self-hosted and subset, with
  `font-display: swap` and two preloaded on the critical path. A template's font strategy is
  replaced if it does not subset, self-host and preload.
- **A third family added (UI-INV-5).** Anek Bangla ships as `Void Bengali` under a `:lang(bn)`
  scope that also raises `--leading-relaxed` from 1.65 to 1.8. The supplied theme was Latin-only.
- **Every feedback tone split into four roles (UI-INV-1).** The theme had one value per tone. No
  single value is legible both as type on the canvas and as a fill, so each tone now carries
  `-text` / `-bg` / `-border` / `-solid` + `-on-solid`. Amber fills carry near-black type at
  9.41:1; white on amber measured 1.9:1 and is prohibited.
- **`--border-control` introduced (UI-INV-1).** The theme's border colour measures 1.24:1, which
  cannot serve as the boundary of an interactive control needing 3:1. The decorative border and
  the control boundary are now separate roles.
- **Default control height raised from 36px to 44px (UI-INV-3).** The 36px step survives, scoped
  to the pointer-only surfaces listed in `readme.md` and only where the hit area is expanded to
  `--touch-target-min`.
- **Body text pinned to 16px (UI-INV-4).** The 11–14px steps are scoped to dense portal chrome,
  table cells, labels and eyebrows. Never body, never product copy.

## Decisions made in the Product Owner's absence (UI-SRC-5)

Disclosed, not silent. Each is reviewable and reversible.

1. **Bengali face: Anek Bangla** (OFL-1.1, Ek Type). It matches Geist's low-contrast,
   near-geometric build and carries the eleven GSUB features Bengali conjuncts need. **Awaiting
   confirmation.**
2. **`font.weight.semibold` and `.bold` both resolve to 500.** Appendix I requires the tokens to
   exist; only 400 and 500 exist as subset files. Pointing them at 600/700 would make the browser
   synthesise a faux weight, which is worse than a system that admits its range.
3. **`color.commerce.trust` resolves to the success tone.** No trust colour was supplied and the
   palette carries one accent hue, which is already spoken for.
4. **Photography: grey plates.** No imagery was supplied. Product media renders as flat
   `--bg-surface-sunken` rectangles at real aspect ratios (4:5 portrait, 1:1 thumbnail) so
   composition reads correctly. Confirmed 2026-09-05: placeholders stay until real shots land in
   `assets/photography/`. **Never substitute a drawn illustration for a photograph.**
5. **Wordmark: the word *Void*** set in the 500 weight, uppercase, at `--tracking-widest`. No logo
   was supplied. **Do not draw, reconstruct or approximate a Void logo.**
6. **Icon set: Lucide** (ISC), subset to the 44 symbols the built code uses, self-hosted as one
   SVG sprite. Authorised by the Product Owner 2026-09-05. If Lucide lacks a glyph, use a text
   label and raise it as a gap — do not hand-draw one.
7. **Bengali interface copy is untranslated.** The locale is wired at token level and the harness
   renders under `lang="bn"` so the type stack is reviewable, but the strings are English with a
   draft Bengali pass on the chrome and one full surface. See "Open items".

## Consequences

The identity is a data file. Replacing `tokens.json` restyles the application with no component
change, which is what UI-SRC-10 asks an automated test to prove. Versioning and rollback (UI-SRC-13)
operate on a document rather than a release. The admin token editor (UI-SRC-14) has a schema to
validate against on save.

The cost is that the CSS custom property names and the contract's dotted names are two vocabularies
for one set of values. They are not derivable from one another — the CSS names predate the contract
and are load-bearing in shipped components — so every semantic token carries an explicit `cssVar`
and the mapping is stated rather than computed. A generator that emits `tokens/*.css` from
`tokens.json` is the follow-up that removes the risk of the two drifting.

## Open items

- **Confirm or replace Anek Bangla.** The one substitution still awaiting a decision.
- **Real photography** into `assets/photography/`.
- **Bengali translations.** UI-SRC-8 asks for both locales; the type stack is reviewable but the
  copy is not translated. Machine output was declined.
- **Geist OFL text** is not in the project. See `docs/licences/README.md`.
- **A `tokens.json` → `tokens/*.css` generator**, so the two cannot drift.
