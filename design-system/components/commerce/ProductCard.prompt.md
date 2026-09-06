Use `ProductCard` in every product grid — storefront category pages, marketplace designer shops, saved items.

```jsx
<ProductCard designer="Rahnuma Atelier" title="Handloom cotton kurta" price={2450} compareAt={3200}
  sizes={["S","M","L","XL"]} badge="New in" image="/assets/…" />
```

Imagery is a 3:4 square-cornered plate (`--radius-media: 0`) — the tile has no border, no shadow and no card around it. Hover scales the photo 1.03 over 600ms and underlines the title. Prices are tabular-nums with the ৳ sign; pass `locale="bn"` for Bengali numerals.
