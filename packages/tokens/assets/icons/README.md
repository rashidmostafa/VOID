# Icons

`void-icons.svg` — one SVG sprite, 57 `<symbol>` elements, self-hosted from this origin.
No icon CDN, no icon font, no third-party request (UI-INV-13 / NFR-SEC-20).

## Source and licence

Paths are taken verbatim from [lucide-static](https://lucide.dev), ISC licensed. The
licence text ships alongside the sprite at `LICENSE-lucide.txt` and must travel with any
copy of it, including into the product repository.

## Geometry contract

Every symbol is `viewBox="0 0 24 24" fill="none"` and carries nothing else.

`fill="none"` is pinned on the symbol because a `<use>` shadow tree does not pick up
`fill` from the referencing `<svg>` — left off, every glyph renders as a solid black blob.

Everything else must be left to inherit. In particular do **not** put
`stroke="currentColor"` on a symbol: inside the shadow tree it resolves against the hidden
sprite host, not the instance, so icons come out body-text black on a dark button. Stroke
colour, stroke weight and line joins are set per instance by `components/core/Icon.jsx`,
and `currentColor` there resolves correctly. A symbol that hard-codes a colour breaks dark
mode silently — strip any presentation attribute other than `fill="none"` when adding one.

## Use

Never reference the sprite directly from a screen. Go through `Icon`:

```jsx
<Icon name="shopping-bag" size={18} />
<Icon name="search" size={16} label="Search" />
```

`Icon` resolves the sprite from `window.VOID_ICON_SPRITE`, falling back to
`assets/icons/void-icons.svg`. Pages that do not sit at the project root set the path once,
before render:

```html
<script>window.VOID_ICON_SPRITE = "../../assets/icons/void-icons.svg"</script>
```

An unknown `name` renders an empty box at the right size rather than throwing, so a typo
degrades to a gap in the layout instead of a blank screen.

## Symbol ids

**Navigation** — `search` `menu` `x` `chevron-down` `chevron-up` `chevron-left`
`chevron-right` `arrow-left` `arrow-right` `external-link` `grid-2x2` `list`
`sliders-horizontal` `settings` `log-out`

**Commerce** — `shopping-bag` `heart` `star` `star-half` `shirt` `store` `package` `truck`
`rotate-ccw` `credit-card` `banknote` `wallet` `shield-check`

**Account and contact** — `user` `map-pin` `phone` `mail` `lock` `eye` `eye-off`

**Editing** — `plus` `minus` `check` `pencil` `copy` `trash-2` `share-2` `download`
`zoom-in` `flip-horizontal`

**Status** — `circle-alert` `circle-check` `circle-help` `info` `triangle-alert` `loader`
`loader-circle` `clock`

**Locale and scheme** — `globe` `languages` `sun` `moon`

## Adding a symbol

Copy the `<path>` children out of the matching
`node_modules/lucide-static/icons/<name>.svg`, wrap them in
`<symbol id="<name>" viewBox="0 0 24 24">`, and strip every presentation attribute. Keep the
id identical to Lucide's file name so provenance stays checkable against the package.

## Known consumers

`Icon` is used by `Button` (`iconLeft`/`iconRight`), `IconButton`, `SideNav` item icons,
`Tabs`, `Toast`, `Dialog` and `ProductCard`. The storefront screens in
`templates/storefront/` were authored with text labels only, from the period when the
sprite was unavailable; they can now take icons where a label alone reads thin.
