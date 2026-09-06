"use client";

import * as React from "react";

/* Tabs — in-page view switch, implementing the ARIA tabs pattern properly.
 *
 * IMPORTANT: this is for switching PANELS WITHIN A PAGE. If the "tabs" navigate
 * between routes — admin destinations, account sections — use TabLinks instead.
 * Marking navigation links as role="tab" is a common and damaging mistake: it
 * tells assistive tech the content is already present and will be revealed,
 * when in fact the page is about to change.
 *
 * What the reference is missing, and why each matters:
 *
 * · No role="tablist" on the container. role="tab" outside a tablist is invalid
 *   and the grouping is lost.
 * · No aria-controls / aria-labelledby, and no panels at all — nothing connects
 *   a tab to what it controls.
 * · No roving tabindex and no arrow keys. Every tab is a tab stop, which is the
 *   wrong keyboard model: the pattern is one stop for the whole tablist, then
 *   Left/Right (Home/End) between tabs.
 * · font-weight changes between states, so the row reflows when you switch. All
 *   tabs are --weight-medium here, which is also what readme.md specifies for
 *   "every heading and control label"; the active tab is marked by the underline
 *   or the segmented pill, not by getting wider.
 */

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Trailing count — open orders, items in a queue. */
  count?: number;
}

export interface TabsProps {
  items: Array<string | TabItem>;
  value: string;
  onChange: (value: string) => void;
  /** Underline for page-level sections; segmented for filters inside a panel. */
  variant?: "underline" | "segmented";
  size?: "sm" | "md";
  /** Names the tablist. Two tablists on a page are otherwise indistinguishable. */
  label: string;
  /** Prefix for the generated tab/panel ids, so TabPanel can match them. */
  idPrefix: string;
}

const normalise = (raw: string | TabItem): TabItem =>
  typeof raw === "string" ? { value: raw, label: raw } : raw;

export const tabId = (prefix: string, value: string) => `${prefix}-tab-${value}`;
export const panelId = (prefix: string, value: string) => `${prefix}-panel-${value}`;

export function Tabs({
  items,
  value,
  onChange,
  variant = "underline",
  size = "md",
  label,
  idPrefix,
}: TabsProps) {
  const tabs = items.map(normalise);
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const move = (delta: number) => {
    const i = tabs.findIndex((t) => t.value === value);
    // Wraps, as the pattern expects.
    const next = (i + delta + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      // Logical, not physical: in RTL the visual order reverses, and the arrow
      // that moves "forward" reverses with it.
      case "ArrowRight":
        e.preventDefault();
        move(document.dir === "rtl" ? -1 : 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        move(document.dir === "rtl" ? 1 : -1);
        break;
      case "Home":
        e.preventDefault();
        onChange(tabs[0].value);
        refs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        onChange(tabs[tabs.length - 1].value);
        refs.current[tabs.length - 1]?.focus();
        break;
    }
  };

  const segmented = variant === "segmented";

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={
        segmented
          ? "inline-flex gap-(--space-05) p-(--space-05) bg-bg-surface-sunken rounded-md"
          : // Scrolls rather than wrapping at 320: the clipped trailing label is
            // the affordance that there is more.
            "flex gap-6 overflow-x-auto border-b border-border-default"
      }
    >
      {tabs.map((t, i) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, t.value)}
            aria-selected={on}
            aria-controls={panelId(idPrefix, t.value)}
            // Roving tabindex: the tablist is one stop.
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.value)}
            className={[
              "inline-flex items-center gap-2 flex-none whitespace-nowrap cursor-pointer",
              "font-sans font-medium bg-transparent",
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
                    // The underline variant is a storefront surface, so the
                    // height is real rather than an expanded hit area: these sit
                    // in a row where an overlapping target would land on the
                    // wrong tab. 39px measured before this.
                    "min-h-(--control-h-md) pb-3 border-b",
                    // -1px pulls the tab's rule onto the tablist's, so the two
                    // read as one line rather than stacking.
                    "-mb-px",
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
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps {
  idPrefix: string;
  value: string;
  /** The currently selected tab. The panel renders only when it matches. */
  selected: string;
  children: React.ReactNode;
}

export function TabPanel({ idPrefix, value, selected, children }: TabPanelProps) {
  const on = value === selected;
  return (
    <div
      role="tabpanel"
      id={panelId(idPrefix, value)}
      aria-labelledby={tabId(idPrefix, value)}
      hidden={!on}
      // The panel itself is focusable so that Tab out of the tablist lands on
      // the content it just revealed, which is where the reader expects to be.
      tabIndex={on ? 0 : -1}
      style={{ paddingBlockStart: "var(--space-5)" }}
    >
      {on ? children : null}
    </div>
  );
}
