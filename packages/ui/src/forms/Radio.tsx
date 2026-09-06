import * as React from "react";

/* Radio — single choice within a named group.
 *
 * Same construction as Checkbox: native input, visually hidden but focusable,
 * drawn control following its state through CSS. Server Component.
 *
 * `name` is required rather than optional. A radio without one is not in a
 * group, which means it can be selected and never deselected — a defect that
 * looks like a working control. The reference leaves it optional.
 */

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "name"> {
  /** Required: a radio outside a group cannot be deselected. */
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Pointer-only dense surfaces only. Pair with .void-touch-safe. */
  dense?: boolean;
}

export function Radio({
  name,
  label,
  description,
  dense = false,
  disabled = false,
  className = "",
  style,
  ...rest
}: RadioProps) {
  const ring = [
    "inline-flex items-center justify-center flex-none",
    "size-(--control-box) rounded-full border",
    "border-border-control bg-bg-canvas",
    "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
    "peer-checked:border-action-primary-bg peer-checked:[--on:1]",
    "peer-focus-visible:shadow-[var(--focus-ring)]",
    "peer-disabled:cursor-not-allowed",
  ].join(" ");

  return (
    <label
      className={className}
      style={{
        display: "inline-flex",
        alignItems: description ? "flex-start" : "center",
        gap: "var(--space-3)",
        minBlockSize: dense ? undefined : "var(--touch-target-min)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? "var(--opacity-disabled)" : undefined,
        ...style,
      }}
    >
      <input type="radio" name={name} className="peer void-visually-hidden" disabled={disabled} {...rest} />
      <span
        aria-hidden="true"
        className={ring}
        style={{ marginBlockStart: description ? "var(--space-05)" : undefined }}
      >
        {/* The dot is drawn always and revealed by the inherited --on, so the
            control does not reflow between states. */}
        <span
          style={{
            inlineSize: "var(--space-2)",
            blockSize: "var(--space-2)",
            borderRadius: "var(--radius-full)",
            background: "var(--action-primary-bg)",
            opacity: "var(--on, 0)",
            transition: "opacity var(--duration-fast) var(--motion-easing-standard)",
          }}
        />
      </span>

      {label ? (
        <span style={{ display: "flex", flexDirection: "column", gap: "var(--space-05)" }}>
          <span style={{ font: "var(--type-ui)" }}>{label}</span>
          {description ? (
            <span style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{description}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
}
