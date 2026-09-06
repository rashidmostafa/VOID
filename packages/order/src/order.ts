import type { FxConversion, Market, Money } from "@void/market";
import type { DeliveryTerms, LandedCost } from "@void/trade";

/* The order — SRS Appendix H `order`, DR-GEN-9, DR-GEN-10, FR-TAX-5.
 *
 * An order is a SNAPSHOT, not a set of foreign keys. That is the single idea
 * this file exists to enforce:
 *
 *   DR-GEN-10 — every rate, threshold and policy value applied to a transaction
 *     is stored WITH the transaction.
 *   FR-TAX-5 — "Every order shall store the full tax and duty calculation
 *     breakdown as immutable data, so an invoice can be reproduced years later
 *     after rates change."
 *   DR-GEN-9 — market_code and seller_of_record on every order-scoped record.
 *     "They cannot be back-filled later", which is why both are required and
 *     non-nullable here rather than optional fields someone fills in later.
 *
 * So the order carries the landed-cost quote, the FX conversions, the delivery
 * terms, the withdrawal right and the addresses as VALUES. Reading an order back
 * never consults today's market configuration or today's rate tables — and the
 * test suite proves that by mutating both and re-reading the order.
 */

/** FR-ORD-1, including the two customs states cross-border shoppers ask about. */
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "in_transit"
  | "customs_clearance"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "failed"
  | "returned";

export const TERMINAL_STATUSES: OrderStatus[] = ["delivered", "cancelled", "failed", "returned"];

export interface OrderLine {
  sku: string;
  title: string;
  designer: string;
  size: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
  /** Snapshotted so a customs entry can be reproduced (FR-XBRD-11). */
  hsCode: string;
  countryOfOrigin: string;
  /** FR-CAT-19, needed for the customs description and labelling obligations. */
  fibres: Array<{ name: string; pct: number }>;
}

/** FR-CHK-16's right, snapshotted with the period that applied on the day. */
export interface WithdrawalRight {
  profile: string;
  days: number;
  /** Computed from delivery, so it does not move when the policy changes. */
  expiresAfterDeliveryDays: number;
  excludesCustomised: boolean;
}

export interface Order {
  id: string;
  /** DR-GEN-1: non-sequential and never exposing a counter. */
  orderNumber: string;

  /* DR-GEN-9. Mandatory, and deliberately not optional: an order without these
     cannot be assigned them afterwards. */
  marketCode: string;
  sellerOfRecord: string;

  status: OrderStatus;
  channel: "web" | "admin_created" | "mobile";

  currencyDisplay: string;
  currencySettlement: string;
  /* FR-PAY-10: the rate, its source and its timestamp as separate fields — not
     recoverable from a rate table later. */
  fxRate: number | null;
  fxSource: string | null;
  fxAt: string | null;
  /** Every leg, for FR-PAY-24's display/authorised/settled chain. */
  fxConversions: FxConversion[];

  deliveryTerms: DeliveryTerms | "domestic";

  lines: OrderLine[];
  subtotal: Money;
  discount: Money;
  tax: Money;
  shipping: Money;
  duty: Money;
  importTax: Money;
  fees: Money;
  creditApplied: Money;
  grandTotal: Money;

  /** FR-TAX-5: the immutable calculation, not a reference to one. */
  taxBreakdown: LandedCost | null;
  /** DR-XBD-1: the quote the customer actually accepted. */
  landedCostQuoteId: string | null;

  withdrawalRight: WithdrawalRight | null;

  /** Snapshots, not foreign keys — an address edited later must not rewrite history. */
  shippingAddress: Record<string, string> | null;
  billingAddress: Record<string, string> | null;

  contactEmail: string | null;
  placedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
}

/* ---------------------------------------------------------------- */
/* Placing an order                                                  */
/* ---------------------------------------------------------------- */

