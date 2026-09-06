import React from "react";

const SIZES = {
  sm: { height: "var(--control-h-sm)", padding: "0 var(--control-pad-x-sm)", fontSize: "var(--text-sm)", gap: "var(--space-2)" },
  md: { height: "var(--control-h-md)", padding: "0 var(--control-pad-x-md)", fontSize: "var(--text-base)", gap: "var(--space-2)" },
  lg: { height: "var(--control-h-lg)", padding: "0 var(--control-pad-x-lg)", fontSize: "var(--text-md)", gap: "var(--space-3)" },
};

const VARIANTS = {
  primary: {
    rest: { background: "var(--action-primary-bg)", color: "var(--action-primary-text)", border: "1px solid var(--action-primary-bg)" },
    hover: { background: "var(--action-primary-hover)", borderColor: "var(--action-primary-hover)" },
  },
  secondary: {
    rest: { background: "var(--action-secondary-bg)", color: "var(--action-secondary-text)", border: "1px solid var(--action-secondary-bg)" },
    hover: { background: "var(--action-secondary-hover)", borderColor: "var(--action-secondary-hover)" },
  },
  outline: {
    rest: { background: "transparent", color: "var(--fg-primary)", border: "1px solid var(--border-control)" },
    hover: { background: "var(--action-tertiary-hover)", borderColor: "var(--fg-primary)" },
  },
  ghost: {
    rest: { background: "transparent", color: "var(--action-tertiary-text)", border: "1px solid transparent" },
    hover: { background: "var(--action-tertiary-hover)" },
  },
  destructive: {
    rest: { background: "var(--action-danger-bg)", color: "var(--action-danger-text)", border: "1px solid var(--action-danger-bg)" },
    hover: { background: "var(--action-danger-hover)", borderColor: "var(--action-danger-hover)" },
  },
  link: {
    rest: { background: "transparent", color: "var(--fg-link)", border: "1px solid transparent", padding: 0, height: "auto", minHeight: "var(--touch-target-min)", textDecoration: "underline", textUnderlineOffset: 3, borderRadius: 0 },
    hover: { color: "var(--fg-link-hover)", textDecorationThickness: 2 },
  },
  accent: {
    rest: { background: "var(--action-accent-bg)", color: "var(--action-accent-text)", border: "1px solid var(--action-accent-bg)" },
    hover: { background: "var(--action-accent-hover)", borderColor: "var(--action-accent-hover)" },
  },
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  as = "button",
  href,
  onClick,
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const inactive = disabled || loading;
  const Tag = as === "a" || href ? "a" : as;

  const styles = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : "auto",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-medium)",
    letterSpacing: "var(--tracking-tight)",
    lineHeight: 1,
    borderRadius: "var(--radius-md)",
    cursor: inactive ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
    transition: "var(--transition-control), transform var(--duration-instant) var(--ease-standard)",
    transform: press && !inactive ? "scale(var(--press-scale))" : "none",
    opacity: inactive ? 0.45 : 1,
    ...s,
    ...v.rest,
    ...(hover && !inactive ? v.hover : null),
    ...style,
  };

  return (
    <Tag
      type={Tag === "button" ? type : undefined}
      href={Tag === "a" ? href : undefined}
      disabled={Tag === "button" ? inactive : undefined}
      aria-busy={loading || undefined}
      onClick={inactive ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={styles}
      {...rest}
    >
      {loading ? <Spinner /> : iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 13,
        height: 13,
        borderRadius: "var(--radius-full)",
        border: "1.5px solid currentColor",
        borderTopColor: "transparent",
        animation: "void-spin 700ms linear infinite",
        flex: "none",
      }}
    >
      <style>{"@keyframes void-spin{to{transform:rotate(360deg)}}"}</style>
    </span>
  );
}
