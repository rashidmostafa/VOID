const { Button, Badge, Tag } = window.VoidDesignSystem_980885;

function ProductDetail({ state = "populated", narrow, onRetry }) {
  const [size, setSize] = React.useState("M");
  const [tab, setTab] = React.useState("details");
  const p = window.PRODUCT;

  if (state === "loading") {
    return (
      <Page narrow={narrow}>
        <Sk w="220px" h={11} mb={24} />
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: narrow ? "var(--space-6)" : "var(--space-12)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <SkPlate />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-3)" }}>
              {[0, 1, 2, 3].map((i) => <SkPlate key={i} ratio="1 / 1" />)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingBlockStart: narrow ? 0 : "var(--space-2)" }}>
            <Sk w="40%" h={11} />
            <Sk w="85%" h={30} />
            <Sk w="30%" h={20} />
            <Sk w="55%" h={12} />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBlockStart: "var(--space-4)" }}>
              {[0, 1, 2, 3, 4, 5].map((i) => <Sk key={i} h={34} />)}
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", marginBlockStart: "var(--space-4)" }}>
              {p.sizes.map((s) => <Sk key={s.label} w="52px" h={44} />)}
            </div>
            <Sk h={52} mb={8} />
            <Sk w="70%" h={12} />
            <Sk w="60%" h={12} />
          </div>
        </div>
      </Page>
    );
  }

  if (state === "error") {
    return (
      <Page narrow={narrow}>
        <div style={{ marginBlockEnd: "var(--space-6)" }}><Breadcrumb items={["Home", "Women", "Kurta"]} /></div>
        <ErrorState
          narrow={narrow}
          title="We could not load this product"
          body="The product service did not respond. Your bag is untouched — nothing was added or removed."
          detail="VD-KRT-0421 · request 8f21c4 · 504 upstream timeout"
          onRetry={onRetry}
        />
      </Page>
    );
  }

  if (state === "empty") {
    return (
      <Page narrow={narrow}>
        <div style={{ marginBlockEnd: "var(--space-6)" }}><Breadcrumb items={["Home", "Women", "Kurta"]} /></div>
        <EmptyState
          narrow={narrow}
          title="This product is no longer sold"
          body="Rahnuma Atelier has retired VD-KRT-0421. Their current pieces are still available."
          action={<div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}><Button>View the designer</Button><Button variant="outline">Browse kurta</Button></div>}
        />
      </Page>
    );
  }

  const chosen = p.sizes.find((s) => s.label === size);
  const info = {
    details: [["Fabric", "100% handloom cotton"], ["Weight", "142 gsm"], ["Weave", "Plain, 60s warp"], ["Origin", "Tangail, Bangladesh"], ["Fit", "Regular, drops 82cm"], ["Model", "178cm, wears M"]],
    care: [["Wash", "Cold hand wash"], ["Dry", "Line dry in shade"], ["Iron", "Medium, reverse side"], ["Bleach", "Do not bleach"], ["First wash", "Wash separately"]],
    delivery: [["Dhaka", "Next day, ৳60"], ["Outside Dhaka", "2–3 days, ৳120"], ["International", "7–12 days, calculated at checkout"], ["Returns", "14 days, unworn"], ["Made to order", "7–10 days before dispatch"]],
  };

  return (
    <Page narrow={narrow}>
      <div style={{ marginBlockEnd: narrow ? "var(--space-5)" : "var(--space-8)" }}><Breadcrumb items={["Home", "Women", "Kurta", p.title]} /></div>
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: narrow ? "var(--space-8)" : "var(--space-12)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", position: narrow ? "static" : "sticky", insetBlockStart: "calc(var(--topbar-height) + var(--space-8))" }}>
          <Plate badge="sale" label="1 / 4" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-3)" }}>
            {[1, 2, 3, 4].map((i) => (
              <Plate key={i} ratio="1 / 1" style={i === 1 ? { outline: "var(--border-width-medium) solid var(--indicator-active)", outlineOffset: -2 } : null} />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", alignItems: "baseline" }}>
              <a href="#" style={{ ...eyebrow, color: "var(--fg-primary)", whiteSpace: "nowrap" }}>{p.designer}</a>
              <span style={monoMeta}>{p.sku}</span>
            </div>
            <h1 style={{ font: "var(--type-h1)" }}>{p.title}</h1>
            <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)" }}>{p.subtitle}</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-medium)", color: "var(--commerce-price-sale)" }}>{taka(p.price)}</span>
              <s style={{ fontSize: "var(--text-lg)", color: "var(--commerce-price-original)" }}>{taka(p.compareAt)}</s>
              <CommerceBadge kind="sale" />
            </div>
            <Rating value={p.rating} count={p.reviews} />
          </div>

          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 0, margin: 0 }}>
            {p.specs.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt style={{ ...eyebrow, paddingBlock: "var(--space-3)", borderBlockEnd: "var(--border-width-thin) solid var(--border-subtle)" }}>{k}</dt>
                <dd style={{ margin: 0, font: "var(--type-ui-dense)", textAlign: "end", fontVariantNumeric: "tabular-nums", paddingBlock: "var(--space-3)", borderBlockEnd: "var(--border-width-thin) solid var(--border-subtle)" }}>{v}</dd>
              </React.Fragment>
            ))}
          </dl>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", alignItems: "baseline" }}>
              <span style={eyebrow}>Size</span>
              <a href="#" style={{ font: "var(--type-ui-dense)" }}>Size guide</a>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {p.sizes.map((s) => {
                const out = s.stock === 0;
                const on = s.label === size;
                return (
                  <button
                    key={s.label}
                    type="button"
                    aria-pressed={on}
                    disabled={out}
                    onClick={() => setSize(s.label)}
                    style={{
                      minWidth: "var(--touch-target-min)", height: "var(--touch-target-min)", paddingInline: "var(--space-3)",
                      background: on ? "var(--indicator-active)" : "var(--bg-surface)",
                      color: out ? "var(--fg-disabled)" : on ? "var(--action-primary-text)" : "var(--fg-primary)",
                      border: "var(--border-width-thin) solid " + (on ? "var(--indicator-active)" : out ? "var(--border-default)" : "var(--border-control)"),
                      borderRadius: "var(--radius-md)", fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)",
                      textDecoration: out ? "line-through" : "none", cursor: out ? "not-allowed" : "pointer", transition: "var(--transition-control)",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <p style={{ font: "var(--type-ui-dense)", color: chosen && chosen.stock <= 6 ? "var(--warning-text)" : "var(--fg-secondary)" }}>
              {chosen && chosen.stock <= 6 ? `Only ${chosen.stock} left in ${size}` : `In stock · ${chosen ? chosen.stock : 0} available`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", flexDirection: narrow ? "column" : "row" }}>
            <Button size="lg" block={narrow} style={narrow ? null : { flex: 1, background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Add to bag · {taka(p.price)}</Button>
            <Button size="lg" variant="outline" block={narrow}>Save</Button>
          </div>

          <Trust items={["Delivered from Dhaka in 7–10 days", "14-day returns, unworn", "Secure payment — bKash, Nagad, card"]} />

          <div style={{ borderBlockStart: "var(--border-width-thin) solid var(--border-default)", paddingBlockStart: "var(--space-5)" }}>
            <div style={{ display: "flex", gap: "var(--space-2)", marginBlockEnd: "var(--space-4)" }}>
              {[["details", "Details"], ["care", "Care"], ["delivery", "Delivery"]].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setTab(v)} style={{ minHeight: "var(--touch-target-min)", paddingInline: "var(--space-3)", background: tab === v ? "var(--bg-surface-sunken)" : "transparent", border: "var(--border-width-thin) solid " + (tab === v ? "var(--border-strong)" : "transparent"), borderRadius: "var(--radius-md)", ...eyebrow, color: tab === v ? "var(--fg-primary)" : "var(--fg-secondary)", cursor: "pointer" }}>{l}</button>
              ))}
            </div>
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", margin: 0 }}>
              {info[tab].map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)", paddingBlock: "var(--space-2)" }}>{k}</dt>
                  <dd style={{ margin: 0, font: "var(--type-ui-dense)", textAlign: "end", paddingBlock: "var(--space-2)" }}>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { ProductDetail });