export interface PlaceOrderInput {
  market: Market;
  lines: OrderLine[];
  subtotal: Money;
  shipping: Money;
  quote: LandedCost | null;
  fxConversions: FxConversion[];
  contactEmail: string | null;
  placedAt: string;
  /** Injected so an order number is reproducible in a test and random in life. */
  randomToken: string;
}

/* DR-GEN-1: a human-communicable reference that is not a counter. Crockford's
   alphabet minus the letters that get misheard on a support call. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function formatOrderNumber(token: string): string {
  const clean = [...token.toUpperCase()].filter((c) => ALPHABET.includes(c)).join("");
  const body = clean.padEnd(8, "0").slice(0, 8);
  return `VD-${body.slice(0, 4)}-${body.slice(4, 8)}`;
}

export function placeOrder(input: PlaceOrderInput): Order {
  const { market, quote } = input;
  const currency = input.subtotal.currency;
  const zero: Money = { amount: 0, currency };

  if (!market.sellerOfRecord) {
    // DR-GEN-9 again: this cannot be back-filled, so it cannot be deferred.
    throw new Error(
      `Market ${market.code} has no seller of record; an order cannot be placed without one (FR-MKTS-6, DR-GEN-9).`
    );
  }
  if (!market.deliveryTerms) {
    throw new Error(
      `Market ${market.code} has no delivery terms; BRU-15 requires them before an order can be taken.`
    );
  }

  const first = input.fxConversions[0] ?? null;

  return {
    id: `ord_${input.randomToken}`,
    orderNumber: formatOrderNumber(input.randomToken),

    marketCode: market.code,
    sellerOfRecord: market.sellerOfRecord,

    status: "placed",
    channel: "web",

    currencyDisplay: currency,
    // Void settles in BDT; FR-PAY-24 requires the two recorded distinctly even
    // when they happen to match.
    currencySettlement: market.settlementCurrency,
    fxRate: first?.rate ?? null,
    fxSource: first?.source ?? null,
    fxAt: first?.rateAsOf ?? null,
    fxConversions: input.fxConversions,

    deliveryTerms: market.deliveryTerms,

    lines: input.lines,
    subtotal: input.subtotal,
    discount: zero,
    tax: quote ? quote.importTax : zero,
    shipping: input.shipping,
    duty: quote ? quote.duty : zero,
    importTax: quote ? quote.importTax : zero,
    fees: quote ? quote.brokerage : zero,
    creditApplied: zero,
    grandTotal: quote
      ? quote.total
      : { amount: input.subtotal.amount + input.shipping.amount, currency },

    taxBreakdown: quote,
    landedCostQuoteId: quote ? `lcq_${input.randomToken}` : null,

    /* FR-CHK-16: the right that applied ON THE DAY, with its period. A policy
       change next year must not silently shorten a right already granted. */
    withdrawalRight: market.statutoryRightsProfile
      ? {
          profile: market.statutoryRightsProfile,
          days: market.returnWindowDays,
          expiresAfterDeliveryDays: market.returnWindowDays,
          excludesCustomised: true,
        }
      : null,

    shippingAddress: null,
    billingAddress: null,

    contactEmail: input.contactEmail,
    placedAt: input.placedAt,
    confirmedAt: null,
    cancelledAt: null,
  };
}

/* DR-ORD-2: the total is recomputable from its parts. An order whose grand total
   does not reconcile is a defect, and this is how it gets caught rather than
   discovered during a reconciliation months later. */
export function reconciles(order: Order): boolean {
  const parts =
    order.subtotal.amount -
    order.discount.amount +
    order.shipping.amount +
    order.duty.amount +
    order.importTax.amount +
    order.fees.amount -
    order.creditApplied.amount;
  return parts === order.grandTotal.amount;
}

/** FR-XBRD-11: an export shipment needs a declaration record; BRU-17 makes it mandatory. */
export const requiresExportRecord = (order: Order): boolean => order.deliveryTerms !== "domestic";
