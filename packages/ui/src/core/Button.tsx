import * as React from "react";

/* Button — rebuilt from design-system/components/core/Button.jsx.
 *
 * Two deliberate departures from the reference, both required by the stack
 * rather than by taste:
 *
 * 1. Hover and press are CSS pseudo-classes, not React state. The reference
 *    tracks them with useState because it renders inside a browser harness. In
 *    the App Router that would make every button a Client Component and ship JS
 *    for a colour change — against the LCP/CLS budgets the catalogue is server
 *    rendered for. This Button is a Server Component with no client JS.
 *
 * 2. Values come from Tailwind utilities bound to tokens, not inline styles, so
 *    :hover/:active/:disabled can be expressed at all. The utilities emit
 *    var(--token) because the theme is mapped with `@theme inline`, so a runtime
 *    theme swap still reaches them (UI-SRC-10).
 *
 * Every literal in the reference now resolves through a token; the six that had
 * no token were added to the contract with their shipped values preserved.
 */

export type ButtonVariant =
  | "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

/* UI-INV-6: the control must tolerate 40% text expansion without truncation,
   overlap or clipping. A FIXED height with whitespace-nowrap — which is what the
   reference does — is exactly the shape that fails it: a long or translated
   label overflows the viewport rather than wrapping. So the height is a MINIMUM
   and the label may wrap. A single-line button is unchanged at 44px, because the
   line box plus block padding is smaller than the minimum; a wrapped one grows.
   `max-w-full` keeps it inside its container at 320. Caught by the theme-swap
   gate at 320, not by review. */
const BASE = [
  "inline-flex items-center justify-center text-center",
  "font-sans font-medium tracking-tight leading-none",
  "rounded-md max-w-full",
  "transition-[background-color,color,border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
  "active:scale-[var(--press-scale)] active:duration-[var(--duration-instant)]",
  "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
  "disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed",
  "aria-busy:opacity-[var(--opacity-disabled)] aria-busy:cursor-not-allowed",
].join(" ");

/* sm is 36px and is NOT a touch size. It is allowlisted to the pointer-only
   surfaces named in readme.md, and only with .void-touch-safe expanding the hit
   area to 44px. Storefront and checkout are md or lg, always. */
const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-(--control-h-sm) px-(--control-pad-x-sm) py-2 text-sm gap-2",
  md: "min-h-(--control-h-md) px-(--control-pad-x-md) py-2 text-base gap-2",
  lg: "min-h-(--control-h-lg) px-(--control-pad-x-lg) py-2 text-md gap-3",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border border-action-primary-bg bg-action-primary-bg text-action-primary-text " +
    "hover:border-action-primary-hover hover:bg-action-primary-hover",
  secondary:
    "border border-action-secondary-bg bg-action-secondary-bg text-action-secondary-text " +
    "hover:border-action-secondary-hover hover:bg-action-secondary-hover",
  outline:
    "border border-border-control bg-transparent text-fg-primary " +
    "hover:border-fg-primary hover:bg-action-tertiary-hover",
  ghost:
    "border border-transparent bg-transparent text-action-tertiary-text " +
    "hover:bg-action-tertiary-hover",
  destructive:
    "border border-action-danger-bg bg-action-danger-bg text-action-danger-text " +
    "hover:border-action-danger-hover hover:bg-action-danger-hover",
  // A link-style button is still a target: it keeps the 44px minimum (UI-INV-3).
  link:
    "border border-transparent bg-transparent text-fg-link rounded-none p-0 " +
    "min-h-(--touch-target-min) underline underline-offset-(--underline-offset) " +
    "hover:text-fg-link-hover hover:decoration-[length:var(--border-width-medium)]",
  accent:
    "border border-action-accent-bg bg-action-accent-bg text-action-accent-text " +
    "hover:border-action-accent-hover hover:bg-action-accent-hover",
};

type Base = React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export interface ButtonProps extends Omit<Base, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  as?: "button" | "a";
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  as = "button",
  href,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const inactive = disabled || loading;
  const Tag = (as === "a" || href ? "a" : "button") as "button" | "a";

  const classes = [
    BASE,
    SIZES[size] ?? SIZES.md,
    VARIANTS[variant] ?? VARIANTS.primary,
    block ? "flex w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={classes}
      type={Tag === "button" ? type : undefined}
      href={Tag === "a" ? href : undefined}
      disabled={Tag === "button" ? inactive : undefined}
      aria-busy={loading || undefined}
      aria-disabled={Tag === "a" && inactive ? true : undefined}
      {...rest}
    >
      {loading ? <Spinner /> : iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}

/* The keyframes live in the theme's base layer so the central
   prefers-reduced-motion rule reaches them (UI-INV-8). A component that ships
   its own <style> block escapes that rule. */
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className={
        "size-(--spinner-size) shrink-0 rounded-full border-(length:--stroke-icon) " +
        "border-current border-t-transparent animate-[void-spin_var(--duration-spin)_linear_infinite]"
      }
    />
  );
}
