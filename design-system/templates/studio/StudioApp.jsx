/* Void Studio — the garment design surface. UI-STU-1..10.

   Two things drive the layout and are worth stating, because they are the reason this
   screen does not look like the rest of the system:

   1. UI-STU-10. The canvas surround is a fixed neutral grey that does NOT follow the
      colour scheme. A customer judges their artwork's colours against it, so a dark or
      tinted surround would misrepresent them. Every other region here is themed; the
      surround is deliberately not, and the tokens it uses are the --studio-* set that
      exist for exactly this exemption.
   2. UI-STU-1. No storefront chrome. The Studio owns the whole viewport: the site
      header, footer and breadcrumb are all absent by requirement, so leaving is an
      explicit action in the top bar rather than a navigation affordance.

   Design-system components resolve at render time, so this file does not care whether
   _ds_bundle.js has finished loading when it is parsed. */

const DS = () => window.VoidDesignSystem_980885 || {};

const Badge = React.forwardRef((p, ref) => React.createElement(DS().Badge, { ...p, ref }));
const Button = React.forwardRef((p, ref) => React.createElement(DS().Button, { ...p, ref }));
const Icon = React.forwardRef((p, ref) => React.createElement(DS().Icon, { ...p, ref }));
const IconButton = React.forwardRef((p, ref) => React.createElement(DS().IconButton, { ...p, ref }));
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

/* The surround and its furniture. Neutral by requirement, so these are literals rather
   than theme tokens — a themed value here would defeat UI-STU-10. */
const SURROUND = "#9a9a97";
const SURROUND_RULE = "#00000022";

const eyebrow = { font: "var(--type-label)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--fg-secondary)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" };
const taka = (n) => "৳" + n.toLocaleString("en-IN");

const TOOLS = [
  ["select", "Select", "flip-horizontal"],
  ["text", "Text", "pencil"],
  ["art", "Upload artwork", "zoom-in"],
  ["shape", "Shape", "grid-2x2"],
  ["colour", "Garment colour", "shirt"],
];

const GARMENTS = [
  { value: "tee", label: "Cotton tee — 180gsm" },
  { value: "kurta", label: "Handloom kurta" },
  { value: "hoodie", label: "Fleece hoodie" },
];

/* UI-STU-9: each warning names the element it is about, not just the document. */
const WARNINGS = [
  { id: "w1", el: "monogram.png", sev: "error", icon: "triangle-alert", title: "Artwork is below print resolution", body: "1,240 × 820 px at this size is 148 dpi. Print needs 300 dpi — scale it to 61% or supply a larger file." },
  { id: "w2", el: "Text — “রঙে রঙে”", sev: "warning", icon: "circle-alert", title: "Text crosses the safe area", body: "The descender sits 3 mm inside the seam allowance. Anything past the dashed line may be cut or stitched over." },
  { id: "w3", el: "Accent block", sev: "warning", icon: "circle-alert", title: "Colour is outside the print gamut", body: "This orange prints about 6% duller on cotton. The nearest printable colour is shown in the swatch." },
];

const SEV = {
  error: { fg: "var(--error-text)", bg: "var(--error-bg, var(--bg-surface-sunken))", bd: "var(--error-border, var(--border-default))" },
  warning: { fg: "var(--warning-text, var(--fg-primary))", bg: "var(--warning-bg, var(--bg-surface-sunken))", bd: "var(--warning-border, var(--border-default))" },
};

/* ---------- top bar ---------- */

