import * as React from "react";

/* Badge — status label. Order state, moderation state, stock.
 *
 * Text only, no icons. Status is carried by a Badge, never by an emoji
 * (readme.md: "No exclamation marks. No emoji anywhere").
 *
 * Never interactive, which is why it is the one control here exempt from the
 * 44px minimum: there is nothing to hit. If a status needs to be clickable it is
 * a Tag or a Button, not a Badge.
 *
 * Each feedback tone is three roles — text, background, border — because no
 * single value per tone is legible both as type on the canvas and as a fill.
 * That split is one of the adaptations recorded in the token contract.
 *
 * Server Component.
 */

export type BadgeTone =
  | "neutral" | "solid" | "outline" | "success" | "warning" | "danger" | "info";
export type BadgeSize = "sm" | "md";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-action-secondary-bg text-action-secondary-text border-transparent",
  solid: "bg-action-primary-bg text-action-primary-text border-action-primary-bg",
  outline: "bg-transparent text-fg-primary border-border-default",
  success: "bg-success-bg text-success-text border-success-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  danger: "bg-error-bg text-error-text border-error-border",
  info: "bg-info-bg text-info-text border-info-border",
};

const SIZE: Record<BadgeSize, string> = {
  sm: "h-(--badge-h-sm) text-2xs",
  md: "h-(--badge-h-md) text-xs",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Leading dot for a live state. Decorative — the text carries the meaning. */
  dot?: boolean;
  children?: React.ReactNode;
}

export function Badge({
  tone = "neutral",
  size = "md",
  dot = false,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const classes = [
    "inline-flex items-center gap-2 rounded-sm border px-2",
    "font-sans font-medium tracking-normal whitespace-nowrap",
    SIZE[size],
    TONE[tone],
    className,
  ].join(" ");

  return (
    <span className={classes} {...rest}>
      {dot ? (
        <span
          aria-hidden="true"
          className="flex-none rounded-full bg-current size-(--badge-dot)"
        />
      ) : null}
      {children}
    </span>
  );
}
