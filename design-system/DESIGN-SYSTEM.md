# Void — Design System

Void is a cross-border fashion and lifestyle e-commerce company. Bangladesh is the home market, with a phased international rollout (India, UAE, UK first). The whole interface is bilingual English / Bengali.

Five surfaces sit on this system:

| Surface | Who uses it | Character |
| --- | --- | --- |
| **Storefront** | Shoppers, BD + international | Editorial, light, full-bleed photography, minimal chrome |
| **Void Studio** | Shoppers customising a garment in-browser | Dark canvas, tool rail, live preview, dense controls |
| **Designer marketplace** | Independent designers and their shoppers | Storefront vocabulary + designer identity and shop pages |
| **Vendor portal** | Merchants and designers selling on Void | Sidebar app, tables, forms, payouts |
| **Admin back office** | Void staff | The vendor portal at higher density — moderation queues, ops |

## Sources given

- **Theme CSS** pasted in the brief: a Tailwind v4 / shadcn-style `@theme inline` block plus `:root` and `.dark` token sets (`--background`, `--primary`, `--radius: 0.625rem`, `--font-geist-sans`, `--font-geist-mono`, chart and sidebar ramps). Every value in `tokens/` is copied from it verbatim; nothing was rounded or re-derived.
- **Company description** in the brief (products, markets, bilingual requirement).
- **No codebase, no Figma file, no screenshots, no slide deck, no logo, no photography, no icon set** were provided. Everything marked *substitution* or *awaiting source* below is a stand-in.

- **Two reference screenshots** (`uploads/`): a fashion e-commerce concept and a tactical e-commerce site — supplied as *references for the feel*, not designs to reproduce.
- **SRS v3.0 Chapter 9 + Appendix I** (`uploads/void-srs-ui-extract.md`): the UI requirements and the Design Token Contract. This is the governing document. Token IDs cited throughout this file (UI-INV-*, V1–V12) refer to it.

## Direction

**Tactical/utility structure carrying fashion imagery.** The labelling discipline, precise
alignment and data-forward presentation of technical gear, at the imagery scale and whitespace of
editorial fashion. Concretely: every value is labelled and aligned to a column, identifiers and
money are monospaced, specs read as a ruled table rather than prose, and the photograph is the
only thing on screen allowed to be large and soft.

Explicitly **not** this: camouflage, stencil or military display type, khaki, tactical or weapons
iconography, "loadout" language. The register is *engineering precision*, not army surplus. Light
is the default scheme; dark is the alternate (`.dark`).

## Blocker — one asset I cannot produce

1. **Icon sprite.** `Icon` reads from a local SVG sprite via `<use>`; no icon CDN, no icon
   font. The sprite is not in the project, and I will not hand-draw a brand's icon set —
   approximated glyphs get shipped. Icons currently reserve their box and render nothing.
   Lucide (ISC) is authorised as the source set, but the glyph files still have to be dropped
   in — outbound fetches to the package CDN are blocked from here. The exact 44-symbol
   inventory the built code needs, call site by call site:
   **`assets/icons/README.md`**.

Resolved:

- **Font binaries.** All five faces are self-hosted from `assets/fonts/` — Geist 400/500,
  Geist Mono 400, Anek Bangla 400/500, subset to Latin + Bengali with GSUB/GPOS intact and
  `font-display: swap`. Verified rendering: Latin at every ramp step, Bengali conjuncts
  (হ্যান্ডলুম, স্টুডিওতে) forming correctly, Bengali numerals resolving. No third-party
  origin remains anywhere in the token closure.

Other substitutions still open:

1. **Bengali face** — Anek Bangla is my judgement call, not a given. It matches Geist's
   low-contrast, near-geometric build and covers the Bengali block with the GSUB/GPOS features
   conjuncts need; the shipped subset renders them correctly. Confirm or replace.
2. **Logo** — none exists here. The mark is the word *Void* set in Geist Medium, uppercase,
   `--tracking-widest`. **Do not draw, reconstruct or approximate a Void logo.**
3. **Photography** — no imagery was supplied. Product plates render as flat
   `--bg-surface-sunken` rectangles. Never substitute a drawn illustration for a photograph.
4. **Palette** — decided, see below.

## Palette — decided

**Signal orange, always on. Decided 2026-09-05.** The greyscale premise was my inference and
was rejected. `tokens/accent.css` now bakes the accent into `:root` and `.dark` directly: no
`data-palette` attribute, no toggle, no greyscale variant of the accent tokens. Anything that
reaches Claude Code renders one way only.

