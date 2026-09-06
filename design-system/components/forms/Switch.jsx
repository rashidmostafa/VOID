import React from "react";

export function Switch({ label, checked = false, disabled = false, size = "md", onChange, id, style, ...rest }) {
  const uid = React.useId();
  const fieldId = id || uid;
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 22;
  const knob = h - 6;

  return (
    <label
      htmlFor={fieldId}
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, ...style }}
    >
      <input id={fieldId} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={onChange} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} {...rest} />
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          width: w,
          height: h,
          flex: "none",
          borderRadius: "var(--radius-full)",
          background: checked ? "var(--primary)" : "var(--border)",
          transition: "background-color var(--duration-base) var(--ease-standard)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? w - knob - 3 : 3,
            width: knob,
            height: knob,
            borderRadius: "var(--radius-full)",
            background: "var(--background)",
            boxShadow: "var(--shadow-xs)",
            transition: "left var(--duration-base) var(--ease-standard)",
          }}
        />
      </span>
      {label ? <span style={{ fontSize: "var(--text-base)" }}>{label}</span> : null}
    </label>
  );
}
