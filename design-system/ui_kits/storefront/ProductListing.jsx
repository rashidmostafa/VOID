const { Button, Tag, Select, Checkbox } = window.VoidDesignSystem_980885;

function Facet({ title, options, narrow }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", paddingBlock: "var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-subtle)" }}>
      <div style={eyebrow}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {options.map((o) => (
          <label key={o.label} className="vd-touch" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minHeight: narrow ? "var(--touch-target-min)" : 28, cursor: "pointer" }}>
            <input type="checkbox" defaultChecked={o.on} style={{ width: 16, height: 16, accentColor: "var(--indicator-active)", flex: "none" }} />
            <span style={{ font: "var(--type-ui-dense)", flex: 1 }}>{o.label}</span>
            <span style={{ ...monoMeta, fontVariantNumeric: "tabular-nums" }}>{o.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const FACETS = [
  { title: "Category", options: [{ label: "Kurta", count: 84, on: true }, { label: "Saree", count: 61 }, { label: "Shirt", count: 47 }, { label: "Outerwear", count: 22 }] },
  { title: "Size", options: [{ label: "XS", count: 31 }, { label: "S", count: 96 }, { label: "M", count: 128, on: true }, { label: "L", count: 112 }, { label: "XL", count: 58 }] },
  { title: "Fabric", options: [{ label: "Handloom cotton", count: 74 }, { label: "Khadi", count: 39 }, { label: "Silk", count: 28 }, { label: "Linen blend", count: 17 }] },
  { title: "Price", options: [{ label: "Under ৳2,000", count: 44 }, { label: "৳2,000–4,000", count: 91, on: true }, { label: "৳4,000–8,000", count: 52 }, { label: "Over ৳8,000", count: 13 }] },
];

function Tile({ item, narrow }) {
  const [hover, setHover] = React.useState(false);
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", cursor: "pointer", minWidth: 0 }}>
      <Plate badge={item.badge} style={item.badge === "out" ? { opacity: 0.55 } : null} />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)", ...eyebrow }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.designer}</span>
          {narrow ? null : <span style={{ fontFamily: "var(--font-mono)", flex: "none" }}>{item.sku}</span>}
        </div>
        <span style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-snug)", textDecoration: hover ? "underline" : "none", textUnderlineOffset: 3 }}>{item.title}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontWeight: "var(--weight-medium)", color: item.compareAt ? "var(--commerce-price-sale)" : "var(--commerce-price)" }}>{taka(item.price)}</span>
          {item.compareAt ? <s style={{ fontSize: "var(--text-ui)", color: "var(--commerce-price-original)" }}>{taka(item.compareAt)}</s> : null}
        </div>
        <Rating value={item.rating} count={item.reviews} width={narrow ? 48 : 56} />
      </div>
    </article>
  );
}

