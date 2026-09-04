# Icons — self-hosted sprite, file still required

## Correction first: there is no sprite in this project, and never was

Your note describes `assets/icons/void-icons.svg` as the full unsubset `lucide-static`
v1.41.0 sprite — 1,807 symbols, 500KB, with an ISC header to preserve. **That file does not
exist in this project.** It has never existed. I did not generate it, subset or otherwise.
Check `assets/icons/` — this README is the only file in it.

So there is nothing to subset down, and no existing licence header to preserve verbatim. What
follows is the inventory you asked for, which is the part I can do without the files.

Two smaller corrections while the record is open:

- **Lucide is ISC-licensed**, not MIT. You have that right and the earlier version of this
  README had it wrong. (Lucide is a fork of Feather, which is MIT; Lucide's own licence is
  ISC.) Either way redistribution with attribution is permitted, so self-hosting a subset is
  fine — the header just has to say ISC.
- I cannot download the glyphs from here. Outbound fetches to the package CDN are blocked in
  this environment; I tried, both the versioned and the `@latest` path. And I will not
  reconstruct Lucide path data from memory and label it Lucide — approximated geometry that
  claims to be someone's icon set is worse than an empty box, because it ships.

## What unblocks it

Drop either into `assets/icons/`:

1. **`lucide-static` itself** (any recent version — the `icons/` directory is what matters).
   I subset it to the list below, name the symbols, and write the ISC header from the
   package's own `LICENSE` file.
2. **Just the 44 SVGs** named below, pulled from `lucide.dev` or the package.

Then `Icon` works everywhere with no other change. Alternatively supply Void's own set and
I'll build the sprite from that instead — the symbol names stay the same, so nothing
downstream moves.

## The inventory — every icon the built code actually needs

44 symbols. Derived by reading the four storefront screens, `Shell.jsx`, and all 19 component
primitives, not from a general-purpose wishlist. Each row names the call site, so you can
delete any row you disagree with and the sprite shrinks accordingly.

### Storefront chrome and navigation (8)

| Symbol | Where |
| --- | --- |
| `menu` | `Shell.jsx` header, 320 only — currently `<Button aria-label="Menu">Menu</Button>` |
| `search` | header action; `IconButton` specimen |
| `user` | header Account action |
| `shopping-bag` | header Bag action; `Button` `iconLeft` example |
| `globe` | header EN / বাংলা switch |
| `chevron-right` | `Breadcrumb` separators; disclosure rows in Account |
| `chevron-left` | gallery previous; Checkout "Back to delivery" |
| `arrow-right` | inline forward links in Footer and empty states |

### Product detail (7)

| Symbol | Where |
| --- | --- |
| `heart` | "Save" beside Add to bag; `IconButton` specimen |
| `star` | `Rating` in `Shell.jsx` |
| `zoom-in` | gallery `Plate` affordance |
| `share-2` | product share action |
| `truck` | `Trust` row — delivery |
| `rotate-ccw` | `Trust` row — returns |
| `shield-check` | `Trust` row — authenticity |

### Listing and filters (5)

| Symbol | Where |
| --- | --- |
| `sliders-horizontal` | "Filters (2)" trigger at 320 |
| `chevron-down` | `Select` caret (replaces the 10px `▾`); `Facet` collapse |
| `chevron-up` | `Facet` expand; column sort ascending in `Table` |
| `x` | `Tag` remove (replaces the `×` glyph), filter sheet Close, `Dialog` close, `Toast` dismiss |
| `grid-2x2` | grid density toggle |

### Checkout (5)

| Symbol | Where |
| --- | --- |
| `lock` | secure-payment assurance beside the Pay button |
| `check` | completed step in the 03/04 stepper; `Checkbox` tick |
| `credit-card` | card payment method |
| `wallet` | bKash / Nagad methods; `SideNav` Payouts |
| `banknote` | cash on delivery |

### Account (6)

| Symbol | Where |
| --- | --- |
| `package` | order Track action; `SideNav` Orders |
| `download` | order Invoice action |
| `plus` | "Add address" dashed tile; quantity increase |
| `minus` | quantity decrease |
| `pencil` | address Edit |
| `trash-2` | address Remove |

### Feedback and system states (7)

| Symbol | Where |
| --- | --- |
| `circle-alert` | `ErrorState`; `Toast`/`Alert` danger tone |
| `triangle-alert` | warning tone |
| `circle-check` | success tone |
| `info` | info tone |
| `circle-help` | size guide, field hints |
| `loader` | `Button` `loading` state |
| `external-link` | outbound links |

### Referenced by component specimens (6)

Live in `components/**/*.card.html` today, so the cards render incomplete without them.

| Symbol | Where |
| --- | --- |
| `shirt` | `SideNav` Listings (`navigation.card.html`) |
| `store` | `SideNav` storefront section |
| `flip-horizontal` | `Tooltip` + `IconButton` specimen (`feedback.card.html`) |
| `copy` | Duplicate `IconButton` specimen |
| `type` | Text-tool `IconButton` specimen (`IconButton.prompt.md`) |
| `clock` | order timestamps, dense table meta |

Not included: the Studio, marketplace, vendor and admin glyphs from the earlier ~60-item
list. Those surfaces aren't built, so their icons aren't used. They get added to the sprite
when the kits get built, not before.

## Sprite format when the files land

```svg
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <!-- Lucide (https://lucide.dev) — ISC. Subset: 44 of 1,800+ symbols. -->
  <symbol id="shopping-bag" viewBox="0 0 24 24"><!-- geometry only --></symbol>
  <symbol id="search" viewBox="0 0 24 24">…</symbol>
</svg>
```

Symbols carry geometry only — no `stroke`, `fill` or `stroke-width` attributes. `Icon`
supplies `stroke="currentColor"`, `stroke-width`, `linecap` and `linejoin`, so one sprite
serves every size and colour. At 44 symbols this lands in single-digit KB, well inside
NFR-PERF-19.

## Interim state

`Icon` reserves its box and renders an empty `<use>` until the sprite exists. Storefront
controls carry text labels. Specimen cards show icon-sized gaps. That is deliberate: nothing
looks finished that isn't, and no request leaves the origin.
