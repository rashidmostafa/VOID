import React from "react";

export function Tag({ selected = false, removable = false, onRemove, onClick, style, children, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        height: 28,
        padding: "0 var(--space-3)",
        /* The height is fixed, so the label must never wrap — under any squeeze it
           would spill out of the pill instead of the pill growing. */
        whiteSpace: "nowrap",
        flex: "0 0 auto",
        borderRadius: "var(--radius-full)",
        border: "1px solid " + (selected ? "var(--primary)" : "var(--border)"),
        background: selected ? "var(--primary)" : hover ? "var(--muted)" : "transparent",
        color: selected ? "var(--primary-foreground)" : "var(--foreground)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-medium)",
        letterSpacing: "var(--tracking-normal)",
        cursor: onClick ? "pointer" : "default",
        transition: "var(--transition-control)",
        ...style,
      }}
      {...rest}
    >
      {children}
      {removable ? (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => { e.stopPropagation(); onRemove && onRemove(e); }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, flex: "none", border: "none", background: "transparent", color: "inherit", cursor: "pointer", opacity: 0.6, padding: 0, fontSize: 13, lineHeight: 1 }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
