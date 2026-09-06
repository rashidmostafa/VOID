import type { Market } from "./types";
import { DEFAULT_MARKET_CODE, MARKETS } from "./registry";

/* Market and locale resolution — FR-MKTS-3.
 *
 * "Market resolution shall follow a documented precedence: explicit user
 *  selection, then account preference, then shipping-address country, then
 *  geolocation or Accept-Language heuristic, then the default market. The
 *  resolved market shall be visible to the user and changeable in one
 *  interaction from the header."
 *
 * The precedence is the requirement, so it is one ordered list of named steps
 * rather than a chain of conditionals — a reader can check it against the SRS
 * line by line, and the resolution reports WHICH step decided, because UI-GLOB-10
 * requires the active market to be unambiguous and "we guessed from your
 * language header" is a materially different claim from "you chose this".
 *
 * Pure: every input is passed in. No headers are read here, no cookies, no I/O.
 */

export type MarketSource =
  | "explicit"          // the user actually chose it — a switcher click, persisted
  | "link"              // the URL said so, but this visitor never chose it
  | "account"           // a stored preference on the signed-in account
  | "shipping-address"  // the country on the address being shipped to
  | "geo"               // an edge geolocation hint
  | "accept-language"   // the browser's language header
  | "default";

export interface ResolutionInput {
  /** The market code in the URL, or chosen from the header switcher. */
  explicit?: string | null;
  accountPreference?: string | null;
  shippingCountry?: string | null;
  /** ISO 3166-1 alpha-2 from an edge geolocation header. */
  geoCountry?: string | null;
  /** Raw Accept-Language header. */
  acceptLanguage?: string | null;
}

export interface Resolution {
  market: Market;
  /** Which step of the precedence decided. Surfaced so the UI can be honest. */
  source: MarketSource;
}

const isServable = (m: Market) => m.status === "enabled" || m.status === "suspended";

/** Parse Accept-Language into tags, best first. */
export function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim(), q: q ? Number(q.split("=")[1]) : 1 };
    })
    .filter((x) => x.tag && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q)
    .map((x) => x.tag);
}

/**
 * The market list is a parameter, defaulting to the registry. FR-MKTS-3's
 * precedence is a requirement that has to be testable, and a function that reads
 * its own data from module scope cannot be tested against a market set other
 * than whatever happens to be seeded — with one enabled market, every case
 * returns that market and the test proves nothing.
 */
export function resolveMarket(
  input: ResolutionInput,
  markets: readonly Market[] = MARKETS
): Resolution {
  const servableList = markets.filter(isServable);
  const servableByCountry = (country: string): Market | undefined =>
    servableList.find((m) => m.countries.includes(country.toUpperCase()));

  // Only a servable market may be resolved to. A draft or closed market in the
  // URL is not an error to the user — it falls through to the next step, and
  // eventually to the default, rather than 404ing on a link someone shared.
  const servable = (code?: string | null): Market | undefined => {
    if (!code) return undefined;
    return servableList.find((m) => m.code === code.toLowerCase());
  };

  const steps: Array<[MarketSource, () => Market | undefined]> = [
    /* A path segment decides the ROUTE, but on its own it is not evidence that
       this visitor chose anything: it may be a link someone shared, or a
       redirect we issued from a guess. UI-GLOB-10 turns on that distinction —
       "a shared link is never read against the wrong market's terms" — so the
       path reports as "link" unless a persisted choice agrees with it. */
    [
      input.explicit && input.accountPreference === input.explicit ? "explicit" : "link",
      () => servable(input.explicit),
    ],
    ["account", () => servable(input.accountPreference)],
    ["shipping-address", () => (input.shippingCountry ? servableByCountry(input.shippingCountry) : undefined)],
    ["geo", () => (input.geoCountry ? servableByCountry(input.geoCountry) : undefined)],
    [
      "accept-language",
      () => {
        // A language header can carry a region: `bn-BD` implies Bangladesh.
        if (!input.acceptLanguage) return undefined;
        for (const tag of parseAcceptLanguage(input.acceptLanguage)) {
          const region = tag.split("-")[1];
          if (region) {
            const hit = servableByCountry(region);
            if (hit) return hit;
          }
        }
        return undefined;
      },
    ],
  ];

  for (const [source, get] of steps) {
    const m = get();
    if (m) return { market: m, source };
  }

  // The default market is configuration (DEFAULT_MARKET env in Appendix G.4),
  // not a constant, and it must itself be servable or the site has no fallback.
  const fallback = servable(DEFAULT_MARKET_CODE);
  if (!fallback) {
    throw new Error(
      `No servable default market: "${DEFAULT_MARKET_CODE}" is not enabled or suspended. ` +
        "At least one market must be servable for the storefront to render."
    );
  }
  return { market: fallback, source: "default" };
}

/* ---------------------------------------------------------------- */
/* Locale                                                            */
/* ---------------------------------------------------------------- */

/**
 * FR-I18N-1: "auto-detected from browser locale and market, with a persisted
 * user override". The market constrains the choice — a locale the market does
 * not permit is never selected, however the browser is configured.
 */
export function resolveLocale(
  market: Market,
  opts: { explicit?: string | null; accountPreference?: string | null; acceptLanguage?: string | null } = {}
): string {
  const permitted = (l?: string | null) =>
    l && market.permittedLocales.includes(l) ? l : undefined;

  if (permitted(opts.explicit)) return opts.explicit as string;
  if (permitted(opts.accountPreference)) return opts.accountPreference as string;

  if (opts.acceptLanguage) {
    for (const tag of parseAcceptLanguage(opts.acceptLanguage)) {
      // `bn-BD` should match a permitted `bn`.
      const base = tag.split("-")[0];
      const hit = permitted(tag) ?? permitted(base);
      if (hit) return hit;
    }
  }
  return market.defaultLocale;
}

/* ---------------------------------------------------------------- */
/* URLs — FR-MKTS-4                                                  */
/* ---------------------------------------------------------------- */

/**
 * "The active market shall be reflected in the URL in a crawlable way (path
 *  segment or subdomain) so that market-specific pages are independently
 *  indexable and shareable, with hreflang annotations per FR-SEO-5."
 *
 * Path segment, as `/<market>/<locale>/...`. Both are in the path because a
 * page differs by each: price and policy by market, copy by locale, and both
 * need to be independently indexable.
 */
export const marketPath = (market: string, locale: string, rest = ""): string =>
  `/${market}/${locale}${rest.startsWith("/") ? rest : rest ? `/${rest}` : ""}`;

/** Every market/locale pair a given path is served at, for hreflang (FR-SEO-5). */
export function alternates(rest = "", markets: readonly Market[] = MARKETS): Array<{ hrefLang: string; href: string }> {
  const out: Array<{ hrefLang: string; href: string }> = [];
  for (const m of markets.filter(isServable)) {
    for (const locale of m.permittedLocales) {
      out.push({
        // BCP 47: language then region, which is what hreflang expects.
        hrefLang: `${locale}-${m.countries[0]}`,
        href: marketPath(m.code, locale, rest),
      });
    }
  }
  return out;
}
