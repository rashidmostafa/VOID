import type { ConversionPolicy, FxRate } from "@void/market";

/* Exchange rates, as a fixture.
 *
 * FR-I18N-3 requires "a live exchange-rate feed, cached, timestamped and
 * refreshed on a configurable interval". The feed is build step 12's; what
 * matters here is that every rate carries its SOURCE and its TIMESTAMP, because
 * those are what get stored on the order (FR-PAY-10) and what make an invoice
 * reproducible two years later (DR-GEN-10).
 *
 * The catalogue is priced in BDT, so these convert out of BDT. Rates are
 * illustrative and dated so the staleness path is exercised rather than
 * theoretical — a fixture that is always fresh never tests the branch that
 * matters.
 */

export const FX_SOURCE = "fixture-bb-daily";

export const RATES: FxRate[] = [
  { from: "BDT", to: "GBP", rate: 0.0071, source: FX_SOURCE, asOf: "2026-09-07T06:00:00Z" },
  { from: "BDT", to: "INR", rate: 0.74, source: FX_SOURCE, asOf: "2026-09-07T06:00:00Z" },
  { from: "BDT", to: "AED", rate: 0.031, source: FX_SOURCE, asOf: "2026-09-07T06:00:00Z" },
];

/**
 * FR-I18N-7: rounding and the margin buffer are configuration, and FR-ADM-47
 * forbids a business-configurable value becoming a code constant. The buffer is
 * deliberately ZERO here rather than an invented spread — choosing one is a
 * commercial decision nobody has made, and a silent 2% would be a real charge
 * applied on my authority.
 */
export const CONVERSION_POLICY: ConversionPolicy = {
  marginBuffer: 0,
  rounding: "nearest",
  roundToNearestMinor: 0,
  maxAgeSeconds: 24 * 60 * 60,
};

export const rateFor = (from: string, to: string): FxRate | undefined =>
  RATES.find((r) => r.from === from && r.to === to);
