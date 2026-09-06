/* Void storefront — the three surfaces added after the SRS gap audit of 2026-09-06.

   · HelpCentre   UI-ACC-4  searchable help, ticket creation with the order pre-attached
   · NotFound     UI-GLOB-6 branded 404, offering search and primary navigation
   · ServerError  UI-GLOB-6 branded 500, same, plus retry and a support diagnostic
   · VoidFormat   UI-GLOB-9 locale-driven money and number rendering

   Registered on window and resolved by StorefrontApp at render time, so neither file
   depends on the other's load order (same arrangement as AdminOps.jsx). */

const DS = () => window.VoidDesignSystem_980885 || {};
const Button = React.forwardRef((p, ref) => React.createElement(DS().Button, { ...p, ref }));
const Icon = React.forwardRef((p, ref) => React.createElement(DS().Icon, { ...p, ref }));
const Input = React.forwardRef((p, ref) => React.createElement(DS().Input, { ...p, ref }));
const Select = React.forwardRef((p, ref) => React.createElement(DS().Select, { ...p, ref }));
const Tag = React.forwardRef((p, ref) => React.createElement(DS().Tag, { ...p, ref }));

/* ===== UI-GLOB-9 — currency and number rendering =====

   Symbol placement, decimal separator, grouping and decimal places come from locale
   data, never from string concatenation. `৳2,450` in en-BD; `৳২,৪৫০` in bn-BD, with
   Bengali numerals and bn-BD grouping. Minor units follow the currency: BDT, INR and
   GBP take two, and Void renders whole taka on the storefront because the catalogue
   is priced in whole taka — so the decimals are suppressed explicitly rather than by
   accident, and a market that needs them gets them.  */

const MARKETS = {
  bd: { currency: "BDT", locales: { en: "en-BD", bn: "bn-BD" }, minor: 0, label: "Bangladesh" },
  in: { currency: "INR", locales: { en: "en-IN", bn: "bn-IN" }, minor: 0, label: "India" },
  ae: { currency: "AED", locales: { en: "en-AE", bn: "bn" }, minor: 2, label: "United Arab Emirates" },
  uk: { currency: "GBP", locales: { en: "en-GB", bn: "bn" }, minor: 2, label: "United Kingdom" },
};

const VoidFormat = {
  markets: MARKETS,
  /* Digits, grouping, decimal separator and numeral system all come from locale data
     via formatToParts — bn-BD yields ২,৪৫০, en-GB yields 2,450.00. Only the SYMBOL
     POSITION is Void's: `readme.md` ("Numbers are literal and formatted") fixes the
     symbol as leading with no space, where CLDR trails it for bn-BD. That is a
     disclosed override of locale data, not an oversight — see ADR-0007. A symbol of
     more than one character, or one made of letters (AED), takes a space, because
     "AED2,450.00" is not what the rule meant. */
  money(amount, locale = "en", market = "bd") {
    const m = MARKETS[market] || MARKETS.bd;
    const tag = m.locales[locale] || m.locales.en;
    const opts = { style: "currency", currency: m.currency, currencyDisplay: "narrowSymbol", minimumFractionDigits: m.minor, maximumFractionDigits: m.minor };
    let parts;
    try { parts = new Intl.NumberFormat(tag, opts).formatToParts(amount); }
    catch (e) {
      /* A locale the engine does not carry must not take the price down with it. */
      try { parts = new Intl.NumberFormat("en", opts).formatToParts(amount); }
      catch (e2) { return m.currency + " " + Number(amount).toFixed(m.minor); }
    }
    const symbol = parts.filter((p) => p.type === "currency").map((p) => p.value).join("");
    const digits = parts.filter((p) => p.type !== "currency" && p.type !== "literal").map((p) => p.value).join("");
    const gap = symbol.length > 1 || /\p{L}/u.test(symbol) ? "\u00a0" : "";
    return symbol + gap + digits;
  },
  number(value, locale = "en", market = "bd") {
    const m = MARKETS[market] || MARKETS.bd;
    const tag = m.locales[locale] || m.locales.en;
    try { return new Intl.NumberFormat(tag).format(value); } catch (e) { return new Intl.NumberFormat("en").format(value); }
  },
  date(iso, locale = "en", market = "bd") {
    const m = MARKETS[market] || MARKETS.bd;
    const tag = m.locales[locale] || m.locales.en;
    try { return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso)); } catch (e) { return iso; }
  },
};

