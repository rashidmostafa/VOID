Use `Tabs` to switch views without leaving the page.

```jsx
<Tabs items={[{value:"open",label:"Open",count:12},{value:"ship",label:"To ship",count:3}]} value={tab} onChange={setTab} />
<Tabs variant="segmented" size="sm" items={["Front","Back","Sleeve"]} value={face} onChange={setFace} />
```

Underline: 1px `--foreground` rule on the active tab, muted labels elsewhere. Segmented sits in a `--muted` trough with a white raised pill.
