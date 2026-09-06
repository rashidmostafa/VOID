import type { Market } from "./types";

/* Money and number rendering — UI-GLOB-9, DR-GEN-3, FR-I18N-5.
 *
 * Two rules govern this file and they pull in opposite directions.
 *
 * DR-GEN-3: money is integer MINOR UNITS plus an ISO-4217 code, never a float.
 * So `Money` is a pair and there is no code path that accepts a bare number —
 * `2450` is meaningless without knowing whether it is taka or poisha.
 *
 * UI-GLOB-9: "Currency and price rendering shall follow the market's convention
 * for symbol placement, decimal separator, grouping and decimal places, driven
 * by locale data rather than string concatenation."
 *
 * So grouping, the decimal separator, the numeral system and the digits all come
 * from `Intl.NumberFormat.formatToParts`. Nothing is assembled by hand.
 *
 * ── The one disclosed override ──────────────────────────────────────────────
 * `readme.md` fixes Void's own convention: "Currency symbol leads with no
 * space." CLDR does not agree for every locale — bn-BD trails the taka sign.
 * The SYMBOL POSITION is therefore Void's, and only the position: the digits,
 * grouping, separator and numeral system remain locale data. This is the same
 * override the design system's VoidFormat carries, disclosed there and here, and
 * it is the only place this file departs from CLDR.
 *
 * A symbol of more than one character, or one made of letters (AED), takes a
 * non-breaking space — "AED2,450.00" is not what the rule meant.
 */

export interface Money {
  /** Integer minor units. 245000 = ৳2,450.00. Never a float, never a bare number. */
  readonly amount: number;
  /** ISO 4217. */
  readonly currency: string;
}

export function money(amount: number, currency: string): Money {
  if (!Number.isInteger(amount)) {
    throw new TypeError(
      `Money must be integer minor units (DR-GEN-3); received ${amount} for ${currency}.`
    );
  }
  return { amount, currency };
}

/** How many minor units make one major unit, from CLDR rather than a table. */
export function minorUnits(currency: string): number {
  try {
    const opts = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions();
    return opts.maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

/**
 * Display fraction digits for a market. Void prices the catalogue in whole taka,
 * so BDT and INR render without decimals — suppressed deliberately rather than
 * by accident, and a market that needs them gets them.
 */
const DISPLAY_DIGITS: Record<string, number> = { BDT: 0, INR: 0 };

const localeTag = (market: Market, locale: string): string => {
  const region = market.countries[0];
  return region ? `${locale}-${region}` : locale;
};

export interface FormatOptions {
  /** Force decimal places. Defaults to the market's display convention. */
  fractionDigits?: number;
}

/**
 * Format money for a market and locale.
 * `৳2,450` in en-BD · `৳২,৪৫০` in bn-BD · `£2,450.00` in en-GB
 */
export function formatMoney(
  value: Money,
  market: Market,
  locale: string,
  opts: FormatOptions = {}
): string {
  const digits = opts.fractionDigits ?? DISPLAY_DIGITS[value.currency] ?? minorUnits(value.currency);
  const major = value.amount / 10 ** minorUnits(value.currency);

  const intlOpts: Intl.NumberFormatOptions = {
    style: "currency",
    currency: value.currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  };

  let parts: Intl.NumberFormatPart[];
  try {
    parts = new Intl.NumberFormat(localeTag(market, locale), intlOpts).formatToParts(major);
  } catch {
    try {
      // A locale the engine does not carry must not take the price down with it.
      parts = new Intl.NumberFormat("en", intlOpts).formatToParts(major);
    } catch {
      return `${value.currency} ${major.toFixed(digits)}`;
    }
  }

  const symbol = parts.filter((p) => p.type === "currency").map((p) => p.value).join("");
  // Everything that is not the symbol and not the literal separating it: the
  // digits, grouping and decimal separator exactly as the locale renders them.
  const digitsText = parts
    .filter((p) => p.type !== "currency" && p.type !== "literal")
    .map((p) => p.value)
    .join("");

  // Void's rule: symbol leads, no space. See the disclosure above.
  const gap = symbol.length > 1 || /\p{L}/u.test(symbol) ? " " : "";
  return symbol + gap + digitsText;
}

/** FR-I18N-5. Locale-driven, including the numeral system. */
export function formatNumber(value: number, market: Market, locale: string): string {
  try {
    return new Intl.NumberFormat(localeTag(market, locale)).format(value);
  } catch {
    return new Intl.NumberFormat("en").format(value);
  }
}

export function formatDate(iso: string, market: Market, locale: string): string {
  try {
    return new Intl.DateTimeFormat(localeTag(market, locale), {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: market.supportTimezone ?? "UTC",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/* ---------------------------------------------------------------- */
/* Arithmetic                                                        */
/* ---------------------------------------------------------------- */

const sameCurrency = (a: Money, b: Money) => {
  if (a.currency !== b.currency) {
    // Adding two currencies is never a rounding question, it is a bug. FX is an
    // explicit conversion that records the rate and timestamp (FR-PAY-24).
    throw new TypeError(`Cannot combine ${a.currency} with ${b.currency} without an FX conversion.`);
  }
};

export const addMoney = (a: Money, b: Money): Money => {
  sameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
};

export const subtractMoney = (a: Money, b: Money): Money => {
  sameCurrency(a, b);
  return { amount: a.amount - b.amount, currency: a.currency };
};

export const multiplyMoney = (a: Money, factor: number): Money => ({
  // Integer result: a quantity multiple cannot introduce a fraction of a minor unit.
  amount: Math.round(a.amount * factor),
  currency: a.currency,
});

export const isZero = (m: Money): boolean => m.amount === 0;
