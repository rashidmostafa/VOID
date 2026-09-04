Use `Select` for closed lists — currency, market, category, sort order.

```jsx
<Select label="Market" options={["Bangladesh", "India", "UAE", "United Kingdom"]} />
<Select label="Sort" size="sm" options={[{value:"new",label:"New in"},{value:"low",label:"Price: low to high"}]} />
```

For 2–3 options prefer `Tabs variant="segmented"` or `Radio`. The caret is a 10px ▾ in `--text-muted`.
