import { getTranslations } from "next-intl/server";
import { marketByCode, marketPath, servableMarkets } from "@void/market";
import { Tag } from "@void/ui/core/Tag";
import { Badge } from "@void/ui/core/Badge";

/* The market and language bar.
 *
 * UI-GLOB-5: "Market, language and currency selectors shall be reachable from
 *  the global header and footer on every page, with the active market always
 *  visible."
 * UI-GLOB-10: "Where a page's content differs by market — price, availability,
 *  policy, disclosure — the page shall make the active market unambiguous, so a
 *  shared link is never read against the wrong market's terms."
 *
 * The statement is phrased to be true however the visitor arrived — chosen,
 * redirected from a guess, or followed from a shared link. It deliberately does
 * NOT claim "you chose this": that depends on a cookie, reading one forces the
 * page out of static rendering, and the catalogue is server rendered precisely
 * to hold an LCP budget. @void/market still resolves and reports the true source
 * (it is what the middleware routes on, and it is tested); a first-visit banner
 * is the right place to surface it, not a line on every static page.
 *
 * The switchers are links, so this works with no client JS and each
 * market/locale pair stays a real, shareable, indexable address.
 *
 * FR-I18N-2: switching language keeps your place — the links preserve the rest
 * of the path rather than returning to the home page.
 */

export async function MarketBar({
  market: code,
  locale,
  path = "",
}: {
  market: string;
  locale: string;
  path?: string;
}) {
  const t = await getTranslations();
  const market = marketByCode(code);
  if (!market) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "var(--space-4)",
        paddingBlock: "var(--space-3)",
        borderBlockEnd: "var(--border-width-thin) solid var(--border-default)",
      }}
    >
      <p style={{ font: "var(--type-ui-sm)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ color: "var(--fg-secondary)" }}>{t("market.shippingTo", { market: market.name })}</span>
        <Badge tone="outline">{market.displayCurrency}</Badge>
      </p>

      {/* UI-GLOB-10: unambiguous, and true however the visitor arrived here. */}
      <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", flex: 1, minInlineSize: 0 }}>
        {t("market.scopeNote", { market: market.name })}
      </p>

      <nav aria-label={t("market.change")} style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {servableMarkets().map((m) => (
          <Tag
            key={m.code}
            href={marketPath(m.code, m.permittedLocales.includes(locale) ? locale : m.defaultLocale, path)}
            selected={m.code === market.code}
          >
            {m.name}
          </Tag>
        ))}
      </nav>

      <nav aria-label={t("locale.change")} style={{ display: "flex", gap: "var(--space-2)" }}>
        {market.permittedLocales.map((l) => (
          <Tag key={l} href={marketPath(market.code, l, path)} selected={l === locale}>
            {l.toUpperCase()}
          </Tag>
        ))}
      </nav>
    </div>
  );
}
