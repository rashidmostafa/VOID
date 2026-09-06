# ADR-0010 — Where the component layer departs from the design-system reference

**Status:** Accepted
**Date:** 2026-09-07
**Affects:** `packages/ui/src/**`
**Related:** SRS Build-Agent Protocol rule 6, `docs/HANDOFF.md`, UI-INV-2/3/6/7/8, UI-GLOB-1, FR-MKTS-4

---

## Context

`HANDOFF.md` is explicit that the components under `design-system/components/` are *"design
references written in HTML — real, interactive and correct to the token system, but not production
source"*, and that the job is to *"read the structure, the states and the copy off them, then
rebuild the mechanics in the target's idiom."*

Rebuilding surfaced defects that are invisible in a browser harness and load-bearing in a shipped
storefront. Build-Agent Protocol rule 6 requires every deviation to be recorded, so they are
recorded here rather than in twenty separate files.

Nothing here changes a **value**. Colours, sizes, spacing, radii and motion are the design's
throughout; where the reference carried a value as an unnamed literal it was added to the token
contract with the shipped value preserved. Values are ADR-0007's to change, not this one's.

## The one structural decision

**Components are Server Components unless interaction genuinely requires otherwise.** The reference
tracks hover, press and focus in `useState` because it renders inside a browser harness where that
costs nothing. In the App Router it makes every button, card and text field a Client Component in
order to change a colour — against the LCP and CLS budgets the catalogue is server-rendered for.

Hover, press, focus, checked, disabled and invalid are all CSS states. Nineteen of the twenty-two
modules ship no client JS at all. Only three are marked `"use client"`, and each for a reason that
CSS cannot cover: `Dialog` must call `showModal()`, `Tooltip` needs a document-level Escape
listener, and `Tabs` needs roving focus management. The home route stays at 120 B; the preview
surface rendering every component in every state costs 6.68 kB, which is what those three islands
weigh.

## Corrections, and why each is a defect rather than a preference

