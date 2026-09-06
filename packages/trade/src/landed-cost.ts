import { addMoney, money, type Money } from "@void/market";
import type {
  CollectionScheme,
  DutyRate,
  LandedCost,
  LandedCostInput,
  Threshold,
} from "./types";

/* The landed-cost engine.
 *
 * Pure. Every rate, threshold, fee and date is an input; nothing here reads a
 * clock, a database or a network (NFR-ARCH-4). The same inputs always produce
 * the same integers, which is what lets a two-year-old invoice be reproduced
 * (DR-GEN-10) and what lets the fixture set assert exact results (NFR-QA-5).
 *
 * Rounding is stated once and applied everywhere: duty and tax round HALF UP to
 * the minor unit, per line for duty and once for tax. Rounding per line rather
 * than on the total matters because a customs authority assesses per line, and a
 * total rounded once will disagree with the entry by a few poisha on a large
 * order — which is exactly the kind of discrepancy nobody notices until it
 * arrives as a bill.
 */

const roundHalfUp = (n: number) => Math.floor(n + 0.5);

const zero = (currency: string): Money => money(0, currency);

/** Most specific match wins: longest HS prefix, then an exact origin over "*". */
export function selectDutyRate(
  rates: DutyRate[],
  hsCode: string,
  origin: string,
  destination: string
): DutyRate | undefined {
  return rates
    .filter(
      (r) =>
        r.destination === destination &&
        hsCode.startsWith(r.hsPrefix) &&
        (r.origin === "*" || r.origin === origin)
    )
    .sort((a, b) => b.hsPrefix.length - a.hsPrefix.length || (a.origin === "*" ? 1 : -1))[0];
}

/**
 * FR-TAX-8: thresholds are dated data. The latest one in force at `asOf` wins,
 * and the DEFAULT FOR AN UNCONFIGURED DESTINATION IS NO RELIEF — not an
 * absent threshold treated as unlimited relief, which is the failure mode that
 * quotes zero duty on a parcel that will be assessed for it.
 */
export function selectThreshold(
  thresholds: Threshold[],
  destination: string,
  asOf: string
): Threshold | undefined {
  return thresholds
    .filter((t) => t.destination === destination && t.effectiveFrom <= asOf)
    .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1))[0];
}

export function selectScheme(
  schemes: CollectionScheme[],
  destination: string
): CollectionScheme | undefined {
  return schemes.find((s) => s.destination === destination);
}

