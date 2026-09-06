/* Cart, order confirmation and order detail — UI-CHK-1..9, UI-ACC-2, UI-ACC-3.

   These three are one journey and share a vocabulary, so they live together: the landed
   cost breakdown a buyer sees in the cart is the same table, in the same order, on the
   confirmation and again on the order detail. A figure that moves position between those
   three screens reads as a different figure.

   Helpers (Plate, eyebrow, monoMeta, taka, EmptyState, ErrorState) come from Shell.jsx. */

const { Badge, Button, Icon, IconButton, Input, Select } = window.VoidDesignSystem_980885;

const ORDER_LINES = [
  { id: "l1", name: "Handloom cotton kurta", house: "Rahnuma Atelier", sku: "VD-KRT-0421", variant: "M · Unbleached", qty: 1, price: 2450, was: 3200, ships: "Dhaka warehouse", eta: "2–3 days" },
  { id: "l2", name: "Muslin scarf", house: "Tangail Weavers", sku: "VD-SCF-0118", variant: "One size · Indigo", qty: 2, price: 1250, was: null, ships: "Dhaka warehouse", eta: "2–3 days" },
  { id: "l3", name: "Monsoon monogram tee", house: "Your design", sku: "VD-STU-77412", variant: "M · Ink · front print", qty: 1, price: 2450, was: null, ships: "Print partner, Gazipur", eta: "6–8 days", custom: true },
];

/* One breakdown shape, used by all three screens (UI-CHK-6, UI-ACC-2). */
function landed(lines, market) {
  const goods = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const export_ = market !== "bd";
  return {
    goods,
    rows: [
      ["Goods", goods, null],
      ["Delivery — " + (export_ ? "DHL Express, 4–6 days" : "outside Dhaka"), export_ ? 1850 : 120, null],
      export_ ? ["Duty and import VAT", 1320, "Prepaid. Nothing is collected at your door."] : ["VAT (15%, included)", 0, "Already inside the prices shown."],
      ["Studio print licence", 330, "Bengali type licence for the custom piece."],
    ],
  };
}

function total(b) { return b.rows.reduce((s, r) => s + r[1], 0); }

