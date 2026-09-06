import { describe, expect, it } from "vitest";
import { MARKETS, marketByCode, type Market } from "@void/market";
import {
  CATALOGUE,
  applyFilters,
  availableInMarket,
  displayPrice,
  inStock,
  marketsOffering,
  pieceBySlug,
} from "./catalogue";

/* The catalogue is a fixture, but the rules applied to it are requirements, and
   two of them cannot be exercised through the storefront while only one market
   is servable. They are tested directly instead of being assumed. */

const bd = marketByCode("bd")!;
const uk = marketByCode("uk")!;

describe("FR-XBRD-18 / UI-PDP-9 — a piece is only offered where it may be", () => {
  it("filters the listing to what this market may be offered", () => {
    const inBd = availableInMarket(CATALOGUE, bd);
    expect(inBd.every((p) => p.availableIn.includes("bd"))).toBe(true);
    // The export-only piece exists and is excluded, which is what makes the
    // UI-PDP-9 branch reachable at all.
    expect(CATALOGUE.some((p) => !p.availableIn.includes("bd"))).toBe(true);
    expect(inBd).toHaveLength(CATALOGUE.length - 1);
  });

  it("offers the servable markets where an unavailable piece CAN be bought", () => {
    const piece = pieceBySlug("export-only-wrap-coat")!;
    expect(piece.availableIn).not.toContain("bd");

    /* With only Bangladesh servable there is nowhere to send the shopper, and
       the page correctly says so. Enable the UK and the other branch is the one
       that runs — this is the assertion that covers it, because the storefront
       cannot reach it until J-1 opens a second market. */
    expect(marketsOffering(piece, ["bd"])).toEqual([]);
    expect(marketsOffering(piece, ["bd", "uk", "ae"])).toEqual(["uk", "ae"]);
  });
});

describe("FR-CAT-12 / UI-PDP-7 — an out-of-stock size is not a dead end", () => {
  it("keeps a zero-stock size selectable rather than hiding it", () => {
    const piece = pieceBySlug("autumn-handloom-shirt")!;
    expect(Object.keys(piece.stock)).toContain("XL");
    expect(inStock(piece, "XL")).toBe(false);
    expect(inStock(piece, "M")).toBe(true);
  });

  it("has a piece with no stock in any size, so that path is reachable", () => {
    const piece = pieceBySlug("indigo-field-jacket")!;
    expect(Object.values(piece.stock).every((n) => n === 0)).toBe(true);
  });
});

describe("FR-CAT-19 — fibre composition is structured, not prose", () => {
  it("carries percentage by weight per fibre and sums to 100", () => {
    for (const p of CATALOGUE) {
      expect(p.fibres.length).toBeGreaterThan(0);
      expect(p.fibres.reduce((n, f) => n + f.pct, 0)).toBe(100);
    }
  });
});

describe("FR-XBRD-6/7 — every piece can clear customs", () => {
  it("carries an HS code of at least six digits and a country of origin", () => {
    for (const p of CATALOGUE) {
      expect(p.hsCode).toMatch(/^\d{6,10}$/);
      expect(p.countryOfOrigin).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe("DR-GEN-3 — catalogue prices are integer minor units", () => {
  it("never produces a float price", () => {
    for (const p of CATALOGUE) {
      expect(Number.isInteger(p.priceBdt)).toBe(true);
      expect(Number.isInteger(displayPrice(p.priceBdt, bd).amount)).toBe(true);
    }
  });

  it("shows BDT until FX exists, rather than an invented conversion", () => {
    // UK displays GBP, but no rate has been recorded, so the honest output is
    // the currency the catalogue is actually priced in (UI-INV-11).
    expect(uk.displayCurrency).toBe("GBP");
    expect(displayPrice(245_000, uk).currency).toBe("BDT");
  });
});

describe("UI-PLP-4 — filters compose", () => {
  it("narrows on size and band together", () => {
    const inBd = availableInMarket(CATALOGUE, bd);
    const bySize = applyFilters(inBd, { size: "XL" });
    const byBoth = applyFilters(inBd, { size: "S", band: "over-6000" });
    expect(bySize.every((p) => p.sizes.includes("XL"))).toBe(true);
    expect(byBoth.every((p) => p.sizes.includes("S") && p.priceBand === "over-6000")).toBe(true);
    expect(byBoth.length).toBeLessThan(bySize.length);
  });
});

describe("FR-MKTS-1 — every market a piece names is a real market", () => {
  it("has no availability entry pointing at an unknown market", () => {
    const codes = new Set<string>(MARKETS.map((m: Market) => m.code));
    for (const p of CATALOGUE) for (const c of p.availableIn) expect(codes.has(c)).toBe(true);
  });
});
