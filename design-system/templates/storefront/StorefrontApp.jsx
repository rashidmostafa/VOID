/* Void storefront — one mountable component for templates/storefront/Storefront.dc.html.
   Concatenated from Shell / ProductDetail / ProductListing / Checkout / Account so the
   whole kit mounts through a single <x-import> in strict order.

   Design-system components are resolved at RENDER time, not module-evaluation time, so
   this file does not care whether _ds_bundle.js has finished loading when it is parsed.
   Edit the source screens, not this file, if you split it back apart. */

const DS = () => window.VoidDesignSystem_980885 || {};

/* ds-base.js loads _ds_bundle.js asynchronously, so on the first paint the design
   system may not be on window yet. Every wrapper below resolves its component at
   render time, and StorefrontApp holds the whole tree back until the bundle is
   present — rendering an undefined element type throws, and the dc-runtime error
   boundary latches, so a missed frame would be permanent rather than transient. */
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

const Badge = React.forwardRef((p, ref) => React.createElement(DS().Badge, { ...p, ref }));
const Button = React.forwardRef((p, ref) => React.createElement(DS().Button, { ...p, ref }));
const Checkbox = React.forwardRef((p, ref) => React.createElement(DS().Checkbox, { ...p, ref }));
const Icon = React.forwardRef((p, ref) => React.createElement(DS().Icon, { ...p, ref }));
const IconButton = React.forwardRef((p, ref) => React.createElement(DS().IconButton, { ...p, ref }));
const Input = React.forwardRef((p, ref) => React.createElement(DS().Input, { ...p, ref }));
const Radio = React.forwardRef((p, ref) => React.createElement(DS().Radio, { ...p, ref }));
const Select = React.forwardRef((p, ref) => React.createElement(DS().Select, { ...p, ref }));
const Switch = React.forwardRef((p, ref) => React.createElement(DS().Switch, { ...p, ref }));
const Tag = React.forwardRef((p, ref) => React.createElement(DS().Tag, { ...p, ref }));

/* ===== Shell.jsx ===== */
/* Shared chrome and state primitives for the Void storefront kit.
   Icons are absent by design — assets/icons/void-icons.svg has not been supplied,
   so navigation and actions carry text labels only. See assets/icons/README.md. */

const PRODUCT = {
  designer: "Rahnuma Atelier",
  sku: "VD-KRT-0421",
  title: "Handloom cotton kurta",
  subtitle: "Unbleached, block-printed placket",
  price: 2450,
  compareAt: 3200,
  rating: 4.6,
  reviews: 128,
  sizes: [
    { label: "XS", stock: 4 },
    { label: "S", stock: 11 },
    { label: "M", stock: 6 },
    { label: "L", stock: 0 },
    { label: "XL", stock: 2 },
  ],
  specs: [
    ["Fabric", "100% handloom cotton"],
    ["Weight", "142 gsm"],
    ["Weave", "Plain, 60s warp"],
    ["Origin", "Tangail, Bangladesh"],
    ["Lead time", "7–10 days"],
    ["Care", "Cold wash, line dry"],
  ],
};

const CATALOGUE = [
  { designer: "Rahnuma Atelier", sku: "VD-KRT-0421", title: "Handloom cotton kurta", price: 2450, compareAt: 3200, badge: "sale", rating: 4.6, reviews: 128 },
  { designer: "Studio Nokshi", sku: "VD-SAR-1180", title: "Block-print wrap saree", price: 5900, rating: 4.8, reviews: 64, badge: "new" },
  { designer: "Void Studio", sku: "VD-JKT-0067", title: "Custom jamdani jacket", price: 8400, rating: 4.4, reviews: 19, badge: "low" },
  { designer: "Karigar Collective", sku: "VD-SHT-0902", title: "Overdyed poplin shirt", price: 3150, rating: 4.5, reviews: 91 },
  { designer: "Aranya", sku: "VD-DUP-0334", title: "Natural-dye dupatta", price: 1890, compareAt: 2400, badge: "sale", rating: 4.7, reviews: 203 },
  { designer: "Rahnuma Atelier", sku: "VD-TRS-0518", title: "Wide-leg khadi trouser", price: 3600, rating: 4.2, reviews: 47 },
  { designer: "Studio Nokshi", sku: "VD-BLS-0771", title: "Quilted nakshi blouse", price: 4250, rating: 4.9, reviews: 12, badge: "low" },
  { designer: "Void Studio", sku: "VD-SCF-0129", title: "Hand-loomed silk scarf", price: 2100, rating: 4.3, reviews: 58, badge: "out" },
];