function TopBar({ zoom, onZoom, saved, onlineState, price, onOrder, narrow }) {
  const online = onlineState === "online";
  return (
    <header style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: "none", minHeight: "var(--topbar-height)", paddingInline: narrow ? "var(--space-3)" : "var(--space-4)", background: "var(--bg-surface)", borderBlockEnd: "var(--border-width-thin) solid var(--border-strong)" }}>
      <IconButton variant="ghost" size="sm" icon={<Icon name="arrow-left" size={16} />} label="Leave the Studio" />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Monsoon monogram</span>
        {/* UI-STU-7: save state, autosave time and connection are always on screen. */}
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", font: "var(--type-ui-sm)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)" }}>
          <Icon name={online ? "circle-check" : "circle-alert"} size={11} />
          <span style={{ whiteSpace: "nowrap" }}>{online ? saved : "Offline — edits held locally"}</span>
        </span>
      </div>
      {narrow ? null : (
        <>
          <span aria-hidden="true" style={{ width: 1, alignSelf: "stretch", marginInline: "var(--space-2)", marginBlock: "var(--space-3)", background: "var(--border-default)" }} />
          <div style={{ display: "flex", gap: "var(--space-1)" }}>
            <IconButton variant="ghost" size="sm" icon={<Icon name="rotate-ccw" size={16} />} label="Undo" />
            <IconButton variant="ghost" size="sm" icon={<Icon name="rotate-ccw" size={16} style={{ transform: "scaleX(-1)" }} />} label="Redo" disabled />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginInlineStart: "var(--space-2)" }}>
            <IconButton variant="ghost" size="sm" icon={<Icon name="minus" size={16} />} label="Zoom out" onClick={() => onZoom(-10)} />
            <span style={{ ...mono, minWidth: 48, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{zoom}%</span>
            <IconButton variant="ghost" size="sm" icon={<Icon name="plus" size={16} />} label="Zoom in" onClick={() => onZoom(10)} />
          </div>
        </>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginInlineStart: "auto" }}>
        {narrow ? null : <Button variant="ghost" size="sm" iconLeft={<Icon name="circle-help" size={15} />}>Help</Button>}
        {narrow ? null : <Button variant="outline" size="sm" iconLeft={<Icon name="download" size={15} />}>Export</Button>}
        {/* UI-STU-5: the order control never leaves the viewport, and carries the live price. */}
        <Button size="sm" onClick={onOrder} style={{ background: "var(--action-accent-bg)", color: "var(--action-accent-text)", borderColor: "var(--action-accent-bg)", whiteSpace: "nowrap" }}>
          {narrow ? taka(price) : "Order this design · " + taka(price)}
        </Button>
      </div>
    </header>
  );
}

/* ---------- tool rail ---------- */

function ToolRail({ tool, onTool }) {
  return (
    <div role="toolbar" aria-orientation="vertical" aria-label="Studio tools" style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: "none", padding: "var(--space-2)", background: "var(--bg-surface)", borderInlineEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      {/* UI-STU-3: icon-first, label on hover, accessible name always present. */}
      {TOOLS.map(([id, label, icon]) => (
        <IconButton key={id} icon={<Icon name={icon} size={18} />} label={label} title={label} active={tool === id} variant={tool === id ? "solid" : "ghost"} onClick={() => onTool(id)} />
      ))}
      <span aria-hidden="true" style={{ height: 1, margin: "var(--space-2) var(--space-1)", background: "var(--border-default)" }} />
      <IconButton icon={<Icon name="copy" size={18} />} label="Duplicate selection" title="Duplicate selection" variant="ghost" />
      <IconButton icon={<Icon name="trash-2" size={18} />} label="Delete selection" title="Delete selection" variant="ghost" />
    </div>
  );
}

/* ---------- canvas ---------- */

