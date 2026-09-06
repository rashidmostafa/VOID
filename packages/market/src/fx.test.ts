import { describe, expect, it } from "vitest";
import { money } from "./money";
import {
  DEFAULT_POLICY,
  convert,
  isStale,
  replay,
  settleThrough,
  type ConversionPolicy,
  type FxRate,
} from "./fx";

/* FX is where DR-GEN-10 is either honoured or quietly lost. These assert the
   record-keeping as hard as the arithmetic, because a correct number with no
   provenance cannot reproduce an invoice two years later. */

const BDT_GBP: FxRate = {
  from: "BDT",
  to: "GBP",
  rate: 0.0071, // 1 BDT = 0.0071 GBP
  source: "bb-daily",
  asOf: "2026-09-07T06:00:00Z",
};
const NOW = "2026-09-07T09:00:00Z";

describe("FR-PAY-10 / DR-GEN-10 — a conversion always produces its own record", () => {
  it("returns the rate, source and both timestamps alongside the amount", () => {
    const { money: out, conversion } = convert(money(245_000, "BDT"), BDT_GBP, NOW);
    // ৳2,450.00 x 0.0071 = £17.395 -> £17.40
    expect(out.amount).toBe(1_740);
    expect(out.currency).toBe("GBP");

    expect(conversion.rate).toBe(0.0071);
    expect(conversion.source).toBe("bb-daily");
    expect(conversion.rateAsOf).toBe("2026-09-07T06:00:00Z");
    expect(conversion.appliedAt).toBe(NOW);
    expect(conversion.fromCurrency).toBe("BDT");
    expect(conversion.toCurrency).toBe("GBP");
  });

  it("reproduces a historical figure from the stored record, not a current rate", () => {
    const { conversion } = convert(money(245_000, "BDT"), BDT_GBP, NOW);
    // The rate moves. The stored conversion must not.
    const moved: FxRate = { ...BDT_GBP, rate: 0.0091, asOf: "2028-01-01T00:00:00Z" };
    const today = convert(money(245_000, "BDT"), moved, "2028-01-01T00:00:00Z");

    expect(replay(conversion).amount).toBe(1_740);
    expect(today.money.amount).not.toBe(1_740);
    // The old invoice still reads £17.40 (FR-PAY-24's "never recompute").
    expect(replay(conversion).amount).toBe(conversion.toAmount);
  });

  it("refuses to apply a rate to the wrong currency", () => {
    expect(() => convert(money(100, "GBP"), BDT_GBP, NOW)).toThrow(/the amount is GBP/);
  });

  it("refuses a non-positive rate", () => {
    expect(() => convert(money(100, "BDT"), { ...BDT_GBP, rate: 0 }, NOW)).toThrow(/must be positive/);
  });
});

describe("FR-I18N-7 — rounding and the margin buffer are configurable", () => {
  const policy = (over: Partial<ConversionPolicy>): ConversionPolicy => ({ ...DEFAULT_POLICY, ...over });

  it("applies a margin buffer and records it", () => {
    const { money: out, conversion } = convert(money(245_000, "BDT"), BDT_GBP, NOW, policy({ marginBuffer: 0.02 }));
    // £17.395 x 1.02 = £17.7429 -> £17.74
    expect(out.amount).toBe(1_774);
    expect(conversion.marginBuffer).toBe(0.02);
  });

  it("honours the rounding mode", () => {
    const amount = money(245_000, "BDT"); // £17.395 before rounding
    expect(convert(amount, BDT_GBP, NOW, policy({ rounding: "down" })).money.amount).toBe(1_739);
    expect(convert(amount, BDT_GBP, NOW, policy({ rounding: "up" })).money.amount).toBe(1_740);
  });

  it("rounds to a readable step when configured", () => {
    // To the nearest £0.50, a converted price reads as a price.
    const out = convert(money(245_000, "BDT"), BDT_GBP, NOW, policy({ roundToNearestMinor: 50 }));
    expect(out.money.amount % 50).toBe(0);
    expect(out.money.amount).toBe(1_750);
  });

  it("handles currencies with different minor units", () => {
    // JPY has none: 100 BDT (1.00) at 1.55 is ¥2, not ¥155.
    const jpy: FxRate = { from: "BDT", to: "JPY", rate: 1.55, source: "x", asOf: BDT_GBP.asOf };
    expect(convert(money(100, "BDT"), jpy, NOW).money.amount).toBe(2);
  });
});

describe("Guardrail 5 / FR-I18N-3 — a stale rate is flagged, never silently used", () => {
  it("marks a rate older than the configured interval", () => {
    const old: FxRate = { ...BDT_GBP, asOf: "2026-09-01T00:00:00Z" };
    expect(isStale(old, NOW, DEFAULT_POLICY)).toBe(true);
    expect(convert(money(100, "BDT"), old, NOW).conversion.stale).toBe(true);
  });

  it("does not flag a rate inside the interval", () => {
    expect(convert(money(100, "BDT"), BDT_GBP, NOW).conversion.stale).toBe(false);
  });

  it("still records the source and timestamp when the rate is stale", () => {
    const old: FxRate = { ...BDT_GBP, asOf: "2020-01-01T00:00:00Z" };
    const { conversion } = convert(money(100, "BDT"), old, NOW);
    // Guardrail 5 permits a stale rate only if its provenance is recorded.
    expect(conversion.source).toBe("bb-daily");
    expect(conversion.rateAsOf).toBe("2020-01-01T00:00:00Z");
    expect(conversion.stale).toBe(true);
  });
});

describe("FR-PAY-24 — display, authorised and settled are modelled honestly", () => {
  it("stores every leg with its own rate and timestamp", () => {
    const gbpToBdt: FxRate = { from: "GBP", to: "BDT", rate: 141.0, source: "psp", asOf: "2026-09-07T07:00:00Z" };
    const chain = settleThrough(money(245_000, "BDT"), [{ rate: BDT_GBP }, { rate: gbpToBdt }], NOW);

    expect(chain.display.currency).toBe("BDT");
    expect(chain.authorised.currency).toBe("GBP");
    expect(chain.settled.currency).toBe("BDT");
    expect(chain.conversions).toHaveLength(2);
    expect(chain.conversions.map((c) => c.source)).toEqual(["bb-daily", "psp"]);
    // A round trip does not return the original — the spread is real, and
    // pretending otherwise is how a reconciliation gap appears months later.
    expect(chain.settled.amount).not.toBe(245_000);
  });

  it("leaves all three equal when there is nothing to convert", () => {
    const chain = settleThrough(money(245_000, "BDT"), [], NOW);
    expect(chain.authorised).toEqual(chain.display);
    expect(chain.settled).toEqual(chain.display);
    expect(chain.conversions).toEqual([]);
  });
});