const BADGE_TOKEN = {
  new: { label: "New in", bg: "var(--commerce-badge-new-bg)", fg: "var(--commerce-badge-new-text)", bd: "transparent" },
  sale: { label: "Sale", bg: "var(--commerce-badge-sale-bg)", fg: "var(--commerce-badge-sale-text)", bd: "var(--commerce-badge-sale-border)" },
  low: { label: "Low stock", bg: "var(--commerce-badge-lowstock-bg)", fg: "var(--commerce-badge-lowstock-text)", bd: "var(--commerce-badge-lowstock-border)" },
  out: { label: "Sold out", bg: "var(--commerce-badge-soldout-bg)", fg: "var(--commerce-badge-soldout-text)", bd: "var(--commerce-badge-soldout-border)" },
};

/* UI-GLOB-9 — money is rendered from locale data, never assembled from a symbol and a
   grouped string. VoidFormat (StorefrontExtra.jsx) owns the Intl calls; these two live
   at module scope because every screen in this file formats prices and none of them
   should have to thread the active market through its props to do it. StorefrontApp
   sets them from its own props on every render, before any child renders. */
let LOCALE = "en";
let MARKET = "bd";
const taka = (n) => (window.VoidFormat
  ? window.VoidFormat.money(Number(n), LOCALE, MARKET)
  : "৳" + Number(n).toLocaleString("en-BD", { maximumFractionDigits: 0 }));
const num = (n) => (window.VoidFormat ? window.VoidFormat.number(Number(n), LOCALE, MARKET) : String(n));

const eyebrow = {
  fontSize: "var(--text-2xs)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-widest)",
  color: "var(--fg-secondary)",
};

const monoMeta = { fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" };

function CommerceBadge({ kind }) {
  const t = BADGE_TOKEN[kind];
  if (!t) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 22, paddingInline: "var(--space-2)", background: t.bg, color: t.fg, border: "var(--border-width-thin) solid " + t.bd, fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", whiteSpace: "nowrap" }}>
      {t.label}
    </span>
  );
}

function Rating({ value, count, width = 64 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
      <span style={{ position: "relative", width, height: 3, background: "var(--commerce-rating-empty)", flex: "none" }}>
        <span style={{ position: "absolute", inset: "0 auto 0 0", width: (value / 5) * 100 + "%", background: "var(--commerce-rating)" }} />
      </span>
      <span style={{ fontSize: "var(--text-2xs)", color: "var(--fg-secondary)", fontVariantNumeric: "tabular-nums" }}>
        {value.toFixed(1)} · {count}
      </span>
    </div>
  );
}

function Plate({ ratio = "3 / 4", label, badge, children, style }) {
  return (
    <div style={{ position: "relative", aspectRatio: ratio, background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-media)", overflow: "hidden", ...style }}>
      {badge ? <div style={{ position: "absolute", insetBlockStart: "var(--space-3)", insetInlineStart: "var(--space-3)", zIndex: 1 }}><CommerceBadge kind={badge} /></div> : null}
      {label ? <span style={{ position: "absolute", insetBlockEnd: "var(--space-2)", insetInlineEnd: "var(--space-2)", ...monoMeta }}>{label}</span> : null}
      {children}
    </div>
  );
}

/* ---- state primitives ---- */

function Sk({ w = "100%", h = 12, mb = 0, radius = "var(--radius-sm)" }) {
  return <div className="vd-sk" style={{ width: w, height: h, marginBlockEnd: mb, borderRadius: radius }} />;
}

function SkPlate({ ratio = "3 / 4" }) {
  return <div className="vd-sk" style={{ aspectRatio: ratio, width: "100%", borderRadius: "var(--radius-media)" }} />;
}

function EmptyState({ title, body, action, narrow }) {
  return (
    <div role="status" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-4)", textAlign: "center", paddingBlock: narrow ? "var(--space-16)" : "var(--space-24)", paddingInline: "var(--space-6)", border: "var(--border-width-thin) dashed var(--border-default)" }}>
      <div style={{ font: "var(--type-h3)" }}>{title}</div>
      {body ? <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)", maxWidth: "42ch" }}>{body}</p> : null}
      {action}
    </div>
  );
}

