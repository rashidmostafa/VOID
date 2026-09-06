/* The market entity — SRS §4.16, FR-MKTS-1.
 *
 * "This section makes 'which countries do we sell to, and on what terms' into
 *  first-class configuration. Without it, international expansion is a series of
 *  code changes, which is the failure mode this whole revision exists to prevent."
 *
 * Appendix G.2 puts the market module under `api/src/modules/market/`. There is
 * no API app yet, and the storefront needs resolution at the edge to route, so
 * the entity, its readiness rules and the resolution function live here as a
 * shared package. The behaviour is pure and has no I/O, so it moves into the API
 * module unchanged when that exists.
 *
 * Nothing here resolves an Appendix J decision. Where one binds, the field
 * exists, the abstraction is built, and the value is left unset — which is what
 * "build the abstraction and the configuration surface; do not hard-code one
 * branch of it" requires.
 */

export type MarketStatus = "draft" | "ready" | "enabled" | "suspended" | "closed";

/** BRU-15. `null` until the Founder decides (J-4); enablement is blocked while it is. */
export type DeliveryTerms = "ddp" | "dap" | "domestic";

export type PriceDisplayMode = "inclusive" | "exclusive";

/** FR-MKTS-6. Changes invoices, consumer-law counterparty and GPSR position. */
export type SellerOfRecord = "void_bd" | "void_foreign_entity" | "merchant_of_record" | "vendor";

export interface Market {
  /** Stable identifier, and the URL path segment (FR-MKTS-4). */
  code: string;
  name: string;
  tier: 1 | 2 | 3;
  status: MarketStatus;

  /** ISO 3166-1 alpha-2. */
  countries: string[];

  defaultLocale: string;
  permittedLocales: string[];

  /** ISO 4217. Display and settlement are distinct and both recorded (FR-PAY-10). */
  displayCurrency: string;
  settlementCurrency: string;

  taxRegime: string;
  /** FR-TAX-3. Showing exclusive prices to an inclusive market is unlawful in several. */
  priceDisplayMode: PriceDisplayMode;

  /** BRU-15 / J-4. Null means undecided, which blocks enablement. */
  deliveryTerms: DeliveryTerms | null;

  /** BRU-16. Never true for a cross-border market. */
  codEnabled: boolean;

  paymentMethods: string[];
  carriers: string[];

  returnWindowDays: number;
  statutoryRightsProfile: string | null;

  sellerOfRecord: SellerOfRecord | null;

  legalPageSet: string[];
  supportHours: string | null;
  supportTimezone: string | null;

  /** FR-XBRD-17. Disclosures a listing must carry to be offered here. */
  complianceProfile: string[];
}

/* ---------------------------------------------------------------- */
/* Readiness — FR-MKTS-12/13                                         */
/* ---------------------------------------------------------------- */

/**
 * "A market shall not move to Enabled until every item on the readiness
 *  checklist passes. The checklist shall be enforced by the system."
 *
 * This is the enforcement, not a report of it. The admin surface (FR-MKTS-12)
 * displays these and records sign-off per item; the point here is that nothing
 * can set `status: "enabled"` while any of them fails.
 *
 * The list is deliberately incomplete against FR-MKTS-13: carrier serviceability,
 * a tested duty rate source, sanctions screening and published legal pages cannot
 * be checked without the modules that own them. Each is named as `pending` rather
 * than silently omitted, so the gap is visible instead of looking like a pass.
 */
export type ReadinessOutcome = "pass" | "fail" | "pending";

export interface ReadinessItem {
  id: string;
  requirement: string;
  outcome: ReadinessOutcome;
  detail?: string;
}

