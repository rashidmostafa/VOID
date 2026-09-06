import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  formatMoney,
  marketByCode,
  marketPath,
  servableMarkets,
  type Market,
} from "@void/market";
import { Button } from "@void/ui/core/Button";
import { Badge } from "@void/ui/core/Badge";
import { Tag } from "@void/ui/core/Tag";
import { Icon } from "@void/ui/core/Icon";
import { MarketBar } from "../../MarketBar";
import {
  CATALOGUE,
  displayPrice,
  inStock,
  marketsOffering,
  pieceBySlug,
  type Piece,
} from "../../../../../lib/catalogue";

/* Product detail — UI-PDP-1..9.
 *
 * Size selection is URL state, like the listing's filters: a chosen size is a
 * shareable address, survives back navigation (UI-GLOB-4), and needs no client
 * JS. Everything on this page server-renders.
 *
 * Deferred, and named rather than faked:
 *   · UI-PDP-2 gallery zoom — needs photography, and there is none.
 *   · UI-PDP-3 the size guide's fit recommendation (FR-CAT-5) and market size
 *     system (FR-I18N-15) need the size-chart data of FR-CAT-10.
 *   · UI-PDP-7's back-in-stock subscription needs the notification module; the
 *     control is present and honest about not being wired.
 *   · UI-PDP-1's sticky mobile add-to-cart bar needs a scroll observer.
 * Each is a real gap, not a rendering choice, and none is papered over.
 */

