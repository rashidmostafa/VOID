import * as React from "react";

/* SideNav — persistent navigation for the vendor portal and admin back office.
 *
 * Four corrections to the reference:
 *
 * 1. Items are LINKS. The reference renders navigation as <button onClick>,
 *    which has no address: it cannot be middle-clicked, opened in a new tab,
 *    copied, bookmarked or restored on reload. For an operations surface people
 *    live in all day, that is a daily cost, and admin destinations are routes.
 * 2. aria-current="page" marks the active item. The reference marks it only
 *    visually, so a screen-reader user cannot tell where they are.
 * 3. Logical properties. The reference uses border-right and text-align: left,
 *    both of which are wrong in RTL (UI-INV-7, FR-I18N-12).
 * 4. 44px rows by default. The reference's 34px is under the minimum and
 *    navigation is NOT on readme.md's dense allowlist — that list names table
 *    toolbars, column config, bulk-action bars, saved views, list filters and
 *    inline row actions. `dense` keeps 34px available for the pointer-only
 *    portal chrome where the allowlist does apply.
 *
 *    Note that .void-touch-safe is deliberately NOT used here: these rows are
 *    full-width and stacked, so 44px hit areas around 34px rows would overlap
 *    and land clicks on the neighbour. The height has to be real.
 *
 * All items are --weight-medium, per readme.md ("500 for every heading and
 * control label"). The reference bolds only the active item, which reflows the
 * row on navigation.
 *
 * Server Component.
 */

export interface SideNavItem {
  href: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Trailing count — a queue depth, an unread total. */
  badge?: React.ReactNode;
}

export interface SideNavSection {
  title?: string;
  items: SideNavItem[];
}

export interface SideNavProps {
  sections: SideNavSection[];
  /** The href of the current route. */
  current: string;
  /** Wordmark row above the nav. */
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  /** Names the landmark. A page with several navs needs them distinguished. */
  label: string;
  /** 34px rows, pointer-only surfaces on the readme allowlist. */
  dense?: boolean;
}

export function SideNav({
  sections,
  current,
  brand,
  footer,
  label,
  dense = false,
}: SideNavProps) {
  return (
    <nav
      aria-label={label}
      style={{
        display: "flex",
        flexDirection: "column",
        inlineSize: "var(--sidebar-width)",
        flex: "none",
        blockSize: "100%",
        background: "var(--bg-sidebar)",
        color: "var(--fg-primary)",
        borderInlineEnd: "var(--border-width-thin) solid var(--border-default)",
      }}
    >
      {brand ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            blockSize: "var(--topbar-height)",
            flex: "none",
            paddingInline: "var(--space-4)",
            borderBlockEnd: "var(--border-width-thin) solid var(--border-default)",
          }}
        >
          {brand}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
          padding: "var(--space-4)",
          overflowY: "auto",
          flex: 1,
        }}
      >
        {sections.map((section, i) => (
          <div key={section.title ?? i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            {section.title ? (
              <h2
                style={{
                  font: "var(--type-label)",
                  fontSize: "var(--text-2xs)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-widest)",
                  color: "var(--fg-secondary)",
                  padding: "0 var(--space-2) var(--space-2)",
                }}
              >
                {section.title}
              </h2>
            ) : null}

            {section.items.map((item) => {
              const on = item.href === current;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 w-full no-underline",
                    dense ? "h-(--nav-item-h-dense)" : "min-h-(--nav-item-h)",
                    "px-2 rounded-md font-sans font-medium text-base",
                    "transition-[background-color,color] duration-[var(--duration-fast)] ease-standard",
                    "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
                    on
                      ? "bg-bg-surface-sunken text-fg-primary"
                      : "text-fg-primary hover:bg-bg-surface-sunken",
                  ].join(" ")}
                  style={{ textAlign: "start" }}
                >
                  {/* Icons never travel alone in navigation (readme.md): every
                      item pairs a glyph with a visible label, so the glyph is
                      decorative and the label carries the name. */}
                  {item.icon ? (
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-flex",
                        flex: "none",
                        color: on ? "var(--fg-primary)" : "var(--fg-secondary)",
                      }}
                    >
                      {item.icon}
                    </span>
                  ) : null}

                  <span style={{ flex: 1, minInlineSize: 0 }}>{item.label}</span>

                  {item.badge != null ? (
                    <span
                      style={{
                        font: "var(--type-label)",
                        fontSize: "var(--text-2xs)",
                        color: "var(--fg-secondary)",
                        fontVariantNumeric: "tabular-nums",
                        flex: "none",
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </div>
        ))}
      </div>

      {footer ? (
        <div
          style={{
            padding: "var(--space-4)",
            flex: "none",
            borderBlockStart: "var(--border-width-thin) solid var(--border-default)",
          }}
        >
          {footer}
        </div>
      ) : null}
    </nav>
  );
}
