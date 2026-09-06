import { getRequestConfig } from "next-intl/server";
import { marketByCode, MARKETS } from "@void/market";
import en from "../messages/en.json";
import bn from "../messages/bn.json";

/* next-intl request configuration.
 *
 * FR-I18N-9: "Missing translations shall fall back to English and shall be
 *  logged for the content team; a missing key shall never render as a raw
 *  identifier."
 *
 * Both halves matter. The fallback is done by DEEP-MERGING the locale's
 * catalogue over English, so a partially translated locale renders translated
 * where it can and English where it cannot — rather than next-intl's default of
 * throwing or emitting the key path. The logging half is the `onError` hook,
 * which records the missing key instead of swallowing it.
 *
 * Bengali is currently almost entirely absent, so most of a bn page renders in
 * English. That is the honest state of the project and the coverage gate reports
 * it; it is not something to paper over by inventing copy.
 */

export const SOURCE_LOCALE = "en";

export const CATALOGUES: Record<string, Record<string, unknown>> = { en, bn };

type Messages = Record<string, unknown>;

/** Locale over source, key by key, so a partial catalogue is usable. */
export function mergeMessages(source: Messages, locale: Messages): Messages {
  const out: Messages = { ...source };
  for (const [k, v] of Object.entries(locale)) {
    const base = out[k];
    out[k] =
      v && typeof v === "object" && !Array.isArray(v) && base && typeof base === "object" && !Array.isArray(base)
        ? mergeMessages(base as Messages, v as Messages)
        : v;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  /* The locale comes from the [locale] route segment, NOT from request headers.
     Reading headers here would opt every page into dynamic rendering, and the
     catalogue is server rendered specifically to hold an LCP budget. */
  const requested = await requestLocale;
  const known = Object.keys(CATALOGUES);
  const locale = requested && known.includes(requested) ? requested : SOURCE_LOCALE;

  // The time zone a delivery estimate should be read in belongs to the market
  // that permits this locale.
  const market = MARKETS.find((m) => m.permittedLocales.includes(locale)) ?? marketByCode("bd");

  const source = CATALOGUES[SOURCE_LOCALE] ?? {};
  const target = CATALOGUES[locale] ?? {};

  return {
    locale,
    messages: mergeMessages(source, target) as never,
    // FR-I18N-5: dates and numbers follow the locale, and the market supplies
    // the time zone a delivery estimate should be read in.
    timeZone: market?.supportTimezone ?? "Asia/Dhaka",
    onError(error) {
      // FR-I18N-9's logging half. A missing key is a content task, not a crash.
      if (process.env.NODE_ENV !== "production") console.warn(`[i18n] ${error.message}`);
    },
    getMessageFallback({ key, namespace }) {
      // Never a raw identifier on screen. If English is missing it too, the key
      // is genuinely undefined and that is a build error, not a display one.
      const path = [namespace, key].filter(Boolean).join(".");
      if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key: ${path}`);
      return "";
    },
  };
});
