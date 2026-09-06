import { NextResponse, type NextRequest } from "next/server";
import { marketPath, resolveLocale, resolveMarket } from "@void/market";

/* Market and locale routing.
 *
 * FR-MKTS-4 requires the active market in the URL "in a crawlable way (path
 * segment or subdomain) so that market-specific pages are independently
 * indexable and shareable". The shape is /<market>/<locale>/..., because a page
 * differs by both — price and policy by market, copy by locale — and each has to
 * be independently addressable for hreflang to mean anything.
 *
 * This middleware only ever RESOLVES and REDIRECTS. The precedence itself lives
 * in @void/market as a pure function with its own tests; nothing here decides
 * anything, it only gathers the inputs the edge can see and forwards the answer.
 *
 * The resolved values are passed down as request headers rather than re-derived
 * per layout, so a page and its i18n config cannot disagree about which market
 * they are rendering.
 */

const COOKIE_MARKET = "void_market";
const COOKIE_LOCALE = "void_locale";

/** Surfaces that are not market-scoped. */
const EXEMPT = [
  /^\/_next\//,
  /^\/theme\//,
  /^\/favicon\./,
  /^\/robots\.txt$/,
  /^\/sitemap.*\.xml$/,
  // The UI-SRC-8 preview surface is a review artefact, not a product route.
  /^\/preview(\/|$)/,
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (EXEMPT.some((re) => re.test(pathname))) return NextResponse.next();

  const [, first, second, ...rest] = pathname.split("/");

  /* FR-MKTS-3, in order. The first segment is "explicit" only because the user
     navigated to or shared it; a cookie is the persisted account-level
     preference standing in for a signed-in account until identity exists. */
  const resolution = resolveMarket({
    explicit: first || null,
    accountPreference: request.cookies.get(COOKIE_MARKET)?.value ?? null,
    // Vercel and most edges expose the country here. Absent locally, which is
    // correct — resolution then falls through to Accept-Language.
    geoCountry: request.headers.get("x-vercel-ip-country"),
    acceptLanguage: request.headers.get("accept-language"),
  });
  const market = resolution.market;

  const locale = resolveLocale(market, {
    explicit: second || null,
    accountPreference: request.cookies.get(COOKIE_LOCALE)?.value ?? null,
    acceptLanguage: request.headers.get("accept-language"),
  });

  const canonical = marketPath(market.code, locale, rest.length ? `/${rest.join("/")}` : "");
  const alreadyCanonical = first === market.code && second === locale;

  if (!alreadyCanonical) {
    // 307, not 308: which market a visitor resolves to depends on where they
    // are and what they have chosen, so this redirect is not permanent and must
    // never be cached as though it were.
    return NextResponse.redirect(new URL(canonical + search, request.url), 307);
  }

  const headers = new Headers(request.headers);
  headers.set("x-void-market", market.code);
  headers.set("x-void-locale", locale);
  // UI-GLOB-10: the page must make the active market unambiguous, and "we
  // guessed from your IP" reads differently from "you chose this".
  headers.set("x-void-market-source", resolution.source);

  const response = NextResponse.next({ request: { headers } });

  /* FR-MKTS-3 calls for a persisted override, and FR-I18N-1 for a persisted
     language override. Only an EXPLICIT choice is persisted — writing a cookie
     for a geo guess would make the guess permanent and unfixable, which is the
     opposite of "changeable in one interaction". */
  if (resolution.source === "explicit") {
    response.cookies.set(COOKIE_MARKET, market.code, { path: "/", sameSite: "lax", httpOnly: false });
  }
  if (second === locale) {
    response.cookies.set(COOKIE_LOCALE, locale, { path: "/", sameSite: "lax", httpOnly: false });
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
