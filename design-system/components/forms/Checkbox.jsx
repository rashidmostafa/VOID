import React from "react";

export function Checkbox({ label, description, checked = false, indeterminate = false, disabled = false, onChange, id, style, ...rest }) {
  const uid = React.useId();
  const fieldId = id || uid;
  const on = checked || indeterminate;

  return (
    <label
      htmlFor={fieldId}
      style={{
        display: "inline-flex",
        alignItems: description ? "flex-start" : "center",
        gap: "var(--space-3)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <input
        id={fieldId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        {...rest}
      />
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          flex: "none",
          marginTop: description ? 2 : 0,
          borderRadius: "var(--radius-sm)",
          border: "1px solid " + (on ? "var(--primary)" : "var(--input)"),
          background: on ? "var(--primary)" : "var(--background)",
          color: "var(--primary-foreground)",
          transition: "var(--transition-control)",
        }}
      >
        {indeterminate ? (
          <span style={{ width: 8, height: 1.5, background: "currentColor" }} />
        ) : checked ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.2 3.8 7.5 8.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : null}
      </span>
      {label ? (
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: "var(--text-base)" }}>{label}</span>
          {description ? <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
