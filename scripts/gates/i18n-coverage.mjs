#!/usr/bin/env node
/* Translation coverage — FR-I18N-14.
 *
 * "Translation coverage shall be reported per locale as a build artefact, and a
 *  locale below a configurable coverage threshold shall not be selectable in
 *  production."
 *
 * Both halves are here: the artefact is written to
 * apps/web/public/i18n-coverage.json, and the threshold is configuration
 * (VOID_I18N_THRESHOLD, default 95) rather than a constant, because FR-ADM-47
 * forbids a business-configurable value becoming a code constant.
 *
 * It also checks the source catalogue for two things a missing-key fallback
 * cannot save you from: an ICU placeholder that exists in English and not in the
 * translation renders a sentence with a hole in it, and a translated key that no
 * longer exists in English is dead weight the content team should be told about.
 *
 * This gate does not fail on low coverage. Bengali is deliberately untranslated
 * — machine translation was declined, and inventing copy to satisfy a number
 * would be worse than the number being honest. What it DOES fail on is a locale
 * that is below threshold while being reachable in production, which is the
 * actual requirement.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

const MESSAGES = "apps/web/messages";
const SOURCE = "en";
const ARTEFACT = "apps/web/public/i18n-coverage.json";
const THRESHOLD = Number(process.env.VOID_I18N_THRESHOLD ?? 95);
const IS_PRODUCTION = process.env.APP_ENV === "production";

const load = (locale) => JSON.parse(readFileSync(join(MESSAGES, `${locale}.json`), "utf8"));

/** Flatten to dotted keys, skipping the `$comment` annotations. */
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, path, out);
    else out[path] = String(v);
  }
  return out;
}

/** ICU placeholders: {name}, and the variable of a plural/select block. */
const placeholders = (s) =>
  new Set([...s.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*(?:,|\})/g)].map((m) => m[1]));

const source = flatten(load(SOURCE));
const sourceKeys = Object.keys(source);

/* Locales are the catalogues present. Whether each is one a servable market
   actually permits is asserted in the market test suite, which can import the
   registry directly — this script runs in plain Node and cannot load TypeScript. */
const locales = readdirSync(MESSAGES)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort((a, b) => (a === SOURCE ? -1 : b === SOURCE ? 1 : a.localeCompare(b)));

const report = { source: SOURCE, totalKeys: sourceKeys.length, threshold: THRESHOLD, locales: {} };
let fatal = 0;
const warnings = [];

for (const locale of locales) {
  const target = flatten(load(locale));
  /* For a translation, "translated" means present AND different from English —
     a copied English string is a placeholder, not a translation. For the SOURCE
     locale that test is meaningless, since it is English by definition. */
  const translated =
    locale === SOURCE
      ? sourceKeys.filter((k) => target[k] !== undefined)
      : sourceKeys.filter((k) => target[k] !== undefined && target[k] !== source[k]);
  const identical = sourceKeys.filter((k) => target[k] !== undefined && target[k] === source[k]);
  const missing = sourceKeys.filter((k) => target[k] === undefined);
  const orphaned = Object.keys(target).filter((k) => source[k] === undefined);

  // A placeholder present in English and absent from the translation renders a
  // sentence with a hole in it — worse than falling back to English entirely.
  const brokenPlaceholders = [];
  for (const k of Object.keys(target)) {
    if (source[k] === undefined) continue;
    const want = placeholders(source[k]);
    const got = placeholders(target[k]);
    const lost = [...want].filter((p) => !got.has(p));
    if (lost.length) brokenPlaceholders.push({ key: k, missing: lost });
  }

  const coverage = locale === SOURCE ? 100 : Math.round((translated.length / sourceKeys.length) * 1000) / 10;
  const selectableInProduction = coverage >= THRESHOLD;

  report.locales[locale] = {
    coverage,
    translated: translated.length,
    identicalToSource: identical.length,
    missing: missing.length,
    orphaned,
    brokenPlaceholders,
    selectableInProduction,
  };

  const bar = "█".repeat(Math.round(coverage / 5)).padEnd(20, "·");
  console.log(`  ${locale}  ${bar} ${String(coverage).padStart(5)}%  ${translated.length}/${sourceKeys.length} translated`);
  if (missing.length && locale !== SOURCE) {
    console.log(`       ${missing.length} key(s) fall back to ${SOURCE} (FR-I18N-9)`);
  }
  if (orphaned.length) warnings.push(`${locale}: ${orphaned.length} orphaned key(s) not in ${SOURCE}: ${orphaned.slice(0, 3).join(", ")}`);
  if (brokenPlaceholders.length) {
    fatal++;
    console.error(`       FAIL ${brokenPlaceholders.length} key(s) drop an ICU placeholder:`);
    for (const b of brokenPlaceholders.slice(0, 5)) console.error(`            ${b.key} loses {${b.missing.join("}, {")}}`);
  }

  /* The requirement: below threshold means NOT SELECTABLE in production. It does
     not mean the build fails — it means the locale must not be reachable. */
  if (!selectableInProduction && IS_PRODUCTION) {
    fatal++;
    console.error(
      `       FAIL ${locale} is ${coverage}% (threshold ${THRESHOLD}%) and must not be selectable in production (FR-I18N-14).`
    );
  }
}

mkdirSync(dirname(ARTEFACT), { recursive: true });
writeFileSync(ARTEFACT, JSON.stringify(report, null, 2) + "\n");
console.log(`\n  artefact: ${ARTEFACT}`);

for (const w of warnings) console.log(`  WARN  ${w}`);

/* A locale below threshold that is also a market's DEFAULT locale is a
   contradiction the requirement cannot resolve on its own: the market would have
   no serveable default. The market test suite asserts which locales are in that
   position; this only reports the number the assertion turns on. */
for (const [locale, r] of Object.entries(report.locales)) {
  if (!r.selectableInProduction) {
    console.log(
      `\n  NOTE  "${locale}" is at ${r.coverage}% against a ${THRESHOLD}% threshold, so FR-I18N-14 makes it\n` +
        `        unselectable in production. Where it is also a market's default locale (FR-MKTS-1), that\n` +
        `        market cannot launch until the copy exists. This is a content blocker, not a code one:\n` +
        `        machine translation was declined (ADR-0007), so the number stays honest until a\n` +
        `        translator supplies words.`
    );
  }
}

if (fatal) {
  console.error(`\nFAIL — ${fatal} i18n problem(s).`);
  process.exit(1);
}
console.log("\nPASS — coverage reported; no locale is below threshold while reachable in production.");