export function readiness(m: Market): ReadinessItem[] {
  const items: ReadinessItem[] = [
    {
      id: "currency",
      requirement: "FR-MKTS-13 — display and settlement currency configured",
      outcome: m.displayCurrency && m.settlementCurrency ? "pass" : "fail",
    },
    {
      id: "delivery-terms",
      requirement: "BRU-15 / FR-XBRD-1 — DDP or DAP set",
      outcome: m.deliveryTerms ? "pass" : "fail",
      detail: m.deliveryTerms ? undefined : "Unset. J-4 is the Founder's decision and is not defaulted.",
    },
    {
      id: "tax-regime",
      requirement: "FR-MKTS-13 — tax regime and price display mode configured",
      outcome: m.taxRegime ? "pass" : "fail",
    },
    {
      id: "cod-cross-border",
      requirement: "BRU-16 — COD is never offered cross-border",
      outcome: m.deliveryTerms !== "domestic" && m.codEnabled ? "fail" : "pass",
      detail:
        m.deliveryTerms !== "domestic" && m.codEnabled
          ? "COD enabled on a cross-border market."
          : undefined,
    },
    {
      id: "locales",
      requirement: "FR-MKTS-1 — default locale is among the permitted set",
      outcome: m.permittedLocales.includes(m.defaultLocale) ? "pass" : "fail",
    },
    {
      id: "payment-methods",
      requirement: "FR-MKTS-13 — at least one payment method available",
      outcome: m.paymentMethods.length > 0 ? "pass" : "fail",
    },
    {
      id: "seller-of-record",
      requirement: "FR-MKTS-6 — seller of record recorded",
      outcome: m.sellerOfRecord ? "pass" : "fail",
    },
    {
      id: "return-policy",
      requirement: "FR-MKTS-13 — return window and statutory rights profile set",
      outcome: m.returnWindowDays > 0 && m.statutoryRightsProfile ? "pass" : "fail",
    },
    {
      id: "address-schema",
      requirement: "FR-MKTS-8 — country address schema present",
      outcome: m.countries.length > 0 ? "pass" : "fail",
    },
    // Owned by modules that do not exist yet. Named, not omitted.
    { id: "carrier", requirement: "FR-MKTS-13 — a carrier serviceable with a live rate quote", outcome: "pending", detail: "Shipping module not built." },
    { id: "duty-source", requirement: "FR-MKTS-13 / FR-TAX-7 — duty rate source configured and tested", outcome: "pending", detail: "packages/trade not built." },
    { id: "sanctions", requirement: "FR-MKTS-13 / FR-RISK-11 — sanctions screening active", outcome: "pending", detail: "Risk module not built. J-14 open." },
    { id: "legal-pages", requirement: "FR-MKTS-13 — required legal pages published in the market's locale", outcome: "pending", detail: "CMS not built." },
  ];
  return items;
}

/**
 * FR-MKTS-12. A market may only be Enabled when nothing on the checklist fails.
 *
 * `blocking` and `pending` are separated deliberately. A FAIL is a configuration
 * error someone can fix now — no delivery terms, COD on a cross-border market.
 * A PENDING item is waiting on a module that does not exist yet; treating those
 * as failures would mean no market could ever be servable during development,
 * and treating them as passes would let a market reach production without a
 * carrier or a sanctions screen.
 *
 * So: `ok` gates enablement during the build, and `productionReady` is what the
 * release gate (§14.5) must use. Nothing may go live with pending items.
 */
export function canEnable(m: Market): {
  ok: boolean;
  productionReady: boolean;
  blocking: ReadinessItem[];
  pending: ReadinessItem[];
} {
  const items = readiness(m);
  const blocking = items.filter((i) => i.outcome === "fail");
  const pending = items.filter((i) => i.outcome === "pending");
  return {
    ok: blocking.length === 0,
    productionReady: blocking.length === 0 && pending.length === 0,
    blocking,
    pending,
  };
}

/** FR-MKTS-5. Suspended serves existing orders, returns and support; takes no new ones. */
export const acceptsNewOrders = (m: Market): boolean => m.status === "enabled";

/** A market is cross-border when it is not the domestic home market. */
export const isCrossBorder = (m: Market): boolean => m.deliveryTerms !== "domestic";
