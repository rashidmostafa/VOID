/* Vendor and designer portals — UI-PTR-1..4.

   UI-PTR-1 puts these in the admin family, not the storefront family: same tokens, but
   density and speed over editorial presentation. So they borrow the back office's
   sidebar/topbar vocabulary rather than the storefront's header.

   UI-PTR-2 is the constraint that shaped the layout: a vendor accepts and dispatches
   orders from a phone in a warehouse. At 320 the sidebar becomes a bottom bar and the
   order rows become cards whose primary action is a full-width button — the desk layout
   is not simply narrowed.

   UI-PTR-3 is a copy rule with teeth: no figure appears without its period, its currency
   and whether it is pending or available. There is no bare number anywhere below. */

const DS = () => window.VoidDesignSystem_980885 || {};

const Badge = React.forwardRef((p, ref) => React.createElement(DS().Badge, { ...p, ref }));
const Button = React.forwardRef((p, ref) => React.createElement(DS().Button, { ...p, ref }));
const Icon = React.forwardRef((p, ref) => React.createElement(DS().Icon, { ...p, ref }));
const IconButton = React.forwardRef((p, ref) => React.createElement(DS().IconButton, { ...p, ref }));
const Input = React.forwardRef((p, ref) => React.createElement(DS().Input, { ...p, ref }));
const Select = React.forwardRef((p, ref) => React.createElement(DS().Select, { ...p, ref }));
const Tag = React.forwardRef((p, ref) => React.createElement(DS().Tag, { ...p, ref }));

function useDesignSystemReady() {
  const [ready, setReady] = React.useState(() => !!window.VoidDesignSystem_980885);
  React.useEffect(() => {
    if (ready) return;
    let live = true;
    const id = setInterval(() => { if (window.VoidDesignSystem_980885) { clearInterval(id); if (live) setReady(true); } }, 24);
    return () => { live = false; clearInterval(id); };
  }, [ready]);
  return ready;
}

const eyebrow = { font: "var(--type-label)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--fg-secondary)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontVariantNumeric: "tabular-nums" };
const monoMeta = { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" };
const taka = (n) => "৳" + n.toLocaleString("en-IN");

const NAV = {
  vendor: [["queue", "Order queue", "package", "6"], ["products", "Products", "shirt"], ["markets", "Market coverage", "globe", "3"], ["earnings", "Settlement", "wallet"]],
  designer: [["designs", "My designs", "pencil"], ["performance", "Performance", "grid-2x2"], ["royalties", "Royalties", "banknote"]],
};

const TITLES = { vendor: ["Rahnuma Atelier", "Vendor portal"], designer: ["Ayesha Karim", "Designer portal"] };

/* ---------- shared furniture ---------- */

function Figure({ label, value, period, note, tone }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
      <span style={eyebrow}>{label}</span>
      <span style={{ font: "var(--type-h2)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      {/* UI-PTR-3: period and availability travel with the figure, never in a page header. */}
      <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-ui-sm)", color: "var(--fg-secondary)", flexWrap: "wrap" }}>
        <span>{period}</span>
        {tone ? <Badge tone={tone} size="sm">{note}</Badge> : <span>· {note}</span>}
      </span>
    </div>
  );
}

function Panel({ title, meta, action, children, pad = true }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", padding: "var(--space-5)", paddingBlockEnd: pad ? 0 : "var(--space-4)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "1 1 auto", minWidth: 0 }}>
          <h2 style={{ font: "var(--type-h3)", margin: 0 }}>{title}</h2>
          {meta ? <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{meta}</span> : null}
        </div>
        {action ? <span style={{ flex: "none" }}>{action}</span> : null}
      </header>
      <div style={{ padding: pad ? "var(--space-5)" : 0 }}>{children}</div>
    </section>
  );
}

function PageHead({ eyebrowText, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "1 1 auto", minWidth: 0 }}>
        <span style={eyebrow}>{eyebrowText}</span>
        <h1 style={{ font: "var(--type-h1)", margin: 0 }}>{title}</h1>
      </div>
      {right ? <span style={{ flex: "none" }}>{right}</span> : null}
    </div>
  );
}

