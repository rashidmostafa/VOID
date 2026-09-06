import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatMoney, marketByCode, marketPath } from "@void/market";
import { ProductCard } from "@void/ui/commerce/ProductCard";
import { Tag } from "@void/ui/core/Tag";
import { Button } from "@void/ui/core/Button";
import { AsyncSurface, type AsyncState } from "@void/ui/state/AsyncSurface";
import { Skeleton, SkeletonMedia } from "@void/ui/state/Skeleton";
import { MarketBar } from "../../MarketBar";
import {
  ALL_SIZES,
  CATALOGUE,
  PRICE_BANDS,
  applyFilters,
  availableInMarket,
  displayPrice,
  type Piece,
} from "../../../../../lib/catalogue";

/* Product listing — UI-PLP-1..7.
 *
 * Filters are URL state, not component state. That is not a stylistic
 * preference: FR-MKTS-4 requires market-specific pages to be independently
 * indexable and shareable, UI-PLP-6 requires applied filters to be restored on
 * return from a product page, and UI-GLOB-4 requires entered state to survive
 * back navigation. A URL gives all three for free and works with no client JS;
 * component state gives none of them.
 *
 * The four states of UI-GLOB-1 all route through AsyncSurface, so none can be
 * omitted — each is a required prop. `state` is derived here from the fixture;
 * when the catalogue module exists it comes from the query instead and nothing
 * else on this page changes.
 */

export function generateStaticParams() {
  return [{ slug: "new-in" }];
}

export default async function Listing({
  params,
  searchParams,
}: {
  params: Promise<{ market: string; locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { market: code, locale, slug } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations();
  const market = marketByCode(code);
  if (!market) notFound();

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const size = one(sp.size);
  const band = one(sp.band);
  // `state` is a fixture affordance so all four branches are reachable and
  // reviewable; a real listing derives it from the query result.
  const forced = one(sp.state);

  const now = new Date().toISOString();
  /* A piece we cannot price cannot be offered. displayPrice returns null when no
     FX rate exists for this market, and showing a tile with no price — or with a
     taka figure under a foreign label — would be a false listing (UI-INV-11). */
  const inMarket = availableInMarket(CATALOGUE, market).filter(
    (piece) => displayPrice(piece.priceBdt, market, now) !== null
  );
  const filtered = applyFilters(inMarket, { size, band });

  const here = `/c/${slug}`;
  const qs = (next: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ size, band, ...next })) if (v) q.set(k, v);
    const s = q.toString();
    return marketPath(code, locale, here) + (s ? `?${s}` : "");
  };

  const state: AsyncState<Piece[]> =
    forced === "loading"
      ? { status: "loading" }
      : forced === "error"
        ? { status: "error", diagnostic: "req_8f21c4 · CATALOGUE_UNAVAILABLE" }
        : filtered.length === 0
          ? { status: "empty" }
          : { status: "ready", data: filtered };

  return (
    <main
      style={{
        maxInlineSize: "var(--layout-max-editorial)",
        marginInline: "auto",
        paddingInline: "var(--space-6)",
        paddingBlock: "var(--space-6)",
      }}
    >
      <MarketBar market={code} locale={locale} path={here} />

      <header style={{ paddingBlock: "var(--space-8) var(--space-6)" }}>
        <h1 style={{ font: "var(--type-h1)" }}>{t("listing.title")}</h1>
        <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", marginBlockStart: "var(--space-2)" }}>
          {t("listing.resultCount", { count: filtered.length })}
        </p>
      </header>

      <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* UI-PLP-4: a persistent sidebar on desktop. At 320 it wraps above the
            grid; the bottom-sheet treatment is a client concern and comes with
            the mobile pass. Every control here is a link, so filtering works
            with no JS and each combination is a real address. */}
        <aside
          aria-label={t("listing.filters")}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
            flex: "1 1 auto",
            minInlineSize: 0,
            maxInlineSize: "var(--measure-tight)",
          }}
        >
          <FilterGroup title={t("product.sizeLabel")}>
            {ALL_SIZES.map((s) => (
              <Tag key={s} href={qs({ size: size === s ? undefined : s })} selected={size === s}>
                {s}
              </Tag>
            ))}
          </FilterGroup>

          <FilterGroup title={t("listing.priceLabel")}>
            {PRICE_BANDS.map((b) => {
              // The boundary is an amount; the label is formatted for this
              // market and locale, never written into the copy.
              const fmt = (minor: number) => formatMoney(displayPrice(minor, market, now)!, market, locale);
              const label =
                b.kind === "under"
                  ? t("listing.bands.under", { price: fmt(b.max!) })
                  : b.kind === "over"
                    ? t("listing.bands.over", { price: fmt(b.min!) })
                    : t("listing.bands.between", { min: fmt(b.min!), max: fmt(b.max!) });
              return (
                <Tag key={b.id} href={qs({ band: band === b.id ? undefined : b.id })} selected={band === b.id}>
                  {label}
                </Tag>
              );
            })}
          </FilterGroup>

          {(size || band) ? (
            <p>
              <Button as="a" href={marketPath(code, locale, here)} variant="outline" size="md">
                {t("listing.clearFilters")}
              </Button>
            </p>
          ) : null}
        </aside>

        <div style={{ flex: "999 1 60%", minInlineSize: 0 }}>
          <AsyncSurface
            state={state}
            label={t("listing.loadingLabel")}
            skeleton={<Grid>{Array.from({ length: 6 }, (_, i) => <TileSkeleton key={i} />)}</Grid>}
            empty={{
              title: t("listing.empty.title"),
              hint: t("listing.empty.hint", { count: inMarket.length }),
              action: (
                <Button as="a" href={marketPath(code, locale, here)} variant="outline">
                  {t("listing.clearFilters")}
                </Button>
              ),
            }}
            error={{
              title: t("listing.error.title"),
              body: t("listing.error.body"),
              retry: (
                <Button as="a" href={qs({})} variant="primary">
                  {t("common.retry")}
                </Button>
              ),
            }}
          >
            {(pieces) => (
              <Grid>
                {pieces.map((p) => (
                  <ProductCard
                    key={p.slug}
                    href={marketPath(code, locale, `/p/${p.slug}`)}
                    title={p.title}
                    designer={p.designer}
                    sku={p.sku}
                    price={displayPrice(p.priceBdt, market, now)!}
                    compareAt={p.compareAtBdt ? displayPrice(p.compareAtBdt, market, now)! : undefined}
                    market={market}
                    locale={locale}
                    sizes={p.sizes}
                    rating={p.rating}
                    reviewCount={p.reviewCount}
                    badge={p.badge?.label}
                    badgeTone={p.badge?.tone}
                    ratingLabel={p.rating?.toFixed(1)}
                  />
                ))}
              </Grid>
            )}
          </AsyncSurface>
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <h2
        style={{
          font: "var(--type-label)",
          fontSize: "var(--text-2xs)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-widest)",
          color: "var(--fg-secondary)",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

/* §9.4 fixes the behaviour at each tier: one column at XS, two at SM/MD, three
   or four at LG, four at XL. auto-fill against a token-derived minimum gets that
   without a media query per tier. */
function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--space-5)",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, var(--measure-tight)), 1fr))",
      }}
    >
      {children}
    </div>
  );
}

/* UI-GLOB-1: the skeleton mirrors the real tile, so nothing reflows when the
   data lands. Same plate ratio, same three text rows. */
function TileSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <SkeletonMedia />
      <Skeleton width="40%" />
      <Skeleton width="75%" />
      <Skeleton width="30%" />
    </div>
  );
}