/* ===== shared bits ===== */

const line = "var(--border-width-thin) solid var(--border-default)";
const eyebrow = { fontSize: "var(--text-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--fg-secondary)" };
const monoMeta = { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" };

function Sk({ w = "100%", h = 14, mb = 0 }) {
  return <div className="vd-sk" style={{ width: w, height: h, marginBlockEnd: mb }} />;
}

function Section({ children, narrow, pad = true, max = "var(--layout-max-editorial)" }) {
  return (
    <div style={{ maxWidth: max, marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlock: pad ? (narrow ? "var(--space-8)" : "var(--space-16)") : 0 }}>
      {children}
    </div>
  );
}

/* ===== UI-ACC-4 — help centre ===== */

const HELP_TOPICS = [
  { group: "Orders and delivery", items: [
    ["Where is my order?", "Tracking, customs states and what each one means"],
    ["Change or cancel an order", "What is still possible after each fulfilment step"],
    ["Delivery times by district", "Next-day districts, and what adds days"],
    ["Duty and import charges", "Why the landed cost is what it is, itemised"],
  ]},
  { group: "Returns and refunds", items: [
    ["Start a return or exchange", "The commercial path — 14 days, unworn, tags on"],
    ["Withdraw from a purchase", "The statutory right, where the market grants one"],
    ["Refund timings by payment method", "bKash, Nagad, card and cash on delivery"],
    ["A made-to-order piece arrived wrong", "Studio and custom orders are handled separately"],
  ]},
  { group: "Void Studio", items: [
    ["Print resolution and safe areas", "What the Studio warns about, and why"],
    ["What can and cannot be printed", "Colour, coverage and legibility limits"],
    ["Lead times for custom pieces", "7–10 days, and what extends it"],
  ]},
  { group: "Account and payment", items: [
    ["Payment methods by market", "What is available where, and what is not"],
    ["Sign-in problems and lockouts", "The 15-minute lockout lifts itself"],
    ["Addresses and saved cards", "Editing, removing and what we keep"],
  ]},
];

const ATTACHED_ORDER = {
  id: "VD-2026-0004417",
  placed: "2026-08-28",
  items: 2,
  total: 8350,
  status: "In transit — cleared customs 2 Sep",
  lead: "Handloom cotton kurta + 1 more",
};

const TICKET_SUBJECTS = [
  "Where is my order?",
  "Something is wrong with an item",
  "Return or exchange",
  "Refund has not arrived",
  "Duty or delivery charge query",
  "Something else",
];

function AttachedOrder({ order, locale, market, onDetach }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-4)", background: "var(--bg-surface-sunken)", border: line }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <span style={eyebrow}>Attached to this ticket</span>
        <button type="button" className="void-touch-safe" onClick={onDetach} style={{ background: "none", border: "none", padding: 0, font: "var(--type-ui-sm)", color: "var(--fg-link)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>Remove</button>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--fg-primary)" }}>{order.id}</span>
      <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-primary)" }}>{order.lead}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1) var(--space-4)", ...monoMeta }}>
        <span>Placed {VoidFormat.date(order.placed, locale, market)}</span>
        <span>{VoidFormat.number(order.items, locale, market)} items</span>
        <span>{VoidFormat.money(order.total, locale, market)}</span>
      </div>
      <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{order.status}</span>
    </div>
  );
}

function TicketPanel({ narrow, locale, market, order, onDetach, onReattach }) {
  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: narrow ? "var(--space-5)" : "var(--space-6)", background: "var(--bg-surface)", border: line, alignSelf: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <span style={eyebrow}>Still stuck</span>
        <h2 style={{ font: "var(--type-h3)", margin: 0, letterSpacing: "var(--tracking-tight)" }}>Open a ticket</h2>
        <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", margin: 0, textWrap: "pretty" }}>
          A person reads every ticket. We reply within one working day, in English or Bengali.
        </p>
      </div>

      {order
        ? <AttachedOrder order={order} locale={locale} market={market} onDetach={onDetach} />
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-4)", border: "var(--border-width-thin) dashed var(--border-control)" }}>
            <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>No order attached. Support will have to ask which one you mean.</span>
            <button type="button" className="void-touch-safe" onClick={onReattach} style={{ alignSelf: "start", background: "none", border: "none", padding: 0, font: "var(--type-ui-sm)", color: "var(--fg-link)", textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }}>Attach order {ATTACHED_ORDER.id}</button>
          </div>
        )}

      <Select label="What is this about?" defaultValue={TICKET_SUBJECTS[0]} options={TICKET_SUBJECTS} />

      <Input label="Tell us what happened" multiline rows={5}
        placeholder="The parcel says delivered but nothing arrived at the gate." />

      <p style={{ ...monoMeta, margin: 0 }}>
        The order, its items and its delivery history travel with the ticket. Nothing else is sent.
      </p>
      <Button variant="primary" style={{ width: "100%" }}>Send ticket</Button>
    </aside>
  );
}

