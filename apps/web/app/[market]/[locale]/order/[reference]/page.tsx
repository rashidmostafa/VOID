import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatMoney, marketByCode, marketPath } from "@void/market";
import { TERMINAL_STATUSES, requiresExportRecord, type OrderStatus } from "@void/order";
import { Badge } from "@void/ui/core/Badge";
import { Button } from "@void/ui/core/Button";
import { Icon } from "@void/ui/core/Icon";
import { EmptyState } from "@void/ui/state/EmptyState";
import { MarketBar } from "../../MarketBar";
import { orderFromCart } from "../../../../../lib/order-store";

/* Order confirmation and detail — UI-CHK-4, UI-ACC-2, UI-ACC-3.
 *
 * One page serves both, because they are the same thing at different moments:
 * the confirmation is the order detail on the day it was placed. Splitting them
 * would mean two renderings of the same record that can drift apart.
 *
 * Everything here is READ FROM THE ORDER, never recomputed. The FX rate, the
 * duty, the delivery terms, the seller of record and the withdrawal period all
 * come off the stored row — which is the whole point of DR-GEN-10, and the
 * reason this page does not import the rate tables or the market's current
 * configuration for any of those values.
 *
 * The one thing it reads live is the market's NAME, which is presentation.
 */

/* FR-ORD-1's progression. The two customs states are the ones cross-border
   shoppers ask about most, so they are on the timeline rather than collapsed
   into "shipped". */