function BreakdownTable({ b, dense }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: dense ? "var(--space-2)" : "var(--space-3)" }}>
      {b.rows.map(([label, value, note]) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", font: "var(--type-ui-dense)" }}>
            <span style={{ color: "var(--fg-secondary)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{value ? taka(value) : "Included"}</span>
          </div>
          {note ? <span style={{ font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)", maxWidth: "46ch" }}>{note}</span> : null}
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", paddingBlockStart: "var(--space-3)", borderBlockStart: "var(--border-width-thin) solid var(--border-default)", font: "var(--type-ui)", fontWeight: "var(--weight-medium)" }}>
        <span>Total to pay</span>
        <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{taka(total(b))}</span>
      </div>
    </div>
  );
}

/* ---------- cart ---------- */

function QtyStepper({ qty, onChange, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: "var(--border-width-thin) solid var(--border-control)", borderRadius: "var(--radius-sm)", opacity: disabled ? 0.55 : 1 }}>
      <IconButton variant="ghost" size="sm" icon={<Icon name="minus" size={14} />} label="Reduce quantity" disabled={disabled || qty <= 1} onClick={() => onChange(qty - 1)} />
      <span style={{ minWidth: 28, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", fontVariantNumeric: "tabular-nums" }}>{qty}</span>
      <IconButton variant="ghost" size="sm" icon={<Icon name="plus" size={14} />} label="Increase quantity" disabled={disabled} onClick={() => onChange(qty + 1)} />
    </div>
  );
}

function CartLine({ line, onQty, onRemove, narrow }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: narrow ? "72px 1fr" : "96px 1fr auto", gap: narrow ? "var(--space-4)" : "var(--space-5)", paddingBlock: "var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      <Plate ratio="3 / 4" style={{ borderRadius: "var(--radius-sm)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 0 }}>
        <span style={{ ...monoMeta, textTransform: "uppercase" }}>{line.house}</span>
        <span style={{ font: "var(--type-ui)", textWrap: "pretty" }}>{line.name}</span>
        <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{line.variant}</span>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
          <Icon name="truck" size={13} />
          {/* UI-CHK-4: which warehouse a line ships from, and therefore when it lands. */}
          <span>{line.ships} · {line.eta}</span>
        </span>
        {/* BRU-3: a Studio piece is made to order and is not returnable unless defective.
            Saying so in the cart is the only honest place — after payment it is too late. */}
        {line.custom ? (
          <span style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", font: "var(--type-ui-sm)", color: "var(--fg-primary)" }}>
            <Icon name="info" size={13} style={{ marginBlockStart: 2, flex: "none" }} />
            <span style={{ maxWidth: "44ch" }}>Made to your design, so it cannot be returned unless it arrives faulty.</span>
          </span>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingBlockStart: "var(--space-1)", flexWrap: "wrap" }}>
          <QtyStepper qty={line.qty} onChange={(q) => onQty(line.id, q)} disabled={line.custom} />
          <Button variant="ghost" size="sm" onClick={() => onRemove(line.id)}>Remove</Button>
          <Button variant="ghost" size="sm" iconLeft={<Icon name="heart" size={14} />}>Save</Button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: narrow ? "flex-start" : "flex-end", gap: 2, gridColumn: narrow ? "2" : "auto" }}>
        <span style={{ font: "var(--type-ui)", fontWeight: "var(--weight-medium)", fontFamily: "var(--font-mono)", color: line.was ? "var(--accent-text)" : "var(--fg-primary)" }}>{taka(line.price * line.qty)}</span>
        {line.was ? <span style={{ ...monoMeta, textDecoration: "line-through" }}>{taka(line.was * line.qty)}</span> : null}
        {line.qty > 1 ? <span style={monoMeta}>{taka(line.price)} each</span> : null}
      </div>
    </div>
  );
}

