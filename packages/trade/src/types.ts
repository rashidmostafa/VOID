import type { Money } from "@void/market";

/* Landed cost — SRS §4.7.2, FR-TAX-6..13.
 *
 * NFR-ARCH-4: "The Trade & Landed Cost module shall be pure and deterministic
 *  given its inputs, with all rate data injected. It shall be independently
 *  testable without a database or a network. This is the module most likely to
 *  be wrong in ways nobody notices until a customs bill arrives."
 *
 * So every rate, threshold and fee is an INPUT. Nothing in this package reads a
 * clock, a database, an environment variable or a network. `asOf` is passed in
 * because thresholds are dated and a quote must be reproducible years later
 * (DR-GEN-10) — a function that called Date.now() could not be.
 *
 * The build note in §4.7.2 states the shape directly: "Landed cost is a pure
 * function of (contents, origin, destination, terms, date, rates)."
 */

/** Where the duty rate came from. Recorded on the order (FR-TAX-7). */
export type RateSource = "provider" | "internal_table" | "flat_market_rate";

/** FR-TAX-11: a failed provider WIDENS the disclosure; it never removes duty. */
export type DisclosureLevel = "narrow" | "wide";

export type DeliveryTerms = "ddp" | "dap";

export interface Line {
  sku: string;
  /** FR-XBRD-6: 6-digit minimum, extensible to 8 or 10. */
  hsCode: string;
  /** ISO 3166-1 alpha-2. Distinct from where the parcel ships from. */
  countryOfOrigin: string;
  quantity: number;
  /** Integer minor units. */
  unitPrice: Money;
}

/** A duty rate, matched most-specific-first. */
export interface DutyRate {
  /** HS prefix: "6205" matches "620520". An empty string is the catch-all. */
  hsPrefix: string;
  /** ISO country, or "*" for any origin. */
  origin: string;
  destination: string;
  /** Fraction, e.g. 0.12 for 12%. */
  rate: number;
}

/**
 * FR-TAX-8: "De minimis and low-value thresholds shall be data, not code, with
 * an effective-from date... The system shall support a threshold of zero —
 * meaning no relief — and shall treat that as the default for any market not
 * explicitly configured."
 */
export interface Threshold {
  id: string;
  destination: string;
  /** Consignment value at or below which relief applies. Zero means no relief. */
  value: Money;
  /** ISO date. The latest threshold not after `asOf` wins. */
  effectiveFrom: string;
  /** What the relief covers. */
  relieves: Array<"duty" | "import_tax">;
}

/**
 * FR-TAX-9: a seller-collected import scheme — EU IOSS, UK supply VAT below
 * £135. Applies at or below its threshold; above it the standard import route
 * applies and checkout must say so.
 */
export interface CollectionScheme {
  id: string;
  destination: string;
  threshold: Money;
  /** Rate charged at checkout when the scheme applies. */
  taxRate: number;
}

export interface RateSet {
  source: RateSource;
  /** Set when a provider was asked and failed (FR-TAX-11). */
  providerFailed?: boolean;
  dutyRates: DutyRate[];
  /** Import tax (VAT/GST) on the standard route, as a fraction. */
  importTaxRate: number;
  thresholds: Threshold[];
  schemes: CollectionScheme[];
  /** Carrier brokerage or disbursement fee. Itemised, never folded into duty. */
  brokerage: Money;
  /** Whether duty is assessed on goods alone or goods + freight + insurance. */
  dutiableBasis: "goods" | "cif";
}

export interface LandedCostInput {
  lines: Line[];
  /** ISO 3166-1 alpha-2 of the delivery address. */
  destination: string;
  deliveryTerms: DeliveryTerms;
  shipping: Money;
  insurance?: Money;
  rates: RateSet;
  /** ISO date. Selects which dated thresholds are in force. */
  asOf: string;
}

/** Every component is itemised. FR-TAX-6 forbids an opaque "fees" line. */
export interface LandedCost {
  goods: Money;
  shipping: Money;
  insurance: Money;
  /** What duty was assessed on, per `dutiableBasis`. */
  dutiableValue: Money;
  duty: Money;
  importTax: Money;
  brokerage: Money;
  total: Money;

  /** FR-XBRD-2: what the shopper pays now versus on delivery. */
  payableAtCheckout: Money;
  payableOnDelivery: Money;

  deliveryTerms: DeliveryTerms;
  rateSource: RateSource;
  /** FR-TAX-11: "wide" when a provider failed and the fallback table was used. */
  disclosure: DisclosureLevel;

  /** The relief applied, or null. Recorded with its effective date (FR-TAX-12). */
  relief: { thresholdId: string; effectiveFrom: string; relieves: string[] } | null;
  /** The collection scheme considered, and whether it applied (FR-TAX-9). */
  scheme: { id: string; applied: boolean; reason: string } | null;

  /** Per-line duty, so an invoice can be reproduced line by line. */
  lines: Array<{ sku: string; hsCode: string; dutyRate: number; duty: Money }>;

  asOf: string;
}
