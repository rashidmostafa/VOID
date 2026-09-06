import { addMoney, convert, money, type FxConversion, type Market, type Money } from "@void/market";
import { computeLandedCost, type LandedCost, type Line } from "@void/trade";
import { CATALOGUE, type Piece } from "./catalogue";
import { BD_VAT_RATE, ratesFor } from "./rates";
import { CONVERSION_POLICY, rateFor } from "./fx-rates";

/* The order summary — one itemisation for two materially different cases.
 *
 * FR-CHK-4 requires "a full itemised order summary... line items, discounts,
 * shipping, tax, duty and import tax, credits applied, and grand total, together
 * with the delivery-terms statement".
 *
 * The two cases are not variations of each other:
 *
 *   DOMESTIC — FR-TAX-2: "Domestic pricing shall be displayed VAT-inclusive with
 *   the tax component itemised." The tax is already IN the price and must be
 *   extracted, not added. Adding it would overcharge every domestic order.
 *
 *   CROSS-BORDER — the landed-cost engine, with duty and import tax computed on
 *   top and split by delivery terms.
 *
 * Both produce the same shape so the UI renders one component. What the UI must
 * not do is guess which case it is in — `mode` says so explicitly.
 */

export interface SummaryLine {
  piece: Piece;
  size: string;
  quantity: number;
  unit: Money;
  total: Money;
}

export interface OrderSummary {
  mode: "domestic" | "cross_border" | "unavailable";
  currency: string;
  lines: SummaryLine[];

  goods: Money;
  shipping: Money;
  /** Domestic: the VAT already inside `goods`. Cross-border: import tax on top. */
  tax: Money;
  /** Whether `tax` is contained in `goods` or added to the total (FR-TAX-3). */
  taxIsIncluded: boolean;
  duty: Money;
  fees: Money;
  total: Money;

  payableAtCheckout: Money;
  payableOnDelivery: Money;

  /** Present only for a cross-border quote, and stored immutably on the order. */
  quote: LandedCost | null;
  /** Why a quote could not be produced, when mode is "unavailable". */
  unavailableReason?: string;
  /** Every FX conversion applied, for storage on the order (FR-PAY-10, DR-GEN-10). */
  conversions: FxConversion[];
  /** True when any rate used was older than the configured interval. */
  usedStaleRate: boolean;
}

export interface CartItem {
  slug: string;
  size: string;
  quantity: number;
}

/** Parse the cart from the URL. A cart in the address is shareable and needs no
    client JS; the cart module (build step 11) replaces this, not the UI. */
export function parseCart(value: string | undefined): CartItem[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => {
      const [slug, size, qty] = part.split("~");
      const quantity = Number(qty);
      if (!slug || !size || !Number.isInteger(quantity) || quantity < 1) return null;
      return CATALOGUE.some((p) => p.slug === slug) ? { slug, size, quantity } : null;
    })
    .filter((x): x is CartItem => x !== null);
}

export const serialiseCart = (items: CartItem[]): string =>
  items.map((i) => `${i.slug}~${i.size}~${i.quantity}`).join(",");

/** Extract the tax already inside a VAT-inclusive price (FR-TAX-2). */
export function includedTax(gross: Money, rate: number): Money {
  // gross = net * (1 + rate)  ->  tax = gross - gross/(1+rate)
  return money(Math.round(gross.amount - gross.amount / (1 + rate)), gross.currency);
}