export function computeLandedCost(input: LandedCostInput): LandedCost {
  const { lines, destination, deliveryTerms, rates, asOf } = input;
  if (lines.length === 0) throw new Error("Landed cost requires at least one line.");

  const currency = lines[0].unitPrice.currency;
  for (const l of lines) {
    if (l.unitPrice.currency !== currency) {
      throw new Error(
        `All lines must share a currency; got ${currency} and ${l.unitPrice.currency}. ` +
          "Converting inside the calculation would lose the rate and its timestamp (FR-PAY-24)."
      );
    }
    if (!Number.isInteger(l.quantity) || l.quantity < 1) {
      throw new Error(`Line ${l.sku} has a non-integer or zero quantity.`);
    }
  }

  /* Every money input must share the goods currency. A threshold expressed in
     the destination's currency cannot be compared against goods priced in
     another without an FX conversion that records its rate and timestamp
     (FR-PAY-24) — and doing that conversion INSIDE the calculation would make
     the quote non-reproducible, which NFR-ARCH-4 forbids. So the engine refuses,
     and the caller converts first. */
  const foreign = [
    ["shipping", input.shipping.currency],
    ["insurance", input.insurance?.currency],
    ["brokerage", rates.brokerage.currency],
    ...rates.thresholds.map((t) => [`threshold ${t.id}`, t.value.currency] as const),
    ...rates.schemes.map((s) => [`scheme ${s.id}`, s.threshold.currency] as const),
  ].find(([, c]) => c !== undefined && c !== currency);

  if (foreign) {
    throw new Error(
      `Landed cost must be computed in one currency: goods are ${currency} but ${foreign[0]} is ${foreign[1]}. ` +
        "Convert the rate set into the goods currency first, recording the FX rate and timestamp (FR-PAY-24)."
    );
  }

  const shipping = input.shipping;
  const insurance = input.insurance ?? zero(currency);

  const goods = lines.reduce(
    (sum, l) => addMoney(sum, money(l.unitPrice.amount * l.quantity, currency)),
    zero(currency)
  );

  /* FR-TAX-6: duty is assessed on the basis the destination uses. CIF includes
     freight and insurance; a "goods" basis does not. Getting this wrong is a
     silent percentage error on every export order. */
  const dutiableValue =
    rates.dutiableBasis === "cif"
      ? addMoney(addMoney(goods, shipping), insurance)
      : goods;

  /* FR-TAX-9: does a seller-collected scheme apply? Decided on the consignment
     value BEFORE relief, because the scheme's threshold is about the consignment,
     not about what is left after a de minimis. */
  const schemeConfig = selectScheme(rates.schemes, destination);
  let scheme: LandedCost["scheme"] = null;
  let schemeApplies = false;
  if (schemeConfig) {
    schemeApplies = goods.amount <= schemeConfig.threshold.amount;
    scheme = {
      id: schemeConfig.id,
      applied: schemeApplies,
      reason: schemeApplies
        ? "Consignment is at or below the scheme threshold; tax is collected at checkout."
        : "Consignment exceeds the scheme threshold; the standard import route applies.",
    };
  }

  /* FR-TAX-8: relief. An unconfigured destination gets NO threshold, and a
     threshold of zero means no relief — both resolve to duty being charged. */
  const threshold = selectThreshold(rates.thresholds, destination, asOf);
  const underThreshold =
    threshold !== undefined &&
    threshold.value.amount > 0 &&
    goods.amount <= threshold.value.amount;

  const dutyRelieved = underThreshold && threshold!.relieves.includes("duty");
  const taxRelieved = underThreshold && threshold!.relieves.includes("import_tax");

  /* Duty, per line, rounded per line. FR-TAX-11: a failed provider falls back to
     the internal table and WIDENS the disclosure — it never yields zero duty. */
  const lineDuty = lines.map((l) => {
    const matched = selectDutyRate(rates.dutyRates, l.hsCode, l.countryOfOrigin, destination);
    const rate = matched?.rate ?? 0;
    if (dutyRelieved) {
      return { sku: l.sku, hsCode: l.hsCode, dutyRate: rate, duty: zero(currency) };
    }
    const lineValue = l.unitPrice.amount * l.quantity;
    // On a CIF basis, freight and insurance are apportioned by line value so the
    // per-line duties sum to duty on the whole dutiable value.
    const share = goods.amount === 0 ? 0 : lineValue / goods.amount;
    const base =
      rates.dutiableBasis === "cif"
        ? lineValue + (shipping.amount + insurance.amount) * share
        : lineValue;
    return {
      sku: l.sku,
      hsCode: l.hsCode,
      dutyRate: rate,
      duty: money(roundHalfUp(base * rate), currency),
    };
  });

  const duty = lineDuty.reduce((sum, l) => addMoney(sum, l.duty), zero(currency));

  /* Import tax. Under a collection scheme it is charged at the scheme's rate on
     the goods; otherwise on the dutiable value plus duty, which is how most
     destinations assess it. */
  let importTax = zero(currency);
  if (!taxRelieved) {
    importTax = schemeApplies
      ? money(roundHalfUp(goods.amount * schemeConfig!.taxRate), currency)
      : money(roundHalfUp((dutiableValue.amount + duty.amount) * rates.importTaxRate), currency);
  }

  /* Brokerage is only charged where a formal entry is actually made. Under a
     collection scheme, or where relief removed both duty and tax, there is no
     disbursement to bill for — charging it anyway would be a fabricated fee. */
  const brokerage =
    schemeApplies || (dutyRelieved && taxRelieved) ? zero(currency) : rates.brokerage;

  const total = [shipping, insurance, duty, importTax, brokerage].reduce(
    (sum, m) => addMoney(sum, m),
    goods
  );

  /* FR-XBRD-2: under DDP the quoted landed cost is charged at checkout. Under
     DAP the buyer pays the import charges to the carrier, and checkout shows the
     estimate rather than collecting it. */
  const importCharges = [duty, importTax, brokerage].reduce((s, m) => addMoney(s, m), zero(currency));
  const payableAtCheckout =
    deliveryTerms === "ddp" ? total : addMoney(addMoney(goods, shipping), insurance);
  const payableOnDelivery = deliveryTerms === "ddp" ? zero(currency) : importCharges;

  return {
    goods,
    shipping,
    insurance,
    dutiableValue,
    duty,
    importTax,
    brokerage,
    total,
    payableAtCheckout,
    payableOnDelivery,
    deliveryTerms,
    rateSource: rates.source,
    // FR-TAX-11: the disclosure widens when the quote rests on a fallback table.
    disclosure: rates.providerFailed ? "wide" : "narrow",
    relief: underThreshold
      ? {
          thresholdId: threshold!.id,
          effectiveFrom: threshold!.effectiveFrom,
          relieves: threshold!.relieves,
        }
      : null,
    scheme,
    lines: lineDuty,
    asOf,
  };
}
