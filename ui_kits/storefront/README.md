# Storefront UI kit

Four screens on the resolved v1.1 token system. Every screen renders at 1440 and 320, in
light and dark, with accent off and on, in four states — populated, loading, empty, error.

Open `index.html`. The toolbar switches all four axes. It is chrome, not part of the design:
append `?chrome=0` to hide it (that is how `explorations/accent-decision.html` embeds these).

## URL parameters

| Param | Values | Default |
| --- | --- | --- |
| `screen` | `detail` `listing` `checkout` `account` | `detail` |
| `state` | `populated` `loading` `empty` `error` | `populated` |
| `scheme` | `light` `dark` | `light` |
| `width` | `1440` `320` | `1440` |
| `chrome` | `1` `0` | `1` |

`scheme` toggles `.dark` on `<html>`. The accent palette is baked into the tokens and is not
switchable. Nothing else changes between renders — same components, same copy, same data.

## Files

| File | Contents |
| --- | --- |
| `Shell.jsx` | `Header` `Footer` `Breadcrumb` `Page` `Plate` `Trust` `Rating` `CommerceBadge`, state primitives `Sk` `SkPlate` `EmptyState` `ErrorState`, and the shared `PRODUCT` / `CATALOGUE` fixtures |
| `ProductDetail.jsx` | Gallery, spec table, size selector with per-size stock, sticky media column, details/care/delivery switch |
| `ProductListing.jsx` | Filter sidebar (1440) / bottom sheet (320), applied-filter chips, product grid, load-more |
| `Checkout.jsx` | Step 03 of 04 — address, delivery method, payment (bKash, Nagad, card, COD), sticky order summary, sticky pay bar at 320 |
| `Account.jsx` | Orders table / stacked rows, addresses, my designs, settings |
| `index.html` | Harness, toolbar, skeleton shimmer keyframes, font preload |

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

## Known gaps

- **No icons.** `assets/icons/void-icons.svg` has not been supplied, so every control uses a
  text label. See `assets/icons/README.md` — this is the one thing most visibly missing.
- **No photography.** Product media renders as flat `--bg-surface-sunken` plates with a mono
  position label. Never substitute a drawn illustration.
- Bengali is wired at the token level (`:lang(bn)` swaps the face and loosens leading) but the
  kit copy is English. A `bn` locale pass needs real translations, not machine output.
