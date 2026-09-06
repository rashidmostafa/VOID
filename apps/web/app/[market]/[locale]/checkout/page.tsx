import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatMoney, marketByCode, marketPath, money } from "@void/market";
import { Button } from "@void/ui/core/Button";
import { Badge } from "@void/ui/core/Badge";
import { EmptyState } from "@void/ui/state/EmptyState";
import { MarketBar } from "../MarketBar";
import { Summary } from "../Summary";
import { buildSummary, parseCart, serialiseCart } from "../../../../lib/order-summary";
import { orderFromCart } from "../../../../lib/order-store";

/* Checkout — the disclosures, which are the hard part.
 *
 * The address, shipping rating and payment steps need modules that do not exist
 * (FR-MKTS-8's country address schema, FR-SHIP-13's rating, the FR-PAY-21
 * abstraction). What CAN be built correctly now is everything the SRS says must
 * appear BEFORE the payment control, and those are the requirements most likely
 * to be quietly skipped:
 *
 *   FR-CHK-15 — for a cross-border order, "a distinct and unmissable block"
 *     naming the seller of record, the country goods ship from, the delivery
 *     terms basis, and whether any further charge is possible on delivery.
 *   FR-CHK-16 — where the market grants a statutory withdrawal right, the
 *     pre-contractual information before the payment obligation is accepted.
 *   FR-CHK-17 — the confirm control states unambiguously that pressing it
 *     creates a payment obligation.
 *   UI-CHK-3 — payment methods for the active market, with unavailable ones
 *     EXPLAINED rather than hidden without reason.
 *   UI-CHK-6 — the order summary visible at every step.
 *
 * None of these depends on a payment provider, and shipping a checkout without
 * them is how a build becomes unlawful in several enabled markets rather than
 * merely incomplete.
 */

const SHIPPING_FLAT = 6_000;

/* The full method set. UI-CHK-3 requires an unavailable method to be explained,
   so the ones this market does not permit are listed and reasoned, not dropped. */
const ALL_METHODS = ["bkash", "nagad", "rocket", "card_domestic", "card_international", "cod"] as const;

