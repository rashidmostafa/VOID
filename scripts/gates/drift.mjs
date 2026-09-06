#!/usr/bin/env node
/* Anti-drift check (HANDOFF open item 5).

   The generated theme must MEAN the same as the hand-authored design-system CSS.
   It compares fully-resolved values, not raw text: `var(--font-sans)` and
   `var(--font-void-sans)` are the same colour of the same paint, and a gate that
   failed on that would be measuring authorship style rather than correctness. */
import { readFileSync, existsSync } from "node:fs";
import { parseDeclarations, CASCADE } from "./lib/parse-css.mjs";

const GEN = "apps/web/public/theme/tokens.css";
const REF = "design-system/tokens";

/** Follow var() chains inside one scope, falling back to :root. */
function resolver(map) {
  const seen = new Set();
  const get = (scope, name) => map.get(`${scope}|${name}`) ?? map.get(`root|${name}`);
  const expand = (scope, value, depth = 0) => {
    if (typeof value !== "string" || depth > 24) return value;
    return value.replace(/var\(\s*(--[a-z0-9-]+)\s*(?:,[^)]*)?\)/gi, (all, ref) => {
      const key = `${scope}|${ref}`;
      if (seen.has(key)) return all;
      const next = get(scope, ref);
      if (next === undefined) return all;
      seen.add(key);
      const out = expand(scope, next, depth + 1);
      seen.delete(key);
      return out;
    });
  };
  return (scope, value) => {
    const out = expand(scope, value);
    return typeof out === "string" ? out.replace(/\s+/g, " ").trim() : out;
  };
}

const gen = parseDeclarations(readFileSync(GEN, "utf8"));
const hand = new Map();
for (const stem of CASCADE) {
  const f = `${REF}/${stem}.css`;
  if (!existsSync(f)) continue;
  for (const [k, v] of parseDeclarations(readFileSync(f, "utf8"))) hand.set(k, v);
}

const rg = resolver(gen);
const rh = resolver(hand);
const split = (k) => { const i = k.indexOf("|"); return [k.slice(0, i), k.slice(i + 1)]; };

const gk = new Set(gen.keys());
const missing = [...hand.keys()].filter((k) => !gk.has(k)).sort();
const extra = [...gk].filter((k) => !hand.has(k)).sort();
const mismatch = [...gk]
  .filter((k) => hand.has(k))
  .filter((k) => { const [s] = split(k); return rg(s, gen.get(k)) !== rh(s, hand.get(k)); })
  .sort();

if (missing.length) {
  console.log(`\nMISSING from generated (${missing.length})`);
  for (const k of missing) console.log(`  ${k} = ${hand.get(k)}`);
}
if (mismatch.length) {
  console.log(`\nVALUE MISMATCH (${mismatch.length})`);
  for (const k of mismatch) {
    const [s] = split(k);
    console.log(`  ${k}\n    reference: ${hand.get(k)}  ->  ${rh(s, hand.get(k))}`);
    console.log(`    generated: ${gen.get(k)}  ->  ${rg(s, gen.get(k))}`);
  }
}
if (extra.length) {
  console.log(`\nEXTRA in generated — advisory, these are redundant but harmless (${extra.length})`);
  for (const k of extra) console.log(`  ${k} = ${gen.get(k)}`);
}

const fatal = missing.length + mismatch.length;
console.log(
  `\ndrift: ${hand.size} reference declarations, ${gk.size} generated, ` +
    `${gk.size - extra.length - mismatch.length} equivalent, ${extra.length} extra`
);
if (fatal) {
  console.error(`\nFAIL — ${fatal} declaration(s) differ in meaning from the design-system reference.`);
  process.exit(1);
}
console.log("PASS — the generated theme is semantically identical to the design-system reference.");
