import * as React from "react";
import { formatMoney, type Market, type Money } from "@void/market";

/* The landed-cost breakdown — UI-CHK-8.
 *
 * "The landed-cost breakdown shall be expandable at cart and checkout, itemising
 *  goods, shipping, tax and duty separately, with the delivery-terms statement
 *  of FR-XBRD-4 rendered as a distinct block rather than fine print."
 *
 * Two things follow, and both are structural rather than cosmetic:
 *
 * · Expandable means <details>, open by default at checkout. A shopper must be
 *   able to see the itemisation before paying, not hunt for it.
 * · "A distinct block rather than fine print" is why the delivery-terms
 *   statement is a bordered region above the total, not a footnote under it.
 *   FR-XBRD-4 also requires it "in plain language — not a footnote and not a
 *   tooltip", which rules out the obvious space-saving treatments.
 *
 * FR-TAX-6 forbids rolling components into an opaque "fees" line, so every row
 * here is a named charge. A domestic summary shows its VAT as CONTAINED in the
 * goods rather than added — `taxIsIncluded` decides which, and the component
 * never infers it.
 */

export interface CostRow {
  key: string;
  label: string;
  amount: Money;
  /** Rendered as "included in the price above" rather than added to the total. */
  included?: boolean;
  /** A charge the carrier collects later, not taken at checkout. */
  onDelivery?: boolean;
}

export interface CostBreakdownProps {
  rows: CostRow[];
  totalLabel: string;
  total: Money;
  /** FR-XBRD-4. Rendered as its own block, never as fine print. */
  deliveryTerms?: { label: string; statement: string };
  /** Shown when the quote rests on a fallback rate table (FR-TAX-11). */
  wideDisclosure?: string;
  payable?: { atCheckoutLabel: string; atCheckout: Money; onDeliveryLabel: string; onDelivery: Money };
  summaryLabel: string;
  market: Market;
  locale: string;
  open?: boolean;
}

export function CostBreakdown({
  rows,
  totalLabel,
  total,
  deliveryTerms,
  wideDisclosure,
  payable,
  summaryLabel,
  market,
  locale,
  open = false,
}: CostBreakdownProps) {
  const fmt = (m: Money) => formatMoney(m, market, locale);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <details open={open}>
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
          {summaryLabel}
        </summary>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "var(--space-2) var(--space-4)",
            margin: 0,
            paddingBlockStart: "var(--space-3)",
          }}
        >
          {rows.map((r) => (
            <React.Fragment key={r.key}>
              <dt style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{r.label}</dt>
              <dd
                style={{
                  font: "var(--type-ui-sm)",
                  margin: 0,
                  textAlign: "end",
                  fontVariantNumeric: "tabular-nums",
                  color: r.included || r.onDelivery ? "var(--fg-secondary)" : "var(--fg-primary)",
                }}
              >
                {fmt(r.amount)}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      </details>

      {/* FR-XBRD-4: a distinct block. Not a footnote, not a tooltip. */}
      {deliveryTerms ? (
        <section
          aria-label={deliveryTerms.label}
          style={{
            padding: "var(--space-4)",
            background: "var(--bg-surface-sunken)",
            border: "var(--border-width-thin) solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <p
            style={{
              font: "var(--type-label)",
              fontSize: "var(--text-2xs)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-widest)",
              color: "var(--fg-secondary)",
            }}
          >
            {deliveryTerms.label}
          </p>
          <p style={{ font: "var(--type-ui)" }}>{deliveryTerms.statement}</p>
          {wideDisclosure ? (
            <p style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{wideDisclosure}</p>
          ) : null}
        </section>
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          paddingBlockStart: "var(--space-3)",
          borderBlockStart: "var(--border-width-thin) solid var(--border-default)",
        }}
      >
        <p style={{ font: "var(--type-ui)", fontWeight: "var(--weight-medium)" }}>{totalLabel}</p>
        <p style={{ font: "var(--type-ui)", fontWeight: "var(--weight-medium)", fontVariantNumeric: "tabular-nums" }}>
          {fmt(total)}
        </p>
      </div>

      {/* Under DAP the shopper pays twice, in two places, to two parties. Saying
          only the total would be true and useless. */}
      {payable ? (
        <dl style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--space-1) var(--space-4)", margin: 0 }}>
          <dt style={{ font: "var(--type-ui-sm)" }}>{payable.atCheckoutLabel}</dt>
          <dd style={{ font: "var(--type-ui-sm)", margin: 0, textAlign: "end", fontVariantNumeric: "tabular-nums" }}>
            {fmt(payable.atCheckout)}
          </dd>
          <dt style={{ font: "var(--type-ui-sm)", color: "var(--fg-secondary)" }}>{payable.onDeliveryLabel}</dt>
          <dd
            style={{
              font: "var(--type-ui-sm)",
              margin: 0,
              textAlign: "end",
              color: "var(--fg-secondary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmt(payable.onDelivery)}
          </dd>
        </dl>
      ) : null}
    </div>
  );
}
