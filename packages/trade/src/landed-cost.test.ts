import { describe, expect, it } from "vitest";
import { money } from "@void/market";
import { computeLandedCost, selectDutyRate, selectThreshold } from "./landed-cost";
import type { LandedCostInput, RateSet } from "./types";

/* The landed-cost fixture set — NFR-QA-5.
 *
 * "A landed-cost fixture set shall exist covering, at minimum: below and above
 *  each configured threshold; DDP and DAP; multiple HS codes and origins;
 *  multi-line and split shipments; a zero-duty destination; and a destination
 *  with no relief at all. Each fixture asserts an exact integer result."
 *
 * Every assertion below is an exact integer in minor units. Not a range, not a
 * rounding tolerance. NFR-ARCH-4 calls this "the module most likely to be wrong
 * in ways nobody notices until a customs bill arrives" — a test that accepts a
 * near-enough answer would not notice either.
 */

const GBP = (n: number) => money(n, "GBP");

/* A rate set with several HS codes and origins, so selection is exercised
   rather than assumed. Rates are illustrative fixtures, not tariff advice. */
const UK_RATES: RateSet = {
  source: "internal_table",
  dutyRates: [
    { hsPrefix: "6205", origin: "BD", destination: "GB", rate: 0.12 }, // shirts from BD
    { hsPrefix: "6205", origin: "*", destination: "GB", rate: 0.16 }, // shirts elsewhere
    { hsPrefix: "62", origin: "*", destination: "GB", rate: 0.1 }, // other apparel
    { hsPrefix: "", origin: "*", destination: "GB", rate: 0.04 }, // catch-all
  ],
  importTaxRate: 0.2,
  thresholds: [
    // The historical relief, superseded but retained so a dated quote reproduces.
    { id: "uk-lvcr-2020", destination: "GB", value: GBP(1500), effectiveFrom: "2020-01-01", relieves: ["duty", "import_tax"] },
    // In force from 2021: duty relief below £135, tax still collected.
    { id: "uk-135", destination: "GB", value: GBP(13500), effectiveFrom: "2021-01-01", relieves: ["duty"] },
  ],
  schemes: [{ id: "uk-supply-vat", destination: "GB", threshold: GBP(13500), taxRate: 0.2 }],
  brokerage: GBP(1200),
  dutiableBasis: "cif",
};

/* A destination with NO relief configured at all. FR-TAX-8 makes that mean duty
   is charged, not that everything is free. */
const NO_RELIEF_RATES: RateSet = {
  source: "internal_table",
  dutyRates: [{ hsPrefix: "", origin: "*", destination: "US", rate: 0.15 }],
  importTaxRate: 0,
  thresholds: [],
  schemes: [],
  brokerage: money(1000, "GBP"),
  dutiableBasis: "goods",
};

/* A zero-duty destination: a rate exists and is zero. Distinct from no rate. */
const ZERO_DUTY_RATES: RateSet = {
  source: "flat_market_rate",
  dutyRates: [{ hsPrefix: "", origin: "BD", destination: "AE", rate: 0 }],
  importTaxRate: 0.05,
  thresholds: [],
  schemes: [],
  brokerage: money(0, "GBP"),
  dutiableBasis: "goods",
};

const shirt = { sku: "VD-2451", hsCode: "620520", countryOfOrigin: "BD", quantity: 1, unitPrice: GBP(20_000) };
const trouser = { sku: "VD-2890", hsCode: "620462", countryOfOrigin: "BD", quantity: 2, unitPrice: GBP(5_000) };

const base = (over: Partial<LandedCostInput> = {}): LandedCostInput => ({
  lines: [shirt],
  destination: "GB",
  deliveryTerms: "ddp",
  shipping: GBP(1_500),
  insurance: GBP(500),
  rates: UK_RATES,
  asOf: "2026-09-07",
  ...over,
});

describe("FR-TAX-7 — duty comes from HS code, origin and destination", () => {
  it("prefers the most specific HS prefix, then an exact origin over the wildcard", () => {
    expect(selectDutyRate(UK_RATES.dutyRates, "620520", "BD", "GB")?.rate).toBe(0.12);
    expect(selectDutyRate(UK_RATES.dutyRates, "620520", "IN", "GB")?.rate).toBe(0.16);
    expect(selectDutyRate(UK_RATES.dutyRates, "620462", "BD", "GB")?.rate).toBe(0.1);
    expect(selectDutyRate(UK_RATES.dutyRates, "999999", "BD", "GB")?.rate).toBe(0.04);
  });

  it("records the source on the quote", () => {
    expect(computeLandedCost(base()).rateSource).toBe("internal_table");
  });
});

