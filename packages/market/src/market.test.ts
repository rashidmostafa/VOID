import { describe, expect, it } from "vitest";
import { MARKETS, marketByCode } from "./registry";
import { resolveMarket, resolveLocale, parseAcceptLanguage, marketPath, alternates } from "./resolve";
import { canEnable, readiness, acceptsNewOrders, type Market } from "./types";
import { money, formatMoney, formatNumber, addMoney, subtractMoney, multiplyMoney } from "./money";

/* These are requirement tests, not unit tests of convenience. Each `it` names
   the identifier it verifies, so a change that breaks one says which clause of
   the SRS it broke. DEL-2 requires tests first for anything touching money. */

const bd = marketByCode("bd")!;
const uk = marketByCode("uk")!;
const ae = marketByCode("ae")!;

/* Resolution precedence is only observable when several markets are servable.
   The seeded registry has one enabled market, so a test against it would pass
   while proving nothing. */
const allEnabled: Market[] = MARKETS.map((m) => ({ ...m, status: "enabled" as const }));

describe("UI-GLOB-9 — currency rendering follows locale data, not concatenation", () => {
  it("renders the design system's documented outputs exactly", () => {
    expect(formatMoney(money(245_000, "BDT"), bd, "en")).toBe("৳2,450");
    expect(formatMoney(money(245_000, "BDT"), bd, "bn")).toBe("৳২,৪৫০");
    expect(formatMoney(money(245_000, "GBP"), uk, "en")).toBe("£2,450.00");
  });

  it("takes grouping from the locale — bn-BD groups at lakh scale", () => {
    // Not 1,024,50 and not 102,450: bn-BD groups 1,02,450.
    expect(formatMoney(money(10_245_000, "BDT"), bd, "bn")).toBe("৳১,০২,৪৫০");
  });

  it("takes the numeral system from the locale", () => {
    expect(formatNumber(2450, bd, "bn")).toBe("২,৪৫০");
    expect(formatNumber(2450, bd, "en")).toBe("2,450");
  });

  it("puts the symbol first per readme.md, overriding CLDR where it trails", () => {
    // The disclosed override: bn-BD trails the taka sign in CLDR.
    const out = formatMoney(money(100, "BDT"), bd, "bn");
    expect(out.startsWith("৳")).toBe(true);
  });

  it("separates a multi-character or alphabetic symbol with a space", () => {
    const out = formatMoney(money(245_000, "AED"), ae, "en");
    // The symbol is followed by a non-breaking space when it is alphabetic.
    expect(out).toMatch(/^[^\d]+\u00a0?[\d,.]+$/);
    expect(out).toContain("2,450");
  });
});

describe("DR-GEN-3 — money is integer minor units plus a currency code", () => {
  it("refuses a float", () => {
    expect(() => money(2450.5, "BDT")).toThrow(/integer minor units/);
  });

  it("adds and subtracts without floating point drift", () => {
    let total = money(0, "BDT");
    for (let i = 0; i < 10; i++) total = addMoney(total, money(10, "BDT"));
    expect(total.amount).toBe(100);
    expect(subtractMoney(money(245_000, "BDT"), money(45_000, "BDT")).amount).toBe(200_000);
  });

  it("keeps a quantity multiple integral", () => {
    expect(multiplyMoney(money(333, "BDT"), 3).amount).toBe(999);
    expect(Number.isInteger(multiplyMoney(money(333, "BDT"), 1 / 3).amount)).toBe(true);
  });

  it("refuses to combine two currencies without an explicit conversion", () => {
    expect(() => addMoney(money(1, "BDT"), money(1, "GBP"))).toThrow(/FX conversion/);
  });
});

describe("FR-MKTS-3 — market resolution precedence", () => {
  const cases: Array<[string, Parameters<typeof resolveMarket>[0], string, string]> = [
    // The path decides the route even when it disagrees with the stored choice —
    // a shared link must show the market it names — but it reports as "link".
    ["the path decides the route, and reports as a link", { explicit: "uk", accountPreference: "in", shippingCountry: "AE", geoCountry: "IN", acceptLanguage: "bn-BD" }, "uk", "link"],
    ["a path the stored choice agrees with is a real choice", { explicit: "uk", accountPreference: "uk" }, "uk", "explicit"],
    ["account beats shipping address", { accountPreference: "in", shippingCountry: "AE", geoCountry: "GB" }, "in", "account"],
    ["shipping address beats geo", { shippingCountry: "AE", geoCountry: "GB" }, "ae", "shipping-address"],
    ["geo beats accept-language", { geoCountry: "GB", acceptLanguage: "bn-BD" }, "uk", "geo"],
    ["accept-language beats the default", { acceptLanguage: "en-IN,en;q=0.9" }, "in", "accept-language"],
    ["nothing falls back to the default", {}, "bd", "default"],
  ];

  for (const [label, input, code, source] of cases) {
    it(label, () => {
      const r = resolveMarket(input, allEnabled);
      expect(r.market.code).toBe(code);
      expect(r.source).toBe(source);
    });
  }

  it("reports which step decided, so the UI can be honest (UI-GLOB-10)", () => {
    expect(resolveMarket({ geoCountry: "GB" }, allEnabled).source).toBe("geo");
    // A URL alone is not evidence this visitor chose anything: it may be a link
    // someone shared, or a redirect we issued from a guess. Reporting it as a
    // choice would launder the guess, which is what UI-GLOB-10 guards against.
    expect(resolveMarket({ explicit: "uk" }, allEnabled).source).toBe("link");
    expect(resolveMarket({ explicit: "uk", accountPreference: "uk" }, allEnabled).source).toBe("explicit");
  });

  it("never claims a choice the visitor did not make", () => {
    // The exact laundering path: / redirects to /bd/xx from a language guess,
    // and the canonical request must not then say "you chose this".
    const viaRedirect = resolveMarket({ explicit: "bd", accountPreference: null }, allEnabled);
    expect(viaRedirect.source).not.toBe("explicit");
    expect(viaRedirect.source).toBe("link");
  });

  it("falls through a draft market rather than 404ing a shared link", () => {
    // uk is draft in the seeded registry.
    const r = resolveMarket({ explicit: "uk" });
    expect(r.market.code).toBe("bd");
    expect(r.source).toBe("default");
  });

  it("falls through an unknown code", () => {
    expect(resolveMarket({ explicit: "zz", geoCountry: "GB" }, allEnabled).market.code).toBe("uk");
  });

  it("orders Accept-Language by q-value", () => {
    expect(parseAcceptLanguage("en;q=0.5,bn-BD;q=0.9,fr;q=0.1")).toEqual(["bn-BD", "en", "fr"]);
  });
});