| Component | Reference behaviour | Why it does not survive | Now |
| --- | --- | --- | --- |
| `Dialog` | Modal as a fixed `<div>` | No focus containment, no Escape, no focus restoration, no inert background, and an ad-hoc `zIndex: 60` — which `tokens.json` forbids outright | Native `<dialog>` + `showModal()`. The browser supplies all of it, and the top layer means **no z-index at all** |
| `Tooltip` | `pointer-events: none`, no key handling, `role="tooltip"` linked to nothing | Fails all three WCAG 1.4.13 conditions and is unreadable by a screen reader | Hoverable, Escape-dismissible from the document (hover leaves focus elsewhere, so a wrapper handler never sees the key), wired with `aria-describedby` |
| `Toast` | Every toast `role="status"` | A polite live region queues behind whatever is speaking. Correct for "Saved"; wrong for "bKash rejected the transfer" | Tone selects the role: warning/danger are `alert`/assertive, neutral/success stay polite |
| `Tag` | `onClick` on a `<span>` | Not focusable, not announced as a control, not keyboard-operable | Renders a real `<a>` or `<button>` |
| `Tag` | Callback-driven | FR-MKTS-4 requires filtered listings to be crawlable URLs; a chip that needs JS cannot produce one | `href` or form submission. A callback chip remains possible in a client wrapper |
| `Checkbox`, `Radio`, `Switch` | 16px box in a content-height label | Effective target far below 44px (UI-INV-3) | Box unchanged; the label row carries `--touch-target-min`, with an explicit `dense` opt-out for the readme allowlist |
| `IconButton` | `sm` 32px, `md` 38px | Both under the minimum, with nothing to stop a storefront using them | `.void-touch-safe` applied automatically below 44px — visual size unchanged, hit area compliant |
| `Switch` | Knob animated with `left` | Physical: in RTL the track mirrors but the knob slides the wrong way (UI-INV-7, FR-I18N-12) | `inset-inline-start`; verified mirroring in both directions |
| `Input` | Focus ring suppressed when `error` is set | Leaves an invalid field with no focus indicator — exactly where a keyboard user will be (UI-INV-2) | Ring always drawn |
| `Input`, `Select` | Hint and error connected to nothing | FR-CHK-3 requires inline specific errors; a screen reader user was told neither that the field was invalid nor why | `Field` wires `aria-describedby`, `aria-invalid`, `aria-required`, `role="alert"` once for every field |
| `Card` | Hover adds `--shadow-sm` | `readme.md`: "No lift, no shadow growth on hover" | Border moves to `--border-strong`; nothing else |
| `Radio` | `name` optional | A radio outside a group can be selected and never deselected | `name` required |
| All | Disabled at 0.45 / 0.5 / 0.6 across seven components | `readme.md` specifies 45% | `--opacity-disabled`, one value |
| `Button` | Fixed height + `whitespace-nowrap` | The exact shape UI-INV-6 names: a 40%-expanded label overflows rather than wrapping | `min-height`, label may wrap. Single-line buttons unchanged at 44px |
| `Tabs` | `role="tab"` with no `tablist`, no `aria-controls`, no panels, no roving tabindex | An incomplete ARIA pattern: the grouping is lost, nothing connects a tab to what it controls, and every tab is a tab stop instead of the tablist being one | Full pattern — `tablist`, `aria-controls`/`aria-labelledby`, roving tabindex, Arrow/Home/End with direction following the writing mode |
| `Tabs` → `TabLinks` | One component for both in-page panels and route navigation | `role="tab"` on a navigation link promises the panel is already present and about to be revealed, when the page is about to change. It also loses middle-click, new tab, copy-link and an indexable URL (FR-MKTS-4) | Split: `Tabs` for in-page panels, `TabLinks` for routes as a `<nav>` of links with `aria-current="page"` |
| `SideNav` | Items are `<button onClick>` | Navigation destinations with no address — cannot be middle-clicked, opened in a new tab, copied, bookmarked or restored on reload. Admin destinations are routes | Links with `href` and `aria-current="page"` |
| `SideNav` | `border-right`, `text-align: left` | Physical properties; wrong in RTL (UI-INV-7) | `border-inline-end`, `text-align: start` |
| `SideNav` | 34px rows | Under the minimum, and navigation is **not** on readme.md's dense allowlist. `.void-touch-safe` is wrong here: full-width stacked rows would get overlapping hit areas and land clicks on the neighbour | 44px default; 34px available as `dense` for the pointer-only chrome the allowlist does cover |
| `Tabs`, `SideNav` | `font-weight` changes between states | The row reflows on selection. readme.md also specifies 500 for "every heading and control label" | Uniform `--weight-medium`; state is carried by the underline, pill or background |
| Spinner, shimmer, dialog animation | Component-level `<style>` blocks | Escape the central `prefers-reduced-motion` rule (UI-INV-8) | Declared in the theme's base layer, where that rule reaches them |

## Consequences

**Positive.** The invariants are enforced by construction rather than by review: a field cannot be
built without its error wiring, an async surface cannot be built without its four states
(`AsyncSurface` makes each a required prop), and a sub-44px control carries its own hit-area
expansion. Almost the whole library server-renders.

**Negative.** `Tag`'s API differs from the `.d.ts` in the design system — `onClick`/`onRemove` are
replaced by `href`/`removeHref`/`removeName`. Anyone reading the reference `.d.ts` as the contract
will find a mismatch, which is why it is recorded here. The same applies to `ErrorState.retry` and
`Toast.dismiss` taking nodes rather than callbacks, which is what keeps them server-renderable.

**Also negative.** Native `<dialog>` requires Chrome 37+, Firefox 98+, Safari 15.4+. That is
comfortably inside the support matrix, but it is a hard dependency rather than a progressive
enhancement: without it there is no modal at all.

## Verification

Every claim above was checked in a browser rather than reasoned about, because several of these
defects look correct in source. Three were found only by measuring: the Switch's RTL mirroring, the
28 Tailwind utilities that compiled to nothing (see the dead-utility gate), and the Bengali face
never applying to a Bengali run inside an English page (see the generator's `:lang(bn)` composite
redeclaration). The theme-swap gate now renders the real preview surface under both token sets at
320 and 1440, light and dark, en and bn, so a regression in any of them fails CI.
