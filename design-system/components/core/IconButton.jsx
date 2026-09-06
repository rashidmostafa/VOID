import React from "react";

const SIZES = { sm: 32, md: 38, lg: 44 };

export function IconButton({ icon, label, variant = "ghost", size = "md", disabled = false, active = false, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const dim = SIZES[size] || SIZES.md;

  const base = {
    ghost: { background: "transparent", border: "1px solid transparent", color: "var(--foreground)" },
    outline: { background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" },
    solid: { background: "var(--primary)", border: "1px solid var(--primary)", color: "var(--primary-foreground)" },
  }[variant];

  const hovered = {
    ghost: { background: "var(--muted)" },
    outline: { background: "var(--muted)", borderColor: "var(--line-strong)" },
    solid: { background: "oklch(0.30 0 0)", borderColor: "oklch(0.30 0 0)" },
  }[variant];

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "var(--transition-control)",
        ...base,
        ...(active ? { background: "var(--muted)", borderColor: "var(--line-strong)" } : null),
        ...(hover && !disabled ? hovered : null),
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
