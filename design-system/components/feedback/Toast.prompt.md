Use `Toast` to confirm something that already happened, with an escape hatch where one exists.

```jsx
<Toast tone="success" title="Added to bag" description="Handloom kurta, size M" action={<Button variant="link" size="sm">View bag</Button>} onDismiss={fn} />
```

Tone shows only as the 3px left accent bar — the surface stays neutral. Never use a toast for an error the user must fix; that belongs on the field.
