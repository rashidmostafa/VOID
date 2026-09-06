import * as React from "react";

/* EmptyState — the empty state of UI-GLOB-1.
 *
 * The voice rules are tight here and they are the point (readme.md):
 *   · one line, one action — "No orders yet." / "Nothing in your bag."
 *   · no illustration, no encouragement, no exclamation marks, no emoji
 *   · say what would change the outcome where something would
 *     ("Removing the price filter returns 128 pieces")
 *
 * `title` is the one line. `hint` is reserved for the outcome-changing fact and
 * is not a place for reassurance — if there is nothing useful to say, leave it
 * out. That is why it is optional and `title` is not.
 */

export interface EmptyStateProps {
  /** The one line. Sentence case, no exclamation mark. */
  title: string;
  /** What would change the outcome, where something would. Not encouragement. */
  hint?: string;
  /** One action, or two at most. */
  action?: React.ReactNode;
  /** Tighter padding for an empty state inside a panel rather than a page. */
  narrow?: boolean;
}

export function EmptyState({ title, hint, action, narrow = false }: EmptyStateProps) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-4)",
        textAlign: "center",
        paddingBlock: narrow ? "var(--space-16)" : "var(--space-24)",
        paddingInline: "var(--space-6)",
        border: "var(--border-width-thin) dashed var(--border-default)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <p style={{ font: "var(--type-h3)" }}>{title}</p>
      {hint ? (
        <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)", maxInlineSize: "var(--measure-tight)" }}>{hint}</p>
      ) : null}
      {action}
    </div>
  );
}
