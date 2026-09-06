import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatMoney, marketByCode, marketPath, money } from "@void/market";
import { Button } from "@void/ui/core/Button";
import { EmptyState } from "@void/ui/state/EmptyState";
import { MarketBar } from "../MarketBar";
import { Summary } from "../Summary";
import { buildSummary, parseCart, serialiseCart } from "../../../../lib/order-summary";

/* The bag — UI-CHK-1's full page half, and UI-CHK-8's breakdown.
 *
 * UI-CHK-1 asks for a right-side drawer AND "a full cart page also available and
 * linkable". The drawer needs the cart module and client state; the page is the
 * linkable half and is what the breakdown lives on.
 *
 * Cart contents are in the URL. That is a fixture standing in for build step 11,
 * but it is not a lie: the bag is genuinely shareable and needs no JS, and when
 * the cart module lands only `parseCart` changes.
 */

const SHIPPING_FLAT = 6_000; // ৳60.00. Real rating is FR-SHIP-13, not built.

export default async function Bag({
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
  const items = parseCart(one(sp.l));
  const here = "/bag";

  if (items.length === 0) {
    return (
      <main style={SHELL}>
        <MarketBar market={code} locale={locale} path={here} />
        <div style={{ paddingBlockStart: "var(--space-10)" }}>
          <h1 style={{ font: "var(--type-h1)", marginBlockEnd: "var(--space-6)" }}>{t("bag.title")}</h1>
          <EmptyState
            title={t("bag.empty")}
            action={
              <Button as="a" href={marketPath(code, locale, "/c/new-in")} variant="outline">
                {t("bag.emptyAction")}
              </Button>
            }
          />
        </div>
      </main>
    );
  }

  const summary = buildSummary(items, market, money(SHIPPING_FLAT, "BDT"), new Date().toISOString().slice(0, 10));
  const remove = (slug: string, size: string) => {
    const rest = items.filter((i) => !(i.slug === slug && i.size === size));
    const q = rest.length ? `?l=${encodeURIComponent(serialiseCart(rest))}` : "";
    return marketPath(code, locale, here) + q;
  };

  return (
    <main style={SHELL}>
      <MarketBar market={code} locale={locale} path={here} />

      <h1 style={{ font: "var(--type-h1)", paddingBlock: "var(--space-8) var(--space-6)" }}>{t("bag.title")}</h1>

      <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "flex-start", flexWrap: "wrap" }}>
        <ul style={{ flex: "999 1 55%", minInlineSize: 0, listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {summary.lines.map((l) => (
            <li
              key={`${l.piece.slug}-${l.size}`}
              style={{ display: "flex", gap: "var(--space-4)", paddingBlockEnd: "var(--space-5)", borderBlockEnd: "var(--border-width-thin) solid var(--border-default)" }}
            >
              <div style={{ inlineSize: "var(--measure-tight)", maxInlineSize: "25%", aspectRatio: "3 / 4", background: "var(--bg-surface-sunken)", borderRadius: "var(--radius-media)", flex: "none" }} />
              <div style={{ flex: 1, minInlineSize: 0, display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <p style={{ font: "var(--type-label)", fontSize: "var(--text-2xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-widest)", color: "var(--fg-secondary)" }}>
                  {l.piece.designer}
                </p>
                <p style={{ font: "var(--type-ui)" }}>{l.piece.title}</p>
                <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
                  {l.size} · {l.quantity}
                </p>
                <p style={{ font: "var(--type-ui)", fontVariantNumeric: "tabular-nums" }}>
                  {formatMoney(l.total, market, locale)}
                </p>
                <p style={{ marginBlockStart: "var(--space-2)" }}>
                  <Button as="a" href={remove(l.piece.slug, l.size)} variant="link">
                    {t("bag.remove", { piece: l.piece.title })}
                  </Button>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <aside
          aria-label={t("summary.title")}
          style={{ flex: "1 1 var(--measure-tight)", minInlineSize: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
        >
          <Summary summary={summary} market={market} locale={locale} />
          {summary.mode !== "unavailable" ? (
            <Button
              as="a"
              href={`${marketPath(code, locale, "/checkout")}?l=${encodeURIComponent(serialiseCart(items))}`}
              variant="accent"
              block
            >
              {t("bag.checkout")}
            </Button>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

const SHELL = {
  maxInlineSize: "var(--layout-max-editorial)",
  marginInline: "auto",
  paddingInline: "var(--space-6)",
  paddingBlock: "var(--space-6)",
} as const;
