const { Button, Badge } = window.VoidDesignSystem_980885;

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

const taka = (n) => "৳" + Number(n).toLocaleString("en-US");

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
      <div style={{ ...eyebrow, color: "var(--error-text)" }}>Error</div>
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

function Header({ narrow, bag = 2 }) {
  return (
    <header style={{ position: "sticky", insetBlockStart: 0, zIndex: "var(--z-sticky)", background: "var(--bg-canvas)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      <div style={{ ...eyebrow, display: "flex", justifyContent: "center", gap: "var(--space-2)", paddingBlock: "var(--space-2)", background: "var(--bg-surface-sunken)", color: "var(--fg-secondary)" }}>
        <span>Free delivery over ৳3,000</span>
        {narrow ? null : <><span aria-hidden="true">·</span><span>Ships to 14 districts next-day</span></>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: narrow ? "var(--space-3)" : "var(--space-8)", height: "var(--topbar-height)", paddingInline: narrow ? "var(--space-4)" : "var(--space-6)", maxWidth: "var(--layout-max-content)", marginInline: "auto" }}>
        {narrow ? <Button variant="ghost" size="sm" aria-label="Menu">Menu</Button> : null}
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: "var(--weight-medium)", fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>Void</span>
        {narrow ? null : (
          <nav style={{ display: "flex", gap: "var(--space-6)", flex: 1 }}>
            {NAV.map((n) => <a key={n} href="#" style={{ ...eyebrow, color: "var(--fg-primary)", textDecoration: "none", whiteSpace: "nowrap" }}>{n}</a>)}
          </nav>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginInlineStart: narrow ? "auto" : 0 }}>
          {narrow ? null : <Button variant="ghost" size="sm">Search</Button>}
          {narrow ? null : <Button variant="ghost" size="sm">EN / বাংলা</Button>}
          {narrow ? null : <Button variant="ghost" size="sm">Account</Button>}
          <Button variant="outline" size="sm">Bag ({bag})</Button>
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

Object.assign(window, { PRODUCT, CATALOGUE, BADGE_TOKEN, taka, eyebrow, monoMeta, CommerceBadge, Rating, Plate, Sk, SkPlate, EmptyState, ErrorState, Header, Footer, Breadcrumb, Trust, Page });
