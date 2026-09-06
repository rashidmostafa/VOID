import * as React from "react";
import { Field, type FieldChrome, type FieldIdentity } from "./Field";

/* Select — the native control in Void's shell.
 *
 * Native on purpose. A custom listbox is a large amount of client JS and a large
 * amount of keyboard and screen-reader surface to get wrong, and it loses the
 * platform picker that mobile users in the home market already know. Use it for
 * four or more mutually exclusive options; below that, Radio reads better.
 *
 * The caret is a text glyph, which readme.md names as one of exactly two
 * intentional Unicode exceptions in the system (the other is the dismiss ×). It
 * is aria-hidden and text-coloured, and it sits in a wrapper that suppresses the
 * platform arrow so the two do not both render.
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

export type SelectOption = string | { value: string; label: string };

export type SelectProps = FieldChrome &
  FieldIdentity &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id" | "name" | "size" | "required" | "disabled"> & {
    size?: Size;
    options?: SelectOption[];
    /** Leading empty option. With `required`, it is the unselected state. */
    placeholder?: string;
  };

export function Select({
  id,
  name,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  size = "md",
  options = [],
  placeholder,
  className,
  style,
  children,
  ...rest
}: SelectProps) {
  const shell = [
    "relative flex items-center",
    "bg-bg-canvas rounded-md border",
    error ? "border-error-border" : "border-border-control",
    "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
    "focus-within:shadow-[var(--focus-ring)]",
    error ? "" : "focus-within:border-focus-ring-color",
    "has-[:disabled]:bg-bg-surface-sunken has-[:disabled]:cursor-not-allowed",
  ]
    .filter(Boolean)
    .join(" ");

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
          <select
            {...aria}
            name={name}
            required={required}
            style={{
              appearance: "none",
              inlineSize: "100%",
              // A <select> takes its intrinsic minimum from its longest option,
              // which overflows a narrow container regardless of inline-size.
              // Caught at 320 under the placeholder set, whose wider system font
              // tips "United Arab Emirates" past the viewport.
              minInlineSize: 0,
              blockSize: HEIGHT[size],
              // Room for the caret, which sits in the inline-end padding.
              padding: "0 var(--space-8) 0 var(--space-3)",
              border: "none",
              outline: "none",
              background: "transparent",
              font: "var(--type-ui)",
              fontSize: FONT[size],
              color: "var(--fg-primary)",
              cursor: "pointer",
            }}
            {...rest}
          >
            {placeholder ? (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            ) : null}
            {options.map((o) => {
              const value = typeof o === "string" ? o : o.value;
              const text = typeof o === "string" ? o : o.label;
              return (
                <option key={value} value={value}>
                  {text}
                </option>
              );
            })}
            {children}
          </select>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              // Logical, so an RTL locale needs no rewrite (UI-INV-7).
              insetInlineEnd: "var(--space-3)",
              pointerEvents: "none",
              color: "var(--fg-secondary)",
              fontSize: "var(--text-2xs)",
            }}
          >
            ▾
          </span>
        </div>
      )}
    </Field>
  );
}
