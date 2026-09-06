"use client";

import * as React from "react";

/* Tooltip — short label on hover and focus. Names things, never explains them.
 *
 * readme.md requires one on every icon-only control, alongside the aria-label.
 * The two do different jobs: the label names the control for assistive tech, the
 * tooltip names it for a sighted pointer user. Neither replaces the other, and a
 * tooltip is never the only place information lives — it cannot be reached at
 * all on a touch device.
 *
 * WCAG 1.4.13 (Content on Hover or Focus) sets three conditions, and the
 * reference meets none of them:
 *
 * · Dismissible — Escape closes it without moving focus. The reference has no
 *   key handling at all.
 * · Hoverable — the pointer can move onto the tooltip without it vanishing. The
 *   reference sets pointer-events: none, which makes that impossible.
 * · Persistent — it stays until dismissed, focus moves, or the content is no
 *   longer valid. It does not time out.
 *
 * Two further corrections: the tooltip is associated with its trigger through
 * aria-describedby, so a screen reader user gets the text at all — the reference
 * renders role="tooltip" connected to nothing; and placement uses logical
 * properties, so `start`/`end` follow the writing direction instead of being
 * pinned to physical left and right.
 */

export type TooltipPlacement = "top" | "bottom" | "start" | "end";

const PLACEMENT: Record<TooltipPlacement, React.CSSProperties> = {
  top: {
    insetBlockEnd: "calc(100% + var(--tooltip-offset))",
    insetInlineStart: "50%",
    transform: "translateX(-50%)",
  },
  bottom: {
    insetBlockStart: "calc(100% + var(--tooltip-offset))",
    insetInlineStart: "50%",
    transform: "translateX(-50%)",
  },
  start: {
    insetInlineEnd: "calc(100% + var(--tooltip-offset))",
    insetBlockStart: "50%",
    transform: "translateY(-50%)",
  },
  end: {
    insetInlineStart: "calc(100% + var(--tooltip-offset))",
    insetBlockStart: "50%",
    transform: "translateY(-50%)",
  },
};

export interface TooltipProps {
  /** Short. A name, not a sentence. */
  label: React.ReactNode;
  placement?: TooltipPlacement;
  children: React.ReactNode;
}

export function Tooltip({ label, placement = "top", children }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  /* Escape must dismiss it "without moving pointer hover or keyboard focus"
     (1.4.13). When the tooltip was opened by HOVER, focus is not in the wrapper,
     so a keydown handler on the wrapper never sees the key — the listener has to
     be on the document. Attached only while open, so it costs nothing at rest. */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {/* aria-describedby is set on the wrapper rather than cloned onto the
          child, so any element can be a trigger without this component having to
          rewrite its props. */}
      <span aria-describedby={open ? id : undefined} style={{ display: "contents" }}>
        {children}
      </span>

      <span
        id={id}
        role="tooltip"
        hidden={!open}
        style={{
          position: "absolute",
          zIndex: "var(--z-tooltip)",
          ...PLACEMENT[placement],
          padding: "var(--space-1) var(--space-2)",
          background: "var(--action-primary-bg)",
          color: "var(--action-primary-text)",
          font: "var(--type-label)",
          fontSize: "var(--text-2xs)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-md)",
          // Long labels wrap rather than running off the viewport; the tooltip
          // is short by rule, but a 40%-expanded translation is not (UI-INV-6).
          maxInlineSize: "var(--measure-tight)",
          inlineSize: "max-content",
          // NOT pointer-events: none — 1.4.13 requires the tooltip to remain
          // visible while the pointer moves onto it.
        }}
      >
        {label}
      </span>
    </span>
  );
}
