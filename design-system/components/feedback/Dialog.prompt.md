Use `Dialog` for a decision that must block the view — cancel an order, reject a design, confirm a payout.

```jsx
<Dialog open={open} title="Reject this design?" description="The designer is notified with your note."
  onClose={close}
  footer={<><Button variant="ghost" onClick={close}>Cancel</Button><Button variant="destructive">Reject</Button></>}>
  <Input label="Note to designer" multiline rows={3} />
</Dialog>
```

`--radius-xl` (14px), `--shadow-overlay`, scrim at 55% with a 2px blur. Rises 6px on open over 200ms.