const DOMESTIC_STEPS: OrderStatus[] = ["placed", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
const EXPORT_STEPS: OrderStatus[] = ["placed", "confirmed", "processing", "shipped", "in_transit", "customs_clearance", "out_for_delivery", "delivered"];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ market: string; locale: string; reference: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { market: code, locale, reference } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations();
  const market = marketByCode(code);
  if (!market) notFound();

  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const now = new Date().toISOString();
  const placed = orderFromCart(one(sp.l), code, now);
  const justPlaced = one(sp.placed) === "1";

  if (!placed || placed.order.orderNumber !== reference) {
    return (
      <main style={SHELL}>
        <MarketBar market={code} locale={locale} path={`/order/${reference}`} />
        <div style={{ paddingBlockStart: "var(--space-10)" }}>
          <EmptyState
            title={t("order.notFound")}
            hint={t("order.notFoundBody")}
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

  const { order, leadTimeDays } = placed;
  const isExport = requiresExportRecord(order);
  const steps = isExport ? EXPORT_STEPS : DOMESTIC_STEPS;
  const reached = steps.indexOf(order.status);
  const fmt = (m: { amount: number; currency: string }) => formatMoney(m, market, locale);

  const nextSteps =
    order.deliveryTerms === "domestic"
      ? t("order.nextStepsDomestic")
      : order.deliveryTerms === "ddp"
        ? t("order.nextStepsDdp")
        : t("order.nextStepsDap");

  return (
    <main style={SHELL}>
      <MarketBar market={code} locale={locale} path={`/order/${reference}`} />

      <header style={{ paddingBlock: "var(--space-8) var(--space-6)" }}>
        <h1 style={{ font: "var(--type-h1)" }}>
          {justPlaced ? t("order.confirmedTitle") : t("order.detail")}
        </h1>
        {justPlaced && order.contactEmail ? (
          <p style={{ font: "var(--type-body)", color: "var(--fg-secondary)", marginBlockStart: "var(--space-3)", maxInlineSize: "var(--measure-default)" }}>
            {t("order.confirmedBody", { email: order.contactEmail })}
          </p>
        ) : null}
        <p style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexWrap: "wrap", marginBlockStart: "var(--space-4)" }}>
          <span style={{ font: "var(--type-mono)" }}>
            {t("order.number")} {order.orderNumber}
          </span>
          <Badge tone={TERMINAL_STATUSES.includes(order.status) ? "neutral" : "info"} dot>
            {t(`status.${order.status}`)}
          </Badge>
        </p>
      </header>

      <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "999 1 55%", minInlineSize: 0, display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {/* UI-ACC-3: the timeline, with the customs states shown for an export
              order and absent for a domestic one — rather than a generic bar
              that means nothing in either case. */}
          <section aria-labelledby="tl">
            <h2 id="tl" style={EYEBROW}>{t("order.timeline")}</h2>
            <ol style={{ listStyle: "none", margin: 0, padding: 0, marginBlockStart: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {steps.map((s, i) => {
                const done = i <= reached;
                return (
                  <li key={s} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                    {/* Lucide's plain `circle` is not in the 57-symbol subset.
                        readme.md: use a text label and raise the gap rather than
                        hand-drawing an SVG. A pending step is therefore a
                        bordered dot built from tokens, not a drawn glyph. */}
                    {done ? (
                      <span aria-hidden="true" style={{ color: "var(--fg-primary)", flex: "none", display: "inline-flex" }}>
                        <Icon name="circle-check" size="sm" />
                      </span>
                    ) : (
                      <span
                        aria-hidden="true"
                        style={{
                          inlineSize: "var(--icon-sm)",
                          blockSize: "var(--icon-sm)",
                          borderRadius: "var(--radius-full)",
                          border: "var(--border-width-thin) solid var(--border-control)",
                          flex: "none",
                        }}
                      />
                    )}
                    <span style={{ font: "var(--type-ui)", color: done ? "var(--fg-primary)" : "var(--fg-secondary)" }}>
                      {t(`status.${s}`)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="next">
            <h2 id="next" style={EYEBROW}>{t("order.nextSteps")}</h2>
            <p style={{ font: "var(--type-body)", marginBlockStart: "var(--space-3)", maxInlineSize: "var(--measure-default)" }}>
              {nextSteps}
            </p>
            <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", marginBlockStart: "var(--space-2)" }}>
              {t("order.estimatedDelivery")}:{" "}
              {t("order.estimatedDeliveryRange", { min: leadTimeDays[0], max: leadTimeDays[1] })}
              {isExport ? ` ${t("order.customsNote")}` : ""}
            </p>
          </section>

          {/* UI-CHK-4: one-click account creation for guests. Offered AFTER the
              order, and explicitly not a condition of it — making an account a
              gate on completing a purchase is the dark pattern UI-INV-11 rules
              out, and FR-CHK-8 requires guest checkout to work. */}
          {justPlaced ? (
            <section aria-labelledby="acct">
              <h2 id="acct" style={EYEBROW}>{t("order.createAccount")}</h2>
              <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", marginBlock: "var(--space-2) var(--space-3)" }}>
                {t("order.createAccountNote")}
              </p>
              <Button variant="outline" disabled>
                {t("order.createAccount")}
              </Button>
            </section>
          ) : null}
        </div>

        {/* Everything in this panel is read off the order, not recomputed. */}
        <aside
          aria-label={t("order.recordedAt")}
          style={{ flex: "1 1 var(--measure-tight)", minInlineSize: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}
        >
          <section>
            <h2 style={EYEBROW}>{t("summary.title")}</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, marginBlockStart: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {order.lines.map((l) => (
                <li key={`${l.sku}-${l.size}`} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", font: "var(--type-ui-sm)" }}>
                  <span style={{ minInlineSize: 0 }}>
                    {l.title} · {l.size} · {l.quantity}
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums", flex: "none" }}>{fmt(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <Rows
              rows={[
                [t("summary.shipping"), fmt(order.shipping)],
                ...(order.duty.amount > 0 ? [[t("summary.duty"), fmt(order.duty)] as const] : []),
                ...(order.importTax.amount > 0 ? [[t("summary.taxAdded"), fmt(order.importTax)] as const] : []),
                ...(order.fees.amount > 0 ? [[t("summary.fees"), fmt(order.fees)] as const] : []),
                [t("summary.total"), fmt(order.grandTotal)],
              ]}
            />
          </section>

          <section>
            <h2 style={EYEBROW}>{t("order.recordedAt")}</h2>
            <Rows
              rows={[
                [t("order.sellerOfRecord"), t(`product.seller.${order.sellerOfRecord}`)],
                [t("order.deliveryTerms"), t(`market.deliveryTerms.${order.deliveryTerms}`)],
                ...(order.fxRate
                  ? [[
                      t("order.fxApplied"),
                      t("order.fxDetail", {
                        rate: order.fxRate,
                        from: order.fxConversions[0]?.fromCurrency ?? "",
                        to: order.currencyDisplay,
                        source: order.fxSource ?? "",
                        at: (order.fxAt ?? "").slice(0, 10),
                      }),
                    ] as const]
                  : []),
                [
                  t("order.withdrawal"),
                  order.withdrawalRight
                    ? t("order.withdrawalDetail", { days: order.withdrawalRight.days })
                    : t("order.noWithdrawal"),
                ],
              ]}
            />
          </section>
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

const EYEBROW = {
  font: "var(--type-label)",
  fontSize: "var(--text-2xs)",
  textTransform: "uppercase" as const,
  letterSpacing: "var(--tracking-widest)",
  color: "var(--fg-secondary)",
};

function Rows({ rows }: { rows: ReadonlyArray<readonly [string, string]> }) {
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "var(--space-2) var(--space-4)",
        margin: 0,
        marginBlockStart: "var(--space-3)",
        paddingBlockStart: "var(--space-3)",
        borderBlockStart: "var(--border-width-thin) solid var(--border-default)",
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{k}</dt>
          <dd style={{ font: "var(--type-ui-sm)", margin: 0, textAlign: "end", fontVariantNumeric: "tabular-nums" }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