/* ---------- vendor: order queue (UI-PTR-2) ---------- */

const QUEUE = [
  { id: "VD-24817", buyer: "Ayesha Karim", where: "Dhanmondi, Dhaka", items: [["Handloom cotton kurta", "M · Unbleached", 1]], value: 2450, placed: "14 min ago", state: "new" },
  { id: "VD-24815", buyer: "Marcus Reid", where: "Manchester, UK", items: [["Jamdani-panel shirt", "L · Indigo", 1], ["Muslin scarf", "One size", 2]], value: 8300, placed: "1 hour ago", state: "new", export: true },
  { id: "VD-24811", buyer: "Priya Nair", where: "Kochi, IN", items: [["Khadi overshirt", "S · Sand", 1]], value: 4120, placed: "3 hours ago", state: "accepted" },
  { id: "VD-24806", buyer: "Tanvir Hasan", where: "Chattogram, BD", items: [["Block-print wide trouser", "M", 1]], value: 3300, placed: "Yesterday", state: "accepted" },
];

function OrderCard({ o, narrow, onAct }) {
  const accepted = o.state === "accepted";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-4)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ ...mono, fontWeight: "var(--weight-medium)" }}>{o.id}</span>
          <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{o.buyer} · {o.where}</span>
          <span style={monoMeta}>{o.placed}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-2)", flex: "none" }}>
          <span style={{ ...mono, fontWeight: "var(--weight-medium)" }}>{taka(o.value)}</span>
          {o.export ? <Badge tone="info" size="sm">Export</Badge> : null}
          {accepted ? <Badge tone="success" size="sm">Accepted</Badge> : null}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingBlock: "var(--space-3)", borderBlock: "var(--border-width-thin) solid var(--border-default)" }}>
        {o.items.map(([name, variant, qty]) => (
          <div key={name} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", font: "var(--type-ui-dense)" }}>
            <span style={{ minWidth: 0 }}>{name}<span style={{ color: "var(--fg-secondary)" }}> · {variant}</span></span>
            <span style={{ ...mono, flex: "none" }}>{qty} ×</span>
          </div>
        ))}
      </div>
      {/* UI-PTR-2: the primary action is thumb-sized and full width on a phone. */}
      <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", gap: "var(--space-2)" }}>
        {accepted ? (
          <>
            <Button size="lg" block={narrow} style={{ flex: narrow ? "none" : 1, background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }} iconLeft={<Icon name="truck" size={16} />} onClick={() => onAct(o.id)}>Mark dispatched</Button>
            <Button size="lg" block={narrow} variant="outline" iconLeft={<Icon name="download" size={16} />}>Packing slip</Button>
          </>
        ) : (
          <>
            <Button size="lg" block={narrow} style={{ flex: narrow ? "none" : 1 }} iconLeft={<Icon name="check" size={16} />} onClick={() => onAct(o.id)}>Accept</Button>
            <Button size="lg" block={narrow} variant="outline">Cannot fulfil</Button>
          </>
        )}
      </div>
    </div>
  );
}

