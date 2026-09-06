# Handoff — Void design system → implementation

For a developer (or Claude Code) implementing Void's interface in a real codebase. Written to be
self-sufficient: someone who was not in the design conversation should be able to work from this
file plus the paths it names.

## What this project is

A **design system**, not a feature mock. It carries the token contract, a component library, five
UI kits and the specimen cards. Consuming projects bind it and get the tokens and components; they
do not copy screens out of it.

**Fidelity: high.** Final colours, type, spacing, radii, motion and states. Every value resolves
through a token, and the contrast of every pairing in both schemes is measured. Recreate the
layouts faithfully; do not re-pick values.

## What the files are, and what to do with them

The `.dc.html` / `.jsx` files under `templates/` are **design references written in HTML** — real,
interactive, correct to the token system, but not production source. The job is to **recreate them
in the target codebase's environment** (React, Vue, SwiftUI, native) using that codebase's
established patterns, with `tokens.json` driving the values.

Two things transfer literally and should not be reinterpreted:

1. **`tokens.json`** — the contract. Appendix I of the SRS makes the identity a data file; this is
   that file. Generate the target platform's theme from it.
2. **`tokens/*.css` and `assets/`** — the emitted CSS custom properties, the five subset font
   binaries and the 44-symbol Lucide sprite. A web target can adopt these as-is via `styles.css`.

Everything else — the component JSX, the kit screens — is a description of intent in the most
precise notation available. Read the structure, the states and the copy off them; rebuild the
mechanics in the target's idiom.

## Start here

| Read | For |
| --- | --- |
| `tokens.json` | The contract. Every semantic token, both schemes, with its `cssVar`, plus `meta.adaptations` and the V1–V12 status. |
| `readme.md` | The direction, the content rules, the visual foundations, the dense-surface allowlist, the component index. |
| `docs/adr/0007-design-source.md` | Where the design came from, what was adapted for accessibility, and every decision made without the Product Owner. Read before changing a value. |
| `docs/adr/0001-theme-payload-budget.md` | The 40KB critical-path budget the font strategy is built to. |
| `guidelines/contrast-report.md` | Measured ratios, 100 pairings. The evidence behind V2. |
| `docs/licences/README.md` | What ships and under what licence. One outstanding item. |

## Surfaces

Each is a `templates/<slug>/` folder with a `.dc.html` entry, a `ds-base.js` that loads the system,
and its own README where one exists.

| Surface | Entry | What it covers |
| --- | --- | --- |
| Storefront | `templates/storefront/Storefront.dc.html` | Homepage, listing + filters, product detail, bag, checkout, confirmation, order detail, account, help centre, 404, 500. Eleven screens × four states × two schemes × two locales × 1440/320. |
| Void Studio | `templates/studio/Studio.dc.html` | Full-viewport garment design surface: tool rail, neutral canvas, properties panel with live price, print warnings, first-run walkthrough, mobile bottom-toolbar layout. |
| Vendor + designer portals | `templates/portals/Portals.dc.html` | One shell, `role` prop switches. Order queue, catalogue, per-product market coverage, settlement; designs, performance, royalties. |
| Admin back office | `templates/admin-dashboard/AdminDashboard.dc.html` | Shell, overview, dense order list, and eleven operational destinations from the customs queue to the design-token editor. |
| Authentication | `templates/auth/Auth.dc.html` | Ten screens: sign-in and its failure, registration with breach-checked strength, SMS and authenticator codes, reset, lockout, guest lookup, sessions. |

Each kit's entry takes harness props (screen, state, scheme, width, locale, market). Those axes are
review scaffolding — the URL/prop harness is the artefact UI-SRC-8 asks for, not part of the
product. Do not port the toolbar.

## The rules that are not negotiable

These are contractual or legal in the SRS, not stylistic. A build that breaks one is defective
regardless of how it looks.

- **No literals (UI-SRC-9).** No colour, font, size, weight, line height, spacing, radius, shadow,
  border width, z-index, breakpoint, duration or easing value as a literal in component code,
  inline style, or a utility class that hard-codes it. Enforce with a lint rule that fails CI.
- **Four states on every async surface (UI-GLOB-1).** Loading is a skeleton mirroring the real
  layout, never a spinner alone. Plus empty, error-with-retry, populated. A blank screen is never
  acceptable.
- **44 × 44 px minimum target (UI-INV-3).** `--control-h-md` is 44px and is the default. The 36px
  step is allowlisted to the pointer-only surfaces in `readme.md` and only with the hit area
  expanded via `.void-touch-safe`.
- **16px body minimum (UI-INV-4)**, layout survives 400% zoom without horizontal scroll.
- **Logical properties only (UI-INV-7).** `padding-inline`, `inset-block-start`, `margin-inline-end`
  — never `left`/`right`/`padding-left`. An RTL locale must need no structural rewrite.
- **40% text expansion (UI-INV-6).** No fixed-width control sized to English copy.
- **`prefers-reduced-motion` (UI-INV-8).** Handled centrally in `tokens/base.css`; do not
  reintroduce animation that escapes it. Nothing exceeds 800ms.
- **Self-hosted assets only (UI-INV-13).** No font, icon, stylesheet or script from a third-party
  origin. **The specimen and harness files load React and Babel from a pinned CDN because that is
  how this environment previews JSX — the product build must not inherit those script tags.**
- **Honest interface (UI-INV-11).** Prices, stock, delivery estimates and scarcity are always
  true. No fabricated urgency, no pre-ticked consent, no making cookie rejection harder than
  acceptance. Unlawful in several enabled markets.
