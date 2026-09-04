import React from "react";

export function Input({
  label,
  hint,
  error,
  size = "md",
  prefix = null,
  suffix = null,
  disabled = false,
  multiline = false,
  rows = 3,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const fieldId = id || uid;
  const h = { sm: "var(--control-h-sm)", md: "var(--control-h-md)", lg: "var(--control-h-lg)" }[size];
  const fs = { sm: "var(--text-sm)", md: "var(--text-base)", lg: "var(--text-md)" }[size];

  const shell = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    height: multiline ? "auto" : h,
    padding: multiline ? "var(--space-3)" : "0 var(--space-3)",
    background: disabled ? "var(--muted)" : "var(--background)",
    border: "1px solid " + (error ? "var(--destructive)" : focus ? "var(--ring)" : "var(--input)"),
    borderRadius: "var(--radius-md)",
    boxShadow: focus && !error ? "var(--focus-ring)" : "none",
    transition: "var(--transition-control)",
    opacity: disabled ? 0.6 : 1,
  };

  const control = {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: fs,
    fontFamily: "var(--font-sans)",
    color: "var(--foreground)",
    resize: multiline ? "vertical" : undefined,
    lineHeight: multiline ? "var(--leading-normal)" : undefined,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label ? (
        <label htmlFor={fieldId} style={{ font: "var(--type-label)", color: "var(--foreground)" }}>{label}</label>
      ) : null}
      <div style={shell}>
        {prefix ? <span style={{ color: "var(--text-muted)", display: "inline-flex" }}>{prefix}</span> : null}
        {multiline ? (
          <textarea id={fieldId} rows={rows} disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={control} {...rest} />
        ) : (
          <input id={fieldId} disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={control} {...rest} />
        )}
        {suffix ? <span style={{ color: "var(--text-muted)", display: "inline-flex", fontSize: "var(--text-xs)" }}>{suffix}</span> : null}
      </div>
      {error || hint ? (
        <span style={{ fontSize: "var(--text-xs)", color: error ? "var(--destructive)" : "var(--text-muted)" }}>{error || hint}</span>
      ) : null}
    </div>
  );
}
