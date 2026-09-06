#!/usr/bin/env node
/* Gates 4 and 5 — ADR-0001 payload budgets.

   Gate 4 (blocking): token CSS + the faces the contract marks criticalPath,
   compressed, must stay under 40KB.
   Gate 5 (advisory): the Bengali pair against a 110KB soft target.

   The file list comes from the token set's `primitive.font.face` entries, not a
   hard-coded list, so adding a sixth face cannot slip past the budget. */
import { readFileSync, existsSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "packages/tokens");
const CEILING = 40 * 1024;          // ADR-0001 §1
const BENGALI_TARGET = 110 * 1024;  // ADR-0001 §3, advisory

const set = JSON.parse(readFileSync(join(PKG, "sets/void-default.json"), "utf8"));
const faces = Object.entries(set.primitive.font.face).filter(([k]) => !k.startsWith("$")).map(([name, f]) => ({ name, ...f }));

const cssPath = join(ROOT, "apps/web/public/theme/tokens.css");
if (!existsSync(cssPath)) {
  console.error("budget: theme not generated — run `npm run tokens:generate` first");
  process.exit(1);
}
const cssBytes = gzipSync(readFileSync(cssPath), { level: 9 }).length;

const size = (f) => (existsSync(join(PKG, f.file)) ? statSync(join(PKG, f.file)).size : NaN);
const critical = faces.filter((f) => f.criticalPath);
const bengali = faces.filter((f) => /bengali/i.test(f.family));

// The set records byte counts; a stale one hides a real regression.
let stale = 0;
for (const f of faces) {
  const actual = size(f);
  if (Number.isNaN(actual)) { console.error(`budget: missing font file ${f.file}`); process.exit(1); }
  if (f.bytes !== actual) { console.log(`  note  ${f.name}: set records ${f.bytes} B, file is ${actual} B`); stale++; }
}

const fontBytes = critical.reduce((n, f) => n + size(f), 0);
const total = cssBytes + fontBytes;
const bengaliBytes = bengali.reduce((n, f) => n + size(f), 0);

const pct = (n, d) => ((n / d) * 100).toFixed(1);
console.log(`\ncritical path (ADR-0001 gate 4)`);
console.log(`  token CSS, gzip -9        ${String(cssBytes).padStart(7)} B`);
for (const f of critical) console.log(`  ${f.file.padEnd(26)}${String(size(f)).padStart(7)} B`);
console.log(`  ${"total".padEnd(26)}${String(total).padStart(7)} B  of ${CEILING} B  (${pct(total, CEILING)}%)`);

console.log(`\nBengali pair (ADR-0001 gate 5, advisory)`);
for (const f of bengali) console.log(`  ${f.file.padEnd(26)}${String(size(f)).padStart(7)} B`);
console.log(`  ${"total".padEnd(26)}${String(bengaliBytes).padStart(7)} B  of ${BENGALI_TARGET} B  (${pct(bengaliBytes, BENGALI_TARGET)}%)`);

if (bengaliBytes > BENGALI_TARGET) console.log(`\n  WARN  Bengali pair exceeds the 110KB advisory target. Not gating.`);
if (stale) console.log(`\n  WARN  ${stale} recorded byte count(s) differ from the files on disk.`);

if (total > CEILING) {
  console.error(`\nFAIL — critical path ${total} B exceeds the ${CEILING} B ceiling by ${total - CEILING} B.`);
  process.exit(1);
}
console.log(`\nPASS — ${CEILING - total} B of headroom.`);