function HelpSearch({ narrow, value, onChange, onSubmit }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <span style={eyebrow}>Help centre</span>
        <h1 style={{ font: narrow ? "var(--type-h1)" : "var(--type-display)", margin: 0, letterSpacing: "var(--tracking-tighter)", textWrap: "balance" }}>What do you need?</h1>
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <Input aria-label="Search help" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="Search — “customs”, “refund”, “size”" prefix={<Icon name="search" size={16} />} />
        </div>
        <Button variant="primary" type="submit">Search</Button>
      </div>
    </form>
  );
}

function TopicCard({ title, blurb }) {
  return (
    <a href="#" style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", padding: "var(--space-4) 0", borderBlockEnd: line, textDecoration: "none", minHeight: "var(--touch-target-min)", justifyContent: "center" }}>
      <span style={{ font: "var(--type-ui)", color: "var(--fg-primary)", fontWeight: "var(--weight-medium)" }}>{title}</span>
      <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", textWrap: "pretty" }}>{blurb}</span>
    </a>
  );
}

function HelpCentre({ state = "populated", narrow = false, onRetry, locale = "en", market = "bd" }) {
  const [q, setQ] = React.useState("");
  const [order, setOrder] = React.useState(ATTACHED_ORDER);
  const ticket = (
    <TicketPanel narrow={narrow} locale={locale} market={market} order={order}
      onDetach={() => setOrder(null)} onReattach={() => setOrder(ATTACHED_ORDER)} />
  );

  let body;
  if (state === "loading") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {[0, 1, 2].map((g) => (
          <div key={g} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <Sk w="180px" h={11} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingBlock: "var(--space-4)", borderBlockEnd: line }}>
                <Sk w={i % 2 ? "58%" : "44%"} h={15} />
                <Sk w="76%" h={12} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  } else if (state === "empty") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingBlock: "var(--space-10)", borderBlock: line }}>
        <p style={{ font: "var(--type-h3)", margin: 0 }}>Nothing matches “{q || "jamdani exchange"}”.</p>
        <p style={{ font: "var(--type-ui)", color: "var(--fg-secondary)", margin: 0, maxWidth: "52ch", textWrap: "pretty" }}>
          Try a shorter phrase, or open a ticket — your order is already attached to it.
        </p>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => setQ("")}>Clear search</Button>
          <Button variant="primary" onClick={() => { const t = document.getElementById("vd-ticket"); if (t) t.focus(); }}>Ask us instead</Button>
        </div>
      </div>
    );
  } else if (state === "error") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: narrow ? "var(--space-5)" : "var(--space-6)", background: "var(--error-bg)", border: "var(--border-width-thin) solid var(--error-border)" }}>
        <p style={{ font: "var(--type-h3)", margin: 0, color: "var(--error-text)" }}>Help search is down.</p>
        <p style={{ font: "var(--type-ui)", color: "var(--fg-primary)", margin: 0, maxWidth: "52ch", textWrap: "pretty" }}>
          Nothing was searched, so nothing was missed. Ticket creation still works, and your order is attached to it.
        </p>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Button variant="primary" onClick={onRetry} iconLeft={<Icon name="rotate-ccw" size={15} />}>Search again</Button>
        </div>
        <span style={monoMeta}>help-search · 503 · req 7f2ac91d</span>
      </div>
    );
  } else {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {["Where is my order?", "Start a return", "Duty and import charges", "Studio lead times"].map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
        {HELP_TOPICS.map((g) => (
          <section key={g.group} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <h2 style={{ ...eyebrow, margin: 0, paddingBlockEnd: "var(--space-2)" }}>{g.group}</h2>
            {g.items.map(([title, blurb]) => <TopicCard key={title} title={title} blurb={blurb} />)}
          </section>
        ))}
      </div>
    );
  }

  return (
    <Section narrow={narrow}>
      <div style={{ display: "flex", flexDirection: "column", gap: narrow ? "var(--space-8)" : "var(--space-12)" }}>
        <HelpSearch narrow={narrow} value={q} onChange={setQ} onSubmit={() => {}} />
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1.6fr) minmax(320px, 1fr)", gap: narrow ? "var(--space-8)" : "var(--space-12)", alignItems: "start" }}>
          <div style={{ minWidth: 0 }}>{body}</div>
          <div id="vd-ticket" tabIndex={-1} style={{ minWidth: 0 }}>{ticket}</div>
        </div>
      </div>
    </Section>
  );
}

