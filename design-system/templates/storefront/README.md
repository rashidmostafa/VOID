# Storefront UI kit

Eleven screens on the resolved v1.1 token system, and the artefact UI-SRC-8 asks for: one harness
that renders every component in the library plus the four representative composed screens, in both
locales, in light and dark, at 320 and 1440.

Open `Storefront.dc.html`. The toolbar switches every axis. It is review chrome, not part of the
design — set `chrome` false to hide it (that is how `explorations/accent-decision.html` embeds
these), and do not port it.

## Harness axes

| Prop | Values | Default |
| --- | --- | --- |
| `screen` | `home` `detail` `listing` `cart` `checkout` `confirm` `order` `account` `help` `notfound` `servererror` | `home` |
| `state` | `populated` `loading` `empty` `error` | `populated` |
| `scheme` | `light` `dark` | `light` |
| `width` | `1440` `320` | `1440` |
| `locale` | `en` `bn` | `en` |
| `market` | `bd` `in` `ae` `uk` | `bd` |
| `chrome` | `true` `false` | `true` |

`scheme` toggles `.dark` on `<html>`. `locale` sets `lang`, which is what swaps the Bengali face
and raises the leading. `market` changes the currency, its grouping and its decimal places, and
the active market stays visible in the header at every width (UI-GLOB-5, UI-GLOB-10). The accent
palette is baked into the tokens and is not switchable.

`state` is hidden on the 404 and 500 — an error page with a loading skeleton is a contradiction.

## Files

| File | Contents |
| --- | --- |
| `Shell.jsx` | `Header` `Footer` `Breadcrumb` `Page` `Plate` `Trust` `Rating` `CommerceBadge`, state primitives `Sk` `SkPlate` `EmptyState` `ErrorState`, and the shared `PRODUCT` / `CATALOGUE` fixtures |
| `ProductDetail.jsx` | Gallery, spec table, size selector with per-size stock, sticky media column, details/care/delivery switch |
| `ProductListing.jsx` | Filter sidebar (1440) / bottom sheet (320), applied-filter chips, product grid, load-more |
| `Checkout.jsx` | Step 03 of 04 — address, delivery method, payment (bKash, Nagad, card, COD), sticky order summary, sticky pay bar at 320 |
| `Account.jsx` | Orders table / stacked rows, addresses, my designs, settings |
| `StorefrontExtra.jsx` | `HelpCentre` (UI-ACC-4), `NotFound` and `ServerError` (UI-GLOB-6), and `VoidFormat` — the locale-driven money, number and date formatting of UI-GLOB-9 |
| `StorefrontApp.jsx` | What actually mounts: the screens above concatenated in order, plus the harness. Edit this file; the split sources are the pre-concatenation copies |
| `Storefront.dc.html` | Entry. Font preload, icon sprite path, `ds-base.js`, harness props |
| `storefront.css` | Harness chrome and skeleton shimmer — the only class-based rules in the kit |

## State rules this kit follows

- **Loading is a skeleton, never a spinner.** Blocks mirror the real layout so nothing reflows
  when data lands. Shimmer is suppressed under `prefers-reduced-motion`.
- **Empty states are one line, one or two actions, no illustration** — and they say what would
  change the outcome ("Removing the price filter returns 128 pieces").
- **Errors name the object, state what did *not* happen, and carry a retry.** Each carries a
  mono diagnostic line (request id, code) for support. Retry is a real action here: it returns
  the screen to `populated`.
- Checkout's error keeps the order summary visible and dimmed — the user needs to see the
  order is intact while reading that the payment failed.

## Component reuse

`Button`, `Input`, `Select`, `Switch`, `Tag` come from `_ds_bundle.js` unchanged. The kit adds
no new visual language; the local pieces in `Shell.jsx` are composition (a page grid, a media
plate, a trust list), not new styles.

Three things are composed inline rather than pulled from the library, deliberately:
size chips, facet rows and payment rows all need a selected state bound to
`--indicator-active`, which is the token that moves when the accent palette activates. Building
them locally is what makes the four-way comparison honest.

## Money and numbers

`VoidFormat.money` takes grouping, decimal separator, decimal places and numeral system from
`Intl.NumberFormat.formatToParts` — `৳2,450` in `en-BD`, `৳২,৪৫০` in `bn-BD`, `৳১,০২,৪৫০` at
lakh scale, `£2,450.00` in `en-GB`. Only the symbol *position* is Void's own rule (leading, no
space, per `readme.md`), overriding CLDR, which trails it for `bn-BD`. That override is disclosed
in the function's comment and in `docs/adr/0007-design-source.md`; nothing else about a price is
assembled by hand.

## Known gaps

- **No photography.** Product media renders as flat `--bg-surface-sunken` plates with a mono
  position label. Never substitute a drawn illustration.
- **Bengali copy is untranslated.** The `bn` axis exercises the real thing — `:lang(bn)` swaps the
  face, raises the leading, and numbers render in Bengali numerals with `bn-BD` grouping — so the
  type stack and the number system are genuinely reviewable. The strings are English, and the
  toolbar says so while `bn` is active. A locale pass needs real translations, not machine output.