export function generateStaticParams() {
  return CATALOGUE.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetail({
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
  const piece = pieceBySlug(slug);
  if (!market || !piece) notFound();

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const sizes = Object.keys(piece.stock);
  const requested = one(sp.size);
  const size = requested && sizes.includes(requested) ? requested : undefined;
  const here = `/p/${slug}`;

  /* UI-PDP-9: an item unavailable in the active market says so and offers the
     markets where it can be bought — it does not 404. A 404 tells a shopper the
     piece does not exist, when it exists and is simply not sold to them here. */
  if (!piece.availableIn.includes(market.code)) {
    const elsewhere = marketsOffering(piece, servableMarkets().map((m) => m.code));
    return (
      <Page market={code} locale={locale} path={here}>
        <div style={{ paddingBlockStart: "var(--space-10)", maxInlineSize: "var(--measure-default)" }}>
          <h1 style={{ font: "var(--type-h2)" }}>{t("product.unavailable.title", { market: market.name })}</h1>
          <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)", marginBlockStart: "var(--space-3)" }}>
            {elsewhere.length ? t("product.unavailable.body") : t("product.unavailable.none")}
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBlockStart: "var(--space-5)" }}>
            {elsewhere.map((c) => {
              const m = marketByCode(c)!;
              return (
                <Tag key={c} href={marketPath(c, m.permittedLocales.includes(locale) ? locale : m.defaultLocale, here)}>
                  {m.name}
                </Tag>
              );
            })}
          </div>
        </div>
      </Page>
    );
  }

  const selectedInStock = size ? inStock(piece, size) : undefined;

  return (
    <Page market={code} locale={locale} path={here}>
      <div
        style={{
          display: "grid",
          gap: "var(--space-8)",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, var(--measure-tight)), 1fr))",
          paddingBlockStart: "var(--space-8)",
          alignItems: "start",
        }}
      >
        {/* Gallery. Flat plates at real aspect ratios until photography lands —
            never a drawn illustration or a generated image (readme.md). The
            ratio is reserved before load, so CLS holds (UI-INV-10). */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                aspectRatio: "3 / 4",
                background: "var(--bg-surface-sunken)",
                borderRadius: "var(--radius-media)",
              }}
            />
          ))}
        </div>

        {/* UI-PDP-1: sticky on desktop, static in normal flow at narrow widths. */}
        <div
          style={{
            position: "sticky",
            insetBlockStart: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
            minInlineSize: 0,
          }}
        >
          <div>
            <p
              style={{
                font: "var(--type-label)",
                fontSize: "var(--text-2xs)",
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-widest)",
                color: "var(--fg-secondary)",
              }}
            >
              {piece.designer}
            </p>
            <h1 style={{ font: "var(--type-h2)", marginBlockStart: "var(--space-2)" }}>{piece.title}</h1>
            <p
              style={{
                font: "var(--type-h3)",
                color: piece.compareAtBdt ? "var(--commerce-price-sale)" : "var(--commerce-price)",
                marginBlockStart: "var(--space-3)",
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatMoney(displayPrice(piece.priceBdt, market), market, locale)}
              {piece.compareAtBdt ? (
                <s style={{ color: "var(--commerce-price-original)", font: "var(--type-ui)" }}>
                  {formatMoney(displayPrice(piece.compareAtBdt, market), market, locale)}
                </s>
              ) : null}
            </p>
          </div>

          {/* UI-PDP-6: the four facts a shopper needs before committing, above
              the fold rather than buried in an accordion. Each comes from the
              market's own configuration, not from copy. */}
          <FactList
            facts={[
              {
                icon: "clock" as const,
                text:
                  t("product.leadTime", { min: piece.leadTimeDays[0], max: piece.leadTimeDays[1] }) +
                  (market.deliveryTerms !== "domestic" ? ` ${t("product.crossBorderNote")}` : ""),
              },
              { icon: "package" as const, text: `${t("product.shipsFrom")}: ${piece.countryOfOrigin}` },
              {
                icon: "store" as const,
                text: `${t("product.soldBy")}: ${
                  market.sellerOfRecord ? t(`product.seller.${market.sellerOfRecord}`) : t("product.pending")
                }`,
              },
              {
                icon: "rotate-ccw" as const,
                text:
                  t("product.returnWindow", { days: market.returnWindowDays }) +
                  (market.statutoryRightsProfile ? ` ${t("product.statutoryRight")}` : ""),
              },
            ]}
          />

          {/* UI-PDP-7 / FR-CAT-12: an out-of-stock size stays visible and
              selectable, and selecting it offers a subscription rather than a
              dead end. */}
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
              {t("product.selectSize")}
            </h2>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {sizes.map((s) => (
                <Tag
                  key={s}
                  href={`${marketPath(code, locale, here)}${size === s ? "" : `?size=${encodeURIComponent(s)}`}`}
                  selected={size === s}
                >
                  {inStock(piece, s) ? s : `${s} · ${t("product.outOfStock")}`}
                </Tag>
              ))}
            </div>
          </div>

          {size && selectedInStock === false ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                background: "var(--bg-surface-sunken)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <p style={{ font: "var(--type-ui)" }}>{t("product.sizeUnavailable")}</p>
              <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{t("product.notifyNote")}</p>
              {/* Not wired: the notification module (§4.12) does not exist. The
                  control is disabled rather than absent, so the path is visible
                  and the gap is honest. */}
              <p>
                <Button variant="outline" disabled>
                  {t("product.notifyMe")}
                </Button>
              </p>
            </div>
          ) : (
            /* UI-PDP-4: both paths prominent, and the customise path states
               plainly that it produces a made-to-order, non-returnable item
               (BRU-3) before anyone commits to it. */
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <Button variant="accent" block disabled={!size}>
                {t("product.addToBag")}
              </Button>
              <Button variant="outline" block>
                {t("product.customise")}
              </Button>
              <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{t("product.customiseNote")}</p>
            </div>
          )}

          <ComplianceBlock piece={piece} market={market} locale={locale} />
        </div>
      </div>

      {/* UI-PDP-5: the five named sections. Native <details>, so they open and
          close with no client JS and are announced correctly. */}
      <div style={{ paddingBlock: "var(--space-10)", maxInlineSize: "var(--layout-max-prose)" }}>
        <Section title={t("product.sections.details")} open>
          <p>{t("product.leadTime", { min: piece.leadTimeDays[0], max: piece.leadTimeDays[1] })}</p>
        </Section>
        <Section title={t("product.sections.materials")}>
          <p>{piece.fibres.map((f) => `${f.pct}% ${f.name}`).join(", ")}</p>
          <p style={{ color: "var(--fg-secondary)" }}>{piece.care.join(" · ")}</p>
        </Section>
        <Section title={t("product.sections.sizeGuide")}>
          <p style={{ color: "var(--fg-secondary)" }}>{t("product.sizeGuideNote")}</p>
          <p style={{ color: "var(--fg-secondary)" }}>{t("product.pending")}</p>
        </Section>
        <Section title={t("product.sections.shipping")}>
          <p>{market.deliveryTerms ? t(`market.deliveryTerms.${market.deliveryTerms}`) : t("product.pending")}</p>
        </Section>
        <Section title={t("product.sections.returnsSection")}>
          <p>{t("product.returnWindow", { days: market.returnWindowDays })}</p>
        </Section>
      </div>
    </Page>
  );
}