The accent is `oklch(0.52 0.19 45)` as type (5.94:1 on canvas) and `oklch(0.66 0.20 50)` as a
fill carrying near-black type (5.39:1), scoped to the commerce and data layer plus one fill per
view. Black remains the primary action colour.

*Rejected alternative:* the achromatic system as originally built — accent tokens resolving to
neutrals so components read the same under either palette. Preserved for reference only in
**`explorations/accent-decision.html`** (four-way comparison) and
**`explorations/palette-decision.html`** (earlier two-column A/B). Neither is shipped and
neither is reachable from the kits.

## Content fundamentals

**Voice.** Plain, specific, unhurried. Void writes like a shop assistant who knows the stock, not like a marketing department. State the fact, then stop.

- **Sentence case everywhere** except the eyebrow/nav/table-header layer, which is uppercase at `--tracking-widest`. No Title Case Headlines.
- **Second person for the shopper, imperative for actions.** "Track your order", "Add to bag", "Choose your fabric". Never "we're excited to", never "let's".
- **First person plural only for Void's own limits or promises**: "We deliver to 14 districts next-day." Otherwise the company stays out of the sentence.
- **No exclamation marks. No emoji anywhere** — not in UI, not in emails, not in toasts. Status is carried by a `Badge`, never by a 🎉.
- **Numbers are literal and formatted.** `৳2,450` in English, `৳২,৪৫০` in Bengali (Bengali numerals, `bn-BD` grouping). Currency symbol leads with no space. Tabular numerals for anything in a column.
- **Errors name the object and the fix**: "bKash rejected the transfer. Update the account number and retry." Not "Something went wrong."
- **Empty states are one line and one action**: "No orders yet." / "Nothing in your bag." — no illustration, no encouragement.
- **Bengali is a translation, not a transcreation.** Same information, same order, same length target. Product names, designer names and SKUs stay in Latin script in both languages.

Examples in system voice:

> New in · Autumn handloom
> Made to order in Dhaka. 7–10 days.
> Awaiting review — a Void editor checks every custom design before it goes to production.
> Payout scheduled for 12 Oct. Nothing to do.

## Visual foundations

**The premise.** The interface is achromatic — every neutral in the palette is chroma 0. Colour comes from the merchandise. That is the single rule from which the rest follows.

