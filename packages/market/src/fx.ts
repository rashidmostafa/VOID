import { minorUnits, money, type Money } from "./money";

/* Currency conversion — FR-I18N-3, FR-I18N-7, FR-PAY-10, FR-PAY-24, DR-GEN-10.
 *
 * The governing constraint is not the arithmetic, it is the record-keeping:
 *
 *   DR-GEN-10 — every rate applied to a transaction is stored WITH the
 *     transaction, so a two-year-old invoice reproduces without today's tables.
 *   FR-PAY-10 — the order records display currency, settlement currency, the
 *     rate applied, the rate SOURCE and the rate TIMESTAMP as separate fields.
 *   Guardrail 5 — never quote from a cached or stale rate without recording the
 *     source and timestamp on the order.
 *
 * So `convert` does not return a number. It returns the converted Money AND the
 * `FxConversion` record that must be persisted alongside it. There is no code
 * path that yields a converted amount without producing the evidence for it —
 * which is the only way this stays true once the module has many callers.
 *
 * Pure: the rate and the current time are both inputs. Nothing here fetches.
 */

export interface FxRate {
  /** ISO 4217. */
  from: string;
  to: string;
  /** Units of `to` per one unit of `from`, in MAJOR units. */
  rate: number;
  /** Where the rate came from, recorded on the order (FR-PAY-10). */
  source: string;
  /** ISO 8601 timestamp of the rate, not of its use. */
  asOf: string;
}

/**
 * FR-I18N-7: "Currency conversion shall use configurable rounding and an
 * optional margin buffer". Both are configuration, never constants (FR-ADM-47).
 */
export interface ConversionPolicy {
  /** Fraction added to protect against movement between quote and settlement. */
  marginBuffer: number;
  rounding: "up" | "down" | "nearest";
  /**
   * Round the result to a multiple of this many minor units, so a converted
   * price reads as a price rather than as arithmetic. 0 disables it.
   */
  roundToNearestMinor: number;
  /** A rate older than this is stale. FR-I18N-3's configurable interval. */
  maxAgeSeconds: number;
}

export const DEFAULT_POLICY: ConversionPolicy = {
  marginBuffer: 0,
  rounding: "nearest",
  roundToNearestMinor: 0,
  maxAgeSeconds: 24 * 60 * 60,
};

/** The record FR-PAY-10 requires on the order. Never derived later. */
export interface FxConversion {
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  marginBuffer: number;
  source: string;
  /** When the RATE was published. */
  rateAsOf: string;
  /** When it was APPLIED. Both are needed to audit staleness after the fact. */
  appliedAt: string;
  /** True when the rate was older than the policy allowed at the time of use. */
  stale: boolean;
}

export interface Converted {
  money: Money;
  conversion: FxConversion;
}

const ageSeconds = (rateAsOf: string, now: string): number =>
  (Date.parse(now) - Date.parse(rateAsOf)) / 1000;

export function isStale(rate: FxRate, now: string, policy: ConversionPolicy): boolean {
  const age = ageSeconds(rate.asOf, now);
  return !Number.isFinite(age) || age > policy.maxAgeSeconds;
}

function applyRounding(value: number, mode: ConversionPolicy["rounding"]): number {
  if (mode === "up") return Math.ceil(value);
  if (mode === "down") return Math.floor(value);
  return Math.floor(value + 0.5);
}

/**
 * Convert, and produce the record. `now` is passed in so the result is
 * reproducible — a function that read the clock could not be replayed.
 */
export function convert(
  amount: Money,
  rate: FxRate,
  now: string,
  policy: ConversionPolicy = DEFAULT_POLICY
): Converted {
  if (amount.currency !== rate.from) {
    throw new TypeError(
      `Rate converts ${rate.from} but the amount is ${amount.currency}. ` +
        "Applying a rate to the wrong currency is silent and expensive; the pair must match."
    );
  }
  if (!(rate.rate > 0)) {
    throw new TypeError(`FX rate must be positive; got ${rate.rate} for ${rate.from}->${rate.to}.`);
  }

  // Rates are quoted in major units, amounts are held in minor units.
  const fromMajor = amount.amount / 10 ** minorUnits(rate.from);
  const toMajor = fromMajor * rate.rate * (1 + policy.marginBuffer);
  let toMinor = applyRounding(toMajor * 10 ** minorUnits(rate.to), policy.rounding);

  if (policy.roundToNearestMinor > 0) {
    const step = policy.roundToNearestMinor;
    toMinor = applyRounding(toMinor / step, policy.rounding) * step;
  }

  return {
    money: money(toMinor, rate.to),
    conversion: {
      fromAmount: amount.amount,
      fromCurrency: amount.currency,
      toAmount: toMinor,
      toCurrency: rate.to,
      rate: rate.rate,
      marginBuffer: policy.marginBuffer,
      source: rate.source,
      rateAsOf: rate.asOf,
      appliedAt: now,
      stale: isStale(rate, now, policy),
    },
  };
}

/**
 * FR-PAY-24: "an order may be displayed in one currency, authorised in a second
 * and settled in a third. Store all three with the rate and timestamp for each
 * conversion, and never recompute a historical figure from a current rate."
 *
 * So a settlement is a LIST of conversions, not a single rate, and the stored
 * chain is what an invoice is reproduced from.
 */
export interface SettlementChain {
  display: Money;
  authorised: Money;
  settled: Money;
  conversions: FxConversion[];
}

export function settleThrough(
  display: Money,
  legs: Array<{ rate: FxRate; policy?: ConversionPolicy }>,
  now: string
): SettlementChain {
  const conversions: FxConversion[] = [];
  let current = display;
  for (const leg of legs) {
    const step = convert(current, leg.rate, now, leg.policy ?? DEFAULT_POLICY);
    conversions.push(step.conversion);
    current = step.money;
  }
  return {
    display,
    authorised: conversions.length > 0 ? money(conversions[0].toAmount, conversions[0].toCurrency) : display,
    settled: current,
    conversions,
  };
}

/** Reproduce a stored conversion without consulting any current rate. */
export function replay(conversion: FxConversion): Money {
  return money(conversion.toAmount, conversion.toCurrency);
}
