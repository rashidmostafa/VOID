import React from "react";

export function Select({ label, hint, error, size = "md", options = [], placeholder, disabled = false, id, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const fieldId = id || uid;
  const h = { sm: "var(--control-h-sm)", md: "var(--control-h-md)", lg: "var(--control-h-lg)" }[size];
  const fs = { sm: "var(--text-sm)", md: "var(--text-base)", lg: "var(--text-md)" }[size];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label ? <label htmlFor={fieldId} style={{ font: "var(--type-label)" }}>{label}</label> : null}
      <div style={{ position: "relative", display: "flex" }}>
        <select
          id={fieldId}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: "none",
            width: "100%",
            height: h,
            padding: "0 var(--space-8) 0 var(--space-3)",
            fontSize: fs,
            fontFamily: "var(--font-sans)",
            color: "var(--foreground)",
            background: disabled ? "var(--muted)" : "var(--background)",
            border: "1px solid " + (error ? "var(--destructive)" : focus ? "var(--ring)" : "var(--input)"),
            borderRadius: "var(--radius-md)",
            boxShadow: focus && !error ? "var(--focus-ring)" : "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            transition: "var(--transition-control)",
          }}
          {...rest}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => {
            const value = typeof o === "string" ? o : o.value;
            const text = typeof o === "string" ? o : o.label;
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
        <span aria-hidden="true" style={{ position: "absolute", right: "var(--space-3)", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)", fontSize: 10 }}>▾</span>
      </div>
      {error || hint ? <span style={{ fontSize: "var(--text-xs)", color: error ? "var(--destructive)" : "var(--text-muted)" }}>{error || hint}</span> : null}
    </div>
  );
}