- **Colour.** An eighteen-step neutral ramp from `oklch(1 0 0)` to `oklch(0.145 0 0)`, chroma 0 at every step. `--action-primary-bg` is `oklch(0.205 0 0)` (near-black, not pure black) and is the only "brand" fill in the greyscale palette. Status tones are derived independently per scheme, never borrowed from the chart ramp. The chart ramp is data visualisation only — a chart hue on a button, a link, an icon or a brand surface is a defect.
- **Contrast is a gate, not a review note.** Every pairing in both schemes is measured in `guidelines/contrast-report.md` — 0 failures across 100 pairings. Two roles exist purely to satisfy it: `--border-control` (the boundary of an interactive control, ≥3:1, distinct from the decorative `--border-default`) and the four-role split on every feedback tone (`-text` / `-bg` / `-border` / `-solid` + `-on-solid`), because no single value can be legible both as type on the canvas and as a fill.
- **Type sizes.** `--text-base` is 16px and body resolves to it; the steps below (14 / 13 / 12 / 11px) are for dense portal UI, table cells, labels and eyebrows only, never for body or product copy. The ramp is fluid from `--text-xl` up. Shipped weights are 400 and 500 only.
- **Touch targets.** `--control-h-md` is 44px and is the default control height everywhere. `--control-h-sm` (36px) is not a touch size — see the dense surface allowlist below.
- **Type.** Two families. Geist for everything, Geist Mono for identifiers and money in tables, Anek Bangla under `:lang(bn)`. Weight range is narrow: 400 body, 500 for every heading and control label; 600 appears only in the wordmark. Headings track tight (`-0.015em`), display tracks tighter (`-0.03em`), the caps layer tracks wide (`0.16em`).
- **Spacing.** 4px base, `--space-05` (2px) half-step for chips and dense table padding. Editorial storefront sections breathe at 64–128px; portal density sits at 16–24px. Generous whitespace is the storefront's main compositional device — there is no ornament to fall back on.
- **Backgrounds.** Flat `--background` or flat `--muted`. **No gradients** anywhere in chrome; the only gradient in the system is the white protection wash under the size-peek strip on a product tile (`ProductCard`) and the same wash under text on full-bleed imagery. No patterns, no textures, no noise, no hand-drawn illustration.
- **Imagery.** Full-bleed photography carries the storefront: 3:4 product plates in grids, 16:9 or full-viewport for editorial. **Square corners always** (`--radius-media: 0`) — product photography is never rounded and never framed in a card. Colour vibe of the photography: natural daylight, warm-neutral, low saturation, real fabric texture, nothing that reads as filtered.
- **Borders and hairlines.** 1px is the only border width. `--border` (0.922) separates, `--line-strong` (0.87) emphasises on hover, `--foreground` marks the active tab. Hairlines do most of the structural work; a hairline is always the first choice over a shadow.
- **Shadows.** Neutral, tight, and only when something floats: `--shadow-xs` on a raised segmented pill, `--shadow-md` on a floating panel, `--shadow-lg` on a toast, `--shadow-overlay` on a dialog. Cards in a grid have no shadow. No inner shadows anywhere except `--shadow-inset-hairline` where a border cannot be used. No coloured or spread-heavy glows.
- **Radii.** `--radius: 10px` is the anchor; controls sit at 8px (`--radius-md`), cards at 10px, dialogs at 14px. Fully rounded (`--radius-full`) is reserved for `Tag`, `Switch` and avatars. Media is 0.
- **Transparency and blur.** Two uses only: the dialog scrim (`--overlay-scrim`, 55% + 2px blur) and sticky storefront headers over imagery (`--blur-panel`, 12px). Never on cards, never as decoration.
- **Motion.** `cubic-bezier(0.2, 0, 0.13, 1)`, 80–320ms. No bounce, no spring, no scale-in. Colour and border changes at 140ms; dialogs and toasts fade + rise 6px at 200ms; drawers slide at 320ms. Imagery is the one exception: product and hero photos cross-fade and scale at 600ms. `prefers-reduced-motion` kills all of it.
- **Hover.** Values shift one step, hues never change: fills go `--muted`, `--primary` goes to `oklch(0.30 0 0)`, borders go `--line-strong`, product titles gain an underline at 3px offset, product photos scale 1.03. No lift, no shadow growth on hover.
- **Press.** `transform: scale(0.985)` over 80ms. No colour change on press.
- **Focus.** Always visible: a 2px `--ring` ring at 2px offset (`--focus-ring`). Never removed, never replaced by a border colour change.
- **Disabled.** 45% opacity, `not-allowed`. No grey-out repaint.
- **Layout.** Storefront is centred at `--container-editorial` (1180px) with 24px gutters, editorial prose at 68ch. Portals are a fixed 248px sidebar plus a 56px sticky top bar, content max 1440px. Void Studio is canvas-first: a 64px tool rail left, a 320px properties rail right, canvas fills the rest. Sidebars and top bars are the only fixed/sticky elements.

## Dense surface allowlist

`--control-h-sm` (36px) and the 13px type step are admissible **only** on these pointer-only
surfaces, and only when the control's hit area is expanded to `--touch-target-min` (the
`.void-touch-safe` helper in `tokens/base.css` does this without changing visual size):

| Surface | What may use 36px | What may not |
| --- | --- | --- |
| Admin back office | table toolbars, column config, bulk-action bars, saved-view chips | anything on the mobile admin, which the SRS requires to be operable (UI-PTR-2) |
| Vendor portal, desktop only | list filters, inline row actions | order acceptance and dispatch marking — mobile-critical, always 44px |
| Void Studio, desktop only | tool rail, properties rail steppers | the persistent "Order This Design" control |
| Any surface | nothing else | storefront, checkout, account, all mobile layouts |

Everything on the storefront and in checkout is 44px minimum regardless of pointer type. A 36px
control with no expanded hit area is a defect, not a density choice.

## Iconography

- **Set:** Lucide (ISC), subset to the 44 symbols the built code uses, self-hosted as a single
  SVG sprite at `assets/icons/void-icons.svg` and read through `<use>` by the `Icon` component.
  No icon CDN, no icon font, no per-icon files, no third-party origin (UI-INV-13).
  **The sprite file is missing** — see the blocker above.
