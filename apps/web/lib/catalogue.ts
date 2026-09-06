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
  /** FR-CAT-19: structured percentage by weight, not a prose string — the
      customs description and a market's labelling obligations both read it. */
  fibres: Array<{ name: string; pct: number }>;
  care: string[];
  /** Per-size units. 0 is out of stock and stays SELECTABLE (FR-CAT-12). */
  stock: Record<string, number>;
  /** Made-to-order lead time in days, as a range. */
  leadTimeDays: [number, number];
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
    fibres: [{ name: "Cotton", pct: 100 }],
    care: ["Cold hand wash", "Dry flat in shade", "Do not bleach"],
    stock: { S: 4, M: 7, L: 2, XL: 0 },
    leadTimeDays: [7, 10],
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
    fibres: [{ name: "Cotton", pct: 100 }],
    care: ["Dry clean only"],
    stock: { S: 1, M: 3, L: 2 },
    leadTimeDays: [10, 14],
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
    fibres: [{ name: "Cotton", pct: 100 }],
    care: ["Cold hand wash", "Warm iron"],
    stock: { M: 5, L: 6, XL: 3 },
    leadTimeDays: [7, 10],
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
    fibres: [{ name: "Cotton", pct: 100 }],
    care: ["Cold machine wash", "Line dry"],
    stock: { S: 1, M: 1 },
    leadTimeDays: [7, 10],
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
    fibres: [{ name: "Silk", pct: 70 }, { name: "Cotton", pct: 30 }],
    care: ["Dry clean only"],
    stock: { "One size": 12 },
    leadTimeDays: [3, 5],
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
    fibres: [{ name: "Cotton", pct: 100 }],
    care: ["Cold hand wash separately", "Colour will fade"],
    stock: { M: 0, L: 0, XL: 0 },
    leadTimeDays: [14, 21],
    hsCode: "620332",
    countryOfOrigin: "BD",
    availableIn: ["bd", "uk"],
    priceBand: "over-6000",
  },
  {
    /* Deliberately NOT available in the home market. UI-PDP-9 requires a piece
       unavailable in the active market to say so and offer the markets where it
       can be bought, rather than 404ing — a fixture in which every piece is
       available everywhere leaves that path unreachable and untested. */
    slug: "export-only-wrap-coat",
    title: "Wrap coat",
    designer: "Rina Ahmed",
    sku: "RA-7720-CHR",
    priceBdt: 1_450_000,
    sizes: ["S", "M", "L"],
    fibres: [{ name: "Wool", pct: 80 }, { name: "Cotton", pct: 20 }],
    care: ["Dry clean only"],
    stock: { S: 2, M: 4, L: 1 },
    leadTimeDays: [14, 21],
    hsCode: "620210",
    countryOfOrigin: "BD",
    availableIn: ["uk", "ae"],
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

export const pieceBySlug = (slug: string): Piece | undefined =>
  CATALOGUE.find((p) => p.slug === slug);

/** FR-XBRD-18 / UI-PDP-9: where else a piece can be bought. */
export const marketsOffering = (piece: Piece, codes: string[]): string[] =>
  codes.filter((c) => piece.availableIn.includes(c));

export const inStock = (piece: Piece, size: string): boolean => (piece.stock[size] ?? 0) > 0;

export const anyInStock = (piece: Piece): boolean =>
  Object.values(piece.stock).some((n) => n > 0);
