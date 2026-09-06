Use `SideNav` as the root navigation of any signed-in back-office surface. The storefront does not use it.

```jsx
<SideNav brand={<Wordmark />} value={view} onChange={setView}
  sections={[{title:"Sell",items:[{value:"orders",label:"Orders",icon:<Icon name="package" />,badge:12}]}]} />
```

248px wide on `--sidebar`, uppercase 11px section titles at `--tracking-widest`, 34px rows, active row filled `--sidebar-accent`.