- **Sizes:** 14px in dense tables, 16px default UI, 18–20px in storefront headers and Studio tool rails. Never below 14px.
- **Colour:** `currentColor` only — inherited from the text or control it sits in, muted (`--fg-secondary`) when decorative. Never a chart hue, never two-tone, never filled.
- **Stroke:** 1.5px on a 24px grid. Sprite symbols carry geometry only; `Icon` supplies stroke, width, linecap and linejoin so one sprite serves every size and colour.
- **No icon font, no sprite sheet, no PNG icons.** No emoji, ever. No Unicode pictographs standing in for icons — the two exceptions are the 10px `▾` caret inside `Select` and the `×` glyph on dismiss controls, both intentional and both text-coloured.
- **Icons never travel alone in navigation.** Sidebar and nav items always pair a glyph with a label; icon-only controls (`IconButton`) require a `Tooltip` and an `aria-label`.
- **Do not hand-draw SVG icons for Void.** If Lucide lacks a glyph, use a text label instead and raise it as a gap.

## Index

**Root**
- `styles.css` — the single entry point consumers link. `@import` lines only.
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Agent Skills wrapper.
- `readme.md` — this file.

**`tokens/`** — two tiers, as Appendix I §I.1 requires. Component code may reference the semantic
tier only.
- `primitives.css` — raw ramps: neutral (18 steps), green / amber / red / blue status ramps, signal orange, chart.
- `colors.css` — semantic surfaces, text (`--fg-*`), borders, actions, focus, selection, both schemes, plus every v1.0 alias so the shadcn-shaped names keep resolving.
- `feedback.css` — success / warning / error / info, four roles each.
- `commerce.css` — price, sale, original, four badge pairs, rating, trust.
- `accent.css` — signal orange, baked into `:root` and `.dark`. Production default; no toggle.
- `typography.css`, `spacing.css`, `layout.css` (z-index, breakpoints, touch target, grid, border widths), `radius.css`, `elevation.css`, `motion.css`, `fonts.css`, `base.css` (the only element-level rules in the system).

**`guidelines/contrast-report.md`** — measured ratios for every pairing in both schemes and both
palettes, the two classification calls worth auditing, and a v1.0 → v1.1 change log.

**`explorations/accent-decision.html`** — the four-way palette comparison that settled the
decision. History only; the rejected greyscale column no longer reflects the shipped tokens.
**`explorations/palette-decision.html`** — the earlier two-column A/B version, superseded.

**`assets/fonts/README.md`** — the shipped font files, subsetting commands and licence notes.
**`assets/icons/README.md`** — the one blocked asset drop, with the 44-symbol inventory.

**`guidelines/`** — 20 specimen cards feeding the Design System tab, grouped Colors (neutral ramp, surfaces & text, interactive states, semantic states, chart ramp, dark theme), Type (display, headings, body & UI, mono, Bengali, eyebrow & caps), Spacing (scale, control heights, layout in use), Brand (wordmark, radius, elevation, motion, hairlines & focus).

**Components** — each with `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and one `@dsCard` HTML per directory.

- `components/core/` — **Button** (variants primary / secondary / outline / ghost / destructive / link / accent), **IconButton**, **Icon**, **Card** (+ **CardHeader**), **Badge** (tones neutral / solid / outline / success / warning / danger / info), **Tag**
- `components/forms/` — **Input**, **Select**, **Checkbox**, **Radio**, **Switch**
- `components/feedback/` — **Dialog**, **Toast**, **Tooltip**
- `components/navigation/` — **Tabs**, **SideNav**
- `components/commerce/` — **ProductCard**
- `components/data/` — **DataTable**

*Intentional additions* (no source defined a component inventory, so this is the standard set; four entries exist because Void's surfaces cannot be built without them):
- **Icon** — wrapper for the Lucide subset sprite (ISC), so the swap to Void's real icons is one file.
- **ProductCard** — the storefront and marketplace are product grids; a generic Card cannot express the plate/eyebrow/price/size-peek structure.
- **SideNav** — the vendor portal and admin back office are sidebar apps.
- **DataTable** — order, payout, listing and moderation queues are the substance of both portals.

**`ui_kits/storefront/`** — built. Product detail, product listing with filters, a checkout step
and the account page, each at 1440 and 320, in light and dark, with accent off and on, in four
states (populated, loading skeleton, empty, error with retry). This is the artefact UI-SRC-8 asks
for: one harness route driven by URL parameters (`?screen=…&state=…&scheme=…&palette=…&width=…`)
rather than a separate storybook. `ui_kits/storefront/README.md` documents the parameters, the
state rules and the two known gaps (no icon sprite, no photography).

Still unbuilt, one directory per surface: `studio/`, `marketplace/`, `vendor/`, `admin/`.

**Note on the specimen harness.** The `@dsCard` preview files load React and Babel from a pinned
CDN because that is how this environment renders JSX previews. Nothing in `tokens/` or
`components/` references a third-party origin, which is what UI-INV-13 governs. The product build
must not inherit the harness's script tags.
