/* Void admin — shell, overview dashboard and the dense order list.

   Structure follows the AdminCN reference the Product Owner supplied: a persistent
   sidebar with uppercase tracked group labels, a slim topbar carrying breadcrumb and
   global search, and content built from thin-bordered surfaces with an icon chip on
   each statistic. Every value resolves through a Void token (UI-SRC-9) — the reference
   supplied the layout vocabulary, not the palette.

   Design-system components are resolved at RENDER time, so this file does not care
   whether _ds_bundle.js has finished loading when it is parsed. */

const DS = () => window.VoidDesignSystem_980885 || {};

const Badge = React.forwardRef((p, ref) => React.createElement(DS().Badge, { ...p, ref }));
const Button = React.forwardRef((p, ref) => React.createElement(DS().Button, { ...p, ref }));
const Checkbox = React.forwardRef((p, ref) => React.createElement(DS().Checkbox, { ...p, ref }));
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
    const id = setInterval(() => {
      if (window.VoidDesignSystem_980885) { clearInterval(id); if (live) setReady(true); }
    }, 24);
    return () => { live = false; clearInterval(id); };
  }, [ready]);
  return ready;
}

/* ---------- data ---------- */

const MARKETS = [
  ["all", "All markets"],
  ["bd", "Bangladesh"],
  ["in", "India"],
  ["ae", "United Arab Emirates"],
  ["uk", "United Kingdom"],
];

const NAV = [
  ["Commerce", [
    ["overview", "Overview", "grid-2x2"],
    ["orders", "Orders", "package", "128"],
    ["customs", "Customs queue", "truck", "9"],
    ["returns", "Returns", "rotate-ccw"],
    ["catalogue", "Catalogue", "shirt"],
  ]],
  ["Partners", [
    ["vendors", "Vendors", "store"],
    ["designers", "Designers", "user"],
    ["payouts", "Payouts", "wallet"],
    ["moderation", "Moderation", "shield-check", "4"],
  ]],
  ["Configuration", [
    ["markets", "Markets", "globe"],
    ["theme", "Design tokens", "settings"],
    ["help", "Help centre", "circle-help"],
  ]],
];

const eyebrow = {
  font: "var(--type-label)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-widest)",
  color: "var(--fg-secondary)",
};

const mono = { fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)" };

const taka = (n) => "৳" + n.toLocaleString("en-IN");

const STATS = [
  ["package", "42", "Shipped orders", "+18.2%", "up"],
  ["triangle-alert", "8", "Damaged returns", "-8.7%", "down"],
  ["clock", "27", "Missed delivery slots", "+4.3%", "up"],
];

const ORDERS = [
  ["VD-24817", "Ayesha Karim", "Dhaka, BD", 3, 6350, "In transit", "info", "28 Aug"],
  ["VD-24816", "Marcus Reid", "Manchester, UK", 1, 4120, "Customs hold", "warning", "28 Aug"],
  ["VD-24812", "Priya Nair", "Kochi, IN", 2, 3890, "Delivered", "success", "27 Aug"],
  ["VD-24809", "Fatima Al Nuaimi", "Dubai, AE", 5, 18400, "Awaiting dispatch", "default", "27 Aug"],
  ["VD-24803", "Tanvir Hasan", "Chattogram, BD", 1, 2450, "Delivered", "success", "26 Aug"],
  ["VD-24798", "Ellen Whitfield", "Bristol, UK", 2, 7600, "Refund pending", "danger", "26 Aug"],
  ["VD-24791", "Nusrat Jahan", "Sylhet, BD", 4, 9250, "Delivered", "success", "25 Aug"],
  ["VD-24788", "Rohan Mehta", "Pune, IN", 1, 2980, "In transit", "info", "25 Aug"],
];

const CUSTOMS = [
  ["VD-24816", "UK", "DHL Express", "Missing commercial invoice", 4],
  ["VD-24774", "UK", "DHL Express", "HS code query — 6109.10", 6],
  ["VD-24769", "AE", "Aramex", "Consignee contact unreachable", 2],
  ["VD-24755", "IN", "FedEx", "Duty prepayment not applied", 11],
];

const COLUMNS = [
  ["order", "Order", true],
  ["customer", "Customer", true],
  ["destination", "Destination", true],
  ["items", "Items", true],
  ["total", "Total", true],
  ["status", "Status", true],
  ["placed", "Placed", true],
];

/* ---------- shell pieces ---------- */

