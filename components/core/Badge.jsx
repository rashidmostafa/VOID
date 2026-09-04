import React from "react";

const TONES = {
  neutral: { background: "var(--action-secondary-bg)", color: "var(--action-secondary-text)", border: "1px solid transparent" },
  solid: { background: "var(--action-primary-bg)", color: "var(--action-primary-text)", border: "1px solid var(--action-primary-bg)" },
  outline: { background: "transparent", color: "var(--fg-primary)", border: "1px solid var(--border-default)" },
  success: { background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid var(--success-border)" },
  warning: { background: "var(--warning-bg)", color: "var(--warning-text)", border: "1px solid var(--warning-border)" },
  danger: { background: "var(--error-bg)", color: "var(--error-text)", border: "1px solid var(--error-border)" },
  info: { background: "var(--info-bg)", color: "var(--info-text)", border: "1px solid var(--info-border)" },
};

export function Badge({ tone = "neutral", size = "md", dot = false, style, children, ...rest }) {
  const s = size === "sm"
    ? { height: 20, padding: "0 var(--space-2)", fontSize: "var(--text-2xs)" }
    : { height: 24, padding: "0 var(--space-2)", fontSize: "var(--text-xs)" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--weight-medium)",
        letterSpacing: "var(--tracking-normal)",
        whiteSpace: "nowrap",
        ...s,
        ...(TONES[tone] || TONES.neutral),
        ...style,
      }}
      {...rest}
    >
      {dot ? <span style={{ width: 5, height: 5, borderRadius: "var(--radius-full)", background: "currentColor", flex: "none" }} /> : null}
      {children}
    </span>
  );
}
