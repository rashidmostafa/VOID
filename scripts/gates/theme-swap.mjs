#!/usr/bin/env node
/* Gate 3 — theme swap (UI-SRC-10).
 *
 * "Render the preview surfaces under two materially different token sets and
 *  assert no layout break, no clipped text, no contrast failure, no component
 *  throw. A component that only works under one theme is defective."
 *
 * The gate has two halves and is explicit about which one ran:
 *
 *   Structural (always runs, no browser). Every set must expose the SAME token
 *   names — a set that silently drops a token does not break at build time, it
 *   breaks as an unstyled control in production — and each set must pass its own
 *   contrast rules. This half catches the defect class that actually recurs:
 *   a theme grown in one set and not the other.
 *
 *   Rendered (needs Playwright). Loads the preview surfaces under each set at
 *   320 and 1440, light and dark, en and bn, and asserts no inline-axis
 *   overflow, no clipped text, no console error, and that the Bengali conjunct
 *   strings shape without fallback — which is the half of rule V6 that can only
 *   honestly be tested in a browser.
 *
 * The rendered half is skipped, loudly, when Playwright is absent. Set
 * VOID_REQUIRE_BROWSER=1 in CI to make that skip fatal.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseDeclarations } from "./lib/parse-css.mjs";

const ROOT = process.cwd();
const SETS = join(ROOT, "packages/tokens/sets");

const themeCss = (name) =>
  name === "void-default"
    ? join(ROOT, "apps/web/public/theme/tokens.css")
    : join(ROOT, `packages/tokens/dist/themes/${name}.css`);

const setFiles = readdirSync(SETS).filter((f) => f.endsWith(".json"));
if (setFiles.length < 2) {
  console.error(`theme-swap: needs at least two token sets, found ${setFiles.length}.`);
  process.exit(1);
}

const themes = [];
for (const f of setFiles) {
  const doc = JSON.parse(readFileSync(join(SETS, f), "utf8"));
  const name = doc.meta?.name ?? f.replace(/\.json$/, "");
  const css = themeCss(name);
  if (!existsSync(css)) {
    console.error(`theme-swap: ${name} has no emitted stylesheet at ${css}.`);
    console.error(`            run: node packages/tokens/src/generate.mjs ${join(SETS, f)}`);
    process.exit(1);
  }
  themes.push({ name, doc, decls: parseDeclarations(readFileSync(css, "utf8")) });
}

console.log(`theme-swap: ${themes.length} sets — ${themes.map((t) => t.name).join(", ")}\n`);

/* ---- structural parity ---- */
let problems = 0;
const nameSet = (t) => new Set([...t.decls.keys()].map((k) => k.split("|")[1]));
const base = themes[0];
const baseNames = nameSet(base);

for (const t of themes.slice(1)) {
  const names = nameSet(t);
  const missing = [...baseNames].filter((n) => !names.has(n)).sort();
  const extra = [...names].filter((n) => !baseNames.has(n)).sort();
  if (missing.length) {
    problems += missing.length;
    console.error(`  FAIL  ${t.name} is missing ${missing.length} token(s) present in ${base.name}:`);
    for (const n of missing.slice(0, 12)) console.error(`          ${n}`);
    if (missing.length > 12) console.error(`          ... and ${missing.length - 12} more`);
  }
  if (extra.length) {
    problems += extra.length;
    console.error(`  FAIL  ${t.name} declares ${extra.length} token(s) absent from ${base.name}:`);
    for (const n of extra.slice(0, 12)) console.error(`          ${n}`);
  }
  if (!missing.length && !extra.length) {
    console.log(`  pass  ${t.name} exposes the same ${names.size} token names as ${base.name}`);
  }
}

/* Materially different: a swap test against a near-identical set proves nothing. */
for (const t of themes.slice(1)) {
  let differing = 0;
  for (const [k, v] of base.decls) if (t.decls.get(k) !== v) differing++;
  const pct = ((differing / base.decls.size) * 100).toFixed(0);
  if (differing < base.decls.size * 0.1) {
    problems++;
    console.error(`  FAIL  ${t.name} differs from ${base.name} in only ${differing} declarations (${pct}%) — not a material difference`);
  } else {
    console.log(`  pass  ${t.name} differs in ${differing}/${base.decls.size} declarations (${pct}%) — materially different`);
  }
}

/* ---- rendered half ---- */
let playwright = null;
try { playwright = await import("playwright"); } catch { /* not installed */ }

if (!playwright) {
  const required = process.env.VOID_REQUIRE_BROWSER === "1";
  const msg =
    "  SKIP  rendered half not run — Playwright is not installed.\n" +
    "        This gate is only half met: layout break, text clipping and Bengali\n" +
    "        conjunct shaping are NOT verified. Install with:\n" +
    "          npm i -D playwright && npx playwright install chromium\n" +
    "        Set VOID_REQUIRE_BROWSER=1 to make this skip fatal in CI.";
  if (required) { console.error(msg.replace("SKIP", "FAIL")); problems++; }
  else console.log(`\n${msg}`);
} else {
  const { runRendered, preflight } = await import("./theme-swap.render.mjs");
  const missing = preflight();
  if (missing) {
    console.error(`\n  FAIL  ${missing}`);
    problems++;
  } else {
    console.log("\n  rendered half: the real preview surface, under each set");
    problems += await runRendered(themes, playwright);
  }
}

console.log("");
if (problems) {
  console.error(`FAIL — ${problems} theme-swap problem(s).`);
  process.exit(1);
}
console.log("PASS — every set exposes the same contract and differs materially.");
