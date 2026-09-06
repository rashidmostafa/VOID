/* Void admin — the nine operational destinations plus the help centre.

   Mounted alongside AdminApp.jsx: this file registers window.VoidAdminPages, and
   AdminApp resolves it at render time, so neither file depends on the other's load
   order. Shared shell primitives (Panel, MarketScope, StatCard, MetricTile, Spark)
   come from window.VoidAdminKit, published by AdminApp, and are also resolved at
   render time.

   Density, borders and the uppercase group label follow the order list. Every value
   resolves through a Void token (UI-SRC-9). */

const DS = () => window.VoidDesignSystem_980885 || {};
const KIT = () => window.VoidAdminKit || {};

const Badge = React.forwardRef((p, ref) => React.createElement(DS().Badge, { ...p, ref }));
const Button = React.forwardRef((p, ref) => React.createElement(DS().Button, { ...p, ref }));
const Icon = React.forwardRef((p, ref) => React.createElement(DS().Icon, { ...p, ref }));
const IconButton = React.forwardRef((p, ref) => React.createElement(DS().IconButton, { ...p, ref }));
const Input = React.forwardRef((p, ref) => React.createElement(DS().Input, { ...p, ref }));
const Select = React.forwardRef((p, ref) => React.createElement(DS().Select, { ...p, ref }));
const Switch = React.forwardRef((p, ref) => React.createElement(DS().Switch, { ...p, ref }));
const Tabs = React.forwardRef((p, ref) => React.createElement(DS().Tabs, { ...p, ref }));
const Tag = React.forwardRef((p, ref) => React.createElement(DS().Tag, { ...p, ref }));

const Panel = (p) => React.createElement(KIT().Panel, p);
const MarketScope = (p) => React.createElement(KIT().MarketScope, p);
const StatCard = (p) => React.createElement(KIT().StatCard, p);
const MetricTile = (p) => React.createElement(KIT().MetricTile, p);
const Spark = (p) => React.createElement(KIT().Spark, p);

const eyebrow = { font: "var(--type-label)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--fg-secondary)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" };
const taka = (n) => "৳" + n.toLocaleString("en-IN");
const line = "var(--border-width-thin) solid var(--border-default)";
const cell = { padding: "var(--space-3) var(--space-4)", borderBlockEnd: line };
const head = { ...eyebrow, textAlign: "start", padding: "var(--space-3) var(--space-4)", borderBlock: line, whiteSpace: "nowrap" };

/* ---------- page furniture ---------- */

function PageHead({ meta, title, market, action, children }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <span style={eyebrow}>{meta}</span>
        <h1 style={{ font: "var(--type-h1)", margin: 0 }}>{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
        {children}
        {market ? <MarketScope market={market} /> : null}
        {action}
      </div>
    </div>
  );
}

