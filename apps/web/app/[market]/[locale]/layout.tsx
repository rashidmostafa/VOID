import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { alternates, marketByCode, marketPath, servableMarkets } from "@void/market";
import "../../globals.css";

/* Root layout for every market-scoped page.
 *
 * There is no app/layout.tsx. This segment and the review group are separate
 * root layouts, and that is deliberate: `lang` comes from the route PARAMS here
 * rather than from request headers, which is what keeps these pages statically
 * renderable. Reading headers in a single shared root layout would opt the whole
 * application into dynamic rendering — including the catalogue, which is server
 * rendered precisely to hold an LCP budget.
 *
 * Everything below this segment can assume a resolved, servable market. The
 * middleware guarantees the canonical URL shape; this refuses anything that
 * still is not one, so a page never has to ask "which market?" or handle the
 * absence of an answer.
 */

/* FR-I18N-12 requires the architecture to be RTL-ready whether or not an RTL
   locale has shipped (J-12 leaves that open). Direction is derived, so enabling
   one is a catalogue entry rather than a layout change. */
const RTL_LOCALES = new Set(["ar", "he", "fa", "ur"]);
const directionOf = (locale: string) => (RTL_LOCALES.has(locale.split("-")[0]) ? "rtl" : "ltr");

const CRITICAL_FONTS = [
  "/theme/fonts/geist-400-latin.woff2",
  "/theme/fonts/geist-500-latin.woff2",
];

export function generateStaticParams() {
  // Only servable markets are pre-rendered. A draft market has no public pages.
  return servableMarkets().flatMap((m) =>
    m.permittedLocales.map((locale) => ({ market: m.code, locale }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ market: string; locale: string }>;
}): Promise<Metadata> {
  const { market: code, locale } = await params;
  const market = marketByCode(code);
  if (!market) return {};

  /* FR-MKTS-4 / FR-SEO-5: every market and locale a page is served at is
     declared, so the same piece in two markets is not read as duplicate content
     and a shopper lands on the terms that actually apply to them. */
  const languages = Object.fromEntries(alternates("").map(({ hrefLang, href }) => [hrefLang, href]));

  return {
    title: "Void",
    description: "Cross-border fashion and lifestyle.",
    alternates: { canonical: marketPath(market.code, locale), languages },
    other: {
      // UI-GLOB-10: the active market must be unambiguous, including to anything
      // that reads the page rather than looks at it.
      "void:market": market.code,
      "void:currency": market.displayCurrency,
    },
  };
}

export default async function MarketLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ market: string; locale: string }>;
}) {
  const { market: code, locale } = await params;
  const market = marketByCode(code);

  // Belt and braces behind the middleware: a draft, closed or unknown market is
  // not a public surface, and a locale the market does not permit is not a page.
  if (!market || !(market.status === "enabled" || market.status === "suspended")) notFound();
  if (!market.permittedLocales.includes(locale)) notFound();

  // Tells next-intl which locale this render is for, so messages resolve without
  // reading headers — the thing that would force dynamic rendering.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={directionOf(locale)} data-market={market.code}>
      <head>
        {/* Font delivery by hand (UI-INV-13, ADR-0001). `next/font` is banned by
            a lint rule: it re-hosts and fingerprints the files, which moves them
            outside the token pipeline and makes the 40KB budget unmeasurable.
            Only the two Geist faces preload — Bengali loads per-locale under
            :lang(bn) with no render-blocking preload. */}
        {CRITICAL_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <link rel="stylesheet" href="/theme/tokens.css" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