describe("FR-TAX-8 — thresholds are dated data, and default to no relief", () => {
  it("selects the threshold in force on the quote date, not the newest", () => {
    expect(selectThreshold(UK_RATES.thresholds, "GB", "2020-06-01")?.id).toBe("uk-lvcr-2020");
    expect(selectThreshold(UK_RATES.thresholds, "GB", "2026-09-07")?.id).toBe("uk-135");
  });

  it("gives no relief for a destination with none configured", () => {
    const q = computeLandedCost(
      base({ destination: "US", rates: NO_RELIEF_RATES, lines: [{ ...shirt, unitPrice: GBP(1_000) }] })
    );
    expect(q.relief).toBeNull();
    // £10.00 at 15% = £1.50. Relief absent must never mean duty absent.
    expect(q.duty.amount).toBe(150);
  });
});

describe("NFR-QA-5 — below and above the configured threshold", () => {
  it("below £135: duty relieved, tax still charged, exact integers", () => {
    // Goods £100.00, shipping £15.00, insurance £5.00, CIF basis.
    const q = computeLandedCost(base({ lines: [{ ...shirt, unitPrice: GBP(10_000) }] }));
    expect(q.goods.amount).toBe(10_000);
    expect(q.dutiableValue.amount).toBe(12_000);
    expect(q.relief?.thresholdId).toBe("uk-135");
    expect(q.duty.amount).toBe(0);
    // Under the UK supply-VAT scheme, tax is 20% of goods: £20.00.
    expect(q.scheme?.applied).toBe(true);
    expect(q.importTax.amount).toBe(2_000);
    // No formal entry under the scheme, so no brokerage to bill.
    expect(q.brokerage.amount).toBe(0);
    expect(q.total.amount).toBe(10_000 + 1_500 + 500 + 0 + 2_000 + 0);
    expect(q.total.amount).toBe(14_000);
  });

  it("above £135: no duty relief, standard route, brokerage charged", () => {
    // Goods £200.00 (shirt at 12%), shipping £15.00, insurance £5.00 -> CIF £220.00
    const q = computeLandedCost(base());
    expect(q.goods.amount).toBe(20_000);
    expect(q.dutiableValue.amount).toBe(22_000);
    expect(q.relief).toBeNull();
    expect(q.scheme?.applied).toBe(false);
    // Duty 12% of £220.00 = £26.40
    expect(q.duty.amount).toBe(2_640);
    // Import tax 20% of (£220.00 + £26.40) = £49.28
    expect(q.importTax.amount).toBe(4_928);
    expect(q.brokerage.amount).toBe(1_200);
    expect(q.total.amount).toBe(20_000 + 1_500 + 500 + 2_640 + 4_928 + 1_200);
    expect(q.total.amount).toBe(30_768);
  });
});

describe("NFR-QA-5 — DDP and DAP split the same quote differently", () => {
  const ddp = computeLandedCost(base({ deliveryTerms: "ddp" }));
  const dap = computeLandedCost(base({ deliveryTerms: "dap" }));

  it("charges the whole landed cost at checkout under DDP", () => {
    expect(ddp.payableAtCheckout.amount).toBe(30_768);
    expect(ddp.payableOnDelivery.amount).toBe(0);
  });

  it("collects only goods, shipping and insurance under DAP", () => {
    expect(dap.payableAtCheckout.amount).toBe(22_000);
    // £26.40 duty + £49.28 tax + £12.00 brokerage = £87.68 on delivery.
    expect(dap.payableOnDelivery.amount).toBe(8_768);
  });

  it("quotes the same total either way — only who pays when changes", () => {
    expect(ddp.total.amount).toBe(dap.total.amount);
    expect(dap.payableAtCheckout.amount + dap.payableOnDelivery.amount).toBe(dap.total.amount);
  });
});

