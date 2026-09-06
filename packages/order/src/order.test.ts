import { describe, expect, it } from "vitest";
import { convert, marketByCode, money, type FxRate, type Market } from "@void/market";
import { computeLandedCost, type RateSet } from "@void/trade";
import { formatOrderNumber, placeOrder, reconciles, requiresExportRecord, type OrderLine } from "./order";

/* The point of these tests is not that placeOrder builds an object. It is that
   the object stops depending on anything outside itself the moment it exists —
   which is what DR-GEN-10 and FR-TAX-5 actually require, and what nobody
   notices is missing until an invoice has to be reproduced. */

const uk = marketByCode("uk")!;
const bd = marketByCode("bd")!;
const GBP = (n: number) => money(n, "GBP");
const NOW = "2026-09-07T09:00:00Z";

const RATE: FxRate = { from: "BDT", to: "GBP", rate: 0.0071, source: "bb-daily", asOf: "2026-09-07T06:00:00Z" };

const RATES: RateSet = {
  source: "internal_table",
  dutyRates: [{ hsPrefix: "62", origin: "BD", destination: "GB", rate: 0.12 }],
  importTaxRate: 0.2,
  thresholds: [{ id: "uk-135", destination: "GB", value: GBP(13_500), effectiveFrom: "2021-01-01", relieves: ["duty"] }],
  schemes: [{ id: "uk-supply-vat", destination: "GB", threshold: GBP(13_500), taxRate: 0.2 }],
  brokerage: GBP(1_200),
  dutiableBasis: "cif",
};

const line: OrderLine = {
  sku: "RA-1180-IND",
  title: "Jamdani panel dress",
  designer: "Rina Ahmed",
  size: "M",
  quantity: 3,
  unitPrice: GBP(4_864),
  lineTotal: GBP(14_592),
  hsCode: "620443",
  countryOfOrigin: "BD",
  fibres: [{ name: "Cotton", pct: 100 }],
};

/* Overrides are applied AFTER the defaults, or a test that nulls a field would
   silently have it restored — which is how a guard gets "verified" without ever
   being exercised. */
function ukOrder(override: Partial<Market> = {}) {
  const market: Market = { ...uk, sellerOfRecord: "void_bd", deliveryTerms: "dap", ...override };
  const quote = computeLandedCost({
    lines: [{ sku: line.sku, hsCode: line.hsCode, countryOfOrigin: line.countryOfOrigin, quantity: 3, unitPrice: GBP(4_864) }],
    destination: "GB",
    deliveryTerms: "dap",
    shipping: GBP(43),
    rates: RATES,
    asOf: "2026-09-07",
  });
  const fx = convert(money(2_055_000, "BDT"), RATE, NOW);
  return placeOrder({
    market,
    lines: [line],
    subtotal: GBP(14_592),
    shipping: GBP(43),
    quote,
    fxConversions: [fx.conversion],
    contactEmail: "shopper@example.com",
    placedAt: NOW,
    randomToken: "7K4M2Q9X",
  });
}

describe("DR-GEN-9 — market and seller of record cannot be back-filled", () => {
  it("records both on the order", () => {
    const o = ukOrder();
    expect(o.marketCode).toBe("uk");
    expect(o.sellerOfRecord).toBe("void_bd");
  });

  it("refuses to place an order for a market with no seller of record", () => {
    expect(() => ukOrder({ sellerOfRecord: null })).toThrow(/no seller of record/);
  });

  it("refuses to place an order for a market with no delivery terms (BRU-15)", () => {
    const noTerms: Market = { ...uk, sellerOfRecord: "void_bd", deliveryTerms: null };
    expect(() =>
      placeOrder({
        market: noTerms, lines: [line], subtotal: GBP(1), shipping: GBP(0),
        quote: null, fxConversions: [], contactEmail: null, placedAt: NOW, randomToken: "A",
      })
    ).toThrow(/no delivery terms/);
  });
});

