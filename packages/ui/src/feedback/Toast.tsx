import * as React from "react";

/* Toast — transient confirmation. Bottom-end, one at a time.
 *
 * The presentation is a Server Component; only the live region that hosts it
 * needs to be client-side. `dismiss` is a node rather than a callback for the
 * same reason it is on ErrorState: the caller decides whether dismissal is a
 * form action or a client handler, and this stays server-renderable either way.
 *
 * The correction that matters is the announcement. The reference gives every
 * toast role="status", which is a polite live region — a screen reader queues it
 * behind whatever is speaking. For "Saved" that is right. For "bKash rejected the
 * transfer" it is not: the user needs to know now, and politely queued means
 * possibly never. Tone therefore selects the role, so a failure is assertive and
 * a confirmation is polite.
 *
 * Voice, from readme.md: errors name the object and the fix. Status is carried by
 * the tone bar and the words, never by an emoji — there are none anywhere.
 */

export type ToastTone = "neutral" | "success" | "warning" | "danger";

const BAR: Record<ToastTone, string> = {
  neutral: "var(--fg-primary)",
  success: "var(--success-solid)",
  warning: "var(--warning-solid)",
  danger: "var(--error-solid)",
};

/* A failure interrupts; a confirmation waits its turn. */
const URGENT: Record<ToastTone, boolean> = {
  neutral: false,
  success: false,
  warning: true,
  danger: true,
};

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: ToastTone;
  icon?: React.ReactNode;
  /** One inline action. "Undo", not a row of choices. */
  action?: React.ReactNode;
  /** The dismiss control — a button or a form submit. */
  dismiss?: React.ReactNode;
}

export function Toast({
  title,
  description,
  tone = "neutral",
  icon,
  action,
  dismiss,
  className = "",
  style,
  ...rest
}: ToastProps) {
  return (
    <div
      role={URGENT[tone] ? "alert" : "status"}
      aria-live={URGENT[tone] ? "assertive" : "polite"}
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-3)",
        inlineSize: "var(--toast-w)",
        maxInlineSize: "100%",
        padding: "var(--space-4)",
        background: "var(--bg-surface-raised)",
        color: "var(--fg-primary)",
        border: "var(--border-width-thin) solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        ...style,
      }}
      {...rest}
    >
      {/* The tone bar is decorative: the words carry the meaning, so colour is
          never the only channel (UI-INV-1). */}
      <span
        aria-hidden="true"
        style={{
          inlineSize: "var(--toast-bar)",
          alignSelf: "stretch",
          flex: "none",
          borderRadius: "var(--radius-full)",
          background: BAR[tone],
        }}
      />

      {icon ? <span style={{ flex: "none", color: BAR[tone] }}>{icon}</span> : null}

      <div style={{ flex: 1, minInlineSize: 0, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <p style={{ font: "var(--type-ui)", fontWeight: "var(--weight-medium)" }}>{title}</p>
        {description ? (
          <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{description}</p>
        ) : null}
        {action ? <div style={{ marginBlockStart: "var(--space-2)" }}>{action}</div> : null}
      </div>

      {dismiss}
    </div>
  );
}

/* The region toasts are announced from. One live region that persists across
   toasts, rather than a new one per toast — a live region only announces changes
   to content already in the accessibility tree, so mounting the region and the
   message together is a common reason nothing is read out.
 *
 * Positioned bottom-end with logical properties, so an RTL locale needs no
 * second rule. */
export function ToastRegion({
  children,
  label = "Notifications",
}: {
  children?: React.ReactNode;
  label?: string;
}) {
  return (
    <div
      aria-label={label}
      style={{
        position: "fixed",
        insetBlockEnd: "var(--space-6)",
        insetInlineEnd: "var(--space-6)",
        zIndex: "var(--z-toast)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        maxInlineSize: "100%",
        pointerEvents: "none",
      }}
    >
      {/* Children re-enable pointer events; the region itself must not block the
          page it floats over. */}
      <div style={{ pointerEvents: "auto", display: "contents" }}>{children}</div>
    </div>
  );
}