function Canvas({ zoom, colour, warnOpen, onWarn }) {
  const w = 300 * (zoom / 100), h = 380 * (zoom / 100);
  return (
    <div style={{ flex: 1, minWidth: 0, display: "grid", placeItems: "center", padding: "var(--space-6)", background: SURROUND, backgroundImage: `linear-gradient(${SURROUND_RULE} 1px, transparent 1px), linear-gradient(90deg, ${SURROUND_RULE} 1px, transparent 1px)`, backgroundSize: "24px 24px", overflow: "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
        {/* UI-STU-4: the garment preview is the canvas, not a panel beside it. */}
        <div style={{ position: "relative", width: w, height: h, background: colour, boxShadow: "0 1px 2px #0003, 0 8px 24px #0000001f" }}>
          <span aria-hidden="true" style={{ position: "absolute", inset: "12% 18%", border: "1px dashed #ffffff8c" }} />
          <span style={{ position: "absolute", insetBlockStart: 0, insetInlineStart: "18%", transform: "translateY(-100%)", paddingBlockEnd: 5, ...mono, fontSize: 10, color: "#ffffffe0", whiteSpace: "nowrap" }}>Safe area · 210 × 280 mm</span>

          {/* selected artwork, with its print warning attached to the element (UI-STU-9) */}
          <div style={{ position: "absolute", insetBlockStart: "26%", insetInlineStart: "31%", width: "38%", aspectRatio: "3 / 2", background: "#ffffff26", outline: "1.5px solid var(--indicator-active)", outlineOffset: 1 }}>
            {["-4px -4px auto auto", "-4px auto auto -4px", "auto -4px -4px auto", "auto auto -4px -4px"].map((inset, i) => (
              <span key={i} aria-hidden="true" style={{ position: "absolute", inset, width: 7, height: 7, background: "var(--bg-surface)", border: "1.5px solid var(--indicator-active)" }} />
            ))}
            <button type="button" onClick={onWarn} aria-expanded={warnOpen} style={{ position: "absolute", insetBlockStart: -10, insetInlineStart: -10, display: "grid", placeItems: "center", width: 20, height: 20, padding: 0, borderRadius: "var(--radius-full)", background: "var(--error-text)", color: "var(--fg-inverse)", border: "1.5px solid var(--bg-surface)", cursor: "pointer" }}>
              <Icon name="triangle-alert" size={11} label="1 print problem on this element" />
            </button>
            {warnOpen ? (
              <div role="status" style={{ position: "absolute", insetBlockStart: "calc(100% + 10px)", insetInlineStart: -10, width: 268, zIndex: 2, display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-4)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid " + SEV.error.bd, borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-overlay)", textAlign: "start" }}>
                <span style={{ ...eyebrow, color: SEV.error.fg }}>Will not print cleanly</span>
                <span style={{ font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>{WARNINGS[0].title}</span>
                <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{WARNINGS[0].body}</span>
                <div style={{ display: "flex", gap: "var(--space-2)", paddingBlockStart: "var(--space-1)" }}>
                  <Button size="sm">Scale to 61%</Button>
                  <Button size="sm" variant="outline">Replace file</Button>
                </div>
              </div>
            ) : null}
          </div>

          <span style={{ position: "absolute", insetBlockStart: "58%", insetInlineStart: "22%", width: "56%", textAlign: "center", fontFamily: "var(--font-bengali, var(--font-body))", fontSize: Math.max(11, 22 * (zoom / 100)), color: "#1c1c1c", outline: "1px dashed #1c1c1c66", outlineOffset: 3 }}>রঙে রঙে</span>
        </div>
        <span style={{ ...mono, fontSize: 10, color: "#ffffffc4" }}>Cotton tee · front · 300 dpi target</span>
      </div>
    </div>
  );
}

/* ---------- properties ---------- */

function Row({ label, children }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "68px 1fr", alignItems: "center", gap: "var(--space-3)", font: "var(--type-ui-sm)" }}>
      <span style={{ color: "var(--fg-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

function NumField({ value, unit }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minHeight: 32, paddingInline: "var(--space-3)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-control)", borderRadius: "var(--radius-sm)", ...mono, fontVariantNumeric: "tabular-nums" }}>
      <span style={{ flex: 1 }}>{value}</span>
      <span style={{ color: "var(--fg-secondary)" }}>{unit}</span>
    </span>
  );
}

function Section({ title, children, action }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "var(--space-4)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
        <span style={eyebrow}>{title}</span>
        {action}
      </div>
      {children}
    </section>
  );
}

const SWATCHES = [["#f2f0ec", "Unbleached"], ["#1c1c1c", "Ink"], ["#3d4a4d", "Slate"], ["#7a3b2e", "Terracotta"], ["#d9d2c4", "Sand"]];