function ErrorState({ title, body, detail, onRetry, narrow }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", paddingBlock: narrow ? "var(--space-10)" : "var(--space-16)", paddingInline: narrow ? "var(--space-5)" : "var(--space-10)", background: "var(--error-bg)", border: "var(--border-width-thin) solid var(--error-border)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ ...eyebrow, color: "var(--error-text)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}><Icon name="triangle-alert" size={13} />Error</div>
      <div style={{ font: "var(--type-h3)", color: "var(--error-text)" }}>{title}</div>
      <p style={{ font: "var(--type-body)", color: "var(--fg-primary)", maxWidth: "56ch" }}>{body}</p>
      {detail ? <p style={{ ...monoMeta, color: "var(--fg-secondary)" }}>{detail}</p> : null}
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginBlockStart: "var(--space-1)" }}>
        <Button variant="primary" onClick={onRetry}>Try again</Button>
        <Button variant="outline" as="a" href="#">Contact support</Button>
      </div>
    </div>
  );
}

/* ---- page chrome ---- */

const NAV = ["New in", "Women", "Men", "Void Studio", "Designers"];

/* UI-HOME-4. Dismissal is held in sessionStorage, not localStorage: the requirement is
   "persisting for the session", and a permanently dismissed bar cannot be re-shown when
   the message changes. */
