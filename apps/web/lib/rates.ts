import { money } from "@void/market";
import type { RateSet } from "@void/trade";

/* Per-market rate configuration, injected into the landed-cost engine.
 *
 * NFR-ARCH-4 requires the engine to take its rates as inputs, so this is where
 * they live — outside it. FR-TAX-4 requires them to be admin-editable with an
 * effective-date history and no deployment; this fixture stands in for that
 * table until the admin surface exists, and is shaped so the swap is a data
 * source change rather than a code change.
 *
 * Every rate below is ILLUSTRATIVE. Real duty rates, thresholds and scheme
 * parameters come from the business's trade adviser and the destination's
 * tariff, and J-7 leaves the rate SOURCE itself open. Nothing here should be
 * read as tariff advice or as a decision about which source Void will use.
 */

const GBP = (n: number) => money(n, "GBP");
const BDT = (n: number) => money(n, "BDT");

/** Domestic VAT. FR-TAX-2: prices display inclusive, with the component itemised. */
export const BD_VAT_RATE = 0.15;

export const RATES_BY_MARKET: Record<string, RateSet> = {
  /* United Kingdom — DAP in the seeded config. Duty relief below £135 since
     2021, supply VAT collected by the seller at or below that value. */
  uk: {
    source: "internal_table",
    dutyRates: [
      { hsPrefix: "6205", origin: "BD", destination: "GB", rate: 0.12 },
      { hsPrefix: "6204", origin: "BD", destination: "GB", rate: 0.12 },
      { hsPrefix: "6202", origin: "BD", destination: "GB", rate: 0.12 },
      { hsPrefix: "62", origin: "*", destination: "GB", rate: 0.1 },
      // FR-TAX-11's conservative catch-all: an unclassified line is never free.
      { hsPrefix: "", origin: "*", destination: "GB", rate: 0.04 },
    ],
    importTaxRate: 0.2,
    thresholds: [
      { id: "uk-135", destination: "GB", value: GBP(13_500), effectiveFrom: "2021-01-01", relieves: ["duty"] },
    ],
    schemes: [{ id: "uk-supply-vat", destination: "GB", threshold: GBP(13_500), taxRate: 0.2 }],
    brokerage: GBP(1_200),
    dutiableBasis: "cif",
  },

  /* India — DDP in the seeded config. No de minimis relief is configured, which
     under FR-TAX-8 means duty is charged: the default is no relief, never an
     assumed one. */
  in: {
    source: "internal_table",
    dutyRates: [
      { hsPrefix: "62", origin: "BD", destination: "IN", rate: 0.2 },
      { hsPrefix: "", origin: "*", destination: "IN", rate: 0.1 },
    ],
    importTaxRate: 0.12,
    thresholds: [],
    schemes: [],
    brokerage: money(50_000, "BDT"),
    dutiableBasis: "cif",
  },

  /* United Arab Emirates — delivery terms are unset (J-4), so this market
     cannot be enabled and this rate set is not yet reachable. It exists so the
     readiness gate has something to check rather than nothing. */
  ae: {
    source: "flat_market_rate",
    dutyRates: [{ hsPrefix: "", origin: "*", destination: "AE", rate: 0.05 }],
    importTaxRate: 0.05,
    thresholds: [],
    schemes: [],
    brokerage: BDT(30_000),
    dutiableBasis: "goods",
  },
};

/**
 * FR-TAX-11: "Where a duty provider is unavailable, the system shall fall back
 * to the configured conservative internal rate table and shall widen, not
 * remove, the disclosure — an unavailable provider is never grounds for showing
 * zero duty."
 *
 * So a missing rate set does not mean "no duty". It means the quote cannot be
 * made, and the caller must say so rather than quoting a total that omits it.
 */
export function ratesFor(marketCode: string): RateSet | undefined {
  return RATES_BY_MARKET[marketCode];
}
