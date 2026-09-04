import React from "react";

export function Tooltip({ label, placement = "top", children, style }) {
  const [open, setOpen] = React.useState(false);

  const pos = {
    top: { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
    bottom: { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" },
    left: { right: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" },
    right: { left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" },
  }[placement];

  return (
    <span
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      style={{ position: "relative", display: "inline-flex", ...style }}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 70,
            ...pos,
            padding: "var(--space-1) var(--space-2)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontSize: "var(--text-2xs)",
            fontWeight: "var(--weight-medium)",
            letterSpacing: "var(--tracking-normal)",
            whiteSpace: "nowrap",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-md)",
            pointerEvents: "none",
          }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
