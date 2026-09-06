import * as React from "react";

/* Checkbox — native input, Void's box.
 *
 * The native input is visually hidden but still focusable and still the thing
 * assistive technology reads; the drawn box follows its state through CSS, so
 * this is a Server Component with no client JS.
 *
 * Three corrections to the reference:
 *
 * · The effective target is 44px (UI-INV-3). The reference draws a 16px box
 *   inside a label that is only as tall as its content — an unlabelled checkbox
 *   was a 16px target. The box stays 16px; the label row carries the minimum.
 *   Dense pointer-only surfaces opt out with `dense`, which is the allowlist in
 *   readme.md, and must pair it with .void-touch-safe.
 * · Focus is visible on the drawn box. The reference hides the input with
 *   width/height 0 and draws no focus state at all, so a keyboard user cannot
 *   see where they are — UI-INV-2 requires an indicator on every interactive
 *   element.
 * · Disabled is --opacity-disabled (0.45), per readme.md. The reference used 0.5.
 *
 * The checked/indeterminate visuals are driven by a custom property the box sets
 * under `peer-checked`, which the glyphs inherit — Tailwind's peer variant
 * reaches siblings, and the glyphs are descendants of one.
 */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  /** Secondary line under the label. */
  description?: React.ReactNode;
  /** Mixed state — a partial selection, as in a table header. */
  indeterminate?: boolean;
  /** Pointer-only dense surfaces only. Pair with .void-touch-safe. */
  dense?: boolean;
}

export function Checkbox({
  label,
  description,
  indeterminate = false,
  dense = false,
  disabled = false,
  className = "",
  style,
  ...rest
}: CheckboxProps) {
  const box = [
    "inline-flex items-center justify-center flex-none",
    "size-(--control-box) rounded-sm border",
    "border-border-control bg-bg-canvas text-action-primary-text",
    "transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
    // Checked and mixed both read as "on": filled box, primary ground.
    "peer-checked:bg-action-primary-bg peer-checked:border-action-primary-bg peer-checked:[--on:1]",
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
      <input
        type="checkbox"
        className="peer void-visually-hidden"
        disabled={disabled}
        aria-checked={indeterminate ? "mixed" : undefined}
        {...rest}
      />
      <span
        aria-hidden="true"
        className={box}
        data-indeterminate={indeterminate || undefined}
        style={{
          marginBlockStart: description ? "var(--space-05)" : undefined,
          ...(indeterminate
            ? {
                background: "var(--action-primary-bg)",
                borderColor: "var(--action-primary-bg)",
                ["--on" as string]: 1,
              }
            : null),
        }}
      >
        {indeterminate ? (
          <span
            style={{
              inlineSize: "var(--space-2)",
              blockSize: "var(--border-width-medium)",
              background: "currentColor",
              opacity: "var(--on, 0)",
            }}
          />
        ) : (
          <svg
            viewBox="0 0 10 10"
            fill="none"
            style={{
              inlineSize: "var(--check-glyph)",
              blockSize: "var(--check-glyph)",
              opacity: "var(--on, 0)",
              strokeWidth: "var(--stroke-icon)",
            }}
          >
            <path
              d="M1.5 5.2 3.8 7.5 8.5 2.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
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
