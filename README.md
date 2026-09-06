# Void

Cross-border fashion and lifestyle e-commerce. Bangladesh home market, phased rollout to India, UAE
and UK. Bilingual English / Bengali throughout.

The governing document is **`Void_SRS_v3.0.md`** — every requirement identifier cited in this repo
(`UI-SRC-9`, `FR-TAX-6`, `DR-GEN-10`, `V1`–`V12`) refers to it. Read its **Build-Agent Protocol**
before writing code; its six rules are not advisory.

## Layout

Follows SRS Appendix G.2.

| Path | What it is |
| --- | --- |
| `apps/web/` | Next.js 15 storefront. Serves the generated theme from `public/theme/`. |
| `packages/tokens/` | **The contract.** Token sets, the generator, the V1–V12 validator, the fonts and icon sprite. |
| `packages/ui/` | Component layer. Consumes tokens, never literals. |
| `apps/web/app/preview/` | The UI-SRC-8 preview surface. Gate 3 renders this page, so it is also the component test suite. |
| `packages/config/` | `eslint-plugin-void` — the token-literal and `next/font` rules. |
| `scripts/gates/` | The CI gates that make the rules enforceable rather than conventional. |
| `docs/adr/` | Decision records. Read `0007` before changing any design value. |
| `design-system/` | **Read-only reference.** Excluded from build and lint — see below. |

### `design-system/` is reference, not source

It holds the design system as delivered: 18 components, five UI kits, 20 specimen cards, the
contrast report. `HANDOFF.md` is explicit that the `.jsx` and `.dc.html` files are *"design
references written in HTML … not production source"* — you read the structure, the states and the
exact copy off them, then rebuild the mechanics here.

It is excluded from lint and build so that rule is structural rather than a matter of discipline,
and so its harness files — which load React and Babel from a CDN *by design*, because that is how
the design tool previewed JSX — are not reported as UI-INV-13 violations in code that never ships.

Two things in it transfer literally and are already wired: `tokens.json` (now
`packages/tokens/sets/void-default.json`) and the assets.

## The token pipeline

`tokens.json` is the identity; `tokens/*.css` is an emitted artefact. Everything that styles the
product is generated from the contract, so the two cannot drift:

```
packages/tokens/sets/void-default.json
        │
        ├── apps/web/public/theme/tokens.css   runtime custom properties, @font-face, base
        ├── packages/tokens/dist/tailwind.css  @theme inline — utilities emit var(--token)
        ├── packages/tokens/dist/contract.css  Appendix I dotted-path binding (admin editor)
        └── packages/tokens/dist/tokens.d.ts   token-name union, so a typo is a type error
```

```bash
npm run tokens:generate    # regenerate from the contract
npm run gates              # all five gates
```

Two rules worth knowing before you edit anything here:

- **Component code references the semantic tier only** (`--fg-primary`, `--space-4`). The primitive
  tier exists so semantic tokens have something to point at, and the lint rule enforces the boundary.
- **The theme is a static stylesheet, not a bundled import.** A bundler would inline and reorder it,
  which makes the ADR-0001 budget unmeasurable and forecloses the runtime theme swap that UI-SRC-10
  requires. `next/font` is banned for the same reason.

## Adding a component

1. Build it in `packages/ui/src/`. Server Component unless it genuinely needs
   state — hover, press, focus and disabled are CSS, not React.
2. Add it to `apps/web/app/preview/page.tsx`, in **every** state it has.
3. `npm run gates`.

Step 2 is not optional and is not documentation. Gate 3 renders that page under
both token sets at 320 and 1440, light and dark, en and bn, and asserts no
overflow, no clipped text, no sub-44px target, no console error. A component that
is not on the preview page is a component nothing tests; one that is gets sixteen
renderings for free.

Components are **Server Components unless interaction genuinely requires otherwise** — hover,
press, focus, checked, disabled and invalid are all CSS. Only three modules are `"use client"`:
`Dialog` (needs `showModal()`), `Tooltip` (document-level Escape) and `Tabs` (roving focus).
`ADR-0010` records every place the component layer departs from the design-system reference, and why.

