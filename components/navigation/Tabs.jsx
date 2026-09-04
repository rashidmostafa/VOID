import React from "react";

export function Tabs({ items = [], value, onChange, variant = "underline", size = "md", style }) {
  const active = value ?? (items[0] && (items[0].value ?? items[0]));
  const fs = size === "sm" ? "var(--text-sm)" : "var(--text-base)";

  const wrap = variant === "segmented"
    ? { display: "inline-flex", gap: 2, padding: 2, background: "var(--muted)", borderRadius: "var(--radius-md)" }
    : { display: "flex", gap: "var(--space-6)", borderBottom: "1px solid var(--border)" };

  return (
    <div style={{ ...wrap, ...style }}>
      {items.map((raw) => {
        const item = typeof raw === "string" ? { value: raw, label: raw } : raw;
        const on = item.value === active;
        const seg = {
          padding: "0 var(--space-3)",
          height: 28,
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          borderRadius: "var(--radius-sm)",
          background: on ? "var(--background)" : "transparent",
          color: on ? "var(--foreground)" : "var(--text-muted)",
          boxShadow: on ? "var(--shadow-xs)" : "none",
        };
        const und = {
          padding: "0 0 var(--space-3)",
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          color: on ? "var(--foreground)" : "var(--text-muted)",
          borderBottom: "1px solid " + (on ? "var(--foreground)" : "transparent"),
          marginBottom: -1,
        };
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange && onChange(item.value)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: fs,
              fontWeight: on ? "var(--weight-medium)" : "var(--weight-regular)",
              transition: "var(--transition-control)",
              ...(variant === "segmented" ? seg : und),
            }}
          >
            {item.icon}
            {item.label}
            {item.count != null ? (
              <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
