import React from "react";

export function Card({ padding = "md", elevated = false, interactive = false, as = "div", style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const pad = { none: 0, sm: "var(--space-4)", md: "var(--space-5)", lg: "var(--space-8)" }[padding];
  const Tag = as;

  return (
    <Tag
      onMouseEnter={interactive ? () => setHover(true) : undefined}
      onMouseLeave={interactive ? () => setHover(false) : undefined}
      style={{
        background: "var(--surface-card)",
        color: "var(--card-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: pad,
        boxShadow: elevated ? "var(--shadow-md)" : "var(--shadow-none)",
        transition: "var(--transition-control)",
        ...(interactive ? { cursor: "pointer" } : null),
        ...(hover ? { borderColor: "var(--line-strong)", boxShadow: "var(--shadow-sm)" } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, meta, action, style }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", ...style }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div style={{ font: "var(--type-h3)", fontSize: "var(--text-md)" }}>{title}</div>
        {meta ? <div style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>{meta}</div> : null}
      </div>
      {action}
    </div>
  );
}
