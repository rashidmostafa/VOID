import { getTranslations } from "next-intl/server";
import { marketByCode, formatMoney, money } from "@void/market";
import { Button } from "@void/ui/core/Button";
import { Badge } from "@void/ui/core/Badge";
import { MarketBar } from "./MarketBar";

/* The market-scoped home page.
 *
 * Deliberately small. Its job in this phase is to prove the plumbing carries
 * end to end — resolved market, resolved locale, translated copy, market-correct
 * money, and the delivery-terms statement the market's own configuration
 * dictates. The real homepage (UI-HOME-1..7) comes with the read path.
 *
 * Every string is a message key (FR-I18N-8). Every price is integer minor units
 * formatted for the market (DR-GEN-3, UI-GLOB-9). Nothing here knows what a
 * currency symbol looks like.
 */

export default async function Home({
  params,
}: {
  params: Promise<{ market: string; locale: string }>;
}) {
  const { market: code, locale } = await params;
  const t = await getTranslations();
  const market = marketByCode(code)!;

  // A catalogue price, in minor units. 245000 poisha = ৳2,450.
  const price = money(245_000, market.displayCurrency === "BDT" ? "BDT" : market.displayCurrency);

  return (
    <main
      style={{
        maxInlineSize: "var(--layout-max-editorial)",
        marginInline: "auto",
        paddingInline: "var(--space-6)",
        paddingBlock: "var(--space-6)",
      }}
    >
      <MarketBar market={code} locale={locale} />

      <div style={{ paddingBlockStart: "var(--space-10)" }}>
        <p
          style={{
            font: "var(--type-label)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-widest)",
            color: "var(--fg-secondary)",
          }}
        >
          {t("home.eyebrow")}
        </p>

        <h1 style={{ font: "var(--type-h1)", marginBlockStart: "var(--space-2)" }}>{t("home.title")}</h1>

        <p
          style={{
            font: "var(--type-body)",
            color: "var(--fg-secondary)",
            maxInlineSize: "var(--layout-max-prose)",
            marginBlockStart: "var(--space-3)",
          }}
        >
          {t("home.standfirst")}
        </p>

        <p
          style={{
            font: "var(--type-h3)",
            color: "var(--commerce-price)",
            marginBlockStart: "var(--space-5)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatMoney(price, market, locale)}
        </p>

        {/* FR-XBRD-4: the delivery-terms statement is rendered in plain language,
            "not a footnote and not a tooltip", from the market's own setting. */}
        {market.deliveryTerms ? (
          <p
            style={{
              font: "var(--type-ui-sm)",
              color: "var(--fg-secondary)",
              marginBlockStart: "var(--space-2)",
            }}
          >
            {t(`market.deliveryTerms.${market.deliveryTerms}`)}
          </p>
        ) : null}

        <div style={{ display: "flex", gap: "var(--space-3)", marginBlockStart: "var(--space-6)", flexWrap: "wrap" }}>
          <Button variant="accent">{t("product.addToBag")}</Button>
          <Button variant="outline">{t("home.shopNewIn")}</Button>
        </div>

        <p style={{ marginBlockStart: "var(--space-6)" }}>
          <Badge tone="outline">{t("product.lowStock", { count: 3 })}</Badge>
        </p>
      </div>
    </main>
  );
}