/* ===== UI-GLOB-6 — branded error pages =====
   Both offer search and primary navigation, because a dead end that only apologises
   is still a dead end. Neither exposes an internal identifier beyond the support
   reference a person would have to quote (UI-GLOB-2). */

const PRIMARY_NAV = [
  ["New in", "Everything from the last 14 days"],
  ["Women", "Kurta, saree, trouser, outerwear"],
  ["Men", "Shirt, kurta, trouser"],
  ["Void Studio", "Print your own on the same cloth"],
  ["Designers", "42 independent studios"],
  ["Your orders", "Track, return, download an invoice"],
];

function ErrorPage({ code, title, body, narrow, action, diagnostic }) {
  return (
    <Section narrow={narrow} max="var(--layout-max-editorial)">
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0, 1fr) minmax(280px, 0.8fr)", gap: narrow ? "var(--space-10)" : "var(--space-16)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", minWidth: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-5xl)", lineHeight: "var(--leading-tight)", color: "var(--fg-primary)", letterSpacing: "var(--tracking-tighter)" }}>{code}</span>
          <h1 style={{ font: narrow ? "var(--type-h1)" : "var(--type-h1)", margin: 0, letterSpacing: "var(--tracking-tight)", textWrap: "balance" }}>{title}</h1>
          <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)", margin: 0, maxWidth: "54ch", textWrap: "pretty" }}>{body}</p>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", maxWidth: 440 }}>
            <div style={{ flex: "1 1 200px", minWidth: 0 }}>
              <Input aria-label="Search Void" placeholder="Search for a piece, a designer, an order" prefix={<Icon name="search" size={16} />} />
            </div>
            <Button variant="primary" type="submit">Search</Button>
          </form>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>{action}</div>
          {diagnostic ? <span style={monoMeta}>{diagnostic}</span> : null}
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 0, minWidth: 0, borderBlockStart: line }}>
          {PRIMARY_NAV.map(([label, blurb]) => (
            <a key={label} href="#" style={{ display: "flex", flexDirection: "column", gap: 2, paddingBlock: "var(--space-3)", borderBlockEnd: line, textDecoration: "none", minHeight: "var(--touch-target-min)", justifyContent: "center" }}>
              <span style={{ font: "var(--type-ui)", color: "var(--fg-primary)", fontWeight: "var(--weight-medium)" }}>{label}</span>
              <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{blurb}</span>
            </a>
          ))}
        </nav>
      </div>
    </Section>
  );
}

function NotFound({ narrow = false }) {
  return (
    <ErrorPage code="404" narrow={narrow}
      title="That page is not here."
      body="It may have been a piece that sold out and was retired, or a link that was mistyped. Everything else is where you left it."
      action={<><Button variant="primary">Back to new in</Button><Button variant="secondary">Your orders</Button></>} />
  );
}

function ServerError({ narrow = false, onRetry }) {
  return (
    <ErrorPage code="500" narrow={narrow}
      title="Something broke on our side."
      body="The page did not load. Nothing you were doing was saved or charged — if you were paying, the payment did not go through. Try again in a moment."
      action={<><Button variant="primary" onClick={onRetry} iconLeft={<Icon name="rotate-ccw" size={15} />}>Reload the page</Button><Button variant="secondary">Help centre</Button></>}
      diagnostic="Quote this if you contact us · req 3c8e10b4 · 2026-09-06 14:22 UTC" />
  );
}

/* ===== registry ===== */

const VoidStorefrontExtra = { help: HelpCentre, notfound: NotFound, servererror: ServerError };
function StorefrontExtraRegistry() { return null; }

Object.assign(window, { VoidFormat, VoidStorefrontExtra, StorefrontExtraRegistry });