function ProductListing({ state = "populated", narrow, onRetry }) {
  const [sheet, setSheet] = React.useState(false);
  const items = window.CATALOGUE;
  const cols = narrow ? 2 : 3;

  const Toolbar = (
    <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", alignItems: narrow ? "stretch" : "flex-end", justifyContent: "space-between", gap: "var(--space-4)", paddingBlockEnd: "var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <Breadcrumb items={["Home", "Women", "Kurta"]} />
        <h1 style={{ font: "var(--type-h1)" }}>Kurta</h1>
        <span style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)", fontVariantNumeric: "tabular-nums" }}>
          {state === "empty" ? "0 pieces" : "214 pieces · 8 shown"}
        </span>
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        {narrow ? <Button variant="outline" block onClick={() => setSheet(true)}>Filters (2)</Button> : null}
        <Select size="sm" options={["Newest", "Price: low to high", "Price: high to low", "Best rated"]} style={{ minWidth: narrow ? 0 : 190, flex: narrow ? 1 : "none" }} />
      </div>
    </div>
  );

  const Applied = (
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center", paddingBlock: "var(--space-4)" }}>
      <span style={eyebrow}>Applied</span>
      <Tag removable onRemove={() => {}}>Size M</Tag>
      <Tag removable onRemove={() => {}}>৳2,000–4,000</Tag>
      <Button variant="link" size="sm">Clear all</Button>
    </div>
  );

  const Sidebar = (
    <aside style={{ width: "var(--sidebar-width)", flex: "none", position: "sticky", insetBlockStart: "calc(var(--topbar-height) + var(--space-8))", alignSelf: "start" }}>
      <div style={{ ...eyebrow, paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-medium) solid var(--fg-primary)" }}>Filters</div>
      {FACETS.map((f) => <Facet key={f.title} {...f} />)}
    </aside>
  );

  let body;
  if (state === "loading") {
    body = (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: narrow ? "var(--space-4)" : "var(--space-6)" }}>
        {Array.from({ length: narrow ? 4 : 6 }).map((_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <SkPlate />
            <Sk w="55%" h={10} />
            <Sk w="90%" h={16} />
            <Sk w="35%" h={14} />
          </div>
        ))}
      </div>
    );
  } else if (state === "error") {
    body = (
      <ErrorState
        narrow={narrow}
        title="We could not load this category"
        body="The catalogue service is not responding. Your filters are kept — retrying will reapply them."
        detail="category/kurta · size=M · price=2000-4000 · request 3ba917 · 503"
        onRetry={onRetry}
      />
    );
  } else if (state === "empty") {
    body = (
      <EmptyState
        narrow={narrow}
        title="No pieces match these filters"
        body="Size M in ৳2,000–4,000 has nothing in Kurta right now. Removing the price filter returns 128 pieces."
        action={<div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}><Button>Clear price filter</Button><Button variant="outline">Clear all filters</Button></div>}
      />
    );
  } else {
    body = (
      <>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: narrow ? "var(--space-4)" : "var(--space-6)" }}>
          {items.map((it) => <Tile key={it.sku} item={it} narrow={narrow} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)", paddingBlockStart: "var(--space-10)" }}>
          <span style={{ ...monoMeta, fontVariantNumeric: "tabular-nums" }}>8 of 214</span>
          <div style={{ width: narrow ? "100%" : 220, height: 2, background: "var(--border-default)" }}>
            <div style={{ width: "4%", height: "100%", background: "var(--indicator-active)" }} />
          </div>
          <Button variant="outline" block={narrow}>Load more</Button>
        </div>
      </>
    );
  }

  return (
    <Page narrow={narrow}>
      {Toolbar}
      {state === "loading" ? null : Applied}
      {narrow ? body : <div style={{ display: "flex", gap: "var(--space-10)", alignItems: "start", paddingBlockStart: "var(--space-2)" }}>{Sidebar}<div style={{ flex: 1, minWidth: 0 }}>{body}</div></div>}

      {sheet ? (
        <div style={{ position: "fixed", inset: 0, zIndex: "var(--z-drawer)", background: "var(--bg-overlay)", display: "flex", alignItems: "flex-end" }} onClick={() => setSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-surface)", width: "100%", maxHeight: "82vh", overflowY: "auto", borderStartStartRadius: "var(--radius-xl)", borderStartEndRadius: "var(--radius-xl)", padding: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)", paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-medium) solid var(--fg-primary)" }}>
              <span style={eyebrow}>Filters</span>
              <Button variant="ghost" size="sm" onClick={() => setSheet(false)}>Close</Button>
            </div>
            {FACETS.map((f) => <Facet key={f.title} {...f} narrow />)}
            <div style={{ display: "flex", gap: "var(--space-3)", paddingBlockStart: "var(--space-5)" }}>
              <Button variant="outline" block>Clear</Button>
              <Button block onClick={() => setSheet(false)}>Show 214</Button>
            </div>
          </div>
        </div>
      ) : null}
    </Page>
  );
}

Object.assign(window, { ProductListing, Tile, Facet });