function Cart({ state = "populated", narrow, onRetry, market = "bd" }) {
  const [lines, setLines] = React.useState(ORDER_LINES);
  React.useEffect(() => { setLines(ORDER_LINES); }, [state]);

  if (state === "error") {
    return <ErrorState narrow={narrow} title="We could not load your bag"
      body="The bag service did not respond. Nothing was added or removed — reloading will show it exactly as you left it."
      detail="cart/8f21c4 · request 2ad901 · 504 upstream timeout" onRetry={onRetry} />;
  }
  if (state === "empty") {
    return <EmptyState narrow={narrow} title="Nothing in your bag"
      body="Add a piece and it will appear here with delivery and duties calculated for your market before you pay."
      action={<div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}><Button>Browse new in</Button><Button variant="outline">View saved items</Button></div>} />;
  }

  const b = landed(lines, market);
  const loading = state === "loading";

  return (
    <div style={{ maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlockStart: narrow ? "var(--space-6)" : "var(--space-10)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginBlockEnd: "var(--space-6)" }}>
        <span style={eyebrow}>{lines.length} lines · {lines.reduce((s, l) => s + l.qty, 0)} pieces</span>
        <h1 style={{ font: "var(--type-h1)", margin: 0 }}>Your bag</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.6fr minmax(300px, 1fr)", gap: narrow ? "var(--space-8)" : "var(--space-10)", alignItems: "start" }}>
        <div>
          {loading
            ? [0, 1, 2].map((i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: narrow ? "72px 1fr" : "96px 1fr", gap: "var(--space-5)", paddingBlock: "var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
                  <div className="vd-sk" style={{ aspectRatio: "3 / 4", borderRadius: "var(--radius-sm)" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    <div className="vd-sk" style={{ height: 10, width: "30%" }} />
                    <div className="vd-sk" style={{ height: 14, width: "62%" }} />
                    <div className="vd-sk" style={{ height: 10, width: "44%" }} />
                  </div>
                </div>
              ))
            : lines.map((l) => (
                <CartLine key={l.id} line={l} narrow={narrow}
                  onQty={(id, q) => setLines((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(1, q) } : x)))}
                  onRemove={(id) => setLines((p) => p.filter((x) => x.id !== id))} />
              ))}
          <div style={{ display: "flex", gap: "var(--space-3)", paddingBlockStart: "var(--space-5)", flexWrap: "wrap" }}>
            <Button variant="ghost" size="sm" iconLeft={<Icon name="arrow-left" size={15} />}>Keep shopping</Button>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", position: narrow ? "static" : "sticky", insetBlockStart: "calc(var(--topbar-height) + var(--space-6))" }}>
          <div style={{ ...eyebrow, paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>What you pay</div>
          <BreakdownTable b={b} />
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Input size="sm" placeholder="Promotion code" aria-label="Promotion code" style={{ flex: 1 }} />
            <Button variant="outline" size="sm">Apply</Button>
          </div>
          <Button size="lg" block style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Checkout</Button>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {[["shield-check", "bKash, Nagad, card and cash on delivery"], ["rotate-ccw", "14 days to return, except custom pieces"], ["lock", "Card details never touch our servers"]].map(([icon, text]) => (
              <span key={text} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
                <Icon name={icon} size={13} style={{ marginBlockStart: 2, flex: "none" }} />{text}
              </span>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- confirmation ---------- */

function Confirmation({ state = "populated", narrow, onRetry, market = "bd" }) {
  if (state === "error") {
    return <ErrorState narrow={narrow} title="Your order went through — this page did not"
      body="Payment succeeded and order VD-24817 exists. Only this confirmation failed to render. It is in your account, and the email is on its way."
      detail="order VD-24817 · render 7c41f0 · 500" onRetry={onRetry} />;
  }
  const b = landed(ORDER_LINES, market);
  return (
    <div style={{ maxWidth: 760, marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlockStart: narrow ? "var(--space-8)" : "var(--space-16)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingBlockEnd: "var(--space-8)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", ...eyebrow, color: "var(--success-text, var(--fg-primary))" }}>
          <Icon name="circle-check" size={14} />Paid
        </span>
        <h1 style={{ font: "var(--type-h1)", margin: 0, textWrap: "balance" }}>Order VD-24817 is confirmed</h1>
        <p style={{ font: "var(--type-ui)", color: "var(--fg-secondary)", margin: 0, maxWidth: "56ch", textWrap: "pretty" }}>
          We have emailed the receipt to ayesha.k@example.com. The two stocked lines leave Dhaka tomorrow; your Studio piece is printed to order and follows in six to eight days.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", paddingBlockStart: "var(--space-2)" }}>
          <Button iconLeft={<Icon name="package" size={15} />}>Track this order</Button>
          <Button variant="outline" iconLeft={<Icon name="download" size={15} />}>Download invoice</Button>
        </div>
      </div>

      {/* UI-CHK-9: what happens next, in order, with the part that needs the buyer marked. */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingBlock: "var(--space-8)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
        <span style={eyebrow}>What happens next</span>
        {[
          ["Tomorrow", "Two lines dispatch from Dhaka warehouse", null],
          ["In 2–3 days", "Delivery to Dhanmondi, Dhaka 1209", null],
          ["In 6–8 days", "Studio piece printed, checked and dispatched", null],
          ["When it arrives", "You have 14 days to return the stocked lines", "The Studio piece is excluded unless it arrives faulty."],
        ].map(([when, what, note]) => (
          <div key={what} style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "132px 1fr", gap: narrow ? "var(--space-1)" : "var(--space-5)" }}>
            <span style={{ ...monoMeta, whiteSpace: "nowrap" }}>{when}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "var(--type-ui-dense)" }}>{what}</span>
              {note ? <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{note}</span> : null}
            </span>
          </div>
        ))}
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingBlock: "var(--space-8)" }}>
        <span style={eyebrow}>What you paid</span>
        <BreakdownTable b={b} />
        <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>Charged to bKash ending 4417 · txn 7c41f0</span>
      </section>
    </div>
  );
}

/* ---------- order detail ---------- */

/* UI-ACC-2. Customs is not one state but four, and a shipment can sit in any of them for
   days, so the timeline names the state AND what is being waited on. */
const TIMELINE = [
  { at: "26 Aug, 14:02", label: "Order placed", body: "Paid with bKash ending 4417.", done: true },
  { at: "27 Aug, 09:18", label: "Dispatched from Dhaka", body: "Two lines, DHL Express 7742 8891 0021.", done: true },
  { at: "28 Aug, 03:40", label: "Export cleared — Bangladesh", body: "Customs declaration accepted, HS 6109.10.", done: true },
  { at: "28 Aug, 22:15", label: "Held at UK border", body: "The carrier has asked for a commercial invoice. We have sent it; nothing is needed from you.", done: false, current: true, tone: "warning" },
  { at: "Expected 31 Aug", label: "Import cleared — United Kingdom", body: "Duty and VAT were prepaid at checkout, so nothing is collected on delivery.", done: false },
  { at: "Expected 1 Sep", label: "Out for delivery", body: "Manchester M1, signature on arrival.", done: false },
];

function Timeline({ narrow }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
      {TIMELINE.map((s, i) => {
        const last = i === TIMELINE.length - 1;
        const dot = s.current ? "var(--warning-text, var(--accent-fill))" : s.done ? "var(--fg-primary)" : "var(--border-strong)";
        return (
          <li key={s.label} style={{ display: "grid", gridTemplateColumns: narrow ? "20px 1fr" : "132px 20px 1fr", gap: narrow ? "var(--space-3)" : "var(--space-4)", alignItems: "start" }}>
            {narrow ? null : <span style={{ ...monoMeta, textAlign: "end", paddingBlockStart: 3, whiteSpace: "nowrap" }}>{s.at}</span>}
            <span style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
              <span aria-hidden="true" style={{ width: s.current ? 13 : 9, height: s.current ? 13 : 9, marginBlockStart: 5, flex: "none", borderRadius: "var(--radius-full)", background: s.done || s.current ? dot : "var(--bg-canvas)", border: "var(--border-width-medium) solid " + dot }} />
              {last ? null : <span aria-hidden="true" style={{ width: 2, flex: 1, minHeight: 26, background: s.done ? "var(--fg-primary)" : "var(--border-default)" }} />}
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, paddingBlockEnd: last ? 0 : "var(--space-5)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <span style={{ font: "var(--type-ui-dense)", fontWeight: s.current ? "var(--weight-medium)" : "var(--weight-regular)", color: s.done || s.current ? "var(--fg-primary)" : "var(--fg-secondary)" }}>{s.label}</span>
                {s.current ? <Badge tone="warning" size="sm">Now — 4 days</Badge> : null}
              </span>
              {narrow ? <span style={monoMeta}>{s.at}</span> : null}
              <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", maxWidth: "52ch", textWrap: "pretty" }}>{s.body}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetail({ state = "populated", narrow, onRetry }) {
  const [ret, setRet] = React.useState(false);
  if (state === "error") {
    return <ErrorState narrow={narrow} title="We could not load this order"
      body="The order service is not responding. Your order is unaffected — this page just cannot show it right now."
      detail="order VD-24816 · request 3ba917 · 503" onRetry={onRetry} />;
  }
  const b = landed(ORDER_LINES.slice(0, 2), "uk");
  return (
    <div style={{ maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlockStart: narrow ? "var(--space-6)" : "var(--space-10)" }}>
      <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-ui-dense)", marginBlockEnd: "var(--space-5)" }}>
        <Icon name="arrow-left" size={15} />All orders
      </a>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-5)", flexWrap: "wrap", marginBlockEnd: "var(--space-8)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <span style={eyebrow}>Placed 26 August · Manchester, UK</span>
          <h1 style={{ font: "var(--type-h1)", margin: 0, fontFamily: "var(--font-mono)" }}>VD-24816</h1>
          <Badge tone="warning">Held at UK border — 4 days</Badge>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Button variant="outline" iconLeft={<Icon name="download" size={15} />}>Invoice</Button>
          <Button variant="outline" iconLeft={<Icon name="circle-help" size={15} />}>Get help with this order</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.5fr minmax(300px, 1fr)", gap: narrow ? "var(--space-10)" : "var(--space-10)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <span style={eyebrow}>Where it is</span>
            <Timeline narrow={narrow} />
          </section>

          {/* UI-ACC-2: per-fulfilment, because one order can be two parcels on two clocks. */}
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <span style={eyebrow}>Two parcels</span>
            {[["Parcel 1 of 2", "DHL Express 7742 8891 0021", "Held at UK border", "warning", ORDER_LINES.slice(0, 2)],
              ["Parcel 2 of 2", "Not yet dispatched", "Printing — expected 2 Sep", "info", ORDER_LINES.slice(2, 3)]].map(([title, track, status, tone, items]) => (
              <div key={title} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>{title}</span>
                    <span style={monoMeta}>{track}</span>
                  </div>
                  <Badge tone={tone} size="sm">{status}</Badge>
                </div>
                {items.map((l) => (
                  <div key={l.id} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: "var(--space-4)", alignItems: "center" }}>
                    <Plate ratio="3 / 4" style={{ borderRadius: "var(--radius-sm)" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <span style={{ font: "var(--type-ui-dense)" }}>{l.name}</span>
                      <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{l.variant} · {l.qty} ×</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", whiteSpace: "nowrap" }}>{taka(l.price * l.qty)}</span>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
            <span style={eyebrow}>What you paid</span>
            <BreakdownTable b={b} dense />
            <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>Card ending 8842 · txn 4d19ba</span>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
            <span style={eyebrow}>Delivery address</span>
            <span style={{ font: "var(--type-ui-dense)", whiteSpace: "pre-line", color: "var(--fg-secondary)" }}>{"Marcus Reid\n14 Ardwick Green North\nManchester M12 6HS\nUnited Kingdom"}</span>
          </section>

          {/* UI-ACC-3. Two interactions to start a return, and the statutory right is a
              separate, differently-worded path — conflating them would misstate the law. */}
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
            <span style={eyebrow}>Returns</span>
            <Button block onClick={() => setRet(true)} iconLeft={<Icon name="rotate-ccw" size={15} />}>Return or exchange an item</Button>
            <Button block variant="outline" onClick={() => setRet(true)}>Cancel under UK withdrawal right</Button>
            <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", textWrap: "pretty" }}>
              The withdrawal right runs for 14 days from delivery and needs no reason. A commercial return needs one, and the Studio piece is excluded from both unless faulty.
            </span>
          </section>
        </aside>
      </div>

      {ret ? (
        <div role="dialog" aria-modal="true" aria-label="Start a return" style={{ position: "fixed", inset: 0, zIndex: "var(--z-modal)", display: "grid", placeItems: "center", padding: "var(--space-5)", background: "var(--bg-overlay, #00000073)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "min(480px, 100%)", padding: "var(--space-6)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)" }}>
            <span style={eyebrow}>Step 1 of 2</span>
            <h2 style={{ font: "var(--type-h3)", margin: 0 }}>Which item, and why?</h2>
            {ORDER_LINES.slice(0, 2).map((l) => (
              <label key={l.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", border: "var(--border-width-thin) solid var(--border-control)", borderRadius: "var(--radius-sm)" }}>
                <input type="radio" name="ret" defaultChecked={l.id === "l1"} style={{ width: 16, height: 16, accentColor: "var(--indicator-active)", flex: "none" }} />
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ font: "var(--type-ui-dense)" }}>{l.name}</span>
                  <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{l.variant}</span>
                </span>
              </label>
            ))}
            <Select options={["Does not fit", "Not as described", "Arrived damaged", "Changed my mind", "Other"]} aria-label="Reason" />
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setRet(false)}>Cancel</Button>
              <Button onClick={() => setRet(false)}>Continue</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
