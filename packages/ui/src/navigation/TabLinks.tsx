import * as React from "react";

/* TabLinks — route-based sections that look like tabs.
 *
 * The visual twin of Tabs, and deliberately NOT the same component. When the
 * sections are routes — account → orders / addresses / designs, an admin
 * destination, a product detail's details / care / delivery if those are
 * addressable — the correct markup is a navigation landmark containing links,
 * with aria-current="page" on the active one.
 *
 * Using role="tab" for these is a real defect, not pedantry: it promises the
 * panel is already in the page and will be revealed, when the browser is about
 * to navigate. It also loses everything a link gives — middle-click, open in a
 * new tab, copy the address, and a URL that can be indexed and shared. The last
 * of those is a requirement here, not a nicety (FR-MKTS-4).
 *
 * Server Component: no state, no JS.
 */

export interface TabLinkItem {
  href: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabLinksProps {
  items: TabLinkItem[];
  /** The href of the current route. */
  current: string;
  variant?: "underline" | "segmented";
  size?: "sm" | "md";
  /** Names the navigation landmark. */
  label: string;
}

export function TabLinks({
  items,
  current,
  variant = "underline",
  size = "md",
  label,
}: TabLinksProps) {
  const segmented = variant === "segmented";

  return (
    <nav
      aria-label={label}
      className={
        segmented
          ? "inline-flex gap-(--space-05) p-(--space-05) bg-bg-surface-sunken rounded-md"
          : "flex gap-6 overflow-x-auto border-b border-border-default"
      }
    >
      {items.map((t) => {
        const on = t.href === current;
        return (
          <a
            key={t.href}
            href={t.href}
            // The one thing that tells a screen reader which section it is in.
            aria-current={on ? "page" : undefined}
            className={[
              "inline-flex items-center gap-2 flex-none whitespace-nowrap no-underline",
              "font-sans font-medium",
              size === "sm" ? "text-sm" : "text-base",
              "transition-[color,border-color,background-color] duration-[var(--duration-fast)] ease-standard",
              "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
              segmented
                ? [
                    // 28px is not a touch target. The pill keeps the design's
                    // height and expands its hit area to 44px instead; it is a
                    // single row, so no neighbour sits above or below to overlap.
                    "h-(--tab-segmented-h) px-3 rounded-sm border border-transparent void-touch-safe",
                    on ? "bg-bg-canvas text-fg-primary shadow-[var(--shadow-xs)]" : "text-fg-secondary",
                  ].join(" ")
                : [
                    "min-h-(--control-h-md) pb-3 border-b -mb-px",
                    on ? "border-fg-primary text-fg-primary" : "border-transparent text-fg-secondary",
                  ].join(" "),
            ].join(" ")}
          >
            {t.icon}
            {t.label}
            {t.count != null ? (
              <span
                style={{
                  font: "var(--type-label)",
                  fontSize: "var(--text-2xs)",
                  color: "var(--fg-secondary)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t.count}
              </span>
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