function StatCard({ icon, value, title, delta, dir }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flex: "none", borderRadius: "var(--radius-sm)", background: "var(--accent-bg)", color: "var(--accent-text)" }}>
          <Icon name={icon} size={16} />
        </span>
        <span style={{ font: "var(--type-h2)" }}>{value}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>{title}</span>
        <span style={{ display: "flex", gap: "var(--space-2)", font: "var(--type-ui-sm)" }}>
          <span style={{ color: dir === "down" ? "var(--success-text)" : "var(--fg-primary)" }}>{delta}</span>
          <span style={{ color: "var(--fg-secondary)" }}>than last week</span>
        </span>
      </div>
    </div>
  );
}

function Panel({ title, meta, action, children, pad = true }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", padding: "var(--space-5)", paddingBlockEnd: pad ? 0 : "var(--space-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <h2 style={{ font: "var(--type-h3)", margin: 0 }}>{title}</h2>
          {meta ? <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{meta}</span> : null}
        </div>
        {action}
      </header>
      <div style={{ padding: pad ? "var(--space-5)" : 0 }}>{children}</div>
    </section>
  );
}

function Donut({ pct, label, value }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)" }}>
      <div style={{ position: "relative", width: 136, height: 136 }}>
        <svg viewBox="0 0 136 136" style={{ display: "block", transform: "rotate(-90deg)" }}>
          <circle cx="68" cy="68" r={r} fill="none" stroke="var(--bg-surface-sunken)" strokeWidth="14" />
          <circle cx="68" cy="68" r={r} fill="none" stroke="var(--accent-fill)" strokeWidth="14" strokeLinecap="butt" strokeDasharray={`${(c * pct) / 100} ${c}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <span style={{ font: "var(--type-h3)" }}>{value}</span>
          <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{label}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
        <span style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>Plan completed</span>
        <span style={{ font: "var(--type-h3)" }}>{pct}%</span>
      </div>
    </div>
  );
}

function MetricTile({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-md)" }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, flex: "none", borderRadius: "var(--radius-sm)", background: "var(--bg-surface-sunken)", color: "var(--fg-secondary)" }}>
        <Icon name={icon} size={15} />
      </span>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>{value}</span>
      </div>
    </div>
  );
}

function Spark({ bars, dim }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 34 }}>
      {bars.map((h, i) => (
        <span key={i} style={{ width: 7, height: `${h}%`, background: dim ? "var(--bg-surface-sunken)" : "var(--fg-primary)", borderRadius: 1 }} />
      ))}
    </div>
  );
}

function Sidebar({ collapsed, page, onNavigate }) {
  return (
    <nav aria-label="Admin" className="vd-scroll-y" style={{ width: collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)", flex: "none", display: "flex", flexDirection: "column", gap: "var(--space-5)", paddingBlock: "var(--space-4)", background: "var(--bg-surface)", borderInlineEnd: "var(--border-width-thin) solid var(--border-default)", overflowY: "auto", overflowX: "hidden", transition: "width var(--duration-slow) var(--motion-easing-standard)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingInline: "var(--space-4)", minHeight: 40 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, flex: "none", borderRadius: "var(--radius-sm)", background: "var(--fg-primary)", color: "var(--fg-inverse)", font: "var(--type-label)", letterSpacing: 0 }}>V</span>
        {collapsed ? null : (
          <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>Void</span>
            <span style={{ font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>Back office</span>
          </span>
        )}
      </div>
      {NAV.map(([group, items]) => (
        <div key={group} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {collapsed ? null : <span style={{ ...eyebrow, paddingInline: "var(--space-4)", paddingBlockEnd: "var(--space-1)" }}>{group}</span>}
          {items.map(([id, label, icon, badge]) => {
            const active = page === id;
            return (
              <button key={id} type="button" onClick={() => onNavigate(id)} title={collapsed ? label : undefined} aria-current={active ? "page" : undefined}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minHeight: 34, marginInline: "var(--space-2)", paddingInline: "var(--space-2)", border: "none", borderRadius: "var(--radius-sm)", background: active ? "var(--bg-surface-sunken)" : "transparent", color: active ? "var(--fg-primary)" : "var(--fg-secondary)", font: "var(--type-ui-dense)", fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)", cursor: "pointer", textAlign: "start", transition: "var(--transition-control)" }}>
                <Icon name={icon} size={16} color={active ? "var(--accent-text)" : "currentColor"} />
                {collapsed ? null : <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>}
                {!collapsed && badge ? (
                  <span style={{ flex: "none", padding: "0 var(--space-2)", borderRadius: "var(--radius-full)", background: "var(--bg-surface-sunken)", font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>{badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function Topbar({ crumb, market, onMarket, scheme, onScheme, onToggleSidebar }) {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", minHeight: "var(--topbar-height)", paddingInline: "var(--space-5)", background: "var(--bg-surface)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      <IconButton variant="ghost" icon={<Icon name="menu" size={16} />} label="Toggle navigation" onClick={onToggleSidebar} />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: "0 0 auto", font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>
        <span className="vd-wide-only" style={{ whiteSpace: "nowrap" }}>Back office</span>
        <span className="vd-wide-only" style={{ display: "flex" }}><Icon name="chevron-right" size={14} /></span>
        <span style={{ color: "var(--fg-primary)", whiteSpace: "nowrap" }}>{crumb}</span>
      </div>
      <div style={{ flex: "1 1 220px", minWidth: 180, maxWidth: 360, marginInlineStart: "auto" }}>
        {/* UI-ADM-2: one input resolves orders, customers, products, designs and tickets.
            It is the last thing in this row allowed to shrink — the ancestor crumb and the
            language control drop out below 1080px instead. */}
        <Input size="sm" placeholder="Search orders, customers, designs…" prefix={<Icon name="search" size={15} color="var(--fg-secondary)" />} aria-label="Global search" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: "0 1 auto", minWidth: 0 }}>
        <div style={{ flex: "0 1 168px", minWidth: 96 }}>
          <Select size="sm" value={market} onChange={(e) => onMarket(e.target && e.target.value ? e.target.value : e)} options={MARKETS.map(([v, l]) => ({ value: v, label: l }))} aria-label="Active market" />
        </div>
        <IconButton variant="ghost" icon={<Icon name={scheme === "dark" ? "sun" : "moon"} size={16} />} label="Toggle colour scheme" onClick={onScheme} />
        <span className="vd-wide-only" style={{ display: "flex" }}>
          <IconButton variant="ghost" icon={<Icon name="languages" size={16} />} label="Language" />
        </span>
        <span aria-hidden="true" style={{ width: 28, height: 28, flex: "none", borderRadius: "var(--radius-full)", background: "var(--bg-surface-sunken)", border: "var(--border-width-thin) solid var(--border-default)" }} />
      </div>
    </header>
  );
}

function MarketScope({ market }) {
  const label = (MARKETS.find(([v]) => v === market) || MARKETS[0])[1];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
      <Icon name="globe" size={14} />
      {/* UI-ADM-5: every screen states whether it shows one market or all. */}
      <span>{market === "all" ? "Showing all markets combined" : "Scoped to " + label}</span>
    </div>
  );
}

/* ---------- pages ---------- */

function Overview({ market }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <span style={eyebrow}>Last 7 days</span>
          <h1 style={{ font: "var(--type-h1)", margin: 0 }}>Overview</h1>
        </div>
        <MarketScope market={market} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
        {STATS.map((s) => <StatCard key={s[2]} icon={s[0]} value={s[1]} title={s[2]} delta={s[3]} dir={s[4]} />)}
      </div>

      <div className="vd-split" style={{ "--split": "minmax(0, 1fr) minmax(0, 1.9fr)" }}>
        <Panel title="Product insight" meta="Published 12 May 2026 · 6:10 PM">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>Product reached</span>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-4)" }}>
                <span style={{ font: "var(--type-h2)" }}>21,153</span>
                <Spark bars={[40, 62, 48, 80, 66, 92]} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>Orders placed</span>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-4)" }}>
                <span style={{ font: "var(--type-h2)" }}>2,123</span>
                <Spark bars={[30, 44, 36, 58, 42, 66]} dim />
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Settlement metrics" meta="Home market and export combined, in BDT">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "var(--space-6)", alignItems: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "var(--space-3)" }}>
              <MetricTile icon="banknote" label="Gross merchandise" value={taka(1154800)} />
              <MetricTile icon="credit-card" label="Duty prepaid (DDP)" value={taka(132600)} />
              <MetricTile icon="wallet" label="Designer royalties" value={taka(173560)} />
              <MetricTile icon="shopping-bag" label="Orders settled" value="248" />
            </div>
            <Donut pct={56} value="256.24" label="Net margin" />
          </div>
        </Panel>
      </div>

      {/* FR-ADM-52: the customs queue, with age and the carrier's stated reason. */}
      <Panel title="Customs queue" meta="Shipments held at a border, oldest first" pad={false}
        action={<Button variant="outline" size="sm">Open queue</Button>}>
        <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-ui-dense)" }}>
          <thead>
            <tr>
              {["Order", "Destination", "Carrier", "Stated reason", "Age"].map((h) => (
                <th key={h} style={{ ...eyebrow, textAlign: h === "Age" ? "end" : "start", padding: "var(--space-3) var(--space-5)", borderBlock: "var(--border-width-thin) solid var(--border-default)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CUSTOMS.map(([id, dest, carrier, reason, age]) => (
              <tr key={id}>
                <td style={{ ...mono, padding: "var(--space-3) var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)", whiteSpace: "nowrap" }}>{id}</td>
                <td style={{ padding: "var(--space-3) var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>{dest}</td>
                <td style={{ padding: "var(--space-3) var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)", color: "var(--fg-secondary)" }}>{carrier}</td>
                <td style={{ padding: "var(--space-3) var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>{reason}</td>
                <td style={{ padding: "var(--space-3) var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)", textAlign: "end", whiteSpace: "nowrap" }}>
                  <Badge tone={age >= 6 ? "danger" : age >= 4 ? "warning" : "outline"} size="sm">{age} days</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Orders({ market, confirm, onConfirm }) {
  const [selected, setSelected] = React.useState([]);
  const [cols, setCols] = React.useState(COLUMNS.map((c) => c[0]));
  const [showCols, setShowCols] = React.useState(false);
  const on = (id) => cols.includes(id);
  const toggleRow = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.concat(id)));
  const allOn = selected.length === ORDERS.length;
  const value = ORDERS.filter((o) => selected.includes(o[0])).reduce((s, o) => s + o[4], 0);

  const cell = { padding: "var(--space-3) var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" };
  const head = { ...eyebrow, textAlign: "start", padding: "var(--space-3) var(--space-4)", borderBlock: "var(--border-width-thin) solid var(--border-default)", whiteSpace: "nowrap", background: "var(--bg-surface)", position: "sticky", top: 0 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <span style={eyebrow}>128 orders</span>
          <h1 style={{ font: "var(--type-h1)", margin: 0 }}>Orders</h1>
        </div>
        <MarketScope market={market} />
      </div>

      {/* UI-ADM-3: saved views, filtering, column configuration and CSV export of this view. */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {["All", "Awaiting dispatch", "In transit", "Customs hold", "Refund pending"].map((v, i) => (
            <Tag key={v} selected={i === 0} onClick={() => {}}>{v}</Tag>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", marginInlineStart: "auto", position: "relative" }}>
          <Button variant="outline" size="sm" iconLeft={<Icon name="sliders-horizontal" size={15} />} onClick={() => setShowCols((s) => !s)} aria-expanded={showCols}>Columns</Button>
          <Button variant="outline" size="sm" iconLeft={<Icon name="download" size={15} />}>Export CSV</Button>
          {showCols ? (
            <div role="group" aria-label="Visible columns" style={{ position: "absolute", top: "calc(100% + var(--space-2))", insetInlineEnd: 0, zIndex: "var(--z-dropdown)", display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 200, padding: "var(--space-4)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)" }}>
              {COLUMNS.map(([id, label, required]) => (
                <Checkbox key={id} label={label} checked={on(id)} disabled={required && cols.length === 1}
                  onChange={() => setCols((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.concat(id)))} />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {selected.length ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", rowGap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", background: "var(--bg-surface-sunken)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-md)", flexWrap: "wrap" }}>
          <span style={{ font: "var(--type-ui-dense)", whiteSpace: "nowrap" }}>{selected.length} selected · {taka(value)}</span>
          <div style={{ display: "flex", gap: "var(--space-2)", marginInlineStart: "auto", flex: "none" }}>
            <Button variant="outline" size="sm">Mark dispatched</Button>
            <Button variant="destructive" size="sm" onClick={() => onConfirm({ count: selected.length, value })}>Cancel orders</Button>
          </div>
        </div>
      ) : null}

      <section className="vd-scroll-x" style={{ background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", overflowX: "auto", overflowY: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-ui-dense)" }}>
          <thead>
            <tr>
              <th scope="col" style={{ ...head, width: 44, paddingInlineStart: "var(--space-5)" }}>
                <Checkbox aria-label="Select all orders" checked={allOn} indeterminate={selected.length > 0 && !allOn} onChange={() => setSelected(allOn ? [] : ORDERS.map((o) => o[0]))} />
              </th>
              {COLUMNS.filter(([id]) => on(id)).map(([id, label]) => (
                <th key={id} scope="col" style={{ ...head, textAlign: id === "total" || id === "items" ? "end" : "start" }}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((o) => {
              const [id, customer, dest, items, total, status, tone, placed] = o;
              const isOn = selected.includes(id);
              return (
                <tr key={id} style={{ background: isOn ? "var(--bg-surface-sunken)" : "transparent" }}>
                  <td style={{ ...cell, paddingInlineStart: "var(--space-5)" }}>
                    <Checkbox aria-label={"Select " + id} checked={isOn} onChange={() => toggleRow(id)} />
                  </td>
                  {on("order") ? <td style={{ ...cell, ...mono, whiteSpace: "nowrap" }}>{id}</td> : null}
                  {on("customer") ? <td style={{ ...cell, whiteSpace: "nowrap" }}>{customer}</td> : null}
                  {on("destination") ? <td style={{ ...cell, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{dest}</td> : null}
                  {on("items") ? <td style={{ ...cell, textAlign: "end" }}>{items}</td> : null}
                  {on("total") ? <td style={{ ...cell, ...mono, textAlign: "end", whiteSpace: "nowrap" }}>{taka(total)}</td> : null}
                  {on("status") ? <td style={cell}><Badge tone={tone} size="sm">{status}</Badge></td> : null}
                  {on("placed") ? <td style={{ ...cell, color: "var(--fg-secondary)", whiteSpace: "nowrap" }}>{placed}</td> : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* UI-ADM-4: the confirmation states the exact effect and the exact value. */}
      {confirm ? (
        <div role="dialog" aria-modal="true" aria-label="Confirm cancellation" style={{ position: "fixed", inset: 0, zIndex: "var(--z-modal)", display: "grid", placeItems: "center", padding: "var(--space-5)", background: "var(--overlay-scrim)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "min(440px, 100%)", padding: "var(--space-6)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)" }}>
            <h2 style={{ font: "var(--type-h3)", margin: 0 }}>Cancel {confirm.count} orders?</h2>
            <p style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)", margin: 0 }}>
              This refunds {taka(confirm.value)} across {confirm.count} orders, releases their reserved stock, and notifies each customer. Designer royalties already accrued on these orders are reversed on the next statement. It cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => onConfirm(null)}>Keep orders</Button>
              <Button variant="destructive" onClick={() => onConfirm(null)}>Cancel {confirm.count} orders</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* AdminOps.jsx registers the nine operational destinations and the help centre on
   window.VoidAdminPages. It is mounted by the same DC, so it may still be loading on
   the first frame — resolve it at render time, never at module evaluation. */
function OpsPage({ page, market }) {
  const registry = window.VoidAdminPages;
  const Page = registry && registry[page];
  if (!Page) return <div style={{ minHeight: 320 }} />;
  return <Page market={market} />;
}

/* ---------- app ---------- */

const LABELS = {};
NAV.forEach(([, items]) => items.forEach(([id, label]) => { LABELS[id] = label; }));

function AdminApp({ page = "overview", scheme = "light", market = "all", sidebar = "expanded" }) {
  const dsReady = useDesignSystemReady();
  const [s, setS] = React.useState({ page, scheme, market, collapsed: sidebar === "collapsed" });
  React.useEffect(() => {
    setS((p) => ({ ...p, page, scheme, market, collapsed: sidebar === "collapsed" }));
  }, [page, scheme, market, sidebar]);
  const [confirm, setConfirm] = React.useState(null);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", s.scheme === "dark");
  }, [s.scheme]);

  if (!dsReady) return <div style={{ minHeight: "100vh" }} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-canvas)", color: "var(--fg-primary)", font: "var(--type-ui-dense)" }}>
      <Sidebar collapsed={s.collapsed} page={s.page} onNavigate={(id) => setS((p) => ({ ...p, page: id }))} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar
          crumb={LABELS[s.page] || "Overview"}
          market={s.market}
          onMarket={(v) => setS((p) => ({ ...p, market: v }))}
          scheme={s.scheme}
          onScheme={() => setS((p) => ({ ...p, scheme: p.scheme === "dark" ? "light" : "dark" }))}
          onToggleSidebar={() => setS((p) => ({ ...p, collapsed: !p.collapsed }))}
        />
        <main style={{ flex: 1, minWidth: 0, padding: "var(--space-6)" }}>
          {s.page === "overview" ? <Overview market={s.market} />
            : s.page === "orders" ? <Orders market={s.market} confirm={confirm} onConfirm={setConfirm} />
            : <OpsPage page={s.page} market={s.market} />}
        </main>
      </div>
    </div>
  );
}

/* Shell primitives the operational pages reuse, so density and chrome stay identical. */
Object.assign(window, { AdminApp, VoidAdminKit: { Panel, MarketScope, StatCard, MetricTile, Spark, Donut } });
