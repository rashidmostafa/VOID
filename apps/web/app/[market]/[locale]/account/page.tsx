import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatMoney, marketByCode, marketPath } from "@void/market";
import { Badge } from "@void/ui/core/Badge";
import { Button } from "@void/ui/core/Button";
import { Card, CardHeader } from "@void/ui/core/Card";
import { TabLinks } from "@void/ui/navigation/TabLinks";
import { EmptyState } from "@void/ui/state/EmptyState";
import { MarketBar } from "../MarketBar";
import { orderFromCart } from "../../../../lib/order-store";

/* The account hub — UI-ACC-1.
 *
 * "An account hub shall provide orders, returns, addresses, payment methods,
 *  designs, wishlist, credits, preferences and security in a consistent layout."
 *
 * All nine sections are present because the requirement names all nine, and a
 * hub that silently omits six is not a partial implementation of it — it is a
 * different thing that looks finished. The six with nothing behind them say
 * "Not built yet" rather than rendering an empty shell that implies the feature
 * exists and has no data.
 *
 * The sections are TabLinks, not Tabs: each is a route, and marking a navigation
 * link as role="tab" tells assistive tech the panel is already present when the
 * page is about to change (see ADR-0010).
 *
 * Identity does not exist (build step 6), so there is no signed-in user and no
 * order history to query. The orders section shows an order only when one is
 * carried in the URL, which is the same fixture the confirmation page uses.
 */

const SECTIONS = [
  "orders", "returns", "addresses", "payment", "designs",
  "wishlist", "credits", "preferences", "security",
] as const;

type Section = (typeof SECTIONS)[number];

export default async function Account({
  params,
  searchParams,
}: {
  params: Promise<{ market: string; locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { market: code, locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations();
  const market = marketByCode(code);
  if (!market) notFound();

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const requested = one(sp.s) as Section | undefined;
  const section: Section = requested && SECTIONS.includes(requested) ? requested : "orders";
  const cart = one(sp.l);
  const here = "/account";

  const base = marketPath(code, locale, here);
  const placed = section === "orders" ? orderFromCart(cart, code, new Date().toISOString()) : null;

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

      <h1 style={{ font: "var(--type-h1)", paddingBlock: "var(--space-8) var(--space-6)" }}>
        {t("account.title")}
      </h1>

      <TabLinks
        label={t("account.title")}
        current={section === "orders" ? base : `${base}?s=${section}`}
        items={SECTIONS.map((s) => ({
          href: s === "orders" ? base + (cart ? `?l=${encodeURIComponent(cart)}` : "") : `${base}?s=${s}`,
          label: t(`account.${s}`),
        }))}
      />

      <div style={{ paddingBlockStart: "var(--space-8)" }}>
        {section === "orders" ? (
          placed ? (
            <Card>
              <CardHeader
                title={placed.order.orderNumber}
                meta={`${t(`status.${placed.order.status}`)} · ${formatMoney(placed.order.grandTotal, market, locale)}`}
                action={<Badge tone="info" dot>{t(`status.${placed.order.status}`)}</Badge>}
              />
              <p style={{ marginBlockStart: "var(--space-4)" }}>
                <Button
                  as="a"
                  href={`${marketPath(code, locale, `/order/${placed.order.orderNumber}`)}?l=${encodeURIComponent(cart!)}`}
                  variant="outline"
                >
                  {t("account.viewOrder", { reference: placed.order.orderNumber })}
                </Button>
              </p>
            </Card>
          ) : (
            <EmptyState
              title={t("account.noOrders")}
              hint={t("account.noOrdersHint")}
              action={
                <Button as="a" href={marketPath(code, locale, "/c/new-in")} variant="outline">
                  {t("bag.emptyAction")}
                </Button>
              }
            />
          )
        ) : (
          /* Named, not hidden. A section the requirement lists and the build has
             not reached says so, rather than showing an empty state that implies
             the feature works and the shopper simply has nothing in it. */
          <EmptyState title={t(`account.${section}`)} hint={t("account.notBuilt")} />
        )}
      </div>
    </main>
  );
}
