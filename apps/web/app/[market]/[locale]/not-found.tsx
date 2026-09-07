import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { DEFAULT_MARKET_CODE } from "@void/market";
import { ErrorSurface } from "./ErrorSurface";

/* The branded 404 (UI-GLOB-6).
 *
 * A not-found boundary cannot read route params — the segment that would have
 * supplied them is the one that failed to match — so market and locale come
 * from the headers the middleware set. That is the one place in the app where
 * reading them is correct rather than a shortcut. */
export default async function NotFound() {
  const t = await getTranslations();
  const h = await headers();
  const market = h.get("x-void-market") ?? DEFAULT_MARKET_CODE;
  const locale = h.get("x-void-locale") ?? "en";

  return (
    <ErrorSurface
      market={market}
      locale={locale}
      title={t("errors.notFound.title")}
      body={t("errors.notFound.body")}
    />
  );
}
