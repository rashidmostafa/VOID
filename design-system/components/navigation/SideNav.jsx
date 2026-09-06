import React from "react";

export function SideNav({ brand, sections = [], value, onChange, footer, width = "var(--sidebar-width)", style }) {
  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        width,
        flex: "none",
        height: "100%",
        background: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
        color: "var(--sidebar-foreground)",
        ...style,
      }}
    >
      {brand ? (
        <div style={{ display: "flex", alignItems: "center", height: "var(--topbar-height)", padding: "0 var(--space-4)", borderBottom: "1px solid var(--sidebar-border)" }}>{brand}</div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", padding: "var(--space-4)", overflowY: "auto", flex: 1 }}>
        {sections.map((section, i) => (
          <div key={section.title || i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            {section.title ? (
              <div style={{ fontSize: "var(--text-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--text-muted)", padding: "0 var(--space-2) var(--space-2)" }}>{section.title}</div>
            ) : null}
            {(section.items || []).map((item) => (
              <NavItem key={item.value} item={item} active={item.value === value} onChange={onChange} />
            ))}
          </div>
        ))}
      </div>
      {footer ? <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--sidebar-border)" }}>{footer}</div> : null}
    </nav>
  );
}

function NavItem({ item, active, onChange }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => onChange && onChange(item.value)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        width: "100%",
        height: 34,
        padding: "0 var(--space-2)",
        border: "none",
        borderRadius: "var(--radius-md)",
        background: active ? "var(--sidebar-accent)" : hover ? "var(--sidebar-accent)" : "transparent",
        color: active ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-base)",
        fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)",
        textAlign: "left",
        cursor: "pointer",
        transition: "var(--transition-control)",
      }}
    >
      {item.icon ? <span style={{ display: "inline-flex", color: active ? "var(--foreground)" : "var(--text-muted)" }}>{item.icon}</span> : null}
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge != null ? (
        <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{item.badge}</span>
      ) : null}
    </button>
  );
}