function Properties({ colour, onColour, price }) {
  return (
    <aside aria-label="Properties" className="vd-scroll-y" style={{ width: 300, flex: "none", display: "flex", flexDirection: "column", background: "var(--bg-surface)", borderInlineStart: "var(--border-width-thin) solid var(--border-default)", overflowY: "auto", overflowX: "hidden" }}>
      <Section title="Garment">
        <Select size="sm" options={GARMENTS} defaultValue="tee" aria-label="Garment" />
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {SWATCHES.map(([hex, name]) => (
            <button key={hex} type="button" onClick={() => onColour(hex)} aria-label={name} aria-pressed={colour === hex} title={name}
              style={{ width: 28, height: 28, padding: 0, background: hex, border: colour === hex ? "2px solid var(--indicator-active)" : "var(--border-width-thin) solid var(--border-strong)", borderRadius: "var(--radius-sm)", cursor: "pointer" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {["S", "M", "L", "XL"].map((s, i) => <Tag key={s} selected={i === 1}>{s}</Tag>)}
        </div>
      </Section>

      <Section title="Selection — monogram.png" action={<Badge tone="danger" size="sm">1 problem</Badge>}>
        <Row label="X"><NumField value="82.0" unit="mm" /></Row>
        <Row label="Y"><NumField value="104.5" unit="mm" /></Row>
        <Row label="Width"><NumField value="114.0" unit="mm" /></Row>
        <Row label="Rotation"><NumField value="0" unit="°" /></Row>
        <Row label="Opacity"><NumField value="100" unit="%" /></Row>
      </Section>

      {/* UI-STU-9, second half: the same warnings gathered as a pre-order summary. */}
      <Section title="Print check" action={<span style={{ ...mono, color: "var(--fg-secondary)" }}>3 items</span>}>
        {WARNINGS.map((w) => (
          <div key={w.id} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3)", background: SEV[w.sev].bg, border: "var(--border-width-thin) solid " + SEV[w.sev].bd, borderRadius: "var(--radius-sm)" }}>
            <Icon name={w.icon} size={14} color={SEV[w.sev].fg} style={{ marginBlockStart: 2 }} />
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ font: "var(--type-ui-sm)", fontWeight: "var(--weight-medium)" }}>{w.title}</span>
              <span style={{ ...mono, fontSize: 10, color: "var(--fg-secondary)" }}>{w.el}</span>
            </span>
          </div>
        ))}
      </Section>

      <Section title="Price">
        {[["Blank garment", 1180], ["Front print — 2 colours", 940], ["Bengali type licence", 330]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", font: "var(--type-ui-sm)" }}>
            <span style={{ color: "var(--fg-secondary)" }}>{l}</span>
            <span style={mono}>{taka(v)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", paddingBlockStart: "var(--space-2)", borderBlockStart: "var(--border-width-thin) solid var(--border-default)", font: "var(--type-ui-dense)", fontWeight: "var(--weight-medium)" }}>
          <span>One piece, incl. VAT</span>
          <span style={mono}>{taka(price)}</span>
        </div>
      </Section>
    </aside>
  );
}

/* ---------- mobile: sheet in place of the side panels (UI-STU-6) ---------- */

function MobileBar({ tool, onTool, sheet, onSheet }) {
  return (
    <div style={{ flex: "none", background: "var(--bg-surface)", borderBlockStart: "var(--border-width-thin) solid var(--border-strong)" }}>
      {sheet ? (
        <div style={{ maxHeight: "46vh", overflowY: "auto", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)" }}>
            <span style={eyebrow}>{sheet === "props" ? "Selection" : "Print check"}</span>
            <IconButton variant="ghost" size="sm" icon={<Icon name="x" size={16} />} label="Close panel" onClick={() => onSheet(null)} />
          </div>
          {sheet === "props" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", padding: "0 var(--space-4) var(--space-4)" }}>
              <Row label="X"><NumField value="82.0" unit="mm" /></Row>
              <Row label="Width"><NumField value="114.0" unit="mm" /></Row>
              <Row label="Rotation"><NumField value="0" unit="°" /></Row>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "0 var(--space-4) var(--space-4)" }}>
              {WARNINGS.map((w) => (
                <div key={w.id} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3)", background: SEV[w.sev].bg, border: "var(--border-width-thin) solid " + SEV[w.sev].bd, borderRadius: "var(--radius-sm)" }}>
                  <Icon name={w.icon} size={14} color={SEV[w.sev].fg} style={{ marginBlockStart: 2 }} />
                  <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ font: "var(--type-ui-sm)", fontWeight: "var(--weight-medium)" }}>{w.title}</span>
                    <span style={{ ...mono, fontSize: 10, color: "var(--fg-secondary)" }}>{w.el}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
      <div role="toolbar" aria-label="Studio tools" className="vd-scroll-x" style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", padding: "var(--space-2)", overflowX: "auto", overflowY: "hidden" }}>
        {TOOLS.map(([id, label, icon]) => (
          <IconButton key={id} icon={<Icon name={icon} size={18} />} label={label} active={tool === id} variant={tool === id ? "solid" : "ghost"} onClick={() => onTool(id)} />
        ))}
        <span aria-hidden="true" style={{ width: 1, alignSelf: "stretch", marginInline: "var(--space-1)", background: "var(--border-default)" }} />
        <IconButton icon={<Icon name="sliders-horizontal" size={18} />} label="Selection properties" active={sheet === "props"} variant={sheet === "props" ? "solid" : "ghost"} onClick={() => onSheet(sheet === "props" ? null : "props")} />
        <span style={{ position: "relative", flex: "none" }}>
          <IconButton icon={<Icon name="triangle-alert" size={18} />} label="Print check — 3 items" active={sheet === "warn"} variant={sheet === "warn" ? "solid" : "ghost"} onClick={() => onSheet(sheet === "warn" ? null : "warn")} />
          <span aria-hidden="true" style={{ position: "absolute", insetBlockStart: 4, insetInlineEnd: 4, width: 7, height: 7, borderRadius: "var(--radius-full)", background: "var(--error-text)" }} />
        </span>
      </div>
    </div>
  );
}

/* ---------- first run (UI-STU-8) ---------- */

function Walkthrough({ onDismiss }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Welcome to the Studio" style={{ position: "absolute", inset: 0, zIndex: "var(--z-modal)", display: "grid", placeItems: "center", padding: "var(--space-5)", background: "var(--bg-overlay, #00000073)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "min(420px, 100%)", padding: "var(--space-6)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-default)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-overlay)" }}>
        <span style={eyebrow}>First time here</span>
        <h2 style={{ font: "var(--type-h3)", margin: 0 }}>Three things and you can print</h2>
        <ol style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", margin: 0, paddingInlineStart: "var(--space-5)", font: "var(--type-ui-dense)", color: "var(--fg-secondary)" }}>
          <li>Pick a garment and colour on the right. Price updates as you go.</li>
          <li>Add artwork or text. Keep it inside the dashed safe area — anything past it may be cut.</li>
          <li>Clear the print check before ordering. Problems are marked on the element itself.</li>
        </ol>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onDismiss}>Skip</Button>
          <Button onClick={onDismiss}>Start the tour</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- app ---------- */

function StudioApp({ layout = "desktop", scheme = "light", walkthrough = false, connection = "online" }) {
  const dsReady = useDesignSystemReady();
  const [s, setS] = React.useState({ tool: "select", zoom: 100, colour: "#f2f0ec", warn: false, sheet: null, tour: walkthrough });
  React.useEffect(() => { setS((p) => ({ ...p, tour: walkthrough })); }, [walkthrough]);
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", scheme === "dark");
  }, [scheme]);

  if (!dsReady) return <div style={{ minHeight: "100vh" }} />;
  const narrow = layout === "mobile";
  const price = 2450;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-canvas)", color: "var(--fg-primary)", font: "var(--type-ui-dense)" }}>
      <TopBar zoom={s.zoom} onZoom={(d) => setS((p) => ({ ...p, zoom: Math.min(200, Math.max(40, p.zoom + d)) }))}
        saved="Saved 2 minutes ago" onlineState={connection} price={price} narrow={narrow} onOrder={() => {}} />
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {narrow ? null : <ToolRail tool={s.tool} onTool={(t) => setS((p) => ({ ...p, tool: t }))} />}
        <Canvas zoom={s.zoom} colour={s.colour} warnOpen={s.warn} onWarn={() => setS((p) => ({ ...p, warn: !p.warn }))} />
        {narrow ? null : <Properties colour={s.colour} onColour={(c) => setS((p) => ({ ...p, colour: c }))} price={price} />}
      </div>
      {narrow ? <MobileBar tool={s.tool} onTool={(t) => setS((p) => ({ ...p, tool: t }))} sheet={s.sheet} onSheet={(v) => setS((p) => ({ ...p, sheet: v }))} /> : null}
      {s.tour ? <Walkthrough onDismiss={() => setS((p) => ({ ...p, tour: false }))} /> : null}
    </div>
  );
}

Object.assign(window, { StudioApp });
