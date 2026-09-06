import * as React from "react";
import { formatMoney, type Market, type Money } from "@void/market";

/* ProductCard — the storefront and marketplace grid tile.
 *
 * Corrections to the reference:
 *
 * · Price is `Money` and is formatted by @void/market. The reference takes a
 *   bare number and builds BDT as `"৳" + toLocaleString()`, which is the string
 *   concatenation UI-GLOB-9 exists to forbid — it produces the right answer for
 *   en and the wrong one for bn-BD, where CLDR trails the symbol and groups at
 *   lakh scale. Formatting lives in one tested place, not in a tile.
 * · The tile is a LINK, not an <article onClick>. A click handler on an article
 *   is not focusable, not announced as a control, and has no address — and a
 *   catalogue that cannot be crawled cannot produce the indexable
 *   market-filtered listings FR-MKTS-4 requires.
 * · The size peek appears on focus as well as hover. Hover-only is unreachable
 *   by keyboard and does not exist on touch, which is most of the home market.
 * · Hover is CSS. Server Component.
 *
 * UI-PLP-7: the media plate reserves its aspect ratio before load, so the grid
 * does not reflow when photographs arrive and CLS stays inside its budget.
 * Product imagery is never rounded — --radius-media is 0 deliberately.
 */

export type BadgeTone = "new" | "sale" | "lowstock" | "soldout";

const BADGE: Record<BadgeTone, React.CSSProperties> = {
  new: {
    background: "var(--commerce-badge-new-bg)",
    color: "var(--commerce-badge-new-text)",
    borderColor: "transparent",
  },
  sale: {
    background: "var(--commerce-badge-sale-bg)",
    color: "var(--commerce-badge-sale-text)",
    borderColor: "var(--commerce-badge-sale-border)",
  },
  lowstock: {
    background: "var(--commerce-badge-lowstock-bg)",
    color: "var(--commerce-badge-lowstock-text)",
    borderColor: "var(--commerce-badge-lowstock-border)",
  },
  soldout: {
    background: "var(--commerce-badge-soldout-bg)",
    color: "var(--commerce-badge-soldout-text)",
    borderColor: "var(--commerce-badge-soldout-border)",
  },
};

export interface ProductCardProps {
  href: string;
  title: string;
  /** Designer or vendor, as the uppercase eyebrow. */
  designer?: string;
  price: Money;
  /** Struck-through original. The badge and the strike carry the discount. */
  compareAt?: Money;
  market: Market;
  locale: string;
  /** Photograph. With none, a flat plate stands in — never an illustration. */
  image?: string;
  ratio?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  /** Sizes revealed on hover or focus. Not a substitute for the detail page. */
  sizes?: string[];
  rating?: number;
  reviewCount?: number;
  sku?: string;
  /** Accessible label for the rating, already localised by the caller. */
  ratingLabel?: string;
}

export function ProductCard({
  href,
  title,
  designer,
  price,
  compareAt,
  market,
  locale,
  image,
  ratio = "3 / 4",
  badge,
  badgeTone = "new",
  sizes = [],
  rating,
  reviewCount,
  sku,
  ratingLabel,
}: ProductCardProps) {
  const onSale = compareAt !== undefined;

  return (
    <article
      className="void-tile"
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", position: "relative" }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: ratio,
          background: "var(--bg-surface-sunken)",
          borderRadius: "var(--radius-media)",
          overflow: "hidden",
        }}
      >
        {image ? (
          <img
            src={image}
            // Decorative: the title beside it is the link's accessible name, so
            // describing the image again would announce the product twice.
            alt=""
            className="void-tile__media"
            style={{ inlineSize: "100%", blockSize: "100%", objectFit: "cover" }}
          />
        ) : null}

        {badge ? (
          <p
            style={{
              position: "absolute",
              insetBlockStart: "var(--space-3)",
              insetInlineStart: "var(--space-3)",
              display: "inline-flex",
              alignItems: "center",
              blockSize: "var(--commerce-badge-h)",
              paddingInline: "var(--space-2)",
              borderStyle: "solid",
              borderWidth: "var(--border-width-thin)",
              font: "var(--type-label)",
              fontSize: "var(--text-2xs)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              ...BADGE[badgeTone],
            }}
          >
            {badge}
          </p>
        ) : null}

        {sizes.length ? (
          <div
            className="void-tile__sizes"
            style={{
              position: "absolute",
              insetInline: 0,
              insetBlockEnd: 0,
              display: "flex",
              gap: "var(--space-2)",
              justifyContent: "center",
              flexWrap: "wrap",
              padding: "var(--space-3)",
              // The one gradient in the system besides the wash under text on
              // full-bleed imagery: a protection wash so the chips stay legible.
              background: "linear-gradient(to top, var(--bg-canvas) 20%, transparent)",
            }}
          >
            {sizes.map((s) => (
              <span
                key={s}
                style={{
                  minInlineSize: "var(--size-chip-min)",
                  textAlign: "center",
                  font: "var(--type-label)",
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--tracking-wide)",
                  padding: "var(--space-1) var(--space-2)",
                  background: "var(--bg-surface)",
                  border: "var(--border-width-thin) solid var(--border-control)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <p
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "var(--space-3)",
            font: "var(--type-label)",
            fontSize: "var(--text-2xs)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-widest)",
            color: "var(--fg-secondary)",
          }}
        >
          <span>{designer}</span>
          {sku ? (
            <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "var(--tracking-normal)" }}>{sku}</span>
          ) : null}
        </p>

        {/* The link covers the whole tile through ::after, so the target is the
            card while the accessible name stays just the product. */}
        <a href={href} className="void-tile__link" style={{ color: "inherit", textDecoration: "none" }}>
          <span style={{ font: "var(--type-ui)", lineHeight: "var(--leading-snug)" }}>{title}</span>
        </a>

        <p
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "var(--space-2)",
            font: "var(--type-ui)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span
            style={{
              color: onSale ? "var(--commerce-price-sale)" : "var(--commerce-price)",
              fontWeight: onSale ? "var(--weight-medium)" : "var(--weight-regular)",
            }}
          >
            {formatMoney(price, market, locale)}
          </span>
          {compareAt ? (
            <s style={{ color: "var(--commerce-price-original)", fontSize: "var(--text-ui)" }}>
              {formatMoney(compareAt, market, locale)}
            </s>
          ) : null}
        </p>

        {rating != null ? (
          <p style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBlockStart: "var(--space-1)" }}>
            <span
              aria-hidden="true"
              style={{
                position: "relative",
                inlineSize: "var(--rating-bar-w)",
                blockSize: "var(--rating-bar-h)",
                background: "var(--commerce-rating-empty)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  insetBlock: 0,
                  insetInlineStart: 0,
                  inlineSize: `${(rating / 5) * 100}%`,
                  background: "var(--commerce-rating)",
                }}
              />
            </span>
            {/* The number is the accessible value; the bar is decoration. That
                also means ADR-0009's contrast failure on the bar does not hide
                the rating from anyone — but it is still a defect to fix. */}
            <span
              style={{ font: "var(--type-label)", fontSize: "var(--text-2xs)", color: "var(--fg-secondary)", fontVariantNumeric: "tabular-nums" }}
            >
              {ratingLabel ?? rating.toFixed(1)}
              {reviewCount != null ? ` · ${reviewCount}` : ""}
            </span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
