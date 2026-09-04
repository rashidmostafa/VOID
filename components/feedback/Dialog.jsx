import React from "react";

export function Dialog({ open = false, title, description, size = "md", onClose, footer, children }) {
  if (!open) return null;
  const width = { sm: 400, md: 520, lg: 720 }[size] || 520;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === "string" ? title : undefined}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        background: "var(--overlay-scrim)",
        backdropFilter: "blur(var(--blur-scrim))",
        animation: "void-fade var(--duration-base) var(--ease-out)",
      }}
    >
      <style>{"@keyframes void-fade{from{opacity:0}to{opacity:1}}@keyframes void-rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}"}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: width,
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-overlay)",
          animation: "void-rise var(--duration-base) var(--ease-out)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", padding: "var(--space-5) var(--space-5) 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {title ? <div style={{ font: "var(--type-h3)" }}>{title}</div> : null}
            {description ? <div style={{ font: "var(--type-ui-sm)", color: "var(--text-muted)" }}>{description}</div> : null}
          </div>
          {onClose ? (
            <button type="button" aria-label="Close" onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
          ) : null}
        </div>
        {children ? <div style={{ padding: "var(--space-5)" }}>{children}</div> : <div style={{ height: "var(--space-5)" }} />}
        {footer ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--border)" }}>{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
