import { getTranslations } from "next-intl/server";
import type { Market } from "@void/market";
import { CostBreakdown, type CostRow } from "@void/ui/commerce/CostBreakdown";
import type { OrderSummary } from "../../../lib/order-summary";

/* Shared by the bag and checkout so the two can never disagree about a total —
   which is the failure UI-CHK-6 ("the order summary shall remain visible at
   every checkout step") exists to prevent. */
export async function Summary({
  summary,
  market,
  locale,
  open = false,
}: {
  summary: OrderSummary;
  market: Market;
  locale: string;
  open?: boolean;
}) {
  const t = await getTranslations();

  if (summary.mode === "unavailable") {
    return (
      <div
        role="alert"
        style={{
          padding: "var(--space-4)",
          background: "var(--warning-bg)",
          border: "var(--border-width-thin) solid var(--warning-border)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <p style={{ font: "var(--type-ui)", color: "var(--warning-text)" }}>{t("summary.unavailable.title")}</p>
        <p style={{ font: "var(--type-ui-sm)" }}>{t(`summary.unavailable.${summary.unavailableReason}`)}</p>
      </div>
    );
  }

  const rows: CostRow[] = [
    { key: "goods", label: t("summary.goods"), amount: summary.goods },
    { key: "shipping", label: t("summary.shipping"), amount: summary.shipping },
  ];

  if (summary.taxIsIncluded) {
    // FR-TAX-2: shown as contained in the price, never added to the total.
    rows.push({ key: "tax", label: t("summary.taxIncluded"), amount: summary.tax, included: true });
  } else {
    rows.push({ key: "duty", label: t("summary.duty"), amount: summary.duty, onDelivery: summary.payableOnDelivery.amount > 0 });
    rows.push({ key: "tax", label: t("summary.taxAdded"), amount: summary.tax, onDelivery: summary.payableOnDelivery.amount > 0 });
    rows.push({ key: "fees", label: t("summary.fees"), amount: summary.fees, onDelivery: summary.payableOnDelivery.amount > 0 });
  }

  return (
    <CostBreakdown
      market={market}
      locale={locale}
      open={open}
      summaryLabel={t("summary.breakdown")}
      rows={rows}
      totalLabel={t("summary.total")}
      total={summary.total}
      deliveryTerms={
        market.deliveryTerms
          ? { label: t("summary.deliveryTermsLabel"), statement: t(`market.deliveryTerms.${market.deliveryTerms}`) }
          : undefined
      }
      wideDisclosure={summary.quote?.disclosure === "wide" ? t("summary.wideDisclosure") : undefined}
      payable={
        summary.payableOnDelivery.amount > 0
          ? {
              atCheckoutLabel: t("summary.payNow"),
              atCheckout: summary.payableAtCheckout,
              onDeliveryLabel: t("summary.payOnDelivery"),
              onDelivery: summary.payableOnDelivery,
            }
          : undefined
      }
    />
  );
}
