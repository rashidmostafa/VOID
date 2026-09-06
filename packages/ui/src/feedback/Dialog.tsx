"use client";

import * as React from "react";

/* Dialog — centred modal over a blurred scrim. Confirmations and short forms only.
 *
 * Built on the native <dialog> element with showModal(), which is not a
 * convenience: it is where the correctness comes from. The browser supplies
 * focus containment, Escape-to-close, inert background content, focus
 * restoration to the trigger, and placement in the top layer. The reference
 * implements a modal as a fixed <div> and therefore has none of them — Tab moves
 * behind the scrim, Escape does nothing, and focus never enters or returns.
 *
 * Notable consequences:
 *
 * · No z-index. The top layer sits above everything by definition, so the
 *   reference's ad-hoc `zIndex: 60` is not replaced by --z-modal, it is not
 *   needed at all. tokens.json is explicit that nothing may declare an ad-hoc
 *   z-index; here nothing declares one.
 * · role="dialog" belongs on the panel, not the scrim. The reference puts it on
 *   the full-screen wrapper, which tells assistive tech the backdrop is the
 *   dialog. <dialog> carries the role itself.
 * · The title is referenced with aria-labelledby rather than copied into
 *   aria-label, so a non-string title still names the dialog.
 * · Animation lives in the theme's base layer, so the central
 *   prefers-reduced-motion rule reaches it (UI-INV-8). The reference injects a
 *   <style> block, which escapes that rule.
 */

export type DialogSize = "sm" | "md" | "lg";

const WIDTH: Record<DialogSize, string> = {
  sm: "var(--dialog-sm)",
  md: "var(--dialog-md)",
  lg: "var(--dialog-lg)",
};

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  size?: DialogSize;
  /** Action row. Put the confirming action last, as the reading order ends there. */
  footer?: React.ReactNode;
  /** Label for the close control. Name what closes. */
  closeLabel?: string;
  children?: React.ReactNode;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  closeLabel = "Close",
  children,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // `cancel` fires on Escape. Let the parent own `open` rather than letting the
  // element close itself, or the two fall out of step.
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    onClose();
  };

  // A click on the backdrop lands on the <dialog> itself, because the panel
  // inside it covers the rest. Comparing the target is what separates the two.
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onCancel={handleCancel}
      onClose={() => open && onClose()}
      onClick={handleClick}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="void-dialog"
      style={{ inlineSize: "100%", maxInlineSize: WIDTH[size] }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            padding: "var(--space-5) var(--space-5) 0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minInlineSize: 0 }}>
            <h2 id={titleId} style={{ font: "var(--type-h3)" }}>
              {title}
            </h2>
            {description ? (
              <p id={descId} style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="void-touch-safe"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
              border: "none",
              background: "transparent",
              color: "var(--fg-secondary)",
              cursor: "pointer",
              padding: 0,
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-none)",
            }}
          >
            {/* One of the two intentional Unicode glyphs in the system. */}
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div style={{ padding: "var(--space-5)" }}>{children}</div>

        {footer ? (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: "var(--space-3)",
              padding: "var(--space-4) var(--space-5)",
              borderBlockStart: "var(--border-width-thin) solid var(--border-default)",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