export default async function Checkout({
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
  const here = "/checkout";

  if (items.length === 0) {
    return (
      <main style={SHELL}>
        <MarketBar market={code} locale={locale} path={here} />
        <div style={{ paddingBlockStart: "var(--space-10)" }}>
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

  const now = new Date().toISOString();
  const summary = buildSummary(items, market, money(SHIPPING_FLAT, "BDT"), now.slice(0, 10), now);
  const crossBorder = market.deliveryTerms !== "domestic";
  const quotable = summary.mode !== "unavailable";

  /* The reference the order WILL carry. Deriving it here rather than after
     payment keeps the confirmation link honest in a fixture; a real checkout
     writes the order and redirects to its number. */
  const cartValue = serialiseCart(items);
  const preview = orderFromCart(cartValue, code, now);
  const confirmationHref = preview
    ? `${marketPath(code, locale, `/order/${preview.order.orderNumber}`)}?l=${encodeURIComponent(cartValue)}&placed=1`
    : null;

  return (
    <main style={SHELL}>
      {/* UI-CHK-5: reduced navigation. The market bar stays because UI-GLOB-5
          requires the active market reachable on every page, and UI-GLOB-10
          because a shared checkout link must not be read against another
          market's terms. */}
      <MarketBar market={code} locale={locale} path={here} />

      <header style={{ paddingBlock: "var(--space-8) var(--space-6)" }}>
        <h1 style={{ font: "var(--type-h1)" }}>{t("checkout.title")}</h1>
        <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)", marginBlockStart: "var(--space-2)" }}>
          {t("checkout.step", { n: 3, total: 3 })}
        </p>
      </header>

      <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "999 1 55%", minInlineSize: 0, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* FR-CHK-15. Distinct and unmissable, before anything else. */}
          {crossBorder ? (
            <section
              aria-labelledby="xb"
              style={{
                padding: "var(--space-5)",
                border: "var(--border-width-medium) solid var(--border-strong)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <h2 id="xb" style={{ font: "var(--type-h3)" }}>
                {t("checkout.crossBorderTitle")}
              </h2>
              <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-2) var(--space-4)", margin: 0 }}>
                <Fact label={t("checkout.sellerOfRecord")}>
                  {market.sellerOfRecord ? t(`product.seller.${market.sellerOfRecord}`) : t("product.pending")}
                </Fact>
                <Fact label={t("checkout.shipsFrom")}>BD</Fact>
                <Fact label={t("checkout.termsBasis")}>
                  {market.deliveryTerms ? t(`market.deliveryTerms.${market.deliveryTerms}`) : t("product.pending")}
                </Fact>
                <Fact label={t("checkout.furtherCharges")}>
                  {summary.payableOnDelivery.amount > 0
                    ? t("checkout.furtherChargesYes")
                    : t("checkout.furtherChargesNo")}
                </Fact>
              </dl>
            </section>
          ) : null}

          {/* FR-CHK-16 / UI-CHK-9. Before the payment control, not after it. */}
          {market.statutoryRightsProfile ? (
            <section
              aria-labelledby="withdrawal"
              style={{
                padding: "var(--space-5)",
                background: "var(--bg-surface-sunken)",
                borderRadius: "var(--radius-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <h2 id="withdrawal" style={{ font: "var(--type-h3)" }}>
                {t("checkout.withdrawalTitle")}
              </h2>
              <p style={{ font: "var(--type-body)" }}>
                {t("checkout.withdrawalBody", { days: market.returnWindowDays })}
              </p>
              {/* BRU-3: a customised piece is excluded, and the exclusion has to
                  be stated before the obligation is accepted, not after. */}
              <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>
                {t("checkout.withdrawalExclusion")}
              </p>
            </section>
          ) : null}

          {/* UI-CHK-3 / FR-CHK-14: methods for this market, unavailable ones explained. */}
          <section aria-labelledby="pay" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <h2 id="pay" style={{ font: "var(--type-h3)" }}>
              {t("checkout.paymentTitle")}
            </h2>
            {market.paymentMethods.length === 0 ? (
              <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{t("checkout.noPayment")}</p>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {ALL_METHODS.map((m) => {
                  const available = market.paymentMethods.includes(m);
                  return (
                    <li key={m} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", minBlockSize: "var(--touch-target-min)" }}>
                      <span style={{ font: "var(--type-ui)", color: available ? "var(--fg-primary)" : "var(--fg-secondary)" }}>
                        {t(`payment.${m}`)}
                      </span>
                      {available ? null : (
                        <Badge tone="outline">{t("checkout.paymentUnavailable", { method: t(`payment.${m}`) })}</Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* FR-CHK-17: the control states what pressing it does. It is disabled
              because no payment provider is wired (J-2 is open, and the
              PaymentProvider abstraction is build step 16) — the wording is what
              is being built here, not the transaction. */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {/* The control carries FR-CHK-17's wording. It navigates to the
                confirmation rather than taking payment, because no provider is
                wired: J-2 is open and the FR-PAY-21 abstraction is build step 16.
                What is built here is the disclosure and the wording, not the
                transaction — and the button says what it would do, not what it
                does. */}
            {quotable && confirmationHref ? (
              <Button as="a" href={confirmationHref} variant="accent" block>
                {t("checkout.obligation", { amount: formatMoney(summary.payableAtCheckout, market, locale) })}
              </Button>
            ) : (
              <Button variant="accent" block disabled>
                {t("summary.unavailable.title")}
              </Button>
            )}
          </div>
        </div>

        {/* UI-CHK-6: the summary is visible here and at every step. Open by
            default at checkout — the itemisation must be readable before paying,
            not something to go looking for. */}
        <aside
          aria-label={t("summary.title")}
          style={{ flex: "1 1 var(--measure-tight)", minInlineSize: 0, position: "sticky", insetBlockStart: "var(--space-6)" }}
        >
          <Summary summary={summary} market={market} locale={locale} open />
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

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{label}</dt>
      <dd style={{ font: "var(--type-ui-sm)", margin: 0 }}>{children}</dd>
    </>
  );
}