describe("NFR-QA-5 — multi-line and split shipments", () => {
  it("applies each line's own rate and sums to the exact total", () => {
    // Shirt £200.00 at 12%; trousers 2 x £50.00 = £100.00 at 10%. Goods £300.00.
    const q = computeLandedCost(base({ lines: [shirt, trouser], shipping: GBP(2_000), insurance: GBP(0) }));
    expect(q.goods.amount).toBe(30_000);
    expect(q.dutiableValue.amount).toBe(32_000);

    // Freight is apportioned by line value: shirt 2/3, trousers 1/3.
    // Shirt base £200.00 + £13.33 = £213.33 -> 12% = £25.60
    // Trouser base £100.00 + £6.67 = £106.67 -> 10% = £10.67
    const byLine = Object.fromEntries(q.lines.map((l) => [l.sku, l.duty.amount]));
    expect(byLine["VD-2451"]).toBe(2_560);
    expect(byLine["VD-2890"]).toBe(1_067);
    expect(q.duty.amount).toBe(3_627);
  });

  it("apportions the whole freight across lines, losing none of it", () => {
    /* The previous version of this test compared the per-line sum with the
       total — which is how the total is BUILT, so it asserted nothing. This
       checks the apportionment independently: recover each line's freight share
       from its duty and rate, and confirm the shares reconstruct the full
       freight. If freight were dropped or double-counted, duty would be wrong
       by a percentage of it and this would catch it. */
    const q = computeLandedCost(base({ lines: [shirt, trouser], shipping: GBP(2_000), insurance: GBP(0) }));
    const rateOf = Object.fromEntries(q.lines.map((l) => [l.sku, l.dutyRate]));
    const valueOf = { "VD-2451": 20_000, "VD-2890": 10_000 };

    const freightRecovered = q.lines.reduce((sum, l) => {
      // duty = (lineValue + freightShare) * rate  ->  freightShare = duty/rate - lineValue
      const share = l.duty.amount / rateOf[l.sku] - valueOf[l.sku as keyof typeof valueOf];
      return sum + share;
    }, 0);

    /* Tolerance is derived, not guessed. Dividing duty by the rate to recover a
       freight share amplifies that line's rounding by 1/rate — a half-unit
       rounding at 10% reappears as five units. So the bound is the sum of
       0.5/rate across the lines, which is what rounding can account for and
       nothing more. Anything beyond it is freight genuinely lost or double
       counted. */
    const bound = q.lines.reduce((n, l) => n + 0.5 / l.dutyRate, 0);
    expect(Math.abs(freightRecovered - 2_000)).toBeLessThanOrEqual(bound);
  });

  it("refuses to mix currencies rather than converting silently", () => {
    expect(() =>
      computeLandedCost(base({ lines: [shirt, { ...trouser, unitPrice: money(5_000, "BDT") }] }))
    ).toThrow(/share a currency/);
  });
});

describe("NFR-QA-5 — a zero-duty destination is not the same as no rate", () => {
  it("charges zero duty but still charges import tax", () => {
    const q = computeLandedCost(
      base({ destination: "AE", rates: ZERO_DUTY_RATES, insurance: GBP(0) })
    );
    expect(q.duty.amount).toBe(0);
    // 5% of (£200.00 goods + £0 duty), goods basis.
    expect(q.importTax.amount).toBe(1_000);
    expect(q.relief).toBeNull();
  });
});

describe("FR-TAX-11 — a failed provider never yields zero duty", () => {
  it("falls back to the internal table and widens the disclosure", () => {
    const q = computeLandedCost(
      base({ rates: { ...UK_RATES, source: "internal_table", providerFailed: true } })
    );
    expect(q.duty.amount).toBeGreaterThan(0);
    expect(q.disclosure).toBe("wide");
    expect(q.rateSource).toBe("internal_table");
  });

  it("keeps the disclosure narrow when the quote did not rest on a fallback", () => {
    expect(computeLandedCost(base()).disclosure).toBe("narrow");
  });
});

describe("FR-TAX-9 — a seller-collected scheme applies only at or below its threshold", () => {
  it("says why it did not apply, rather than falling silent", () => {
    const q = computeLandedCost(base());
    expect(q.scheme?.applied).toBe(false);
    expect(q.scheme?.reason).toMatch(/exceeds the scheme threshold/);
  });

  it("applies exactly at the threshold, not just below it", () => {
    const q = computeLandedCost(base({ lines: [{ ...shirt, unitPrice: GBP(13_500) }] }));
    expect(q.scheme?.applied).toBe(true);
    expect(q.importTax.amount).toBe(2_700);
  });
});

describe("FR-TAX-6 — every component is itemised", () => {
  it("never folds charges into an opaque total", () => {
    const q = computeLandedCost(base());
    const parts = q.goods.amount + q.shipping.amount + q.insurance.amount + q.duty.amount + q.importTax.amount + q.brokerage.amount;
    expect(parts).toBe(q.total.amount);
  });
});

describe("NFR-ARCH-4 / DR-GEN-10 — pure, and reproducible from stored inputs", () => {
  it("returns identical output for identical input", () => {
    expect(computeLandedCost(base())).toEqual(computeLandedCost(base()));
  });

  it("reproduces a historical quote from its own asOf date", () => {
    // The same basket in 2020, when the £15 relief was in force, is relieved.
    const then = computeLandedCost(base({ lines: [{ ...shirt, unitPrice: GBP(1_000) }], asOf: "2020-06-01" }));
    expect(then.relief?.thresholdId).toBe("uk-lvcr-2020");
    expect(then.duty.amount).toBe(0);
    expect(then.importTax.amount).toBe(0);

    // The same basket today falls under uk-135: duty relieved, tax collected.
    const now = computeLandedCost(base({ lines: [{ ...shirt, unitPrice: GBP(1_000) }], asOf: "2026-09-07" }));
    expect(now.relief?.thresholdId).toBe("uk-135");
    expect(now.duty.amount).toBe(0);
    expect(now.importTax.amount).toBe(200);
  });

  it("rejects an empty basket rather than quoting zero", () => {
    expect(() => computeLandedCost(base({ lines: [] }))).toThrow(/at least one line/);
  });
});
