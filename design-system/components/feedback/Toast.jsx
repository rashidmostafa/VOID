import React from "react";

const TONE_ACCENT = {
  neutral: "var(--foreground)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
};

export function Toast({ title, description, tone = "neutral", icon = null, action = null, onDismiss, style, ...rest }) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-3)",
        width: 360,
        maxWidth: "100%",
        padding: "var(--space-4)",
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ width: 3, alignSelf: "stretch", borderRadius: "var(--radius-full)", background: TONE_ACCENT[tone] || TONE_ACCENT.neutral, flex: "none" }} />
      {icon ? <span style={{ marginTop: 1, color: TONE_ACCENT[tone] }}>{icon}</span> : null}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div style={{ fontSize: "var(--text-base)", fontWeight: "var(--weight-medium)" }}>{title}</div>
        {description ? <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", lineHeight: "var(--leading-normal)" }}>{description}</div> : null}
        {action ? <div style={{ marginTop: "var(--space-2)" }}>{action}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
      ) : null}
    </div>
  );
}
