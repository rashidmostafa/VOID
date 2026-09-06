import type { Market } from "./types";

/* Seed market configuration.
 *
 * Appendix J, J-1 — "which export markets open, and in what order" — is the
 * Founder's decision with commercial input, and its recorded default while open
 * is: "Build the market module; seed one DDP and one DAP example market."
 * That is exactly what this is.
 *
 * So: Bangladesh is enabled, because it is the home market and given. The three
 * markets named in the brief as the phased rollout are seeded as DRAFT — the
 * module supports them, nothing has decided they open. Two of them carry example
 * delivery terms so both branches of the landed-cost engine have a configuration
 * to be tested against; the third leaves the terms unset, which is the honest
 * state of J-4 and is what a real market looks like before the Founder answers.
 *
 * None of this is a commercial decision and none of it should be read as one.
 * FR-MKTS-2 requires all of it to be editable through the admin without a
 * deployment, so these values are a starting fixture, not a source of truth.
 *
 * Every one of the export markets fails `canEnable()` today, which is correct:
 * the carrier, duty-source, sanctions and legal-page checks are pending on
 * modules that do not exist.
 */

const BANGLADESH: Market = {
  code: "bd",
  name: "Bangladesh",
  tier: 1,
  status: "enabled",
  countries: ["BD"],
  defaultLocale: "bn",
  permittedLocales: ["bn", "en"],
  displayCurrency: "BDT",
  settlementCurrency: "BDT",
  taxRegime: "bd-vat",
  // FR-TAX-2: domestic pricing is VAT-inclusive with the component itemised.
  priceDisplayMode: "inclusive",
  deliveryTerms: "domestic",
  // BRU-16 permits COD domestically only, subject to the risk controls of §4.15.
  codEnabled: true,
  paymentMethods: ["bkash", "nagad", "rocket", "card_domestic", "cod"],
  carriers: ["pathao", "steadfast", "redx"],
  returnWindowDays: 14,
  statutoryRightsProfile: "bd-consumer-2009",
  sellerOfRecord: "void_bd",
  legalPageSet: ["terms", "privacy", "returns", "shipping"],
  supportHours: "09:00-21:00",
  supportTimezone: "Asia/Dhaka",
  complianceProfile: ["fibre-composition", "care-instructions"],
};

/* DDP example — Void prepays duty and import tax, and the quoted landed cost is
   charged at checkout (FR-XBRD-2). */
const INDIA: Market = {
  code: "in",
  name: "India",
  tier: 2,
  status: "draft",
  countries: ["IN"],
  defaultLocale: "en",
  permittedLocales: ["en", "bn"],
  displayCurrency: "INR",
  settlementCurrency: "BDT",
  taxRegime: "in-gst",
  priceDisplayMode: "inclusive",
  deliveryTerms: "ddp",
  codEnabled: false,
  paymentMethods: [],
  carriers: [],
  returnWindowDays: 14,
  statutoryRightsProfile: null,
  sellerOfRecord: null,
  legalPageSet: [],
  supportHours: null,
  supportTimezone: null,
  complianceProfile: ["fibre-composition", "care-instructions", "country-of-origin"],
};

/* DAP example — the buyer pays on or before delivery, and checkout must say so
   plainly rather than in a footnote (FR-XBRD-2, FR-XBRD-4). */
const UNITED_KINGDOM: Market = {
  code: "uk",
  name: "United Kingdom",
  tier: 2,
  status: "draft",
  countries: ["GB"],
  defaultLocale: "en",
  permittedLocales: ["en", "bn"],
  displayCurrency: "GBP",
  settlementCurrency: "BDT",
  taxRegime: "uk-vat",
  priceDisplayMode: "inclusive",
  deliveryTerms: "dap",
  codEnabled: false,
  paymentMethods: [],
  carriers: [],
  returnWindowDays: 14,
  // The UK grants a statutory right of withdrawal, which FR-CHK-16 requires
  // disclosing before the payment obligation is accepted.
  statutoryRightsProfile: "uk-ccr-2013",
  sellerOfRecord: null,
  legalPageSet: [],
  supportHours: null,
  supportTimezone: null,
  complianceProfile: ["fibre-composition", "care-instructions", "country-of-origin", "trader-identity"],
};

/* Terms deliberately unset. This is what a market looks like before J-4 is
   answered, and `canEnable` refuses it for that reason among others. */
const UAE: Market = {
  code: "ae",
  name: "United Arab Emirates",
  tier: 2,
  status: "draft",
  countries: ["AE"],
  defaultLocale: "en",
  permittedLocales: ["en", "bn"],
  displayCurrency: "AED",
  settlementCurrency: "BDT",
  taxRegime: "ae-vat",
  priceDisplayMode: "inclusive",
  deliveryTerms: null,
  codEnabled: false,
  paymentMethods: [],
  carriers: [],
  returnWindowDays: 14,
  statutoryRightsProfile: null,
  sellerOfRecord: null,
  legalPageSet: [],
  supportHours: null,
  supportTimezone: null,
  complianceProfile: ["fibre-composition", "care-instructions", "country-of-origin"],
};

export const MARKETS: readonly Market[] = [BANGLADESH, INDIA, UNITED_KINGDOM, UAE];

/** The fallback at the end of the FR-MKTS-3 precedence chain. */
export const DEFAULT_MARKET_CODE = "bd";

export const marketByCode = (code: string): Market | undefined =>
  MARKETS.find((m) => m.code === code.toLowerCase());

/** Markets a shopper may actually be served. FR-MKTS-5 keeps suspended readable. */
export const servableMarkets = (): Market[] =>
  MARKETS.filter((m) => m.status === "enabled" || m.status === "suspended");

/** Every locale any servable market permits — the set the app must translate. */
export const activeLocales = (): string[] =>
  [...new Set(servableMarkets().flatMap((m) => m.permittedLocales))];
