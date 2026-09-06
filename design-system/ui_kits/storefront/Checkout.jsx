const { Button, Input, Select, Radio } = window.VoidDesignSystem_980885;

const LINES = [
  { sku: "VD-KRT-0421", title: "Handloom cotton kurta", variant: "Size M · Unbleached", qty: 1, price: 2450 },
  { sku: "VD-DUP-0334", title: "Natural-dye dupatta", variant: "One size · Indigo", qty: 2, price: 1890 },
];

function Summary({ narrow, muted }) {
  const sub = LINES.reduce((t, l) => t + l.price * l.qty, 0);
  const ship = 120;
  const rows = [["Subtotal", taka(sub)], ["Delivery — outside Dhaka", taka(ship)], ["Duties", "Included"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", padding: "var(--space-5)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", opacity: muted ? 0.5 : 1 }}>
      <div style={{ ...eyebrow, paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>Order summary</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {LINES.map((l) => (
          <div key={l.sku} style={{ display: "flex", gap: "var(--space-3)" }}>
            <div style={{ width: 56, flex: "none" }}><Plate ratio="3 / 4" /></div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "var(--type-ui-dense)", lineHeight: "var(--leading-snug)" }}>{l.title}</span>
              <span style={{ ...monoMeta }}>{l.sku}</span>
              <span style={{ fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>{l.variant} · ×{l.qty}</span>
            </div>
            <span style={{ font: "var(--type-ui-dense)", fontVariantNumeric: "tabular-nums", fontWeight: "var(--weight-medium)" }}>{taka(l.price * l.qty)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingBlockStart: "var(--space-4)", borderBlockStart: "var(--border-width-thin) solid var(--border-subtle)" }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", font: "var(--type-ui-dense)" }}>
            <span style={{ color: "var(--fg-secondary)" }}>{k}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-4)", paddingBlockStart: "var(--space-4)", borderBlockStart: "var(--border-width-medium) solid var(--fg-primary)" }}>
        <span style={{ ...eyebrow, color: "var(--fg-primary)" }}>Total</span>
        <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums" }}>{taka(sub + ship)}</span>
      </div>
      <Trust items={["Encrypted payment", "14-day returns", "Dispatched from Dhaka"]} />
    </div>
  );
}

function Steps({ current = 2 }) {
  const steps = ["Bag", "Delivery", "Payment", "Confirm"];
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 0, borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      {steps.map((s, i) => {
        const done = i < current, on = i === current;
        return (
          <li key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-medium) solid " + (on ? "var(--indicator-active)" : done ? "var(--fg-primary)" : "transparent"), marginBlockEnd: -1 }}>
            <span style={{ ...monoMeta, color: on ? "var(--fg-primary)" : "var(--fg-secondary)" }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ ...eyebrow, color: on || done ? "var(--fg-primary)" : "var(--fg-secondary)" }}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

function PayMethod({ id, name, label, meta, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minHeight: "var(--touch-target-min)", padding: "var(--space-3) var(--space-4)", background: checked ? "var(--bg-surface-sunken)" : "var(--bg-surface)", border: "var(--border-width-thin) solid " + (checked ? "var(--indicator-active)" : "var(--border-control)"), borderRadius: "var(--radius-md)", cursor: "pointer", transition: "var(--transition-control)" }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} style={{ width: 16, height: 16, accentColor: "var(--indicator-active)", flex: "none" }} />
      <span style={{ flex: 1, font: "var(--type-ui)" }}>{label}</span>
      <span style={monoMeta}>{meta}</span>
    </label>
  );
}

function Checkout({ state = "populated", narrow, onRetry }) {
  const [pay, setPay] = React.useState("bkash");
  const [ship, setShip] = React.useState("std");

  if (state === "loading") {
    return (
      <Page narrow={narrow}>
        <Sk h={44} mb={32} />
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.4fr 1fr", gap: narrow ? "var(--space-8)" : "var(--space-12)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {[0, 1, 2].map((g) => (
              <div key={g} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <Sk w="120px" h={11} />
                <Sk h={44} /><Sk h={44} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}><Sk h={44} /><Sk h={44} /></div>
              </div>
            ))}
            <Sk h={52} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-5)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)" }}>
            <Sk w="40%" h={11} />
            {[0, 1].map((i) => <div key={i} style={{ display: "flex", gap: "var(--space-3)" }}><div style={{ width: 56, flex: "none" }}><SkPlate /></div><div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}><Sk h={12} /><Sk w="60%" h={10} /><Sk w="40%" h={10} /></div></div>)}
            <Sk h={1} /><Sk w="100%" h={12} /><Sk w="100%" h={12} /><Sk w="50%" h={26} />
          </div>
        </div>
      </Page>
    );
  }

  if (state === "empty") {
    return (
      <Page narrow={narrow}>
        <Steps current={0} />
        <div style={{ paddingBlockStart: "var(--space-8)" }}>
          <EmptyState
            narrow={narrow}
            title="Nothing in your bag"
            body="Add a piece and it will appear here with delivery and duties calculated for your market."
            action={<div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}><Button>Browse new in</Button><Button variant="outline">View saved items</Button></div>}
          />
        </div>
      </Page>
    );
  }

  if (state === "error") {
    return (
      <Page narrow={narrow}>
        <Steps current={2} />
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.4fr 1fr", gap: narrow ? "var(--space-8)" : "var(--space-12)", paddingBlockStart: "var(--space-8)", alignItems: "start" }}>
          <ErrorState
            narrow={narrow}
            title="bKash declined the payment"
            body="No money left your account and your bag is intact. Retry, or choose another method — Nagad and card are both available."
            detail="txn 7c41f0 · code E-2043 insufficient balance"
            onRetry={onRetry}
          />
          <Summary narrow={narrow} muted />
        </div>
      </Page>
    );
  }

  return (
    <Page narrow={narrow}>
      <Steps current={2} />
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.4fr 1fr", gap: narrow ? "var(--space-8)" : "var(--space-12)", paddingBlockStart: narrow ? "var(--space-6)" : "var(--space-10)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: narrow ? "var(--space-8)" : "var(--space-10)" }}>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-4)", paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
              <h2 style={{ font: "var(--type-h3)" }}>Delivery address</h2>
              <span style={monoMeta}>Step 02 complete</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: "var(--space-4)" }}>
              <Input label="Full name" defaultValue="Ayesha Karim" />
              <Input label="Phone" prefix={<span style={{ fontSize: "var(--text-ui)" }}>+880</span>} defaultValue="1712 345678" />
              <Input label="Street address" defaultValue="House 42, Road 11, Dhanmondi" style={{ gridColumn: narrow ? "auto" : "1 / -1" }} />
              <Select label="District" options={["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi"]} />
              <Input label="Postcode" defaultValue="1209" />
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ font: "var(--type-h3)", paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>Delivery method</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <PayMethod name="ship" label="Standard — 2–3 days" meta="৳120" checked={ship === "std"} onChange={() => setShip("std")} />
              <PayMethod name="ship" label="Express — next day" meta="৳240" checked={ship === "exp"} onChange={() => setShip("exp")} />
              <PayMethod name="ship" label="Collect from Dhanmondi studio" meta="Free" checked={ship === "pick"} onChange={() => setShip("pick")} />
            </div>
          </section>

          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ font: "var(--type-h3)", paddingBlockEnd: "var(--space-3)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>Payment</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <PayMethod name="pay" label="bKash" meta="Mobile wallet" checked={pay === "bkash"} onChange={() => setPay("bkash")} />
              <PayMethod name="pay" label="Nagad" meta="Mobile wallet" checked={pay === "nagad"} onChange={() => setPay("nagad")} />
              <PayMethod name="pay" label="Card" meta="Visa · Mastercard" checked={pay === "card"} onChange={() => setPay("card")} />
              <PayMethod name="pay" label="Cash on delivery" meta="Dhaka only" checked={pay === "cod"} onChange={() => setPay("cod")} />
            </div>
            {pay === "card" ? (
              <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "2fr 1fr 1fr", gap: "var(--space-4)", paddingBlockStart: "var(--space-2)" }}>
                <Input label="Card number" placeholder="0000 0000 0000 0000" />
                <Input label="Expiry" placeholder="MM / YY" />
                <Input label="CVC" placeholder="123" />
              </div>
            ) : null}
            <p style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>
              You will be redirected to {pay === "card" ? "your bank" : "bKash"} to authorise. Void never stores your wallet PIN.
            </p>
          </section>

          {narrow ? null : (
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <Button size="lg" style={{ flex: 1, background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Pay {taka(6350)}</Button>
              <Button size="lg" variant="outline">Back to delivery</Button>
            </div>
          )}
        </div>
        <div style={{ position: narrow ? "static" : "sticky", insetBlockStart: "calc(var(--topbar-height) + var(--space-8))" }}>
          <Summary narrow={narrow} />
        </div>
      </div>

      {narrow ? (
        <div style={{ position: "sticky", insetBlockEnd: 0, zIndex: "var(--z-sticky)", display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBlockStart: "var(--space-6)", marginInline: "calc(var(--space-4) * -1)", padding: "var(--space-4)", background: "var(--bg-surface)", borderBlockStart: "var(--border-width-thin) solid var(--border-default)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--type-ui-dense)" }}>
            <span style={{ color: "var(--fg-secondary)" }}>Total</span>
            <span style={{ fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums" }}>{taka(6350)}</span>
          </div>
          <Button size="lg" block style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>Pay {taka(6350)}</Button>
        </div>
      ) : null}
    </Page>
  );
}

Object.assign(window, { Checkout, Summary, Steps, PayMethod });