- **Locale-driven numbers (UI-GLOB-9).** Never concatenate a symbol onto a grouped string.
  `VoidFormat` in `templates/storefront/StorefrontExtra.jsx` shows the shape: grouping, decimals
  and numeral system from `Intl.formatToParts`, with the symbol *position* set by Void's own rule
  and that override disclosed in comment.
- **Studio is exempt from theming (UI-SRC-15, UI-STU-10).** The artwork canvas surround is a fixed
  neutral grey that does not follow the colour scheme, because the customer judges their own
  colours against it. Do not "fix" this to match the theme.

## Five CI gates to build

The design side of UI-SRC-9 … UI-SRC-11 and ADR-0001 is done; the enforcement is engineering work
and does not exist yet. Without these, every rule above is a convention.

1. **Token-literal lint.** Fails the build on a raw colour, size, duration or z-index in component
   code. `_adherence.oxlintrc.json` at the root is this environment's own adherence config and is a
   useful starting shape, but it is generated for the design-system host — write the real rule for
   the target repo.
2. **Token-set validator (UI-SRC-11).** Runs V1–V12 from `tokens.json` → `validation` and reports
   failures per token with the rule cited. A set that fails cannot be activated. The statuses in
   the file are self-reported; the validator must re-derive them.
3. **Theme-swap test (UI-SRC-10).** Renders the preview surfaces under at least two materially
   different token sets and asserts no layout break, no clipped text, no contrast failure, no
   component throw. A component that only works under one theme is defective.
4. **Critical-path budget check (ADR-0001).** Fails if token CSS + Geist 400/500, compressed,
   exceeds 40KB. Currently 34,762 B.
5. **Bengali advisory check (ADR-0001).** Warns if the Bengali pair exceeds 110KB. Currently
   102,960 B. Advisory, not gating.

Also required by the SRS and absent by design here: the **placeholder token set** (UI-SRC-7) that
ships with seed data, is visibly marked provisional outside production, and fails the release gate
if active in production. Void's design source arrived before styling began, so no placeholder was
ever built — implement it as the seed fixture, not as a theme.

## Requirement coverage

Everything in SRS Chapter 9 that the design system is responsible for.

| Requirement | Where |
| --- | --- |
| UI-SRC-1..6, 12 | `docs/adr/0007-design-source.md` |
| UI-SRC-8 preview surfaces | `templates/storefront/` harness — every axis on one entry |
| UI-SRC-13 versioning | `tokens.json` → `meta.version`; immutability is a runtime concern |
| UI-SRC-14 admin token editor | `templates/admin-dashboard/` → Design tokens destination |
| UI-SRC-15, UI-STU-10 | `templates/studio/` — fixed neutral canvas surround |
| UI-INV-1..13 | `tokens/`, `guidelines/contrast-report.md`, `tokens.json` → `meta.adaptations` |
| UI-GLOB-1..4, 7, 8 | Every kit; state rules in `templates/storefront/README.md` |
| UI-GLOB-5, 10 | Header market control at every width; footer selector |
| UI-GLOB-6 | Storefront `notfound` and `servererror` screens |
| UI-GLOB-9 | `VoidFormat` in `templates/storefront/StorefrontExtra.jsx` |
| UI-HOME-1..7 | Storefront `home` |
| UI-PLP-1..7 | Storefront `listing` |
| UI-PDP-1..9 | Storefront `detail` |
| UI-STU-1..10 | `templates/studio/` |
| UI-CHK-1..9 | Storefront `cart`, `checkout`, `confirm` |
| UI-ACC-1..3 | Storefront `account`, `order` |
| UI-ACC-4 | Storefront `help` |
| UI-PTR-1..4 | `templates/portals/` |
| UI-ADM-1..5 | `templates/admin-dashboard/` |
| FR-AUTH-1..19 (UI) | `templates/auth/` |

## Open items

Carried from `docs/adr/0007-design-source.md`; none is a design decision left dangling, each needs
material or a Product Owner answer.

1. **Geist OFL text** is not in `docs/licences/`. Drop it in from upstream before release — rule
   V11 gates on the record resolving. The licence position itself is not in doubt.
2. **Bengali translations.** The locale is wired, the type stack and numerals are correct and
   reviewable under `lang="bn"`, and the harness marks itself as untranslated. The strings are
   English. Machine translation was declined; UI-SRC-8's "both locales" is not fully met until real
   copy lands.
3. **Photography.** Product media is flat `--bg-surface-sunken` at real aspect ratios (4:5, 1:1).
   Real shots go in `assets/photography/`. **Never substitute a drawn illustration.**
4. **Anek Bangla** as the Bengali face is a disclosed default awaiting confirmation.
5. **A `tokens.json` → `tokens/*.css` generator**, so the contract and the emitted CSS cannot
   drift. Today the mapping is maintained by hand via each token's `cssVar`.
6. **No Void logo exists.** The wordmark is the word *Void* in the 500 weight, uppercase, at
   `--tracking-widest`. **Do not draw, reconstruct or approximate one.**

## Assets

| Asset | Path | Note |
| --- | --- | --- |
| Fonts | `assets/fonts/` | Five subset `.woff2`. Subsetting commands and verification steps in the README beside them. Preload the two Geist faces; Bengali loads per-locale. |
| Icons | `assets/icons/void-icons.svg` | One sprite, 44 Lucide symbols, read through `<use>` by `Icon`. Geometry only — `Icon` supplies stroke, width, linecap, linejoin. If a glyph is missing, use a text label and raise it; do not hand-draw one. |
| Photography | — | Not supplied. See open items. |
