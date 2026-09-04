Use `IconButton` where the glyph alone is unambiguous and space is tight. Always pass `label`.

```jsx
<IconButton icon={<Icon name="heart" />} label="Save to wishlist" />
<IconButton icon={<Icon name="type" />} label="Text tool" active variant="outline" />
```

Pair with `Tooltip` in tool rails. `active` is the persistent selected state; hover is a `--muted` fill.
