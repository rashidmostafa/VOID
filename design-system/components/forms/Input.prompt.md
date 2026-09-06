Use `Input` for all free text and numeric entry.

```jsx
<Input label="Product title" placeholder="Handloom cotton kurta" hint="English title, shown to all markets" />
<Input label="Price" prefix={<span>৳</span>} suffix="BDT" defaultValue="2450" />
<Input label="Care notes" multiline rows={4} />
<Input label="Email" error="We could not verify this address" defaultValue="rafi@" />
```

Labels are 12px medium sentence case. Errors replace the hint. Focus draws the 2px `--ring` offset ring, never a colored border on valid fields.
