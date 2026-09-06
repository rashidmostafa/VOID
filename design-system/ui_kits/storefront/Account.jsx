const { Button, Badge, Switch, Input } = window.VoidDesignSystem_980885;

const ORDERS = [
  { id: "VD-24817", date: "28 Aug 2026", items: 3, total: 6350, state: "In transit", tone: "info" },
  { id: "VD-24102", date: "11 Aug 2026", items: 1, total: 2450, state: "Delivered", tone: "success" },
  { id: "VD-23771", date: "02 Aug 2026", items: 2, total: 4990, state: "Delivered", tone: "success" },
  { id: "VD-23004", date: "19 Jul 2026", items: 1, total: 8400, state: "Returned", tone: "neutral" },
  { id: "VD-22890", date: "04 Jul 2026", items: 4, total: 11200, state: "Payment failed", tone: "error" },
];

const TONE = {
  success: ["var(--success-bg)", "var(--success-text)", "var(--success-border)"],
  info: ["var(--info-bg)", "var(--info-text)", "var(--info-border)"],
  error: ["var(--error-bg)", "var(--error-text)", "var(--error-border)"],
  neutral: ["var(--bg-surface-sunken)", "var(--fg-secondary)", "var(--border-default)"],
};

function StateChip({ tone, children }) {
  const [bg, fg, bd] = TONE[tone] || TONE.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingInline: "var(--space-2)", background: bg, color: fg, border: "var(--border-width-thin) solid " + bd, borderRadius: "var(--radius-sm)", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>{children}</span>
  );
}