function Queue({ narrow }) {
  const [rows, setRows] = React.useState(QUEUE);
  const act = (id) => setRows((p) => p.map((o) => (o.id === id ? { ...o, state: o.state === "new" ? "accepted" : "dispatched" } : o)).filter((o) => o.state !== "dispatched"));
  const nw = rows.filter((o) => o.state === "new").length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <PageHead eyebrowText={nw + " awaiting acceptance · accept within 24 hours"} title="Order queue"
        right={<Select size="sm" options={["All markets", "Bangladesh", "Export only"]} aria-label="Market filter" style={{ minWidth: 160 }} />} />
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(auto-fill, minmax(360px, 1fr))", gap: "var(--space-4)" }}>
        {rows.map((o) => <OrderCard key={o.id} o={o} narrow={narrow} onAct={act} />)}
      </div>
      {rows.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-12)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
          <Icon name="circle-check" size={22} color="var(--fg-secondary)" />
          <span style={{ font: "var(--type-h3)" }}>Queue clear</span>
          <span style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>Everything placed today has been accepted and dispatched.</span>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- vendor: market coverage (UI-PTR-4) ---------- */

const MARKETS = ["BD", "IN", "AE", "UK"];

const COVERAGE = [
  { name: "Handloom cotton kurta", sku: "VD-KRT-0421", live: { BD: true, IN: true, AE: true, UK: true } },
  { name: "Jamdani-panel shirt", sku: "VD-SHT-0207", live: { BD: true, IN: true, AE: false, UK: false }, missing: { AE: "No Arabic care label", UK: "Fibre composition not declared" } },
  { name: "Khadi overshirt", sku: "VD-OVR-0088", live: { BD: true, IN: false, AE: false, UK: true }, missing: { IN: "HS code missing" } },
  { name: "Nakshi kantha jacket", sku: "VD-JKT-0311", live: { BD: true, IN: false, AE: false, UK: false }, missing: { IN: "HS code missing", AE: "No Arabic care label", UK: "Fibre composition not declared" } },
];

function Coverage({ narrow }) {
  const gaps = COVERAGE.reduce((s, p) => s + Object.keys(p.missing || {}).length, 0);
  const cell = { padding: "var(--space-3) var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <PageHead eyebrowText={gaps + " gaps across 4 markets"} title="Market coverage" />
      {/* UI-PTR-4: not just which markets a product is in, but what is missing where it is not. */}
      <Panel title="Where each product is offered" meta="A blank cell is a gap you can close — the reason is named, not implied." pad={false}>
        <div className="vd-scroll-x" style={{ overflowX: "auto", overflowY: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-ui-dense)" }}>
            <thead>
              <tr>
                <th scope="col" style={{ ...eyebrow, textAlign: "start", padding: "var(--space-3) var(--space-4)", borderBlock: "var(--border-width-thin) solid var(--border-default)", whiteSpace: "nowrap" }}>Product</th>
                {MARKETS.map((m) => (
                  <th key={m} scope="col" style={{ ...eyebrow, textAlign: "center", padding: "var(--space-3) var(--space-4)", borderBlock: "var(--border-width-thin) solid var(--border-default)" }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COVERAGE.map((p) => (
                <tr key={p.sku}>
                  <td style={{ ...cell, minWidth: 220 }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span>{p.name}</span>
                      <span style={monoMeta}>{p.sku}</span>
                    </span>
                  </td>
                  {MARKETS.map((m) => (
                    <td key={m} style={{ ...cell, textAlign: "center", verticalAlign: "middle" }}>
                      {p.live[m]
                        ? <Icon name="circle-check" size={16} color="var(--success-text, var(--fg-primary))" label={"Live in " + m} />
                        : <span title={(p.missing || {})[m]} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)", color: "var(--fg-secondary)" }}>
                            <Icon name="circle-alert" size={15} label={"Not offered in " + m} />
                          </span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="What is blocking each market" meta="Fix one of these and every product listed under it goes live.">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[["UK", "Fibre composition not declared", 2], ["AE", "No Arabic care label", 2], ["IN", "HS code missing", 2]].map(([m, reason, n]) => (
            <div key={m + reason} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-4)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-md)", flexWrap: "wrap" }}>
              <Badge tone="warning" size="sm">{m}</Badge>
              <span style={{ flex: "1 1 auto", minWidth: 0, font: "var(--type-ui-dense)" }}>{reason}</span>
              <span style={{ ...monoMeta, whiteSpace: "nowrap" }}>{n} products</span>
              <Button variant="outline" size="sm" style={{ flex: "none" }}>Fix now</Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------- vendor: products ---------- */

const PRODUCTS = [
  ["Handloom cotton kurta", "VD-KRT-0421", 2450, 34, "Live", "success", 4],
  ["Jamdani-panel shirt", "VD-SHT-0207", 5800, 11, "Live", "success", 2],
  ["Khadi overshirt", "VD-OVR-0088", 4120, 0, "Out of stock", "warning", 2],
  ["Nakshi kantha jacket", "VD-JKT-0311", 9800, 6, "Live", "success", 1],
  ["Block-print wide trouser", "VD-TRS-0166", 3300, 19, "Draft", "default", 0],
];

function Products({ narrow }) {
  const cell = { padding: "var(--space-3) var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <PageHead eyebrowText="5 products · 1 out of stock · 1 draft" title="Products"
        right={<Button size="sm" iconLeft={<Icon name="plus" size={15} />}>Add product</Button>} />
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {["All", "Live", "Out of stock", "Draft"].map((v, i) => <Tag key={v} selected={i === 0}>{v}</Tag>)}
      </div>
      <Panel title="Your catalogue" meta="Stock is the count we can sell right now, across all markets. Prices are the Bangladesh list price before market adjustment." pad={false}>
        <div className="vd-scroll-x" style={{ overflowX: "auto", overflowY: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-ui-dense)" }}>
            <thead>
              <tr>
                {["Product", "Price (BDT)", "Stock", "Status", "Markets live", ""].map((h, i) => (
                  <th key={h || i} scope="col" style={{ ...eyebrow, textAlign: i === 1 || i === 2 || i === 4 ? "end" : "start", padding: "var(--space-3) var(--space-4)", borderBlock: "var(--border-width-thin) solid var(--border-default)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(([name, sku, price, stock, status, tone, live]) => (
                <tr key={sku}>
                  <td style={{ ...cell, minWidth: 210 }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span>{name}</span>
                      <span style={monoMeta}>{sku}</span>
                    </span>
                  </td>
                  <td style={{ ...cell, ...mono, textAlign: "end" }}>{taka(price)}</td>
                  <td style={{ ...cell, ...mono, textAlign: "end", color: stock === 0 ? "var(--error-text)" : "var(--fg-primary)" }}>{stock}</td>
                  <td style={cell}><Badge tone={tone} size="sm">{status}</Badge></td>
                  <td style={{ ...cell, ...mono, textAlign: "end", color: live < 4 ? "var(--fg-secondary)" : "var(--fg-primary)" }}>{live} of 4</td>
                  <td style={{ ...cell, textAlign: "end" }}>
                    <IconButton variant="ghost" size="sm" icon={<Icon name="pencil" size={15} />} label={"Edit " + name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ---------- settlement / royalties (UI-PTR-3) ---------- */

const STATEMENTS = [
  ["Aug 2026", "1–31 Aug", 184200, 14736, 169464, "Paying 5 Sep", "info"],
  ["Jul 2026", "1–31 Jul", 156800, 12544, 144256, "Paid 5 Aug", "success"],
  ["Jun 2026", "1–30 Jun", 141300, 11304, 129996, "Paid 5 Jul", "success"],
];

function Money({ role, narrow }) {
  const designer = role === "designer";
  const cell = { padding: "var(--space-3) var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <PageHead eyebrowText="All amounts in Bangladeshi taka (BDT)" title={designer ? "Royalties" : "Settlement"}
        right={<Button variant="outline" size="sm" iconLeft={<Icon name="download" size={15} />}>Export statements</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(auto-fit, minmax(230px, 1fr))", gap: "var(--space-4)" }}>
        <Figure label="Available now" value={taka(169464)} period="Earned 1–31 Aug 2026" note="Available" tone="success" />
        <Figure label="Pending clearance" value={taka(48200)} period="Earned 1–4 Sep 2026" note="Pending — clears 14 days after delivery" tone="warning" />
        <Figure label="Next payout" value={taka(169464)} period="Scheduled 5 Sep 2026" note="bKash ending 4417" />
        <Figure label={designer ? "Royalty rate" : "Commission"} value={designer ? "12%" : "18%"} period="Effective 1 Jul 2026" note="Of goods value, excluding delivery and duty" />
      </div>
      <Panel title="Statements" meta="Gross is goods value only. Delivery, duty and taxes are settled separately and never appear here." pad={false}>
        <div className="vd-scroll-x" style={{ overflowX: "auto", overflowY: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-ui-dense)" }}>
            <thead>
              <tr>
                {["Period", "Dates", "Gross (BDT)", designer ? "Platform share" : "Commission", "Net to you", "Status"].map((h, i) => (
                  <th key={h} scope="col" style={{ ...eyebrow, textAlign: i >= 2 && i <= 4 ? "end" : "start", padding: "var(--space-3) var(--space-4)", borderBlock: "var(--border-width-thin) solid var(--border-default)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATEMENTS.map(([p, dates, gross, fee, net, status, tone]) => (
                <tr key={p}>
                  <td style={{ ...cell, whiteSpace: "nowrap" }}>{p}</td>
                  <td style={{ ...cell, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{dates}</td>
                  <td style={{ ...cell, ...mono, textAlign: "end" }}>{taka(gross)}</td>
                  <td style={{ ...cell, ...mono, textAlign: "end", color: "var(--fg-secondary)" }}>−{taka(fee)}</td>
                  <td style={{ ...cell, ...mono, textAlign: "end", fontWeight: "var(--weight-medium)" }}>{taka(net)}</td>
                  <td style={cell}><Badge tone={tone} size="sm">{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ---------- designer: designs and performance ---------- */

const DESIGNS = [
  ["Monsoon monogram", "VD-STU-77412", "Published", "success", 41, 4920, "2 Aug"],
  ["রঙে রঙে — type study", "VD-STU-77380", "Published", "success", 128, 15360, "18 Jul"],
  ["Delta lines", "VD-STU-77455", "In review", "warning", 0, 0, "4 Sep"],
  ["Kantha grid", "VD-STU-77401", "Draft", "default", 0, 0, "—"],
];

function Designs({ narrow }) {
  const cell = { padding: "var(--space-3) var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <PageHead eyebrowText="2 published · 1 in review · 1 draft" title="My designs"
        right={<Button size="sm" iconLeft={<Icon name="plus" size={15} />}>New design</Button>} />
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {["All", "Published", "In review", "Draft"].map((v, i) => <Tag key={v} selected={i === 0}>{v}</Tag>)}
      </div>
      <Panel title="Designs" meta="Royalties accrue only on published designs, and only after the buyer's return window closes." pad={false}>
        <div className="vd-scroll-x" style={{ overflowX: "auto", overflowY: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-ui-dense)" }}>
            <thead>
              <tr>
                {["Design", "Status", "Sold", "Royalties earned (BDT)", "Published"].map((h, i) => (
                  <th key={h} scope="col" style={{ ...eyebrow, textAlign: i === 2 || i === 3 ? "end" : "start", padding: "var(--space-3) var(--space-4)", borderBlock: "var(--border-width-thin) solid var(--border-default)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DESIGNS.map(([name, sku, status, tone, sold, earned, when]) => (
                <tr key={sku}>
                  <td style={{ ...cell, minWidth: 200 }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span>{name}</span>
                      <span style={monoMeta}>{sku}</span>
                    </span>
                  </td>
                  <td style={cell}><Badge tone={tone} size="sm">{status}</Badge></td>
                  <td style={{ ...cell, ...mono, textAlign: "end" }}>{sold || "—"}</td>
                  <td style={{ ...cell, ...mono, textAlign: "end" }}>{earned ? taka(earned) : "—"}</td>
                  <td style={{ ...cell, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Performance({ narrow }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <PageHead eyebrowText="1–31 Aug 2026 · compared with July" title="Performance" />
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(auto-fit, minmax(230px, 1fr))", gap: "var(--space-4)" }}>
        <Figure label="Views" value="21,153" period="1–31 Aug 2026" note="+18.2% on July" />
        <Figure label="Pieces sold" value="169" period="1–31 Aug 2026" note="+11.4% on July" />
        <Figure label="Conversion" value="0.8%" period="1–31 Aug 2026" note="Views that became an order" />
        <Figure label="Returned" value="4" period="Delivered 1–31 Aug 2026" note="Royalties reversed on these" tone="warning" />
      </div>
      <Panel title="By market" meta="Views and orders for the period, in the buyer's market.">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {[["Bangladesh", 14200, 112, 84], ["United Kingdom", 3810, 31, 42], ["India", 2140, 19, 26], ["United Arab Emirates", 1003, 7, 14]].map(([m, views, orders, pct]) => (
            <div key={m} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", font: "var(--type-ui-dense)" }}>
                <span>{m}</span>
                <span style={{ ...monoMeta, whiteSpace: "nowrap" }}>{views.toLocaleString("en-IN")} views · {orders} orders</span>
              </div>
              <span style={{ height: 4, background: "var(--bg-surface-sunken)" }}>
                <span style={{ display: "block", width: pct + "%", height: "100%", background: "var(--accent-fill)" }} />
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------- shell ---------- */

function Sidebar({ role, page, onNavigate }) {
  const [name, kind] = TITLES[role];
  return (
    <nav aria-label={kind} className="vd-scroll-y" style={{ width: "var(--sidebar-width)", flex: "none", display: "flex", flexDirection: "column", gap: "var(--space-5)", paddingBlock: "var(--space-4)", background: "var(--bg-surface)", borderInlineEnd: "var(--border-width-thin) solid var(--border-default)", overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingInline: "var(--space-4)", minHeight: 40 }}>
        <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, flex: "none", borderRadius: "var(--radius-sm)", background: "var(--fg-primary)", color: "var(--fg-inverse)", font: "var(--type-label)", letterSpacing: 0 }}>V</span>
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
          <span style={{ font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>{kind}</span>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {NAV[role].map(([id, label, icon, badge]) => {
          const active = page === id;
          return (
            <button key={id} type="button" onClick={() => onNavigate(id)} aria-current={active ? "page" : undefined}
              style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minHeight: 34, marginInline: "var(--space-2)", paddingInline: "var(--space-2)", border: "none", borderRadius: "var(--radius-sm)", background: active ? "var(--bg-surface-sunken)" : "transparent", color: active ? "var(--fg-primary)" : "var(--fg-secondary)", font: "var(--type-ui-dense)", fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)", cursor: "pointer", textAlign: "start", transition: "var(--transition-control)" }}>
              <Icon name={icon} size={16} color={active ? "var(--accent-text)" : "currentColor"} />
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
              {badge ? <span style={{ flex: "none", paddingInline: "var(--space-2)", borderRadius: "var(--radius-full)", background: "var(--bg-surface-sunken)", font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>{badge}</span> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* UI-PTR-2: at 320 the nav is a bottom bar, within thumb reach and out of the way of
   the order cards, which are the only thing a warehouse phone is used for. */
function BottomNav({ role, page, onNavigate }) {
  return (
    <nav aria-label="Sections" style={{ position: "sticky", insetBlockEnd: 0, zIndex: "var(--z-sticky)", display: "flex", flex: "none", background: "var(--bg-surface)", borderBlockStart: "var(--border-width-thin) solid var(--border-strong)" }}>
      {NAV[role].map(([id, label, icon, badge]) => {
        const active = page === id;
        return (
          <button key={id} type="button" onClick={() => onNavigate(id)} aria-current={active ? "page" : undefined}
            style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minHeight: "var(--touch-target-min)", paddingBlock: "var(--space-2)", border: "none", background: "transparent", color: active ? "var(--fg-primary)" : "var(--fg-secondary)", cursor: "pointer" }}>
            <Icon name={icon} size={19} color={active ? "var(--accent-text)" : "currentColor"} />
            <span style={{ font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", textAlign: "center", lineHeight: 1.2 }}>{label}</span>
            {badge ? <span aria-hidden="true" style={{ position: "absolute", insetBlockStart: 4, insetInlineStart: "calc(50% + 6px)", minWidth: 15, height: 15, paddingInline: 3, borderRadius: "var(--radius-full)", background: "var(--accent-fill)", color: "var(--accent-on-fill)", fontFamily: "var(--font-mono)", fontSize: 9, lineHeight: "15px", textAlign: "center" }}>{badge}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

function Topbar({ role, crumb, scheme, onScheme, narrow }) {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: "none", minHeight: "var(--topbar-height)", paddingInline: narrow ? "var(--space-4)" : "var(--space-5)", background: "var(--bg-surface)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      {narrow ? (
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{TITLES[role][0]}</span>
          <span style={{ font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>{crumb}</span>
        </span>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>
          <span>{TITLES[role][1]}</span><Icon name="chevron-right" size={14} /><span style={{ color: "var(--fg-primary)" }}>{crumb}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginInlineStart: "auto" }}>
        {narrow ? null : <div style={{ width: 260 }}><Input size="sm" placeholder="Search orders and products…" prefix={<Icon name="search" size={15} color="var(--fg-secondary)" />} aria-label="Search" /></div>}
        <IconButton variant="ghost" icon={<Icon name={scheme === "dark" ? "sun" : "moon"} size={16} />} label="Toggle colour scheme" onClick={onScheme} />
        <span aria-hidden="true" style={{ width: 28, height: 28, flex: "none", borderRadius: "var(--radius-full)", background: "var(--bg-surface-sunken)", border: "var(--border-width-thin) solid var(--border-default)" }} />
      </div>
    </header>
  );
}

const LABELS = {};
Object.values(NAV).forEach((items) => items.forEach(([id, label]) => { LABELS[id] = label; }));

function PortalApp({ role = "vendor", page, scheme = "light", width = "1440" }) {
  const dsReady = useDesignSystemReady();
  const first = NAV[role] ? NAV[role][0][0] : "queue";
  const [s, setS] = React.useState({ role, page: page || first, scheme, width });
  React.useEffect(() => {
    const f = NAV[role] ? NAV[role][0][0] : "queue";
    const valid = NAV[role] && NAV[role].some(([id]) => id === (page || s.page));
    setS((p) => ({ ...p, role, scheme, width, page: valid ? (page || p.page) : f }));
  }, [role, page, scheme, width]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", s.scheme === "dark");
  }, [s.scheme]);

  if (!dsReady) return <div style={{ minHeight: "100vh" }} />;
  const narrow = s.width === "320";
  const go = (id) => setS((p) => ({ ...p, page: id }));

  const body = s.page === "queue" ? <Queue narrow={narrow} />
    : s.page === "products" ? <Products narrow={narrow} />
    : s.page === "markets" ? <Coverage narrow={narrow} />
    : s.page === "earnings" || s.page === "royalties" ? <Money role={s.role} narrow={narrow} />
    : s.page === "designs" ? <Designs narrow={narrow} />
    : s.page === "performance" ? <Performance narrow={narrow} />
    : s.role === "vendor" ? <Queue narrow={narrow} />
    : <Designs narrow={narrow} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-canvas)", color: "var(--fg-primary)", font: "var(--type-ui-dense)" }}>
      {narrow ? null : <Sidebar role={s.role} page={s.page} onNavigate={go} />}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar role={s.role} crumb={LABELS[s.page] || ""} scheme={s.scheme} narrow={narrow}
          onScheme={() => setS((p) => ({ ...p, scheme: p.scheme === "dark" ? "light" : "dark" }))} />
        <main style={{ flex: 1, minWidth: 0, padding: narrow ? "var(--space-4)" : "var(--space-6)" }}>{body}</main>
        {narrow ? <BottomNav role={s.role} page={s.page} onNavigate={go} /> : null}
      </div>
    </div>
  );
}

Object.assign(window, { PortalApp });
