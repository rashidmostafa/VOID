/* Homepage — UI-HOME-1..7. Sits on the same Header/Footer chrome as the rest of the
   storefront; the modules below the hero are the CMS-driven, per-market reorderable set
   of UI-HOME-7, so each one is a self-contained component with no positional assumptions.

   Helpers (Plate, Rating, CommerceBadge, eyebrow, monoMeta, taka) come from Shell.jsx. */

const { Button, Icon, IconButton } = window.VoidDesignSystem_980885;

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