function OrderRow({ o, narrow }) {
  if (narrow) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingBlock: "var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{o.id}</span>
          <StateChip tone={o.tone}>{o.state}</StateChip>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>
          <span>{o.date} · {o.items} item{o.items > 1 ? "s" : ""}</span>
          <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--fg-primary)", fontWeight: "var(--weight-medium)" }}>{taka(o.total)}</span>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", paddingBlockStart: "var(--space-1)" }}>
          <Button variant="outline" size="sm">Track</Button>
          <Button variant="ghost" size="sm">Invoice</Button>
        </div>
      </div>
    );
  }
  return (
    <tr style={{ borderBlockStart: "var(--border-width-thin) solid var(--border-subtle)" }}>
      <td style={{ padding: "var(--space-4) var(--space-4) var(--space-4) 0", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" }}>{o.id}</td>
      <td style={{ padding: "var(--space-4)", font: "var(--type-ui-dense)", color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{o.date}</td>
      <td style={{ padding: "var(--space-4)", font: "var(--type-ui-dense)", fontVariantNumeric: "tabular-nums" }}>{o.items}</td>
      <td style={{ padding: "var(--space-4)" }}><StateChip tone={o.tone}>{o.state}</StateChip></td>
      <td style={{ padding: "var(--space-4)", font: "var(--type-ui-dense)", fontVariantNumeric: "tabular-nums", textAlign: "end", fontWeight: "var(--weight-medium)" }}>{taka(o.total)}</td>
      <td style={{ padding: "var(--space-4) 0 var(--space-4) var(--space-4)", textAlign: "end" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="outline" size="sm">Track</Button>
          <Button variant="ghost" size="sm">Invoice</Button>
        </div>
      </td>
    </tr>
  );
}

function Account({ state = "populated", narrow, onRetry }) {
  const [tab, setTab] = React.useState("orders");
  const tabs = [["orders", "Orders"], ["addresses", "Addresses"], ["designs", "My designs"], ["settings", "Settings"]];

  const Head = (
    <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", justifyContent: "space-between", alignItems: narrow ? "flex-start" : "flex-end", gap: "var(--space-4)", paddingBlockEnd: "var(--space-5)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <span style={eyebrow}>Account</span>
        <h1 style={{ font: "var(--type-h1)" }}>Ayesha Karim</h1>
        <span style={{ ...monoMeta }}>ayesha.k@example.com · member since Mar 2025</span>
      </div>
      <Button variant="outline" block={narrow}>Sign out</Button>
    </div>
  );

  const TabBar = (
    <div style={{ display: "flex", gap: narrow ? "var(--space-4)" : "var(--space-6)", overflowX: "auto", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      {tabs.map(([v, l]) => (
        <button key={v} type="button" onClick={() => setTab(v)} style={{ background: "transparent", border: "none", borderBlockEnd: "var(--border-width-medium) solid " + (tab === v ? "var(--indicator-active)" : "transparent"), marginBlockEnd: -1, minHeight: "var(--touch-target-min)", padding: "0 0 var(--space-3)", ...eyebrow, color: tab === v ? "var(--fg-primary)" : "var(--fg-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}>{l}</button>
      ))}
    </div>
  );

  let body;
  if (state === "loading") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingBlockStart: "var(--space-6)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "110px 1fr 60px 130px 100px 160px", gap: "var(--space-4)", alignItems: "center", paddingBlockEnd: "var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-subtle)" }}>
            <Sk h={14} /><Sk h={14} />{narrow ? null : <><Sk h={14} /><Sk h={22} /><Sk h={14} /><Sk h={32} /></>}
          </div>
        ))}
      </div>
    );
  } else if (state === "error") {
    body = (
      <div style={{ paddingBlockStart: "var(--space-6)" }}>
        <ErrorState narrow={narrow} title="We could not load your orders" body="Your account is fine — only the order history failed to load. Nothing has changed on any order." detail="account/orders · request b1f704 · 500" onRetry={onRetry} />
      </div>
    );
  } else if (state === "empty") {
    body = (
      <div style={{ paddingBlockStart: "var(--space-6)" }}>
        <EmptyState narrow={narrow} title="No orders yet" body="When you order, it appears here with tracking and invoices." action={<Button>Browse new in</Button>} />
      </div>
    );
  } else if (tab === "settings") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", paddingBlockStart: "var(--space-6)", maxWidth: 560 }}>
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: "var(--space-4)" }}>
          <Input label="Full name" defaultValue="Ayesha Karim" />
          <Input label="Phone" prefix={<span style={{ fontSize: "var(--text-ui)" }}>+880</span>} defaultValue="1712 345678" />
        </div>
        {[["Interface in বাংলা", "Switches the whole storefront to Bengali", true], ["Order updates by SMS", "Dispatch and delivery only", true], ["New arrivals email", "Once a week, no more", false]].map(([l, d, on]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-5)", paddingBlockEnd: "var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-subtle)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "var(--type-ui)" }}>{l}</span>
              <span style={{ fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>{d}</span>
            </div>
            <Switch defaultChecked={on} onChange={() => {}} />
          </div>
        ))}
      </div>
    );
  } else if (tab === "addresses") {
    body = (
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: "var(--space-4)", paddingBlockStart: "var(--space-6)" }}>
        {[["Home", "House 42, Road 11, Dhanmondi, Dhaka 1209", true], ["Office", "Level 8, Bay's Galleria, Gulshan 1, Dhaka 1212", false]].map(([l, a, def]) => (
          <div key={l} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid " + (def ? "var(--indicator-active)" : "var(--border-default)"), borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)" }}>
              <span style={eyebrow}>{l}</span>
              {def ? <StateChip tone="info">Default</StateChip> : null}
            </div>
            <p style={{ font: "var(--type-ui)" }}>{a}</p>
            <div style={{ display: "flex", gap: "var(--space-2)" }}><Button variant="outline" size="sm">Edit</Button><Button variant="ghost" size="sm">Remove</Button></div>
          </div>
        ))}
        <button type="button" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140, background: "transparent", border: "var(--border-width-thin) dashed var(--border-strong)", borderRadius: "var(--radius-lg)", ...eyebrow, cursor: "pointer" }}>Add an address</button>
      </div>
    );
  } else if (tab === "designs") {
    body = (
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(4,1fr)", gap: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlockStart: "var(--space-6)" }}>
        {[["Jamdani jacket", "Draft", "neutral"], ["Indigo kurta", "In review", "info"], ["Nakshi tote", "Approved", "success"], ["Silk scarf", "Rejected", "error"]].map(([t, s, tone]) => (
          <div key={t} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Plate ratio="1 / 1" label="Studio" />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <span style={{ font: "var(--type-ui)" }}>{t}</span>
              <StateChip tone={tone}>{s}</StateChip>
            </div>
          </div>
        ))}
      </div>
    );
  } else if (narrow) {
    body = <div style={{ paddingBlockStart: "var(--space-2)" }}>{ORDERS.map((o) => <OrderRow key={o.id} o={o} narrow />)}</div>;
  } else {
    body = (
      <table style={{ width: "100%", borderCollapse: "collapse", marginBlockStart: "var(--space-4)" }}>
        <thead>
          <tr>
            {["Order", "Date", "Items", "Status", "Total", ""].map((h, i) => (
              <th key={h + i} style={{ ...eyebrow, textAlign: i === 4 ? "end" : "start", padding: i === 0 ? "0 var(--space-4) var(--space-3) 0" : "0 var(--space-4) var(--space-3)", fontWeight: "var(--weight-medium)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{ORDERS.map((o) => <OrderRow key={o.id} o={o} />)}</tbody>
      </table>
    );
  }

  return (
    <Page narrow={narrow}>
      {Head}
      {TabBar}
      {body}
    </Page>
  );
}

Object.assign(window, { Account, StateChip, OrderRow });