Two pairs look alike and are deliberately not interchangeable. **`Tabs` switches panels within a
page; `TabLinks` navigates between routes** — `role="tab"` on a navigation link tells assistive tech
the content is already present, when the page is about to change. **`Badge` is never interactive;
`Tag` is** — which is why only one of them is exempt from the 44px minimum.

`AsyncSurface` is how UI-GLOB-1 is enforced rather than remembered: every state —
loading skeleton, empty, error-with-retry, populated — is a required prop, so
omitting one is a compile error. Use it for anything that loads.

## The five gates

Until these existed every rule in `HANDOFF.md` was a convention. All five run in CI on every PR.

| Gate | Rule | What it does |
| --- | --- | --- |
| 1 · token-literal lint | UI-SRC-9 | Fails on a colour, size, duration, easing or z-index literal in style objects, **Tailwind arbitrary values** (`w-[13px]`, `bg-[#fff]`) or raw CSS. |
| 2 · token-set validator | UI-SRC-11 | Re-derives V1–V12 from the set and its emitted CSS. Never reads the set's own `validation` block. |
| 3 · theme swap | UI-SRC-10 | Structural parity between sets, plus a rendered pass in Chromium at 320/1440 × light/dark × en/bn. |
| 4 · critical-path budget | ADR-0001 | Token CSS + the faces marked `criticalPath`, gzipped, under 40KB. Currently **31,492 B (76.9%)**. |
| 5 · Bengali advisory | ADR-0001 | Warns above 110KB. Currently 102,960 B. Advisory, not gating. |
| + · dead utilities | UI-SRC-9 | Fails on a Tailwind utility that compiles to nothing. Tailwind emits no error for an unknown theme key, so an inert `hover:border-line-strong` otherwise ships looking correct. |

Tailwind theme keys derive from a token's **cssVar**, not its dotted path: `--fg-primary`
becomes `text-fg-primary`, not `text-text-primary`. Deriving from the path produced names nobody
guesses, so utilities were written against the cssVar and silently compiled to nothing — 28 of them
before the dead-utility gate existed. The composite/alias tier (`--line-strong`, `--muted`,
`--primary`) is deliberately *not* in the theme, because component code references the semantic tier
only; reach for `border-border-strong`, not `border-line-strong`.

Note also that Tailwind v4 has no `--duration-*` namespace. Durations are written as
`duration-[var(--duration-fast)]`, which is still a token reference.

Gate 2 evaluates contrast against the **generated cascade**, not the JSON, because the cascade is
what ships — `accent.css` deliberately overrides link, price, badge and rating roles defined
earlier, and a check reading only the token tier would grade a stylesheet nobody serves.

### Waivers

A known failure may be waived only in `packages/tokens/waivers.json`, with an owner, a reason and an
expiry — the discipline FR-MKTS-14 applies to a market-readiness item. A waiver suppresses the exit
code, never the finding: waived failures print on every run, and an expired waiver is fatal again.

One waiver is open: **ADR-0009**, the star rating's non-text contrast under the accent palette.

## Open items

| Item | State |
| --- | --- |
| **J-2** — international payment route | Founder's, with counsel and the AD bank. Not resolved by inference. Reverses ADR-0002's build/adopt decision if it lands on Route B. |
| **ADR-0009** — rating contrast | Genuine WCAG 1.4.11 failure. Needs a design decision; recommendation is option B. Waived to 2026-12-05. |
| Bengali interface copy | Locale is wired and correct — face, leading, numerals, grouping. Strings are English. Do not machine-translate. |
| Photography | None supplied. Plates render as `--bg-surface-sunken` at real aspect ratios. Never substitute an illustration or an AI-generated image. |
| Anek Bangla as the Bengali face | Disclosed default awaiting confirmation (ADR-0007). |

Two items previously carried as open are **closed**: Geist's OFL text was not missing but deleted
from the working tree, and is restored; the `tokens.json` → CSS generator now exists.

There is **no Void logo**. The wordmark is the word *Void* in the 500 weight, uppercase, at
`--tracking-widest`. Do not draw, reconstruct or approximate one.
