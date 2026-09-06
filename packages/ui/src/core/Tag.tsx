import * as React from "react";

/* Tag — pill-shaped filter or attribute chip. The interactive counterpart to Badge.
 *
 * Two corrections to the reference, both of which change the API:
 *
 * 1. The reference puts `onClick` on a <span>. That is not reachable by keyboard
 *    and not announced as a control — a filter that a keyboard or screen-reader
 *    user cannot operate. An interactive Tag here renders a real <a> or <button>.
 *
 * 2. Interaction is by href or form submission rather than a callback. On the
 *    storefront this is not merely a preference: FR-MKTS-4 requires the active
 *    market to be in the URL "in a crawlable way ... so that market-specific
 *    pages are independently indexable", and the catalogue is server rendered
 *    for exactly that. A filter chip that only works once JS has loaded cannot
 *    produce an indexable filtered listing. `href` also means the whole thing
 *    works with no client JS at all.
 *
 *    A callback-driven chip is still possible — wrap this in a client component
 *    — but it should not be the default the storefront reaches for.
 *
 * 28px is not a touch target, so an interactive Tag carries .void-touch-safe,
 * which expands the hit area to --touch-target-min without changing the pill
 * (UI-INV-3). The remove control gets its own.
 *
 * Server Component.
 */

const PILL = [
  "inline-flex items-center gap-2 flex-none",
  "h-(--tag-h) px-3 rounded-full border",
  "font-sans text-xs font-medium tracking-normal",
  // Fixed height, so the label must not wrap: under a squeeze it would spill out
  // of the pill rather than the pill growing. Chips truncate by dropping out of
  // the row, not by breaking their own shape.
  "whitespace-nowrap",
  "transition-[background-color,border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
].join(" ");

const REST = "border-border-default bg-transparent text-fg-primary";
const SELECTED = "border-action-primary-bg bg-action-primary-bg text-action-primary-text";
const HOVER = "hover:bg-action-secondary-bg";
const FOCUS = "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]";

export interface TagProps {
  children: React.ReactNode;
  /** Filled selected state. On a filter chip this means "currently applied". */
  selected?: boolean;
  /** Makes the whole pill a link. */
  href?: string;
  /** Shows the × affordance, as a link. */
  removeHref?: string;
  /** Shows the × as a form submit button — for a filter form without JS. */
  removeName?: string;
  removeValue?: string;
  /** Accessible name for the remove control. Name the thing being removed. */
  removeLabel?: string;
  className?: string;
}

export function Tag({
  children,
  selected = false,
  href,
  removeHref,
  removeName,
  removeValue,
  removeLabel,
  className = "",
}: TagProps) {
  const removable = Boolean(removeHref || removeName);
  const tone = selected ? SELECTED : REST;

  // A plain link chip is the pill itself. With a remove control it cannot be,
  // because an <a> inside an <a> is invalid — the two become siblings.
  if (href && !removable) {
    return (
      <a
        href={href}
        aria-current={selected ? "true" : undefined}
        className={[PILL, tone, HOVER, FOCUS, "void-touch-safe no-underline", className].join(" ")}
      >
        {children}
      </a>
    );
  }

  const remove = removable ? (
    removeHref ? (
      <a
        href={removeHref}
        aria-label={removeLabel ?? "Remove filter"}
        className={["inline-flex items-center justify-center flex-none", "no-underline void-touch-safe", FOCUS].join(" ")}
        style={{ color: "inherit", fontSize: "var(--text-sm)", lineHeight: "var(--leading-none)" }}
      >
        {/* One of the two intentional Unicode glyphs in the system, per
            readme.md — the other is the Select caret. Text-coloured, not an icon. */}
        <span aria-hidden="true">×</span>
      </a>
    ) : (
      <button
        type="submit"
        name={removeName}
        value={removeValue}
        aria-label={removeLabel ?? "Remove filter"}
        className={["inline-flex items-center justify-center flex-none void-touch-safe", FOCUS].join(" ")}
        style={{
          border: "none",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
          padding: 0,
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-none)",
        }}
      >
        <span aria-hidden="true">×</span>
      </button>
    )
  ) : null;

  return (
    <span className={[PILL, tone, className].join(" ")}>
      {href ? (
        <a
          href={href}
          aria-current={selected ? "true" : undefined}
          className={["no-underline void-touch-safe", FOCUS].join(" ")}
          style={{ color: "inherit" }}
        >
          {children}
        </a>
      ) : (
        children
      )}
      {remove}
    </span>
  );
}
