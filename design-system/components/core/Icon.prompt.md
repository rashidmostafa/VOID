Use `Icon` for every glyph in the system. Void has no proprietary icon set — Lucide (ISC) at 1.5px stroke is the house set, self-hosted as a subset sprite.

```jsx
<Icon name="shopping-bag" size={18} />
<Icon name="search" size={16} color="var(--text-muted)" />
```

Sizes: 14 in dense tables, 16 default UI, 18–20 in storefront headers and Studio tool rails. Icons inherit `currentColor`; never recolor one to a chart hue. `name` must be one of the 44 symbols in `assets/icons/void-icons.svg` — the sprite is a deliberate subset, so a name outside it renders nothing. Adding a glyph means adding it to the sprite and to the inventory in `assets/icons/README.md`. No icon CDN, no icon font, no per-icon files.
