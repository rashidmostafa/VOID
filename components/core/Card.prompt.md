Use `Card` for grouped panels in the portals and dashboards — never around storefront product imagery (merchandise sits in hard-edged plates with no container).

```jsx
<Card padding="md">
  <CardHeader title="Payouts" meta="Next cycle 12 Oct" action={<Button variant="ghost" size="sm">Export</Button>} />
</Card>
```

Default is a 1px `--border` hairline, `--radius-lg` (10px), no shadow. Reach for `elevated` only when the card floats over content.
