import React from "react";

/* Product tile for the storefront and marketplace grids.
   `image` takes a real photograph URL; with none, a flat --bg-surface-sunken
   plate stands in (never a drawn illustration). Every colour resolves through a
   commerce token, so the tile is correct under both palettes and both schemes. */

const BADGE = {
  new: { background: "var(--commerce-badge-new-bg)", color: "var(--commerce-badge-new-text)", borderColor: "transparent" },
  sale: { background: "var(--commerce-badge-sale-bg)", color: "var(--commerce-badge-sale-text)", borderColor: "var(--commerce-badge-sale-border)" },
  lowstock: { background: "var(--commerce-badge-lowstock-bg)", color: "var(--commerce-badge-lowstock-text)", borderColor: "var(--commerce-badge-lowstock-border)" },
  soldout: { background: "var(--commerce-badge-soldout-bg)", color: "var(--commerce-badge-soldout-text)", borderColor: "var(--commerce-badge-soldout-border)" },
};

export function ProductCard({
  title,
  designer,
  price,
  compareAt,
  currency = "BDT",
  locale = "en",
  image,
  ratio = "3 / 4",
  badge,
  badgeTone = "new",
  sizes = [],
  rating,
  reviewCount,
  sku,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const loc = locale === "bn" ? "bn-BD" : "en-US";
  const fmt = (n) =>
    currency === "BDT" ? "৳" + Number(n).toLocaleString(loc) : new Intl.NumberFormat(loc, { style: "currency", currency }).format(n);
  const onSale = compareAt != null;

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", cursor: onClick ? "pointer" : "default", ...style }}
      {...rest}
    >
      <div style={{ position: "relative", aspectRatio: ratio, background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-media)", overflow: "hidden" }}>
        {image ? (
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hover ? "scale(1.03)" : "none", transition: "transform var(--duration-editorial) var(--motion-easing-standard)" }} />
        ) : null}
        {badge ? (
          <div style={{ position: "absolute", insetBlockStart: "var(--space-3)", insetInlineStart: "var(--space-3)", display: "inline-flex", alignItems: "center", height: 22, paddingInline: "var(--space-2)", borderStyle: "solid", borderWidth: "var(--border-width-thin)", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", ...BADGE[badgeTone] }}>
            {badge}
          </div>
        ) : null}
        {sizes.length && hover ? (
          <div style={{ position: "absolute", inset: "auto 0 0 0", display: "flex", gap: "var(--space-2)", justifyContent: "center", padding: "var(--space-3)", background: "linear-gradient(to top, var(--bg-canvas) 20%, transparent)" }}>
            {sizes.map((s) => (
              <span key={s} style={{ minWidth: 28, textAlign: "center", fontSize: "var(--text-2xs)", fontWeight: "var(--weight-medium)", letterSpacing: "var(--tracking-wide)", padding: "4px var(--space-2)", background: "var(--bg-surface)", border: "var(--border-width-thin) solid var(--border-control)" }}>{s}</span>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", fontSize: "var(--text-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--fg-secondary)" }}>
          {designer ? <span>{designer}</span> : <span />}
          {sku ? <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "var(--tracking-normal)" }}>{sku}</span> : null}
        </div>
        <span style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-snug)", textDecoration: hover ? "underline" : "none", textUnderlineOffset: 3 }}>{title}</span>
        <span style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", fontSize: "var(--text-base)", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ color: onSale ? "var(--commerce-price-sale)" : "var(--commerce-price)", fontWeight: onSale ? "var(--weight-medium)" : "var(--weight-regular)" }}>{fmt(price)}</span>
          {onSale ? <s style={{ color: "var(--commerce-price-original)", fontSize: "var(--text-ui)" }}>{fmt(compareAt)}</s> : null}
        </span>
        {rating != null ? (
          <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBlockStart: "var(--space-1)" }}>
            <span aria-hidden="true" style={{ position: "relative", width: 56, height: 3, background: "var(--commerce-rating-empty)" }}>
              <span style={{ position: "absolute", inset: "0 auto 0 0", width: (rating / 5) * 100 + "%", background: "var(--commerce-rating)" }} />
            </span>
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--fg-secondary)", fontVariantNumeric: "tabular-nums" }}>
              {rating.toFixed(1)}{reviewCount != null ? " · " + reviewCount : ""}
            </span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
