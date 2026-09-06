import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Void",
  description: "Cross-border fashion and lifestyle.",
};

/* Font delivery, deliberately by hand (UI-INV-13, ADR-0001).
 *
 * `next/font` is not used and is banned by a lint rule. It re-hosts and
 * fingerprints font files, which moves them outside the token pipeline and makes
 * the 40KB critical-path budget unmeasurable. The subsetting is already done,
 * the byte counts are recorded in the token contract, and the budget gate
 * measures exactly the two faces marked criticalPath there.
 *
 * Only the two Geist faces preload. Geist Mono is not on the critical path
 * (ADR-0001 §2) and the Bengali pair loads per-locale under :lang(bn) with no
 * render-blocking preload (§3) — 103KB is not something an English-locale
 * visitor should pay for, and it is not something a Bengali visitor should wait
 * on before first paint.
 */
const CRITICAL_FONTS = [
  "/theme/fonts/geist-400-latin.woff2",
  "/theme/fonts/geist-500-latin.woff2",
];

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // Next 15 hands route params to a layout as a Promise.
  params?: Promise<{ locale?: string }>;
}) {
  const locale = (await params)?.locale ?? "en";

  return (
    <html lang={locale}>
      <head>
        {CRITICAL_FONTS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        {/* The runtime token layer. A static stylesheet, not a bundled import, so
            it stays swappable and stays measurable. */}
        <link rel="stylesheet" href="/theme/tokens.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
