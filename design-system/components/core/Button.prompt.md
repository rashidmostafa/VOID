Use `Button` for any committed action — add to bag, save, publish, approve. One primary per view; everything secondary is `outline` or `ghost`.

```jsx
<Button variant="primary" size="lg" iconLeft={<Icon name="shopping-bag" />}>Add to bag</Button>
<Button variant="outline">Save for later</Button>
<Button variant="link">Size guide</Button>
```

- `primary` is near-black (`--primary`), used once per screen; hover darkens one step, it does not tint.
- `destructive` is reserved for irreversible vendor/admin actions (cancel order, remove listing).
- `link` drops the box and keeps the brand hairline underline.
- `loading` replaces `iconLeft` with a spinner and sets `aria-busy`.
