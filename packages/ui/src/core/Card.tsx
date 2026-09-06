import * as React from "react";

/* Card — hairline surface container. Elevation is opt-in; the default is
 * border-only, because a hairline is always the first choice over a shadow and
 * cards in a grid carry no shadow at all.
 *
 * Correction to the reference: its hover added --shadow-sm. readme.md is
 * explicit that hover is "no lift, no shadow growth" — values shift one step and
 * borders go to --line-strong, and that is all. So `interactive` moves the
 * border and nothing else.
 *
 * `interactive` is a visual affordance only. It does not make the card operable:
 * a clickable card must contain a real link or button, so that the target has a
 * name, a focus ring and keyboard activation. A div with a click handler has
 * none of those. Keeping the affordance and the mechanism separate is what stops
 * the card becoming an inaccessible button.
 *
 * Server Component.
 */

export type CardPadding = "none" | "sm" | "md" | "lg";

const PADDING: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-8",
};

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  padding?: CardPadding;
  /** --shadow-md, for a panel that genuinely floats. Not for a card in a grid. */
  elevated?: boolean;
  /** Hover response on the border. Does not make the card operable — see above. */
  interactive?: boolean;
  as?: "div" | "section" | "article" | "li" | "aside";
  children?: React.ReactNode;
}

export function Card({
  padding = "md",
  elevated = false,
  interactive = false,
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: CardProps) {
  const classes = [
    "bg-bg-surface text-fg-primary rounded-lg border border-border-default",
    PADDING[padding],
    elevated ? "shadow-[var(--shadow-md)]" : "",
    interactive
      ? "transition-[border-color] duration-[var(--duration-fast)] ease-standard hover:border-border-strong"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export interface CardHeaderProps {
  title: React.ReactNode;
  /** Secondary line — a date, a count, a status. */
  meta?: React.ReactNode;
  action?: React.ReactNode;
  /** Heading level. A card in a list is usually h3; pick what the outline needs. */
  as?: "h2" | "h3" | "h4" | "p";
  className?: string;
}

export function CardHeader({
  title,
  meta,
  action,
  as: Heading = "h3",
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", minInlineSize: 0 }}>
        {/* A real heading, so the card is reachable in a document outline
            rather than being a visually-bold div. */}
        <Heading style={{ font: "var(--type-h3)", fontSize: "var(--text-md)" }}>{title}</Heading>
        {meta ? (
          <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{meta}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