export function buildSummary(
  items: CartItem[],
  market: Market,
  shippingBdt: Money,
  asOf: string,
  now: string = `${asOf}T09:00:00Z`
): OrderSummary {
  /* The quote is produced in the MARKET'S display currency, because that is
     what the shopper is shown and what they will be charged (FR-I18N-3,
     FR-TAX-3). Converting the rate table into taka instead would quote in a
     currency nobody sees and leave the £135 threshold comparison meaningless. */
  const currency = market.displayCurrency;
  const zero = money(0, currency);
  const conversions: FxConversion[] = [];

  const rate = currency === "BDT" ? undefined : rateFor("BDT", currency);
  const toDisplay = (minorBdt: number): Money | null => {
    if (currency === "BDT") return money(minorBdt, "BDT");
    if (!rate) return null;
    const { money: out, conversion } = convert(money(minorBdt, "BDT"), rate, now, CONVERSION_POLICY);
    conversions.push(conversion);
    return out;
  };

  const converted = items.map((item) => {
    const piece = CATALOGUE.find((p) => p.slug === item.slug);
    if (!piece) return null;
    const unit = toDisplay(piece.priceBdt);
    return unit ? { piece, item, unit } : null;
  });

  /* FR-I18N-3 / Guardrail 5: no rate means no price. Showing the taka figure
     under a GBP label would be a false price, and UI-INV-11 makes a shown price
     contractual. */
  const missingRate = converted.some((c) => c === null && items.length > 0) || (currency !== "BDT" && !rate);

  const lines: SummaryLine[] = converted.flatMap((c) =>
    c === null ? [] : [{
      piece: c.piece,
      size: c.item.size,
      quantity: c.item.quantity,
      unit: c.unit,
      total: money(c.unit.amount * c.item.quantity, currency),
    }]
  );

  const goods = lines.reduce((sum, l) => addMoney(sum, l.total), zero);
  const shippingConverted = currency === "BDT" ? shippingBdt : (toDisplay(shippingBdt.amount) ?? zero);
  const shipping = shippingConverted;
  const usedStaleRate = conversions.some((c) => c.stale);

  const empty = {
    currency,
    lines,
    goods,
    shipping,
    taxIsIncluded: market.priceDisplayMode === "inclusive",
    quote: null,
    conversions,
    usedStaleRate,
  };

  if (missingRate) {
    return {
      ...empty, mode: "unavailable", tax: zero, duty: zero, fees: zero,
      total: goods, payableAtCheckout: zero, payableOnDelivery: zero,
      unavailableReason: "fx_required",
    };
  }

  /* Domestic. Tax is inside the price and is shown, not added. */
  if (market.deliveryTerms === "domestic") {
    const tax = includedTax(goods, BD_VAT_RATE);
    const total = addMoney(goods, shipping);
    return {
      ...empty,
      mode: "domestic",
      tax,
      taxIsIncluded: true,
      duty: zero,
      fees: zero,
      total,
      payableAtCheckout: total,
      payableOnDelivery: zero,
    };
  }

  /* Cross-border. A market with no delivery terms cannot be quoted at all —
     BRU-15 makes the setting mandatory before enablement, and guessing a branch
     here would be exactly the "resolve an open decision by inference" the
     Build-Agent Protocol forbids (J-4). */
  if (!market.deliveryTerms) {
    return {
      ...empty, mode: "unavailable", tax: zero, duty: zero, fees: zero,
      total: goods, payableAtCheckout: zero, payableOnDelivery: zero,
      unavailableReason: "delivery_terms_unset",
    };
  }

  const rates = ratesFor(market.code);
  if (!rates) {
    // FR-TAX-11: no rates is not zero duty. The quote is refused.
    return {
      ...empty, mode: "unavailable", tax: zero, duty: zero, fees: zero,
      total: goods, payableAtCheckout: zero, payableOnDelivery: zero,
      unavailableReason: "no_rate_source",
    };
  }

  /* The rate table must already be in the quote currency. Goods were converted
     above with a recorded rate; a rate table in a third currency would need a
     second conversion whose provenance nobody asked for. */
  const rateCurrency = rates.brokerage.currency;
  if (rateCurrency !== currency) {
    return {
      ...empty, mode: "unavailable", tax: zero, duty: zero, fees: zero,
      total: goods, payableAtCheckout: zero, payableOnDelivery: zero,
      unavailableReason: "fx_required",
    };
  }

  const tradeLines: Line[] = lines.map((l) => ({
    sku: l.piece.sku,
    hsCode: l.piece.hsCode,
    countryOfOrigin: l.piece.countryOfOrigin,
    quantity: l.quantity,
    unitPrice: l.unit,
  }));

  const quote = computeLandedCost({
    lines: tradeLines,
    destination: market.countries[0],
    deliveryTerms: market.deliveryTerms,
    shipping,
    rates,
    asOf,
  });

  return {
    ...empty,
    mode: "cross_border",
    tax: quote.importTax,
    taxIsIncluded: false,
    duty: quote.duty,
    fees: quote.brokerage,
    total: quote.total,
    payableAtCheckout: quote.payableAtCheckout,
    payableOnDelivery: quote.payableOnDelivery,
    quote,
  };
}
