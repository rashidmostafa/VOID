import { money, type Market, type Money } from "@void/market";

/* A fixture catalogue.
 *
 * Steps 7–9 of the build sequence — catalogue, inventory, search — do not exist
 * yet, so the listing needs something to render. This is deliberately shaped
 * like the real thing rather than convenient for the UI: prices are integer
 * minor units in the market's currency, availability is per market, and every
 * piece carries the trade attributes FR-CAT-16..19 require, because a product
 * without an HS code and a country of origin cannot be offered cross-border and
 * a fixture that omits them would let the UI pretend otherwise.
 *
 * No photography is supplied, so `image` is absent throughout and the tiles
 * render flat plates at real aspect ratios. Never substitute an illustration or
 * an AI-generated image (readme.md, ADR-0007).
 */

export interface Piece {
  slug: string;
  title: string;
  designer: string;
  sku: string;
  /** Minor units in BDT, the catalogue's pricing currency. */
  priceBdt: number;
  compareAtBdt?: number;
  sizes: string[];
  rating?: number;
  reviewCount?: number;
  badge?: { label: string; tone: "new" | "sale" | "lowstock" | "soldout" };
  fabric: string;
  /** FR-XBRD-6: 6-digit minimum, extensible to what a destination requires. */
  hsCode: string;
  /** FR-XBRD-7: distinct from the shipping origin. */
  countryOfOrigin: string;
  /** Market codes this piece may be offered in (FR-XBRD-18). */
  availableIn: string[];
  priceBand: "under-3000" | "3000-6000" | "over-6000";
}

export const CATALOGUE: Piece[] = [
  {
    slug: "autumn-handloom-shirt",
    title: "Autumn handloom shirt",
    designer: "Void",
    sku: "VD-2451-BLK",
    priceBdt: 245_000,
    sizes: ["S", "M", "L", "XL"],
    rating: 4.6,
    reviewCount: 38,
    badge: { label: "New in", tone: "new" },
    fabric: "100% cotton",
    hsCode: "620520",
    countryOfOrigin: "BD",
    availableIn: ["bd", "in", "uk", "ae"],
    priceBand: "under-3000",
  },
  {
    slug: "jamdani-panel-dress",
    title: "Jamdani panel dress",
    designer: "Rina Ahmed",
    sku: "RA-1180-IND",
    priceBdt: 685_000,
    compareAtBdt: 845_000,
    sizes: ["S", "M", "L"],
    rating: 4.8,
    reviewCount: 12,
    badge: { label: "Sale", tone: "sale" },
    fabric: "100% cotton",
    hsCode: "620443",
    countryOfOrigin: "BD",
    availableIn: ["bd", "uk"],
    priceBand: "over-6000",
  },
  {
    slug: "khadi-overshirt",
    title: "Khadi overshirt",
    designer: "Void",
    sku: "VD-3302-NAT",
    priceBdt: 412_000,
    sizes: ["M", "L", "XL"],
    rating: 4.4,
    reviewCount: 61,
    fabric: "100% cotton",
    hsCode: "620520",
    countryOfOrigin: "BD",
    availableIn: ["bd", "in", "uk", "ae"],
    priceBand: "3000-6000",
  },
  {
    slug: "muslin-wide-trouser",
    title: "Muslin wide trouser",
    designer: "Void",
    sku: "VD-2890-CHA",
    priceBdt: 298_000,
    sizes: ["S", "M"],
    rating: 4.2,
    reviewCount: 9,
    badge: { label: "2 left", tone: "lowstock" },
    fabric: "100% cotton",
    hsCode: "620462",
    countryOfOrigin: "BD",
    availableIn: ["bd"],
    priceBand: "under-3000",
  },
  {
    slug: "silk-blend-scarf",
    title: "Silk blend scarf",
    designer: "Tahmina Rahman",
    sku: "TR-0441-GLD",
    priceBdt: 156_000,
    sizes: ["One size"],
    rating: 4.9,
    reviewCount: 24,
    fabric: "70% silk, 30% cotton",
    hsCode: "621410",
    countryOfOrigin: "BD",
    availableIn: ["bd", "in", "uk", "ae"],
    priceBand: "under-3000",
  },
  {
    slug: "indigo-field-jacket",
    title: "Indigo field jacket",
    designer: "Void",
    sku: "VD-5120-IND",
    priceBdt: 920_000,
    sizes: ["M", "L", "XL"],
    badge: { label: "Sold out", tone: "soldout" },
    fabric: "100% cotton",
    hsCode: "620332",
    countryOfOrigin: "BD",
    availableIn: ["bd", "uk"],
    priceBand: "over-6000",
  },
];

/* The catalogue is priced in BDT. A market displaying another currency needs an
   FX conversion that records the rate and its timestamp on anything it is
   applied to (FR-PAY-10, FR-PAY-24, DR-GEN-10) — that belongs to the pricing
   module, which does not exist. Until it does, a non-BDT market shows the BDT
   price rather than an invented conversion: a wrong price is worse than an
   obviously foreign one, and UI-INV-11 makes prices contractual. */
export function displayPrice(minorBdt: number, _market: Market): Money {
  // Deliberately ignores the market's display currency until FX exists. The
  // parameter stays so every call site is already passing the market when the
  // conversion lands, and the signature does not change under them.
  return money(minorBdt, "BDT");
}

export interface Filters {
  size?: string;
  band?: string;
}

/** FR-XBRD-18: a piece is not offered in a market whose profile it fails. */
export function availableInMarket(pieces: Piece[], market: Market): Piece[] {
  return pieces.filter((p) => p.availableIn.includes(market.code));
}

export function applyFilters(pieces: Piece[], f: Filters): Piece[] {
  return pieces.filter(
    (p) => (!f.size || p.sizes.includes(f.size)) && (!f.band || p.priceBand === f.band)
  );
}

export const ALL_SIZES = ["S", "M", "L", "XL"];

/* Price bands carry AMOUNTS, not labels. A label written as "Under ৳3,000"
   hard-codes a currency into the copy, which renders a false price the moment
   the market is not BDT — and UI-INV-11 makes a shown price contractual. The
   boundary is minor units and the label is composed with formatMoney, so the
   band follows the market the same way every other price does. */
export const PRICE_BANDS = [
  { id: "under-3000", kind: "under" as const, max: 300_000 },
  { id: "3000-6000", kind: "between" as const, min: 300_000, max: 600_000 },
  { id: "over-6000", kind: "over" as const, min: 600_000 },
];
