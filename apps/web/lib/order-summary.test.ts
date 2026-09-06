import { describe, expect, it } from "vitest";
import { marketByCode, money, type Market } from "@void/market";
import { buildSummary, includedTax, parseCart, serialiseCart } from "./order-summary";

const bd = marketByCode("bd")!;
const uk = marketByCode("uk")!;
const ae = marketByCode("ae")!;
const BDT = (n: number) => money(n, "BDT");
const ASOF = "2026-09-07";

describe("FR-TAX-2 — domestic prices are VAT-inclusive with the component itemised", () => {
  it("extracts the tax already inside the price rather than adding it", () => {
    // ৳100.00 gross at 15% -> net ৳86.96, VAT ৳13.04. The customer pays ৳100.00.
    expect(includedTax(BDT(10_000), 0.15).amount).toBe(1_304);
  });

  it("does not inflate the total by the tax it itemises", () => {
    const s = buildSummary([{ slug: "autumn-handloom-shirt", size: "M", quantity: 1 }], bd, BDT(6_000), ASOF);
    expect(s.mode).toBe("domestic");
    expect(s.goods.amount).toBe(245_000);
    expect(s.taxIsIncluded).toBe(true);
    // Total is goods + shipping. The VAT is inside the goods, not on top.
    expect(s.total.amount).toBe(251_000);
    expect(s.tax.amount).toBe(31_957);
    expect(s.duty.amount).toBe(0);
    expect(s.payableOnDelivery.amount).toBe(0);
  });

  it("would overcharge if tax were added — the regression this guards", () => {
    const s = buildSummary([{ slug: "autumn-handloom-shirt", size: "M", quantity: 1 }], bd, BDT(6_000), ASOF);
    expect(s.total.amount).not.toBe(s.goods.amount + s.shipping.amount + s.tax.amount);
  });
});

describe("FR-PAY-10 / FR-XBRD-2 — a cross-border quote, in the market's own currency", () => {
  const NOW = "2026-09-07T09:00:00Z";
  const q = (quantity: number) =>
    buildSummary([{ slug: "jamdani-panel-dress", size: "M", quantity }], uk, BDT(6_000), ASOF, NOW);

  it("quotes in GBP, not in the currency the catalogue happens to use", () => {
    const s = q(1);
    expect(s.mode).toBe("cross_border");
    expect(s.currency).toBe("GBP");
    expect(s.goods.currency).toBe("GBP");
    // ৳6,850.00 at 0.0071 = £48.64
    expect(s.goods.amount).toBe(4_864);
  });

  it("records every conversion, with its rate, source and timestamps", () => {
    const s = q(1);
    expect(s.conversions.length).toBeGreaterThan(0);
    for (const c of s.conversions) {
      expect(c.rate).toBe(0.0071);
      expect(c.source).toBe("fixture-bb-daily");
      expect(c.rateAsOf).toBe("2026-09-07T06:00:00Z");
      expect(c.appliedAt).toBe(NOW);
      expect(c.fromCurrency).toBe("BDT");
      expect(c.toCurrency).toBe("GBP");
    }
  });

  it("relieves duty below the £135 threshold and applies the collection scheme", () => {
    const s = q(1);
    expect(s.duty.amount).toBe(0);
    expect(s.quote?.relief?.thresholdId).toBe("uk-135");
    expect(s.quote?.scheme?.applied).toBe(true);
  });

  it("charges duty above the threshold, and splits it as DAP", () => {
    // 3 x £48.64 = £145.92, over £135.
    const s = q(3);
    expect(s.goods.amount).toBe(14_592);
    expect(s.duty.amount).toBeGreaterThan(0);
    expect(s.quote?.relief).toBeNull();
    expect(s.quote?.scheme?.applied).toBe(false);
    // UK is DAP: goods and shipping now, import charges to the carrier later.
    expect(s.payableAtCheckout.amount).toBe(s.goods.amount + s.shipping.amount);
    expect(s.payableOnDelivery.amount).toBe(s.duty.amount + s.tax.amount + s.fees.amount);
    expect(s.payableAtCheckout.amount + s.payableOnDelivery.amount).toBe(s.total.amount);
  });

  it("flags a stale rate rather than using it silently (Guardrail 5)", () => {
    // The fixture rate is dated; quote a year later and it is out of interval.
    const late = buildSummary(
      [{ slug: "jamdani-panel-dress", size: "M", quantity: 1 }],
      uk, BDT(6_000), "2027-09-07", "2027-09-07T09:00:00Z"
    );
    expect(late.usedStaleRate).toBe(true);
    // Still quoted, but the provenance is recorded — which is what Guardrail 5
    // actually requires, rather than refusing outright.
    expect(late.conversions.every((c) => c.source === "fixture-bb-daily")).toBe(true);
  });

  it("refuses when no rate exists for the market's currency", () => {
    const sgd: Market = { ...uk, displayCurrency: "SGD" };
    const s = buildSummary([{ slug: "jamdani-panel-dress", size: "M", quantity: 1 }], sgd, BDT(6_000), ASOF, NOW);
    expect(s.mode).toBe("unavailable");
    expect(s.unavailableReason).toBe("fx_required");
    expect(s.payableAtCheckout.amount).toBe(0);
  });
});

describe("BRU-15 / J-4 — a market with no delivery terms cannot be quoted", () => {
  it("refuses rather than guessing a branch", () => {
    expect(ae.deliveryTerms).toBeNull();
    const s = buildSummary([{ slug: "autumn-handloom-shirt", size: "M", quantity: 1 }], ae, BDT(6_000), ASOF);
    expect(s.mode).toBe("unavailable");
    expect(s.unavailableReason).toBe("delivery_terms_unset");
    // And it quotes nothing payable, rather than a total missing its duty.
    expect(s.payableAtCheckout.amount).toBe(0);
  });
});

describe("FR-TAX-11 — a missing rate source is not zero duty", () => {
  it("refuses the quote when no rate table exists for the market", () => {
    const unknown: Market = { ...uk, code: "zz", countries: ["ZZ"] };
    const s = buildSummary([{ slug: "autumn-handloom-shirt", size: "M", quantity: 1 }], unknown, BDT(6_000), ASOF);
    expect(s.mode).toBe("unavailable");
    expect(s.unavailableReason).toBe("no_rate_source");
    expect(s.duty.amount).toBe(0);
    // The point: it does not present a payable total that omits duty.
    expect(s.payableAtCheckout.amount).toBe(0);
  });
});

describe("the cart round-trips through the URL", () => {
  it("parses and reserialises without loss", () => {
    const items = [
      { slug: "autumn-handloom-shirt", size: "M", quantity: 2 },
      { slug: "silk-blend-scarf", size: "One size", quantity: 1 },
    ];
    expect(parseCart(serialiseCart(items))).toEqual(items);
  });

  it("drops entries that are not real pieces or not real quantities", () => {
    expect(parseCart("nope~M~1")).toEqual([]);
    expect(parseCart("autumn-handloom-shirt~M~0")).toEqual([]);
    expect(parseCart("autumn-handloom-shirt~M~x")).toEqual([]);
    expect(parseCart(undefined)).toEqual([]);
  });
});
