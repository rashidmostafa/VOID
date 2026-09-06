import { marketByCode, money } from "@void/market";
import { placeOrder, type Order, type OrderLine } from "@void/order";
import { CATALOGUE } from "./catalogue";
import { buildSummary, parseCart, type CartItem } from "./order-summary";

/* A fixture order store.
 *
 * The order module (build step 18) and the database are not built, so an order
 * is derived deterministically from the reference in the URL. That is a
 * fixture, and it has one property that matters for what these pages are
 * demonstrating: the order is BUILT ONCE from a cart and then read back as a
 * value, exactly as a stored row would be.
 *
 * What it deliberately does NOT do is prove persistence. A real order is written
 * at checkout and read afterwards; this one is reconstructed, so if the rate
 * tables changed between placement and viewing, this fixture would follow them
 * and a stored row would not. The snapshot discipline itself is proven in
 * packages/order's tests, which mutate the tables and re-read the order — that
 * is the assertion, not this file.
 */

/** Deterministic token from the cart string, so a reference is stable to share. */
function tokenFor(seed: string): string {
  let h = 2_166_136_261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16_777_619);
  }
  const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  let out = "";
  let n = h >>> 0;
  for (let i = 0; i < 8; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) + 7;
  }
  return out;
}

export interface PlacedOrder {
  order: Order;
  leadTimeDays: [number, number];
}

export function orderFromCart(
  cartValue: string | undefined,
  marketCode: string,
  now: string
): PlacedOrder | null {
  const items: CartItem[] = parseCart(cartValue);
  const market = marketByCode(marketCode);
  if (!market || items.length === 0) return null;

  const summary = buildSummary(items, market, money(6_000, "BDT"), now.slice(0, 10), now);
  if (summary.mode === "unavailable") return null;

  const lines: OrderLine[] = summary.lines.map((l) => ({
    sku: l.piece.sku,
    title: l.piece.title,
    designer: l.piece.designer,
    size: l.size,
    quantity: l.quantity,
    unitPrice: l.unit,
    lineTotal: l.total,
    hsCode: l.piece.hsCode,
    countryOfOrigin: l.piece.countryOfOrigin,
    fibres: l.piece.fibres,
  }));

  // The longest lead time in the basket governs the estimate.
  const leadTimeDays = summary.lines.reduce<[number, number]>(
    (acc, l) => [Math.max(acc[0], l.piece.leadTimeDays[0]), Math.max(acc[1], l.piece.leadTimeDays[1])],
    [0, 0]
  );

  const order = placeOrder({
    market,
    lines,
    subtotal: summary.goods,
    shipping: summary.shipping,
    quote: summary.quote,
    fxConversions: summary.conversions,
    contactEmail: "shopper@example.com",
    placedAt: now,
    randomToken: tokenFor(cartValue ?? ""),
  });

  return { order, leadTimeDays };
}

/** Look up by reference. A real store queries; this rebuilds from the same seed. */
export function orderByNumber(
  reference: string,
  cartValue: string | undefined,
  marketCode: string,
  now: string
): PlacedOrder | null {
  const placed = orderFromCart(cartValue, marketCode, now);
  if (!placed) return null;
  return placed.order.orderNumber === reference ? placed : null;
}

export const catalogueCount = CATALOGUE.length;
