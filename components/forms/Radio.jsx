import React from "react";

export function Radio({ label, description, checked = false, disabled = false, name, value, onChange, id, style, ...rest }) {
  const uid = React.useId();
  const fieldId = id || uid;

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
        type="radio"
        name={name}
        value={value}
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
          borderRadius: "var(--radius-full)",
          border: "1px solid " + (checked ? "var(--primary)" : "var(--input)"),
          background: "var(--background)",
          transition: "var(--transition-control)",
        }}
      >
        {checked ? <span style={{ width: 8, height: 8, borderRadius: "var(--radius-full)", background: "var(--primary)" }} /> : null}
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