function Announcement({ narrow }) {
  const KEY = "void.announcement.dismissed";
  const [shown, setShown] = React.useState(() => {
    try { return sessionStorage.getItem(KEY) !== "1"; } catch (e) { return true; }
  });
  if (!shown) return null;
  return (
    <div style={{ ...eyebrow, display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", paddingBlock: "var(--space-2)", paddingInline: "var(--space-10)", position: "relative", background: "var(--bg-surface-sunken)", color: "var(--fg-secondary)" }}>
      <span>Free delivery over ৳3,000</span>
      {narrow ? null : <><span aria-hidden="true">·</span><span>Ships to 14 districts next-day</span></>}
      <button type="button" aria-label="Dismiss announcement"
        onClick={() => { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} setShown(false); }}
        style={{ position: "absolute", insetBlockStart: "50%", insetInlineEnd: "var(--space-3)", transform: "translateY(-50%)", display: "grid", placeItems: "center", width: 24, height: 24, padding: 0, background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}>
        <Icon name="x" size={13} />
      </button>
    </div>
  );
}

const MARKET_LABEL = { bd: "BD", in: "IN", ae: "AE", uk: "UK" };
const MARKET_SYMBOL = { bd: "৳", in: "₹", ae: "AED", uk: "£" };
const LOCALE_LABEL = { en: "EN", bn: "বাং" };

function Header({ narrow, bag = 2, wishlist = 3, locale = "en", market = "bd" }) {
  /* UI-GLOB-5 / UI-GLOB-10 — market, currency and language are one control, because
     changing any one of them changes the other two, and the active market is legible
     at every width. At 320 it loses the chevron and the globe, not the value: a shared
     link must never be read against the wrong market's terms. */
  const scope = MARKET_LABEL[market] + " · " + MARKET_SYMBOL[market] + " · " + LOCALE_LABEL[locale];
  return (
    <header style={{ position: "sticky", insetBlockStart: 0, zIndex: "var(--z-sticky)", background: "var(--bg-canvas)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      <Announcement narrow={narrow} />
      <div style={{ display: "flex", alignItems: "center", gap: narrow ? "var(--space-3)" : "var(--space-8)", height: "var(--topbar-height)", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", maxWidth: "var(--layout-max-content)", marginInline: "auto" }}>
        {narrow ? <IconButton variant="ghost" icon={<Icon name="menu" size={17} />} label="Menu" /> : null}
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>Void</span>
        {narrow ? null : (
          <nav style={{ display: "flex", gap: "var(--space-6)", flex: 1 }}>
            {NAV.map((n) => <a key={n} href="#" style={{ ...eyebrow, color: "var(--fg-primary)", textDecoration: "none", whiteSpace: "nowrap" }}>{n}</a>)}
          </nav>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginInlineStart: narrow ? "auto" : 0 }}>
          {narrow ? null : <Button variant="ghost" size="sm" iconLeft={<Icon name="search" size={15} />}>Search</Button>}
          <Button variant="ghost" size="sm" iconLeft={narrow ? null : <Icon name="globe" size={15} />} iconRight={narrow ? null : <Icon name="chevron-down" size={13} />} aria-label={"Market, currency and language — " + scope}>{scope}</Button>
          {narrow ? null : (
            <span style={{ position: "relative", display: "flex" }}>
              <IconButton variant="ghost" size="sm" icon={<Icon name="heart" size={16} />} label={"Wishlist — " + wishlist + " items"} />
              {wishlist ? <span aria-hidden="true" style={{ position: "absolute", insetBlockStart: 2, insetInlineEnd: 2, minWidth: 14, height: 14, paddingInline: 3, borderRadius: "var(--radius-full)", background: "var(--accent-fill)", color: "var(--accent-on-fill)", fontFamily: "var(--font-mono)", fontSize: 9, lineHeight: "14px", textAlign: "center" }}>{wishlist}</span> : null}
            </span>
          )}
          {narrow ? null : <IconButton variant="ghost" size="sm" icon={<Icon name="user" size={16} />} label="Account" />}
          <Button variant="outline" size="sm" iconLeft={<Icon name="shopping-bag" size={15} />}>Bag ({bag})</Button>
        </div>
      </div>
    </header>
  );
}

function Footer({ narrow }) {
  const cols = [
    ["Shop", ["New in", "Women", "Men", "Designers", "Gift cards"]],
    ["Help", ["Delivery", "Returns", "Size guide", "Track order", "Contact"]],
    ["Void", ["About", "Sell on Void", "Void Studio", "Careers"]],
  ];
  return (
    <footer style={{ borderBlockStart: "var(--border-width-thin) solid var(--border-default)", marginBlockStart: narrow ? "var(--space-12)" : "var(--space-24)" }}>
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: "var(--space-8)", maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlock: narrow ? "var(--space-10)" : "var(--space-16)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", gridColumn: narrow ? "1 / -1" : "auto" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>Void</span>
          <p style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)", maxWidth: "34ch" }}>Cross-border fashion and lifestyle, made in Bangladesh.</p>
        </div>
        {cols.map(([h, items]) => (
          <div key={h} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={eyebrow}>{h}</div>
            {items.map((i) => <a key={i} href="#" style={{ font: "var(--type-ui-dense)" }}>{i}</a>)}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap", maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlock: "var(--space-5)", borderBlockStart: "var(--border-width-thin) solid var(--border-subtle)", ...monoMeta }}>
        <span>© 2026 Void Commerce Ltd · Dhaka</span>
        <span>BDT ৳ · EN</span>
      </div>
    </footer>
  );
}

function Breadcrumb({ items }) {
  return (
    <nav style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", ...eyebrow }}>
      {items.map((it, i) => (
        <React.Fragment key={it}>
          {i ? <span aria-hidden="true">/</span> : null}
          {i === items.length - 1 ? <span style={{ color: "var(--fg-primary)" }}>{it}</span> : <a href="#" style={{ color: "var(--fg-secondary)", textDecoration: "none", whiteSpace: "nowrap" }}>{it}</a>}
        </React.Fragment>
      ))}
    </nav>
  );
}

function Trust({ items }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {items.map((t) => (
        <li key={t} style={{ display: "flex", gap: "var(--space-3)", alignItems: "baseline", font: "var(--type-ui-dense)" }}>
          <span aria-hidden="true" style={{ color: "var(--commerce-trust)", fontWeight: "var(--weight-medium)" }}>✓</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Page({ narrow, children }) {
  return (
    <div style={{ maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlock: narrow ? "var(--space-6)" : "var(--space-10)" }}>
      {children}
    </div>
  );
}

/* ===== ProductDetail.jsx ===== */
function ProductDetail({ state = "populated", narrow, onRetry }) {
  const [size, setSize] = React.useState("M");
  const [tab, setTab] = React.useState("details");
  const p = PRODUCT;

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
            <Button size="lg" variant="outline" block={narrow} iconLeft={<Icon name="heart" size={17} />}>Save</Button>
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

/* ===== ProductListing.jsx ===== */
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
  const items = CATALOGUE;
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
      {/* At 320 the two controls stack: side by side, the block-width Filters button
          consumed the row and left the sort select at zero width. */}
      <div style={{ display: "flex", flexDirection: narrow ? "column" : "row", gap: "var(--space-3)", alignItems: narrow ? "stretch" : "center" }}>
        {narrow ? <Button variant="outline" block onClick={() => setSheet(true)} iconLeft={<Icon name="sliders-horizontal" size={16} />}>Filters (2)</Button> : null}
        <Select size="sm" options={["Newest", "Price: low to high", "Price: high to low", "Best rated"]} style={{ minWidth: narrow ? 0 : 190, flex: narrow ? "1 1 auto" : "none", width: narrow ? "100%" : undefined }} />
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
          <Button variant="outline" block={narrow} iconRight={<Icon name="chevron-down" size={16} />}>Load more</Button>
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
              <IconButton variant="ghost" icon={<Icon name="x" size={17} />} label="Close filters" onClick={() => setSheet(false)} />
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

/* ===== Checkout.jsx ===== */
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
              <Button size="lg" variant="outline" iconLeft={<Icon name="arrow-left" size={17} />}>Back to delivery</Button>
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

/* ===== Account.jsx ===== */
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
    <div className="vd-scroll-x" style={{ display: "flex", gap: narrow ? "var(--space-4)" : "var(--space-6)", overflowX: "auto", overflowY: "hidden", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
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

/* ===== Homepage.jsx ===== */
const HERO = {
  eyebrow: "Monsoon 2026",
  headline: "Handloom, cut for the city",
  body: "Twenty-two pieces from six Dhaka ateliers. Woven, dyed and finished within 40 km of where the cotton was spun.",
  cta: "See the collection",
};

const NEW_IN = [
  ["Handloom cotton kurta", "Rahnuma Atelier", 2450, 3200, "sale", 4.6, 128],
  ["Jamdani-panel shirt", "Studio Anjum", 5800, null, null, 4.8, 41],
  ["Khadi overshirt", "Neel Workshop", 4120, null, "new", 4.4, 17],
  ["Block-print wide trouser", "Rahnuma Atelier", 3300, null, null, 4.5, 63],
];

const TRENDING = [
  ["Indigo wrap dress", "Neel Workshop", 6400, 4.7, 88],
  ["Muslin scarf", "Tangail Weavers", 1250, 4.9, 210],
  ["Nakshi kantha jacket", "Studio Anjum", 9800, 4.8, 34],
  ["Cotton kurta — short", "Rahnuma Atelier", 2100, 4.3, 156],
  ["Handwoven gamcha set", "Tangail Weavers", 890, 4.6, 302],
  ["Linen-blend sari", "Studio Anjum", 7400, 4.7, 51],
];

const COLLECTIONS = [
  ["Woven in Tangail", "14 pieces", "3 / 4"],
  ["The white shirt, six ways", "6 pieces", "3 / 4"],
  ["Made for 34°C", "22 pieces", "3 / 4"],
];

const RECENT = [
  ["Handloom cotton kurta", 2450],
  ["Muslin scarf", 1250],
  ["Khadi overshirt", 4120],
  ["Indigo wrap dress", 6400],
];

function HomeTile({ name, house, price, was, badge, rating, count, ratio = "3 / 4" }) {
  return (
    <a href="#" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
      <Plate ratio={ratio} badge={badge} />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <span style={{ ...monoMeta, textTransform: "uppercase" }}>{house}</span>
        <span style={{ font: "var(--type-ui)", textWrap: "pretty" }}>{name}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
          <span style={{ font: "var(--type-ui)", fontWeight: "var(--weight-medium)", color: was ? "var(--accent-text)" : "var(--fg-primary)" }}>{taka(price)}</span>
          {was ? <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", textDecoration: "line-through" }}>{taka(was)}</span> : null}
        </div>
        {rating ? <Rating value={rating} count={count} width={52} /> : null}
      </div>
    </a>
  );
}

function ModuleHead({ title, meta, href = "#", cta = "See all", arrow = true }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", marginBlockEnd: "var(--space-5)", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "1 1 auto", minWidth: 0 }}>
        {meta ? <span style={eyebrow}>{meta}</span> : null}
        <h2 style={{ font: "var(--type-h2)", margin: 0, textWrap: "balance" }}>{title}</h2>
      </div>
      <a href={href} style={{ font: "var(--type-ui-dense)", display: "flex", alignItems: "center", gap: "var(--space-2)", whiteSpace: "nowrap", flex: "none" }}>
        {cta}{arrow ? <Icon name="arrow-right" size={15} /> : null}
      </a>
    </div>
  );
}

function Band({ children, narrow, style }) {
  return (
    <section style={{ maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", marginBlockStart: narrow ? "var(--space-12)" : "var(--space-20)", ...style }}>
      {children}
    </section>
  );
}

/* UI-HOME-1. The hero reserves its box with aspect-ratio and renders a poster frame, so
   the LCP element is a still image and never the video — swapping in motion later cannot
   shift the layout or delay the paint. */
function Hero({ narrow }) {
  return (
    <section style={{ maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlockStart: narrow ? "var(--space-6)" : "var(--space-8)" }}>
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr", alignItems: "end", aspectRatio: narrow ? "4 / 5" : "16 / 7", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-media)", overflow: "hidden" }}>
        <span aria-hidden="true" style={{ position: "absolute", insetBlockEnd: "var(--space-3)", insetInlineEnd: "var(--space-3)", ...monoMeta }}>poster frame · 2400 × 1050</span>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: narrow ? "var(--space-3)" : "var(--space-4)", maxWidth: narrow ? "none" : "52ch", padding: narrow ? "var(--space-5)" : "var(--space-10)" }}>
          <span style={eyebrow}>{HERO.eyebrow}</span>
          <h1 style={{ font: narrow ? "var(--type-h1)" : "var(--type-display)", margin: 0, textWrap: "balance" }}>{HERO.headline}</h1>
          <p style={{ font: "var(--type-ui)", color: "var(--fg-secondary)", margin: 0, maxWidth: "46ch", textWrap: "pretty" }}>{HERO.body}</p>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", paddingBlockStart: "var(--space-2)" }}>
            <Button size="lg" style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)" }}>{HERO.cta}</Button>
            <Button size="lg" variant="outline">Watch the film</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* UI-HOME-5. A scroll-snap strip, driven by buttons rather than drag alone: the arrows
   are real controls, the strip is a labelled region, and the position is announced. */
function Carousel({ items, narrow }) {
  const ref = React.useRef(null);
  const [at, setAt] = React.useState(0);
  const step = () => {
    const el = ref.current;
    return el ? el.clientWidth * 0.8 : 0;
  };
  const nudge = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * step(), behavior: "smooth" });
  };
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const per = el.scrollWidth / items.length;
    setAt(Math.min(items.length - 1, Math.round(el.scrollLeft / per)));
  };
  return (
    <div role="region" aria-roledescription="carousel" aria-label="Trending now">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-4)", marginBlockEnd: "var(--space-5)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "1 1 auto", minWidth: 0 }}>
          <span style={eyebrow}>Last 48 hours</span>
          <h2 style={{ font: "var(--type-h2)", margin: 0, whiteSpace: "nowrap" }}>Trending now</h2>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", flex: "none" }}>
          <IconButton variant="outline" icon={<Icon name="chevron-left" size={16} />} label="Previous items" onClick={() => nudge(-1)} />
          <IconButton variant="outline" icon={<Icon name="chevron-right" size={16} />} label="Next items" onClick={() => nudge(1)} />
        </div>
      </div>
      <ul ref={ref} onScroll={onScroll} className="vd-snap-x" tabIndex={0} aria-label="Trending items"
        style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: narrow ? "72%" : "23%", gap: "var(--space-5)", listStyle: "none", margin: 0, padding: 0, overflowX: "auto", overflowY: "hidden", scrollSnapType: "x mandatory" }}>
        {items.map(([name, house, price, rating, count]) => (
          <li key={name} style={{ scrollSnapAlign: "start" }}>
            <HomeTile name={name} house={house} price={price} rating={rating} count={count} />
          </li>
        ))}
      </ul>
      <p aria-live="polite" style={{ ...monoMeta, margin: 0, marginBlockStart: "var(--space-3)" }}>Item {at + 1} of {items.length}</p>
    </div>
  );
}

function StudioCta({ narrow }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.1fr 1fr", gap: narrow ? "var(--space-6)" : "var(--space-10)", alignItems: "center", padding: narrow ? "var(--space-6)" : "var(--space-10)", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-media)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <span style={eyebrow}>Void Studio</span>
        <h2 style={{ font: "var(--type-h2)", margin: 0, textWrap: "balance" }}>Print your own, on the same cloth</h2>
        <p style={{ font: "var(--type-ui)", color: "var(--fg-secondary)", margin: 0, maxWidth: "44ch", textWrap: "pretty" }}>
          Put artwork or Bengali type on any garment we stock. The Studio tells you what will and will not print before you order, and quotes the finished price as you work.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Button size="lg" iconLeft={<Icon name="pencil" size={16} />}>Open the Studio</Button>
          <Button size="lg" variant="outline">How printing works</Button>
        </div>
      </div>
      <Plate ratio={narrow ? "4 / 3" : "1 / 1"} label="studio preview" />
    </div>
  );
}

function Spotlight({ narrow }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "auto 1fr", gap: narrow ? "var(--space-6)" : "var(--space-10)", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: narrow ? "auto" : 280 }}>
        <Plate ratio="1 / 1" style={{ borderRadius: "var(--radius-full)", width: narrow ? 140 : 200 }} />
        <span style={eyebrow}>Designer spotlight</span>
        <h2 style={{ font: "var(--type-h3)", margin: 0 }}>Rahnuma Atelier</h2>
        <p style={{ font: "var(--type-ui-dense)", color: "var(--fg-secondary)", margin: 0, textWrap: "pretty" }}>
          Nine weavers in Narayanganj. Rahnuma buys yarn direct from the spinners and dyes in batches of forty, so no two runs match exactly.
        </p>
        <a href="#" style={{ font: "var(--type-ui-dense)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>All 34 pieces<Icon name="arrow-right" size={15} /></a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(3, 1fr)", gap: "var(--space-5)" }}>
        {NEW_IN.slice(0, narrow ? 2 : 3).map(([name, house, price, was, badge, rating, count]) => (
          <HomeTile key={name} name={name} house={house} price={price} was={was} badge={badge} rating={rating} count={count} />
        ))}
      </div>
    </div>
  );
}

function Homepage({ state = "populated", narrow, onRetry, returning = true }) {
  if (state === "error") {
    return (
      <ErrorState narrow={narrow}
        title="We could not load the homepage"
        body="The content service is not responding. Browsing by category still works — the navigation above is unaffected."
        detail="cms/home?market=bd · request 5c8e02 · 503"
        onRetry={onRetry} />
    );
  }
  if (state === "loading") {
    return (
      <div style={{ maxWidth: "var(--layout-max-content)", marginInline: "auto", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", paddingBlockStart: narrow ? "var(--space-6)" : "var(--space-8)", display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        <div className="vd-sk" style={{ aspectRatio: narrow ? "4 / 5" : "16 / 7", borderRadius: "var(--radius-media)" }} />
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(4, 1fr)", gap: "var(--space-5)" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div className="vd-sk" style={{ aspectRatio: "3 / 4", borderRadius: "var(--radius-media)" }} />
              <div className="vd-sk" style={{ height: 12, width: "60%" }} />
              <div className="vd-sk" style={{ height: 12, width: "40%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (state === "empty") {
    return (
      <EmptyState narrow={narrow}
        title="Nothing is scheduled for this market yet"
        body="No homepage modules are live for Bangladesh right now. Categories and search are unaffected, and the editorial team can publish without a deploy."
        action={<div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}><Button>Browse new in</Button><Button variant="outline">All designers</Button></div>} />
    );
  }

  return (
    <div>
      <Hero narrow={narrow} />

      <Band narrow={narrow}>
        <ModuleHead title="New arrivals" meta="This week" />
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(4, 1fr)", gap: "var(--space-5)" }}>
          {NEW_IN.map(([name, house, price, was, badge, rating, count]) => (
            <HomeTile key={name} name={name} house={house} price={price} was={was} badge={badge} rating={rating} count={count} />
          ))}
        </div>
      </Band>

      <Band narrow={narrow}><Carousel items={TRENDING} narrow={narrow} /></Band>

      <Band narrow={narrow}>
        <ModuleHead title="Featured collections" cta="All collections" />
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(3, 1fr)", gap: "var(--space-5)" }}>
          {COLLECTIONS.map(([title, meta, ratio]) => (
            <a key={title} href="#" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", textDecoration: "none", color: "inherit" }}>
              <Plate ratio={narrow ? "16 / 9" : ratio} />
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <span style={{ font: "var(--type-h3)" }}>{title}</span>
                <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{meta}</span>
              </div>
            </a>
          ))}
        </div>
      </Band>

      <Band narrow={narrow}><StudioCta narrow={narrow} /></Band>
      <Band narrow={narrow}><Spotlight narrow={narrow} /></Band>

      {/* UI-HOME-6: only for a returning visitor — there is nothing honest to show otherwise. */}
      {returning ? (
        <Band narrow={narrow}>
          <ModuleHead title="Recently viewed" cta="Clear" arrow={false} />
          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(4, 1fr)", gap: "var(--space-5)" }}>
            {RECENT.map(([name, price]) => (
              <a key={name} href="#" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-md)", textDecoration: "none", color: "inherit" }}>
                <Plate ratio="1 / 1" style={{ width: 48, flex: "none", borderRadius: "var(--radius-sm)" }} />
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ font: "var(--type-ui-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                  <span style={{ ...monoMeta }}>{taka(price)}</span>
                </span>
              </a>
            ))}
          </div>
        </Band>
      ) : null}
    </div>
  );
}

/* ===== OrderFlow.jsx ===== */
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

/* ===== harness ===== */

/* StorefrontExtra.jsx registers the help centre and the two branded error pages on
   window.VoidStorefrontExtra. It is mounted by the same DC, so it may still be loading
   on the first frame — resolve it at render time, never at module evaluation. */
const extra = (key) => (window.VoidStorefrontExtra || {})[key] || (() => null);

const SCREENS = {
  home: ["Homepage", Homepage],
  detail: ["Product detail", ProductDetail],
  listing: ["Listing + filters", ProductListing],
  cart: ["Bag", Cart],
  checkout: ["Checkout", Checkout],
  confirm: ["Confirmation", Confirmation],
  order: ["Order detail", OrderDetail],
  account: ["Account", Account],
  help: ["Help centre", (p) => React.createElement(extra("help"), p)],
  notfound: ["404", (p) => React.createElement(extra("notfound"), p)],
  servererror: ["500", (p) => React.createElement(extra("servererror"), p)],
};
const STATES = ["populated", "loading", "empty", "error"];
/* The two error pages and the 404 have one state each — an error page with a loading
   skeleton is a contradiction — so the state control is hidden on them rather than
   offering four buttons that do nothing. */
const STATEFUL = new Set(["home", "detail", "listing", "cart", "checkout", "confirm", "order", "account", "help"]);

function Group({ legend, value, options, onChange }) {
  return (
    <fieldset><legend>{legend}</legend>
      {options.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </fieldset>
  );
}

function StorefrontApp({ screen = "home", state = "populated", scheme = "light", width = "1440", locale = "en", market = "bd", chrome = true }) {
  const dsReady = useDesignSystemReady();
  const [s, setS] = React.useState({ screen, state, scheme, width, locale, market });
  React.useEffect(() => { setS({ screen, state, scheme, width, locale, market }); }, [screen, state, scheme, width, locale, market]);
  const set = (k) => (v) => setS((p) => ({ ...p, [k]: v }));
  const [nonce, setNonce] = React.useState(0);

  /* Set before any child renders, so the first paint formats in the active locale. */
  LOCALE = s.locale;
  MARKET = s.market;

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", s.scheme === "dark");
  }, [s.scheme]);

  /* :lang(bn) is what swaps the Bengali face and raises the leading, so the attribute
     goes on the document element as well as the frame — the harness must exercise the
     same selector the product will (UI-SRC-8, UI-INV-5). */
  React.useEffect(() => {
    document.documentElement.setAttribute("lang", s.locale);
  }, [s.locale]);

  const [, Screen] = SCREENS[s.screen] || SCREENS.detail;
  const narrow = s.width === "320";

  if (!dsReady) return <div style={{ minHeight: "100vh" }} />;

  return (
    <>
      {chrome ? (
        <div className="vd-bar">
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", fontSize: "var(--text-sm)" }}>Void</span>
          <Group legend="Screen" value={s.screen} onChange={set("screen")} options={Object.entries(SCREENS).map(([k, v]) => [k, v[0]])} />
          {STATEFUL.has(s.screen) ? <Group legend="State" value={s.state} onChange={set("state")} options={STATES.map((v) => [v, v[0].toUpperCase() + v.slice(1)])} /> : null}
          <Group legend="Scheme" value={s.scheme} onChange={set("scheme")} options={[["light", "Light"], ["dark", "Dark"]]} />
          <Group legend="Width" value={s.width} onChange={set("width")} options={[["1440", "1440"], ["320", "320"]]} />
          <Group legend="Locale" value={s.locale} onChange={set("locale")} options={[["en", "EN"], ["bn", "বাংলা"]]} />
          <Group legend="Market" value={s.market} onChange={set("market")} options={[["bd", "BD"], ["in", "IN"], ["ae", "AE"], ["uk", "UK"]]} />
          {s.locale === "bn" ? (
            /* The bn axis exercises the type stack, the leading and the number system —
               not a translation. Saying so here is cheaper than someone reviewing this
               screen and reporting the English copy as a bug. */
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--warning-text)", background: "var(--warning-bg)", border: "var(--border-width-thin) solid var(--warning-border)", padding: "2px var(--space-2)" }}>bn — type stack and numerals only; copy untranslated</span>
          ) : null}
        </div>
      ) : null}
      <div className="vd-frame" data-w={s.width} lang={s.locale}>
        <Header narrow={narrow} locale={s.locale} market={s.market} />
        <main key={nonce + s.screen + s.state + s.width + s.locale + s.market}>
          <Screen state={s.state} narrow={narrow} locale={s.locale} market={s.market} onRetry={() => { setS((p) => ({ ...p, state: "populated" })); setNonce((n) => n + 1); }} />
        </main>
        <Footer narrow={narrow} />
      </div>
    </>
  );
}

Object.assign(window, { StorefrontApp });