describe("DR-GEN-10 / FR-TAX-5 — the order survives its own configuration changing", () => {
  it("keeps the quote, the rates and the right after the tables move", () => {
    const o = ukOrder();

    const before = {
      duty: o.duty.amount,
      importTax: o.importTax.amount,
      total: o.grandTotal.amount,
      fxRate: o.fxRate,
      fxSource: o.fxSource,
      terms: o.deliveryTerms,
      seller: o.sellerOfRecord,
      withdrawalDays: o.withdrawalRight?.days,
      dutyRateOnLine: o.taxBreakdown?.lines[0].dutyRate,
      thresholdId: o.taxBreakdown?.relief?.thresholdId ?? null,
    };

    /* Everything the order was built from now changes: the duty rate doubles,
       the threshold is withdrawn, the FX rate moves, the market switches to DDP
       and shortens its return window. A system that read today's tables would
       report a different order. */
    RATES.dutyRates[0].rate = 0.24;
    RATES.thresholds.length = 0;
    RATE.rate = 0.0091;
    /* Self-check: the mutation must be MATERIAL, or this test passes for the
       wrong reason. A quote computed now, from the changed tables, must differ —
       otherwise "the order did not change" says nothing. */
    const recomputed = computeLandedCost({
      lines: [{ sku: line.sku, hsCode: line.hsCode, countryOfOrigin: line.countryOfOrigin, quantity: 3, unitPrice: GBP(4_864) }],
      destination: "GB",
      deliveryTerms: "dap",
      shipping: GBP(43),
      rates: RATES,
      asOf: "2026-09-07",
    });
    expect(recomputed.duty.amount).not.toBe(before.duty);

    expect(o.duty.amount).toBe(before.duty);
    expect(o.importTax.amount).toBe(before.importTax);
    expect(o.grandTotal.amount).toBe(before.total);
    expect(o.fxRate).toBe(before.fxRate);
    expect(o.fxSource).toBe(before.fxSource);
    expect(o.deliveryTerms).toBe(before.terms);
    expect(o.sellerOfRecord).toBe(before.seller);
    expect(o.withdrawalRight?.days).toBe(before.withdrawalDays);
    expect(o.taxBreakdown?.lines[0].dutyRate).toBe(before.dutyRateOnLine);
    expect(o.taxBreakdown?.relief?.thresholdId ?? null).toBe(before.thresholdId);

    // Restore, so ordering between test files cannot matter.
    RATES.dutyRates[0].rate = 0.12;
    RATES.thresholds.push({ id: "uk-135", destination: "GB", value: GBP(13_500), effectiveFrom: "2021-01-01", relieves: ["duty"] });
    RATE.rate = 0.0071;
  });

  it("stores the FX rate, source and timestamp as separate fields (FR-PAY-10)", () => {
    const o = ukOrder();
    expect(o.fxRate).toBe(0.0071);
    expect(o.fxSource).toBe("bb-daily");
    expect(o.fxAt).toBe("2026-09-07T06:00:00Z");
    expect(o.currencyDisplay).toBe("GBP");
    expect(o.currencySettlement).toBe("BDT");
  });

  it("carries the customs attributes a declaration will need (FR-XBRD-11)", () => {
    const o = ukOrder();
    expect(o.lines[0].hsCode).toBe("620443");
    expect(o.lines[0].countryOfOrigin).toBe("BD");
    expect(o.lines[0].fibres[0]).toEqual({ name: "Cotton", pct: 100 });
    expect(requiresExportRecord(o)).toBe(true);
  });
});

describe("DR-ORD-2 — the grand total reconciles from its parts", () => {
  it("reconciles for a cross-border order", () => {
    expect(reconciles(ukOrder())).toBe(true);
  });

  it("reconciles for a domestic order, where tax is inside the subtotal", () => {
    const o = placeOrder({
      market: bd,
      lines: [{ ...line, unitPrice: money(245_000, "BDT"), lineTotal: money(245_000, "BDT"), quantity: 1 }],
      subtotal: money(245_000, "BDT"),
      shipping: money(6_000, "BDT"),
      quote: null,
      fxConversions: [],
      contactEmail: null,
      placedAt: NOW,
      randomToken: "AAAA1111",
    });
    expect(o.deliveryTerms).toBe("domestic");
    expect(o.grandTotal.amount).toBe(251_000);
    expect(reconciles(o)).toBe(true);
    expect(requiresExportRecord(o)).toBe(false);
  });
});

describe("DR-GEN-1 — the order number is human-communicable and not a counter", () => {
  it("formats without characters that get misheard on a support call", () => {
    const n = formatOrderNumber("7K4M2Q9X");
    expect(n).toBe("VD-7K4M-2Q9X");
    expect(n).not.toMatch(/[ILOU]/);
  });

  it("exposes no sequence", () => {
    const a = formatOrderNumber("7K4M2Q9X");
    const b = formatOrderNumber("Z3PBN8TW");
    expect(a).not.toBe(b);
    expect(Number.isNaN(Number(a.replace(/\D/g, "")))).toBe(false);
    // Nothing in the format implies ordering or a count.
    expect(a.length).toBe(b.length);
  });
});
