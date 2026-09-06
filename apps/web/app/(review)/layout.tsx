import type { Metadata } from "next";
import "../globals.css";

/* Root layout for the review surface.
 *
 * There is no app/layout.tsx: the market segment and this group are separate
 * root layouts, which is what lets a market page take its `lang` from its route
 * params and stay STATICALLY renderable. A single root layout would have to read
 * the locale from request headers, and that makes every route in the app
 * dynamic — including the catalogue, which is server-rendered precisely to hold
 * an LCP budget.
 */

export const metadata: Metadata = { title: "Void — component preview" };

const CRITICAL_FONTS = [
  "/theme/fonts/geist-400-latin.woff2",
  "/theme/fonts/geist-500-latin.woff2",
];

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {CRITICAL_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <link rel="stylesheet" href="/theme/tokens.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