function Page({ children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>{children}</div>;
}

function Table({ columns, children }) {
  return (
    <div className="vd-scroll-x" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-ui-dense)" }}>
        <thead>
          <tr>
            {columns.map(([label, align]) => (
              <th key={label} scope="col" style={{ ...head, textAlign: align === "end" ? "end" : "start", paddingInlineStart: label === columns[0][0] ? "var(--space-5)" : undefined }}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* A labelled row of definition pairs — used by the customs detail and market config. */
function Facts({ rows }) {
  return (
    <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "var(--space-5)", rowGap: "var(--space-3)", margin: 0, font: "var(--type-ui-dense)" }}>
      {rows.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt style={{ color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{k}</dt>
          <dd style={{ margin: 0 }}>{v}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/* Horizontal capacity / stock meter. */
function Meter({ pct, tone = "var(--fg-primary)", width = 88 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
      <span style={{ width, height: 6, flex: "none", borderRadius: "var(--radius-full)", background: "var(--bg-surface-sunken)", overflow: "hidden" }}>
        <span style={{ display: "block", width: pct + "%", height: "100%", background: tone }} />
      </span>
      <span style={{ ...mono, color: "var(--fg-secondary)" }}>{pct}%</span>
    </span>
  );
}

function Thumb({ ratio = "3 / 4", label }) {
  return (
    <span aria-hidden="true" title={label} style={{ display: "block", aspectRatio: ratio, background: "var(--bg-surface-sunken)", border: line, borderRadius: "var(--radius-sm)" }} />
  );
}

/* ---------- 1. Customs queue ---------- */

const HOLDS = [
  { id: "VD-24816", dest: "Manchester, UK", carrier: "DHL Express", reason: "Missing commercial invoice", age: 4, value: 4120, hs: "6109.10", parcels: 1, docs: [["Commercial invoice", false], ["Packing list", true], ["Certificate of origin", true], ["Duty prepayment receipt", true]] },
  { id: "VD-24774", dest: "Leeds, UK", carrier: "DHL Express", reason: "HS code query — 6109.10", age: 6, value: 9880, hs: "6109.10", parcels: 2, docs: [["Commercial invoice", true], ["Packing list", true], ["Certificate of origin", false], ["Fibre composition sheet", false]] },
  { id: "VD-24769", dest: "Dubai, AE", carrier: "Aramex", reason: "Consignee contact unreachable", age: 2, value: 6400, hs: "6204.42", parcels: 1, docs: [["Commercial invoice", true], ["Packing list", true], ["Consignee ID", false]] },
  { id: "VD-24755", dest: "Pune, IN", carrier: "FedEx", reason: "Duty prepayment not applied", age: 11, value: 2980, hs: "6110.20", parcels: 1, docs: [["Commercial invoice", true], ["Packing list", true], ["Duty prepayment receipt", false]] },
];

function CustomsQueue({ market }) {
  const [open, setOpen] = React.useState(HOLDS[0].id);
  const sel = HOLDS.find((h) => h.id === open) || HOLDS[0];
  return (
    <Page>
      <PageHead meta="9 shipments held" title="Customs queue" market={market}
        action={<Button variant="outline" size="sm" iconLeft={<Icon name="download" size={15} />}>Export manifest</Button>} />

      {/* FR-ADM-52: the queue is worked from a list into a detail pane, never a modal —
          an agent keeps the carrier's wording in view while they assemble documents. */}
      <div className="vd-split" style={{ "--split": "minmax(0, 1fr) minmax(0, 1.1fr)" }}>
        <section style={{ background: "var(--bg-surface)", border: line, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", borderBlockEnd: line }}>
            <span style={eyebrow}>Oldest first</span>
            <div style={{ marginInlineStart: "auto" }}>
              <Select size="sm" value="all" options={[{ value: "all", label: "All carriers" }, { value: "dhl", label: "DHL Express" }, { value: "aramex", label: "Aramex" }, { value: "fedex", label: "FedEx" }]} aria-label="Carrier" />
            </div>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {HOLDS.map((h) => {
              const active = h.id === sel.id;
              const missing = h.docs.filter(([, ok]) => !ok).length;
              return (
                <li key={h.id}>
                  <button type="button" onClick={() => setOpen(h.id)} aria-current={active ? "true" : undefined}
                    style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-2)", width: "100%", padding: "var(--space-4) var(--space-5)", border: "none", borderBlockEnd: line, borderInlineStart: "3px solid " + (active ? "var(--accent-fill)" : "transparent"), background: active ? "var(--bg-surface-sunken)" : "transparent", color: "inherit", font: "var(--type-ui-dense)", textAlign: "start", cursor: "pointer", transition: "var(--transition-control)" }}>
                    <span style={{ ...mono }}>{h.id}</span>
                    <Badge tone={h.age >= 6 ? "danger" : h.age >= 4 ? "warning" : "outline"} size="sm">{h.age} days</Badge>
                    <span style={{ color: "var(--fg-secondary)" }}>{h.reason}</span>
                    <span style={{ color: "var(--fg-secondary)", textAlign: "end", whiteSpace: "nowrap" }}>{missing} doc{missing === 1 ? "" : "s"} missing</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <Panel title={sel.id} meta={sel.carrier + " · " + sel.dest}
          action={<IconButton variant="ghost" icon={<Icon name="external-link" size={15} />} label="Open order" />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div style={{ padding: "var(--space-4)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-md)", font: "var(--type-ui-dense)" }}>
              <span style={{ ...eyebrow, display: "block", paddingBlockEnd: "var(--space-2)" }}>Carrier's stated reason</span>
              {sel.reason}
            </div>
            <Facts rows={[
              ["Declared value", <span style={mono}>{taka(sel.value)}</span>],
              ["HS code", <span style={mono}>{sel.hs}</span>],
              ["Parcels", sel.parcels],
              ["Held since", sel.age + " days ago"],
            ]} />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <span style={eyebrow}>Documents</span>
              {sel.docs.map(([label, ok]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", font: "var(--type-ui-dense)" }}>
                  <Icon name={ok ? "check" : "triangle-alert"} size={15} color={ok ? "var(--fg-secondary)" : "var(--error-text)"} />
                  <span style={{ flex: 1, color: ok ? "var(--fg-primary)" : "var(--fg-primary)" }}>{label}</span>
                  {ok ? <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>Attached</span>
                    : <Button variant="outline" size="sm">Attach</Button>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", paddingBlockStart: "var(--space-4)", borderBlockStart: line }}>
              <Button size="sm">Resubmit to carrier</Button>
              <Button variant="outline" size="sm">Message customer</Button>
              <Button variant="ghost" size="sm" style={{ marginInlineStart: "auto" }}>Abandon</Button>
            </div>
          </div>
        </Panel>
      </div>
    </Page>
  );
}

/* ---------- 2. Returns ---------- */

const RETURN_STAGES = [["Requested", 14], ["In transit", 9], ["Inspecting", 6], ["Resolved", 61]];
const RETURNS = [
  ["RMA-3312", "VD-24798", "Ellen Whitfield", "Sizing — too small", "A · resaleable", "Refund", 7600, "warning", "Inspecting"],
  ["RMA-3309", "VD-24781", "Rohan Mehta", "Print misalignment", "C · defect", "Replace", 2980, "danger", "Requested"],
  ["RMA-3305", "VD-24760", "Nusrat Jahan", "Changed mind", "A · resaleable", "Refund", 4250, "info", "In transit"],
  ["RMA-3298", "VD-24744", "Marcus Reid", "Wrong item shipped", "B · minor wear", "Replace", 4120, "success", "Resolved"],
  ["RMA-3291", "VD-24738", "Priya Nair", "Fabric weight not as described", "A · resaleable", "Refund", 3890, "success", "Resolved"],
];

function Returns({ market }) {
  return (
    <Page>
      <PageHead meta="Last 30 days" title="Returns" market={market}
        action={<Button variant="outline" size="sm" iconLeft={<Icon name="download" size={15} />}>Export CSV</Button>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-5)" }}>
        {RETURN_STAGES.map(([label, n], i) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-5)", background: "var(--bg-surface)", border: line, borderRadius: "var(--radius-lg)" }}>
            <span style={eyebrow}>Stage {i + 1}</span>
            <span style={{ font: "var(--type-h2)" }}>{n}</span>
            <span style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="vd-split" style={{ "--split": "minmax(0, 2.2fr) minmax(0, 1fr)" }}>
        <Panel title="Open returns" meta="Condition grade is set at inspection and drives the resolution" pad={false}>
          <Table columns={[["RMA"], ["Order"], ["Customer"], ["Reason"], ["Condition"], ["Resolution"], ["Value", "end"]]}>
            {RETURNS.map(([rma, order, customer, reason, grade, res, value, tone]) => (
              <tr key={rma}>
                <td style={{ ...cell, ...mono, paddingInlineStart: "var(--space-5)", whiteSpace: "nowrap" }}>{rma}</td>
                <td style={{ ...cell, ...mono, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{order}</td>
                <td style={{ ...cell, whiteSpace: "nowrap" }}>{customer}</td>
                <td style={cell}>{reason}</td>
                <td style={{ ...cell, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{grade}</td>
                <td style={cell}><Badge tone={tone} size="sm">{res}</Badge></td>
                <td style={{ ...cell, ...mono, textAlign: "end", whiteSpace: "nowrap" }}>{taka(value)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <Panel title="Return rate" meta="Share of shipped orders returned">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-4)" }}>
                <span style={{ font: "var(--type-h2)" }}>4.8%</span>
                <Spark bars={[52, 44, 60, 38, 46, 34]} />
              </div>
              <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>Down from 6.1% in the previous 30 days.</span>
            </div>
          </Panel>
          <Panel title="Leading reasons">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {[["Sizing", 41], ["Changed mind", 24], ["Print or stitch defect", 19], ["Wrong item", 9], ["Late arrival", 7]].map(([label, pct]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)", font: "var(--type-ui-dense)" }}>
                  <span>{label}</span>
                  <Meter pct={pct} width={72} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Page>
  );
}

/* ---------- 3. Catalogue ---------- */

const PRODUCTS = [
  ["Jamdani panel shirt", "Rashid Atelier", 8, 42, 6350, "Live", "success", 74],
  ["Indigo wrap kurta", "Void Studio", 12, 18, 4820, "Live", "success", 31],
  ["Khadi overshirt", "Meherpur Weave", 6, 4, 5400, "Low stock", "warning", 8],
  ["Nakshi kantha jacket", "Rashid Atelier", 4, 0, 12900, "Out of stock", "danger", 0],
  ["Handloom gamcha scarf", "Tangail Loom Co.", 9, 126, 1450, "Live", "success", 96],
  ["Muslin shift dress", "Void Studio", 10, 22, 7600, "Draft", "default", 44],
];

function Catalogue({ market }) {
  const [view, setView] = React.useState("grid");
  return (
    <Page>
      <PageHead meta="248 products · 1,914 variants" title="Catalogue" market={market}
        action={<Button size="sm" iconLeft={<Icon name="plus" size={15} />}>New product</Button>}>
        <Tabs variant="segmented" size="sm" value={view} onChange={setView} items={[{ value: "grid", label: "Grid" }, { value: "table", label: "Table" }]} />
      </PageHead>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
          <Input size="sm" placeholder="Search products…" prefix={<Icon name="search" size={15} color="var(--fg-secondary)" />} aria-label="Search products" />
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {["All", "Live", "Draft", "Low stock", "Out of stock"].map((f, i) => <Tag key={f} selected={i === 0} onClick={() => {}}>{f}</Tag>)}
        </div>
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "var(--space-5)" }}>
          {PRODUCTS.map(([name, vendor, variants, stock, price, status, tone, pct]) => (
            <article key={name} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--bg-surface)", border: line, borderRadius: "var(--radius-lg)" }}>
              <Thumb label={name} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>{name}</span>
                  <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{vendor}</span>
                </div>
                <Badge tone={tone} size="sm">{status}</Badge>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", paddingBlockStart: "var(--space-3)", borderBlockStart: line, font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
                <span style={mono}>{taka(price)}</span>
                <span>{variants} variants · {stock} in stock</span>
              </div>
              <Meter pct={pct} width={"100%"} tone={pct === 0 ? "var(--error-text)" : "var(--fg-primary)"} />
            </article>
          ))}
        </div>
      ) : (
        <section style={{ background: "var(--bg-surface)", border: line, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <Table columns={[["Product"], ["Vendor"], ["Variants", "end"], ["Stock", "end"], ["Price", "end"], ["Status"]]}>
            {PRODUCTS.map(([name, vendor, variants, stock, price, status, tone]) => (
              <tr key={name}>
                <td style={{ ...cell, paddingInlineStart: "var(--space-5)" }}>{name}</td>
                <td style={{ ...cell, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{vendor}</td>
                <td style={{ ...cell, textAlign: "end" }}>{variants}</td>
                <td style={{ ...cell, textAlign: "end" }}>{stock}</td>
                <td style={{ ...cell, ...mono, textAlign: "end", whiteSpace: "nowrap" }}>{taka(price)}</td>
                <td style={cell}><Badge tone={tone} size="sm">{status}</Badge></td>
              </tr>
            ))}
          </Table>
        </section>
      )}
    </Page>
  );
}

/* ---------- 4. Vendors ---------- */

const VENDORS = [
  ["Rashid Atelier", "Narayanganj, BD", "Cut & sew, hand embroidery", 96, 18, 42, "Preferred", "success"],
  ["Tangail Loom Co.", "Tangail, BD", "Handloom weaving", 91, 26, 31, "Preferred", "success"],
  ["Meherpur Weave", "Meherpur, BD", "Khadi, natural dye", 78, 41, 12, "Under review", "warning"],
  ["Dhaka Print Works", "Dhaka, BD", "Screen and digital print", 88, 22, 27, "Active", "info"],
  ["Chattogram Knit", "Chattogram, BD", "Circular knit, jersey", 64, 55, 6, "Probation", "danger"],
];

function Vendors({ market }) {
  return (
    <Page>
      <PageHead meta="5 active vendors" title="Vendors" market={market}
        action={<Button size="sm" iconLeft={<Icon name="plus" size={15} />}>Invite vendor</Button>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
        <StatCard icon="store" value="5" title="Vendors producing" delta="+1" dir="up" />
        <StatCard icon="clock" value="21 days" title="Median lead time" delta="-3 days" dir="down" />
        <StatCard icon="shield-check" value="87%" title="On-time delivery" delta="+2.4%" dir="up" />
      </div>

      <Panel title="Vendor roster" meta="Capacity is this month's committed units against the agreed ceiling" pad={false}>
        <Table columns={[["Vendor"], ["Capability"], ["On-time"], ["Lead time", "end"], ["Open POs", "end"], ["Standing"]]}>
          {VENDORS.map(([name, place, cap, onTime, lead, pos, standing, tone]) => (
            <tr key={name}>
              <td style={{ ...cell, paddingInlineStart: "var(--space-5)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontWeight: "var(--weight-medium)" }}>{name}</span>
                  <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{place}</span>
                </div>
              </td>
              <td style={{ ...cell, color: "var(--fg-secondary)" }}>{cap}</td>
              <td style={cell}><Meter pct={onTime} tone={onTime < 70 ? "var(--error-text)" : "var(--fg-primary)"} /></td>
              <td style={{ ...cell, textAlign: "end", whiteSpace: "nowrap" }}>{lead} days</td>
              <td style={{ ...cell, textAlign: "end" }}>{pos}</td>
              <td style={cell}><Badge tone={tone} size="sm">{standing}</Badge></td>
            </tr>
          ))}
        </Table>
      </Panel>
    </Page>
  );
}

/* ---------- 5. Designers ---------- */

const DESIGNERS = [
  ["Anika Rahman", "Dhaka", 14, 12, 12, 186400, "Verified", "success"],
  ["Imran Chowdhury", "Sylhet", 9, 7, 10, 94200, "Verified", "success"],
  ["Sadia Noor", "Khulna", 6, 3, 15, 41800, "Pending review", "warning"],
  ["Tahmid Zaman", "Dhaka", 21, 19, 12, 302650, "Verified", "success"],
  ["Farhana Islam", "Rajshahi", 3, 0, 10, 0, "Onboarding", "info"],
];

function Designers({ market }) {
  return (
    <Page>
      <PageHead meta="41 designers · 4 awaiting review" title="Designers" market={market}
        action={<Button variant="outline" size="sm">Royalty policy</Button>} />

      <div className="vd-split" style={{ "--split": "minmax(0, 2.4fr) minmax(0, 1fr)" }}>
        <Panel title="Roster" meta="Royalty is the designer's share of net revenue on their published designs" pad={false}>
          <Table columns={[["Designer"], ["Submitted", "end"], ["Live", "end"], ["Royalty", "end"], ["Earned to date", "end"], ["Status"]]}>
            {DESIGNERS.map(([name, city, submitted, live, royalty, earned, status, tone]) => (
              <tr key={name}>
                <td style={{ ...cell, paddingInlineStart: "var(--space-5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <span aria-hidden="true" style={{ width: 28, height: 28, flex: "none", borderRadius: "var(--radius-full)", background: "var(--bg-surface-sunken)", border: line }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontWeight: "var(--weight-medium)" }}>{name}</span>
                      <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{city}</span>
                    </div>
                  </div>
                </td>
                <td style={{ ...cell, textAlign: "end" }}>{submitted}</td>
                <td style={{ ...cell, textAlign: "end" }}>{live}</td>
                <td style={{ ...cell, ...mono, textAlign: "end" }}>{royalty}%</td>
                <td style={{ ...cell, ...mono, textAlign: "end", whiteSpace: "nowrap" }}>{taka(earned)}</td>
                <td style={cell}><Badge tone={tone} size="sm">{status}</Badge></td>
              </tr>
            ))}
          </Table>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <Panel title="Awaiting review" meta="Identity and portfolio checks">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {[["Sadia Noor", "Portfolio submitted 2 days ago"], ["Farhana Islam", "Identity document pending"], ["Nabil Haque", "Bank details unverified"], ["Rumana Aziz", "Portfolio submitted 5 days ago"]].map(([name, note]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span aria-hidden="true" style={{ width: 28, height: 28, flex: "none", borderRadius: "var(--radius-full)", background: "var(--bg-surface-sunken)", border: line }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                    <span style={{ font: "var(--type-ui-dense)" }}>{name}</span>
                    <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{note}</span>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Royalties this period">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-3)" }}>
              <MetricTile icon="wallet" label="Accrued" value={taka(173560)} />
              <MetricTile icon="banknote" label="Paid last period" value={taka(158200)} />
            </div>
          </Panel>
        </div>
      </div>
    </Page>
  );
}

/* ---------- 6. Payouts ---------- */

const PAYOUT_ROWS = [
  ["PO-2609-014", "Rashid Atelier", "Vendor", "31 Aug 2026", 412800, "Scheduled", "info", ""],
  ["PO-2609-013", "Tahmid Zaman", "Designer", "31 Aug 2026", 68400, "Scheduled", "info", ""],
  ["PO-2609-012", "Chattogram Knit", "Vendor", "31 Aug 2026", 96200, "On hold", "warning", "Quality claim open"],
  ["PO-2608-041", "Anika Rahman", "Designer", "31 Jul 2026", 54100, "Paid", "success", ""],
  ["PO-2608-040", "Tangail Loom Co.", "Vendor", "31 Jul 2026", 288900, "Paid", "success", ""],
  ["PO-2608-039", "Sadia Noor", "Designer", "31 Jul 2026", 12300, "Failed", "danger", "Bank details rejected"],
];

function Payouts({ market }) {
  return (
    <Page>
      <PageHead meta="Period 1–31 Aug 2026 · closes in 4 days" title="Payouts" market={market}
        action={<Button size="sm">Approve period</Button>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
        <MetricTile icon="banknote" label="Gross owed" value={taka(577400)} />
        <MetricTile icon="wallet" label="Designer royalties" value={taka(122500)} />
        <MetricTile icon="shield-check" label="Withheld on hold" value={taka(96200)} />
        <MetricTile icon="credit-card" label="Fees and FX" value={taka(8940)} />
      </div>

      <Panel title="Statement lines" meta="A hold states its reason on the line, not in a separate report" pad={false}
        action={<Button variant="outline" size="sm" iconLeft={<Icon name="download" size={15} />}>Export ledger</Button>}>
        <Table columns={[["Reference"], ["Payee"], ["Type"], ["Period end"], ["Amount", "end"], ["Status"]]}>
          {PAYOUT_ROWS.map(([ref, payee, type, end, amount, status, tone, note]) => (
            <tr key={ref}>
              <td style={{ ...cell, ...mono, paddingInlineStart: "var(--space-5)", whiteSpace: "nowrap" }}>{ref}</td>
              <td style={{ ...cell, whiteSpace: "nowrap" }}>{payee}</td>
              <td style={{ ...cell, color: "var(--fg-secondary)" }}>{type}</td>
              <td style={{ ...cell, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{end}</td>
              <td style={{ ...cell, ...mono, textAlign: "end", whiteSpace: "nowrap" }}>{taka(amount)}</td>
              <td style={cell}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                  <Badge tone={tone} size="sm">{status}</Badge>
                  {note ? <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{note}</span> : null}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </Page>
  );
}

/* ---------- 7. Moderation ---------- */

const SUBMISSIONS = [
  { id: "SUB-1182", title: "Rickshaw art tee", designer: "Imran Chowdhury", age: "2 hours", flags: ["Possible third-party artwork"], tone: "warning" },
  { id: "SUB-1181", title: "Bengal tiger panel", designer: "Anika Rahman", age: "5 hours", flags: [], tone: "default" },
  { id: "SUB-1179", title: "Slogan crew — Bangla script", designer: "Nabil Haque", age: "1 day", flags: ["Text legibility below print minimum"], tone: "warning" },
  { id: "SUB-1176", title: "Alpona repeat print", designer: "Tahmid Zaman", age: "1 day", flags: [], tone: "default" },
];

function Moderation({ market }) {
  const [open, setOpen] = React.useState(SUBMISSIONS[0].id);
  const sel = SUBMISSIONS.find((s) => s.id === open) || SUBMISSIONS[0];
  return (
    <Page>
      <PageHead meta="4 designs awaiting a decision" title="Moderation" market={market} />

      <div className="vd-split" style={{ "--split": "minmax(0, 1fr) minmax(0, 1.6fr)" }}>
        <section style={{ background: "var(--bg-surface)", border: line, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "var(--space-4) var(--space-5)", borderBlockEnd: line }}><span style={eyebrow}>Queue</span></div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {SUBMISSIONS.map((s) => {
              const active = s.id === sel.id;
              return (
                <li key={s.id}>
                  <button type="button" onClick={() => setOpen(s.id)} aria-current={active ? "true" : undefined}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", width: "100%", padding: "var(--space-3) var(--space-4)", border: "none", borderBlockEnd: line, borderInlineStart: "3px solid " + (active ? "var(--accent-fill)" : "transparent"), background: active ? "var(--bg-surface-sunken)" : "transparent", color: "inherit", font: "var(--type-ui-dense)", textAlign: "start", cursor: "pointer", transition: "var(--transition-control)" }}>
                    <span style={{ width: 34, flex: "none" }}><Thumb label={s.title} /></span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                      <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{s.designer} · {s.age}</span>
                    </span>
                    {s.flags.length ? <Icon name="triangle-alert" size={15} color="var(--warning-text)" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <Panel title={sel.title} meta={sel.id + " · " + sel.designer + " · submitted " + sel.age + " ago"}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-3)" }}>
              <Thumb label="Design artwork" ratio="1 / 1" />
              <Thumb label="Garment mock-up, front" ratio="1 / 1" />
              <Thumb label="Garment mock-up, back" ratio="1 / 1" />
            </div>
            {sel.flags.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-4)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-md)" }}>
                <span style={eyebrow}>Automatic checks</span>
                {sel.flags.map((f) => (
                  <span key={f} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", font: "var(--type-ui-dense)" }}>
                    <Icon name="triangle-alert" size={15} color="var(--warning-text)" />{f}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-md)", font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>
                <Icon name="check" size={15} />All automatic checks passed.
              </div>
            )}
            <Facts rows={[
              ["Print method", "Direct-to-garment, 4 colours"],
              ["Artwork resolution", <span style={mono}>4200 × 5600 px, 300 dpi</span>],
              ["Placement", "Front centre, 280 mm wide"],
              ["Royalty rate", <span style={mono}>10%</span>],
            ]} />
            <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", paddingBlockStart: "var(--space-4)", borderBlockStart: line }}>
              <Button size="sm">Approve for sale</Button>
              <Button variant="outline" size="sm">Request changes</Button>
              <Button variant="destructive" size="sm" style={{ marginInlineStart: "auto" }}>Reject</Button>
            </div>
          </div>
        </Panel>
      </div>
    </Page>
  );
}

/* ---------- 8. Markets ---------- */

const MARKET_ROWS = [
  ["Bangladesh", "BDT ৳", "Domestic", "VAT 15% inclusive", "Pathao, Steadfast", "বাংলা, English", true],
  ["India", "INR ₹", "DDP", "IGST on import", "FedEx, Delhivery", "English", true],
  ["United Arab Emirates", "AED د.إ", "DDP", "VAT 5% on import", "Aramex", "English, العربية", true],
  ["United Kingdom", "GBP £", "DDP", "VAT 20% on import", "DHL Express", "English", true],
  ["Singapore", "SGD $", "DDU", "GST above S$400", "DHL Express", "English", false],
];

function Markets() {
  return (
    <Page>
      <PageHead meta="4 live · 1 draft" title="Markets" action={<Button size="sm" iconLeft={<Icon name="plus" size={15} />}>Add market</Button>} />

      {/* FR-ADM-61: duty model, tax treatment and carriers are set per market; the
          storefront reads them, so the copy here is the copy the customer sees. */}
      <Panel title="Market configuration" meta="A market goes live only once currency, duty model and one carrier are set" pad={false}>
        <Table columns={[["Market"], ["Currency"], ["Duty model"], ["Tax treatment"], ["Carriers"], ["Languages"], ["Live", "end"]]}>
          {MARKET_ROWS.map(([name, currency, duty, tax, carriers, langs, live]) => (
            <tr key={name}>
              <td style={{ ...cell, paddingInlineStart: "var(--space-5)", whiteSpace: "nowrap", fontWeight: "var(--weight-medium)" }}>{name}</td>
              <td style={{ ...cell, ...mono, whiteSpace: "nowrap" }}>{currency}</td>
              <td style={cell}><Badge tone={duty === "Domestic" ? "outline" : duty === "DDP" ? "info" : "warning"} size="sm">{duty}</Badge></td>
              <td style={{ ...cell, color: "var(--fg-secondary)" }}>{tax}</td>
              <td style={{ ...cell, color: "var(--fg-secondary)" }}>{carriers}</td>
              <td style={{ ...cell, color: "var(--fg-secondary)" }}>{langs}</td>
              <td style={{ ...cell, textAlign: "end" }}><Switch size="sm" checked={live} aria-label={"Market " + name + " live"} onChange={() => {}} /></td>
            </tr>
          ))}
        </Table>
      </Panel>

      <div className="vd-split">
        <Panel title="Rounding and display" meta="Applied after conversion, per market">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Select size="sm" label="Price rounding" value="99" options={[{ value: "99", label: "Round up to nearest 99" }, { value: "50", label: "Round up to nearest 50" }, { value: "none", label: "No rounding" }]} />
            <Switch label="Show duty and tax as a separate line at checkout" checked onChange={() => {}} />
            <Switch label="Let the customer override the detected market" checked onChange={() => {}} />
          </div>
        </Panel>
        <Panel title="Bengali typography" meta="Void Bengali is the only face licensed for Bangla copy">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div lang="bn" style={{ padding: "var(--space-4)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-md)", font: "var(--type-h3)" }}>জামদানি প্যানেল শার্ট</div>
            <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>Bangla sets one step larger than Latin at the same optical size; the token set applies that offset under <span style={mono}>[lang="bn"]</span>.</span>
          </div>
        </Panel>
      </div>
    </Page>
  );
}

/* ---------- 9. Design tokens ---------- */

const TOKEN_GROUPS = [
  ["Surface", [["--bg-canvas", "Page ground"], ["--bg-surface", "Card and panel"], ["--bg-surface-sunken", "Inset and hover"]]],
  ["Ink", [["--fg-primary", "Body and headings"], ["--fg-secondary", "Supporting copy"], ["--fg-inverse", "On solid fills"]]],
  ["Accent", [["--accent-fill", "Primary action"], ["--accent-text", "Accent ink"], ["--border-default", "Hairline"]]],
];

function Theme() {
  const [scale, setScale] = React.useState("comfortable");
  return (
    <Page>
      <PageHead meta="418 tokens · 3 themes" title="Design tokens" action={<Button variant="outline" size="sm" iconLeft={<Icon name="download" size={15} />}>Export theme</Button>} />

      <div className="vd-split" style={{ "--split": "minmax(0, 1.4fr) minmax(0, 1fr)" }}>
        <Panel title="Colour" meta="Editing a token here republishes it to the storefront, the studio and this back office">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {TOKEN_GROUPS.map(([group, tokens]) => (
              <div key={group} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <span style={eyebrow}>{group}</span>
                {tokens.map(([token, use]) => (
                  <div key={token} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                    <span aria-hidden="true" style={{ width: 32, height: 32, flex: "none", borderRadius: "var(--radius-sm)", background: "var(" + token + ")", border: line }} />
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                      <span style={{ ...mono, overflow: "hidden", textOverflow: "ellipsis" }}>{token}</span>
                      <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{use}</span>
                    </span>
                    <IconButton variant="ghost" icon={<Icon name="pencil" size={15} />} label={"Edit " + token} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <Panel title="Density" meta="Applies to tables, forms and list rows across the back office">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <Tabs variant="segmented" size="sm" value={scale} onChange={setScale} items={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }]} />
              <div style={{ border: line, borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {["Order VD-24817", "Order VD-24816", "Order VD-24812"].map((r, i) => (
                  <div key={r} style={{ padding: (scale === "compact" ? "var(--space-2)" : "var(--space-4)") + " var(--space-4)", borderBlockEnd: i < 2 ? line : "none", font: "var(--type-ui-dense)" }}>{r}</div>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="Type ramp" meta="Void Sans, Void Mono, Void Bengali">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[["--type-h1", "Heading 1"], ["--type-h3", "Heading 3"], ["--type-ui-dense", "Interface dense"], ["--type-ui-sm", "Interface small"]].map(([token, label]) => (
                <div key={token} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)" }}>
                  <span style={{ font: "var(" + token + ")" }}>{label}</span>
                  <span style={{ ...mono, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{token}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Page>
  );
}

/* ---------- 10. Help centre ---------- */

const HELP_TOPICS = [
  ["package", "Orders and fulfilment", "Dispatch, splitting, partial refunds", 18],
  ["truck", "Customs and shipping", "Duty models, documents, held parcels", 12],
  ["store", "Vendors and purchase orders", "Onboarding, capacity, quality claims", 9],
  ["wallet", "Payouts and royalties", "Statement periods, holds, tax forms", 14],
  ["shirt", "Catalogue and variants", "Stock, pricing, market availability", 21],
  ["settings", "Tokens and theming", "Publishing a token change safely", 6],
];

const TICKETS = [
  ["HC-4471", "Duty prepayment not reaching FedEx", "Open", "warning", "4 hours ago"],
  ["HC-4468", "Bulk CSV export truncates Bangla names", "In progress", "info", "1 day ago"],
  ["HC-4460", "Vendor cannot see purchase order PO-2609-014", "Resolved", "success", "3 days ago"],
];

function Help() {
  return (
    <Page>
      <PageHead meta="Back office documentation" title="Help centre" />

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-6)", background: "var(--bg-surface)", border: line, borderRadius: "var(--radius-lg)" }}>
        <span style={{ font: "var(--type-h3)" }}>What do you need to do?</span>
        <div style={{ maxWidth: 520 }}>
          <Input placeholder="Search articles, e.g. release a customs hold" prefix={<Icon name="search" size={16} color="var(--fg-secondary)" />} aria-label="Search help articles" />
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {["Release a customs hold", "Reverse a royalty", "Add a market", "Grade a return"].map((q) => <Tag key={q} onClick={() => {}}>{q}</Tag>)}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--space-5)" }}>
        {HELP_TOPICS.map(([icon, title, body, count]) => (
          <article key={title} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-5)", background: "var(--bg-surface)", border: line, borderRadius: "var(--radius-lg)" }}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--bg-surface-sunken)", color: "var(--accent-text)" }}>
              <Icon name={icon} size={16} />
            </span>
            <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>{title}</span>
            <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{body}</span>
            <span style={{ ...eyebrow, paddingBlockStart: "var(--space-2)" }}>{count} articles</span>
          </article>
        ))}
      </div>

      <Panel title="Your tickets" meta="Raised from this back office" pad={false}
        action={<Button variant="outline" size="sm">New ticket</Button>}>
        <Table columns={[["Reference"], ["Subject"], ["Status"], ["Updated", "end"]]}>
          {TICKETS.map(([ref, subject, status, tone, when]) => (
            <tr key={ref}>
              <td style={{ ...cell, ...mono, paddingInlineStart: "var(--space-5)", whiteSpace: "nowrap" }}>{ref}</td>
              <td style={cell}>{subject}</td>
              <td style={cell}><Badge tone={tone} size="sm">{status}</Badge></td>
              <td style={{ ...cell, color: "var(--fg-secondary)", textAlign: "end", whiteSpace: "nowrap" }}>{when}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </Page>
  );
}

/* ---------- registry ---------- */

const VoidAdminPages = {
  customs: CustomsQueue,
  returns: Returns,
  catalogue: Catalogue,
  vendors: Vendors,
  designers: Designers,
  payouts: Payouts,
  moderation: Moderation,
  markets: Markets,
  theme: Theme,
  help: Help,
};

/* Mounted as a zero-size component purely so the DC runtime evaluates this file. */
function AdminOpsRegistry() { return null; }

Object.assign(window, { VoidAdminPages, AdminOpsRegistry });