async function Page({
  market,
  locale,
  path,
  children,
}: {
  market: string;
  locale: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        maxInlineSize: "var(--layout-max-editorial)",
        marginInline: "auto",
        paddingInline: "var(--space-6)",
        paddingBlock: "var(--space-6)",
      }}
    >
      <MarketBar market={market} locale={locale} path={path} />
      {children}
    </main>
  );
}

function FactList({ facts }: { facts: Array<{ icon: "clock" | "package" | "store" | "rotate-ccw"; text: string }> }) {
  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", listStyle: "none", padding: 0, margin: 0 }}>
      {facts.map((f) => (
        <li key={f.icon} style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
          <span style={{ flex: "none", color: "var(--fg-secondary)", marginBlockStart: "var(--space-05)" }}>
            <Icon name={f.icon} size="sm" />
          </span>
          <span style={{ font: "var(--type-ui-sm)" }}>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}

/* UI-PDP-8 / FR-CAT-18: where the active market's compliance profile requires
   economic-operator, manufacturer or safety information, it is rendered before
   purchase "in a fixed, findable location — not buried in a description field".
   So this is a named block in the buy panel, driven by the market's profile
   rather than by what the product happens to carry. A disclosure the market
   requires and the product cannot supply is shown as outstanding, because a
   listing lacking it is non-compliant on its face and hiding that would make the
   page look correct while it is not. */
function ComplianceBlock({ piece, market, locale }: { piece: Piece; market: Market; locale: string }) {
  const value: Record<string, string | undefined> = {
    "fibre-composition": piece.fibres.map((f) => `${f.pct}% ${f.name}`).join(", "),
    "care-instructions": piece.care.join(" · "),
    "country-of-origin": piece.countryOfOrigin,
    // FR-XBRD-14: a vendor's verified trader identification. Void is the seller
    // of record for first-party lines, so there is no vendor to name here.
    "trader-identity": market.sellerOfRecord === "vendor" ? undefined : undefined,
  };

  if (market.complianceProfile.length === 0) return null;

  return (
    <section
      aria-labelledby={`compliance-${piece.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        paddingBlockStart: "var(--space-4)",
        borderBlockStart: "var(--border-width-thin) solid var(--border-default)",
      }}
    >
      <h2
        id={`compliance-${piece.slug}`}
        style={{
          font: "var(--type-label)",
          fontSize: "var(--text-2xs)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-widest)",
          color: "var(--fg-secondary)",
        }}
      >
        <ComplianceTitle locale={locale} />
      </h2>
      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-1) var(--space-4)", margin: 0 }}>
        {market.complianceProfile.map((key) => (
          <Row key={key} label={key} value={value[key]} />
        ))}
      </dl>
    </section>
  );
}

async function ComplianceTitle({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  return <>{t("product.compliance.title")}</>;
}

async function Row({ label, value }: { label: string; value?: string }) {
  const t = await getTranslations();
  return (
    <>
      <dt style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{t(`product.compliance.${label}`)}</dt>
      <dd style={{ font: "var(--type-ui-sm)", margin: 0 }}>
        {value ?? <Badge tone="warning">{t("product.pending")}</Badge>}
      </dd>
    </>
  );
}

function Section({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details
      open={open}
      style={{ borderBlockEnd: "var(--border-width-thin) solid var(--border-default)", paddingBlock: "var(--space-4)" }}
    >
      <summary
        style={{
          font: "var(--type-ui)",
          fontWeight: "var(--weight-medium)",
          cursor: "pointer",
          minBlockSize: "var(--touch-target-min)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {title}
      </summary>
      <div style={{ font: "var(--type-body)", display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingBlockStart: "var(--space-3)" }}>
        {children}
      </div>
    </details>
  );
}