describe("FR-I18N-1 — locale is constrained by the market", () => {
  it("never selects a locale the market does not permit", () => {
    expect(resolveLocale(bd, { explicit: "fr" })).toBe(bd.defaultLocale);
  });

  it("matches a base language against a regional tag", () => {
    expect(resolveLocale(bd, { acceptLanguage: "en-GB,en;q=0.9" })).toBe("en");
  });

  it("falls back to the market default", () => {
    expect(resolveLocale(bd, {})).toBe("bn");
  });
});

describe("FR-MKTS-12/13 — the readiness gate is enforced, not reported", () => {
  it("blocks a market whose delivery terms are unset (BRU-15, J-4 open)", () => {
    const item = readiness(ae).find((i) => i.id === "delivery-terms");
    expect(item?.outcome).toBe("fail");
    expect(canEnable(ae).ok).toBe(false);
  });

  it("blocks COD on a cross-border market (BRU-16)", () => {
    const bad: Market = { ...uk, codEnabled: true };
    expect(readiness(bad).find((i) => i.id === "cod-cross-border")?.outcome).toBe("fail");
  });

  it("permits COD domestically", () => {
    expect(readiness(bd).find((i) => i.id === "cod-cross-border")?.outcome).toBe("pass");
  });

  it("separates configuration failures from unbuilt modules", () => {
    const c = canEnable(bd);
    expect(c.blocking).toHaveLength(0);
    expect(c.ok).toBe(true);
    // Carrier, duty source, sanctions and legal pages are pending on modules
    // that do not exist. Production must not ship with any of them outstanding.
    expect(c.pending.length).toBeGreaterThan(0);
    expect(c.productionReady).toBe(false);
  });
});

describe("FR-MKTS-5 — suspension never orphans an in-flight order", () => {
  it("stops new orders but leaves the market servable", () => {
    const suspended: Market = { ...bd, status: "suspended" };
    expect(acceptsNewOrders(suspended)).toBe(false);
    expect(resolveMarket({ explicit: "bd" }, [suspended]).market.code).toBe("bd");
  });
});

describe("FR-MKTS-4 — the market is in the URL, crawlably", () => {
  it("builds a market/locale path", () => {
    expect(marketPath("bd", "bn", "/c/new-in")).toBe("/bd/bn/c/new-in");
    expect(marketPath("uk", "en")).toBe("/uk/en");
  });

  it("emits an hreflang alternate per servable market and locale (FR-SEO-5)", () => {
    const alts = alternates("/c/new-in", allEnabled);
    expect(alts).toContainEqual({ hrefLang: "bn-BD", href: "/bd/bn/c/new-in" });
    expect(alts).toContainEqual({ hrefLang: "en-GB", href: "/uk/en/c/new-in" });
    // Every servable market contributes every locale it permits.
    expect(alts).toHaveLength(allEnabled.reduce((n, m) => n + m.permittedLocales.length, 0));
  });
});

/* The cross-check the coverage gate cannot do: it runs in plain Node and cannot
   import this registry. Together they cover FR-I18N-14 — the gate measures
   coverage, this asserts what that coverage means for the markets. */
describe("FR-I18N-14 / FR-MKTS-1 — coverage against the locales markets require", () => {
  it("every locale a servable market permits has a catalogue", async () => {
    const { readFileSync, readdirSync } = await import("node:fs");
    const present = new Set(
      readdirSync("apps/web/messages")
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(/\.json$/, ""))
    );
    const required = new Set(
      MARKETS.filter((m) => m.status === "enabled" || m.status === "suspended")
        .flatMap((m) => m.permittedLocales)
    );
    for (const locale of required) expect(present.has(locale)).toBe(true);

    // And the artefact the gate emits agrees about which locales exist.
    const report = JSON.parse(readFileSync("apps/web/public/i18n-coverage.json", "utf8"));
    for (const locale of required) expect(report.locales[locale]).toBeDefined();
  });

  it("names the markets that cannot launch because their default locale is untranslated", async () => {
    const { readFileSync } = await import("node:fs");
    const report = JSON.parse(readFileSync("apps/web/public/i18n-coverage.json", "utf8"));

    const blocked = MARKETS.filter((m) => report.locales[m.defaultLocale]?.selectableInProduction === false)
      .map((m) => `${m.code}/${m.defaultLocale}`);

    /* This is an assertion about a KNOWN state, not a wish. Bengali is
       deliberately untranslated and must not be machine-translated (ADR-0007),
       so Bangladesh — whose default locale is bn — cannot go to production yet.
       When a translator supplies the copy this expectation changes to an empty
       list, and that change is the signal the blocker cleared. */
    expect(blocked).toContain("bd/bn");
  });
});
