import * as React from "react";
import { Field, type FieldChrome, type FieldIdentity } from "./Field";

/* Input — text field and textarea, in Void's control shell.
 *
 * Departures from the reference, each for a stated reason:
 *
 * · Focus is `:focus-within` on the shell, not React state. The reference tracks
 *   focus with useState, which makes every text field a Client Component to draw
 *   a border. CSS already knows.
 * · The focus ring is never suppressed by the error state. The reference swaps
 *   the ring off when `error` is set, which leaves an invalid field with no
 *   visible focus indicator — UI-INV-2 requires one on every interactive
 *   element, and an invalid field is exactly where a keyboard user will be.
 * · Disabled is --opacity-disabled (0.45). The reference used 0.6 here, 0.5 in
 *   Checkbox and Switch, and 0.45 in Button; readme.md specifies 45%.
 * · The boundary is --border-control, which exists to clear 3:1 against the
 *   canvas. The reference used the --input alias, which resolves to the same
 *   token; naming it directly keeps component code on the semantic tier.
 */

type Size = "sm" | "md" | "lg";

const HEIGHT: Record<Size, string> = {
  sm: "var(--control-h-sm)",
  md: "var(--control-h-md)",
  lg: "var(--control-h-lg)",
};
const FONT: Record<Size, string> = {
  sm: "var(--text-sm)",
  md: "var(--text-base)",
  lg: "var(--text-md)",
};

export type InputProps = FieldChrome &
  FieldIdentity &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "size" | "required" | "disabled" | "prefix"> & {
    /** sm is 36px and is pointer-only. Never on storefront or checkout (UI-INV-3). */
    size?: Size;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    multiline?: boolean;
    rows?: number;
  };

export function Input({
  id,
  name,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  size = "md",
  prefix = null,
  suffix = null,
  multiline = false,
  rows = 3,
  className,
  style,
  ...rest
}: InputProps) {
  const shell = [
    "flex items-center gap-2",
    "bg-bg-canvas rounded-md border",
    error ? "border-error-border" : "border-border-control",
    "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
    // The ring is drawn whether or not the field is invalid.
    "focus-within:shadow-[var(--focus-ring)]",
    error ? "" : "focus-within:border-focus-ring-color",
    "has-[:disabled]:bg-bg-surface-sunken has-[:disabled]:cursor-not-allowed",
    multiline ? "p-3" : "px-3",
  ]
    .filter(Boolean)
    .join(" ");

  const controlStyle: React.CSSProperties = {
    flex: 1,
    minInlineSize: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: FONT[size],
    fontFamily: "var(--font-sans)",
    color: "var(--fg-primary)",
    blockSize: multiline ? undefined : HEIGHT[size],
    resize: multiline ? "vertical" : undefined,
    lineHeight: multiline ? "var(--leading-normal)" : undefined,
  };

  const affix: React.CSSProperties = {
    color: "var(--fg-secondary)",
    display: "inline-flex",
    flex: "none",
    fontSize: FONT[size],
  };

  return (
    <Field
      {...({ id, name } as FieldIdentity)}
      label={label}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      className={className}
      style={style}
    >
      {(aria) => (
        <div className={shell}>
          {prefix ? <span style={affix}>{prefix}</span> : null}
          {multiline ? (
            <textarea
              {...aria}
              name={name}
              rows={rows}
              required={required}
              style={controlStyle}
              {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input {...aria} name={name} required={required} style={controlStyle} {...rest} />
          )}
          {suffix ? <span style={affix}>{suffix}</span> : null}
        </div>
      )}
    </Field>
  );
}
