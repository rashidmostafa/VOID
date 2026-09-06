import { Button } from "@void/ui/core/Button";

/* Phase 1 surface: proof the token pipeline reaches a rendered page.
   Not a product screen — the storefront read path is Phase 3. Its only job is to
   show that the generated theme, the Tailwind mapping and the first ported
   component all resolve through tokens in a real Next.js render. */

export default function Home() {
  return (
    <main className="mx-auto max-w-(--layout-max-editorial) p-(--space-6)">
      <p
        style={{
          font: "var(--type-label)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-widest)",
          color: "var(--fg-secondary)",
        }}
      >
        Phase 1 · token pipeline
      </p>

      <h1 style={{ font: "var(--type-h1)", marginBlockStart: "var(--space-2)" }}>Void</h1>

      <p
        style={{
          font: "var(--type-body)",
          color: "var(--fg-secondary)",
          maxInlineSize: "var(--layout-max-prose)",
          marginBlockStart: "var(--space-4)",
        }}
      >
        The theme on this page is generated from the token contract and served as a static
        stylesheet. Nothing here sets a colour, size or duration by hand.
      </p>

      <div style={{ display: "flex", gap: "var(--space-3)", marginBlockStart: "var(--space-6)", flexWrap: "wrap" }}>
        <Button variant="primary">Add to bag</Button>
        <Button variant="accent">Order this design</Button>
        <Button variant="outline">Size guide</Button>
        <Button variant="primary" loading>
          Placing order
        </Button>
      </div>
    </main>
  );
}
