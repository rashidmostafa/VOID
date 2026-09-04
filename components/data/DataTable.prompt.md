Use `DataTable` for order, payout, listing and moderation queues.

```jsx
<DataTable selectable dense onRowClick={open}
  columns={[{key:"id",label:"Order",mono:true},{key:"total",label:"Total",numeric:true,align:"right"},
            {key:"state",label:"Status",render:r=><Badge tone={r.tone}>{r.state}</Badge>}]}
  rows={orders} />
```

Uppercase 11px header row on `--muted`, hairline row separators, IDs in `--font-mono`, money right-aligned with tabular numerals. Status always renders as a `Badge`, never as coloured text.
