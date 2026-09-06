import * as React from "react";

/* IconButton — square, icon-only control.
 *
 * `label` is required and becomes the accessible name, because an icon-only
 * control has no other one. readme.md also requires a Tooltip on every
 * icon-only control; Tooltip is not built yet, so until it lands the label is
 * carrying the whole job and call sites should prefer a labelled Button where
 * space allows.
 *
 * Corrections to the reference:
 *
 * · `sm` (32px) and `md` (38px) are both under the 44px minimum. Rather than
 *   forbid them — they are the shipped design for dense toolbars and table row
 *   actions — this applies .void-touch-safe to them automatically, which
 *   expands the hit area to --touch-target-min without changing the visual size.
 *   The control is then UI-INV-3 compliant wherever it is used, instead of
 *   depending on the call site remembering.
 * · The reference's solid hover is the literal `oklch(0.30 0 0)`, which is the
 *   value --action-primary-hover already holds. It now resolves through the
 *   token, as UI-SRC-9 requires.
 * · Hover and press are CSS. Server Component.
 */

export type IconButtonVariant = "ghost" | "outline" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";

const SIZE: Record<IconButtonSize, string> = {
  sm: "size-(--icon-button-sm)",
  md: "size-(--icon-button-md)",
  lg: "size-(--icon-button-lg)",
};

/** Below the touch minimum, so the hit area is expanded rather than the box. */
const NEEDS_TOUCH_SAFE: Record<IconButtonSize, boolean> = { sm: true, md: true, lg: false };

const VARIANT: Record<IconButtonVariant, string> = {
  ghost:
    "border border-transparent bg-transparent text-fg-primary " +
    "hover:bg-action-tertiary-hover",
  outline:
    "border border-border-control bg-bg-canvas text-fg-primary " +
    "hover:border-border-strong hover:bg-action-tertiary-hover",
  solid:
    "border border-action-primary-bg bg-action-primary-bg text-action-primary-text " +
    "hover:border-action-primary-hover hover:bg-action-primary-hover",
};

/* The sticky selected state of a tool rail. aria-pressed carries the meaning;
   this is the visual that goes with it. */
const ACTIVE = "bg-action-tertiary-hover border-border-strong";

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  icon: React.ReactNode;
  /** Required accessible name — the control has no visible text. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Sticky selected state, as on the Studio tool rail. */
  active?: boolean;
  type?: "button" | "submit" | "reset";
}

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  active = false,
  disabled = false,
  type = "button",
  className = "",
  ...rest
}: IconButtonProps) {
  const classes = [
    "inline-flex items-center justify-center flex-none rounded-md",
    "transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
    "active:scale-[var(--press-scale)] active:duration-[var(--duration-instant)]",
    "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
    "disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
    SIZE[size],
    VARIANT[variant],
    active ? ACTIVE : "",
    NEEDS_TOUCH_SAFE[size] ? "void-touch-safe" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      className={classes}
      {...rest}
    >
      {icon}
    </button>
  );
}
