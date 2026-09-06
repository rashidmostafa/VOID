#!/usr/bin/env node
/* Dead-utility check.
 *
 * Tailwind emits NOTHING for a utility whose theme key does not exist, and no
 * error. `hover:border-line-strong` looks correct, type-checks, lints clean, and
 * silently does not apply — which is how 28 colour utilities in this repo were
 * inert until a browser probe caught one of them.
 *
 * This compares every class written in a className against the classes Tailwind
 * actually emitted into the built stylesheet. It runs after the build, for the
 * same reason gate 3 does: the build is the ground truth about what Tailwind
 * recognised.
 *
 * A utility referencing a token that exists at runtime but is not exposed to
 * Tailwind is reported with that fact, because it is nearly always the cause —
 * the composite/alias tier is deliberately not in the theme, since component
 * code references the semantic tier only.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const CSS_DIR = "apps/web/.next/static/css";
if (!existsSync(CSS_DIR)) {
  console.error("dead-utilities: no built CSS — run `npx next build apps/web` first.");
  process.exit(1);
}

const css = readdirSync(CSS_DIR)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(CSS_DIR, f), "utf8"))
  .join("\n");

// Selectors Tailwind emitted, unescaped.
const emitted = new Set(
  [...css.matchAll(/\.((?:[a-zA-Z0-9_-]|\\.)+)/g)].map((m) => m[1].replace(/\\/g, ""))
);

const runtime = readFileSync("apps/web/public/theme/tokens.css", "utf8");

/* The theme's base layer defines real classes of its own — .void-touch-safe,
   .void-skeleton, .void-visually-hidden. They are not Tailwind utilities and
   must not be reported as dead. */
for (const m of runtime.matchAll(/\.([a-z][a-z0-9_-]*)/gi)) emitted.add(m[1]);
const runtimeProps = new Set(
  [...runtime.matchAll(/^\s*--([a-z0-9-]+)\s*:/gim)].map((m) => m[1])
);

const SOURCES = ["packages/ui/src", "apps/web/app"];
const files = [];
for (const root of SOURCES) {
  (function walk(d) {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      if (statSync(p).isDirectory()) { if (!/node_modules|\.next|dist/.test(p)) walk(p); }
      else if (/\.tsx?$/.test(p)) files.push(p);
    }
  })(root);
}

/* Only strings that are actually class lists: a className attribute, or a
   string assigned to something class-shaped. Anything else produces noise —
   CSS property names in inline styles look like utilities. */
function classStrings(src) {
  const out = [];
  for (const m of src.matchAll(/className\s*=\s*\{?["'`]([^"'`]+)["'`]/g)) out.push(m[1]);
  for (const m of src.matchAll(/(?:^|\n)\s*(?:const|let)\s+[A-Za-z_$][\w$]*\s*(?::[^=]+)?=\s*\[([\s\S]*?)\]\s*(?:\.filter[^;]*)?\.join\(" "\)/g)) {
    for (const s of m[1].matchAll(/["'`]([^"'`]+)["'`]/g)) out.push(s[1]);
  }
  for (const m of src.matchAll(/(?:^|\n)\s*(?:const|let)\s+[A-Z_]+\s*(?::[^=]+)?=\s*["'`]([^"'`]+)["'`]/g)) out.push(m[1]);
  for (const m of src.matchAll(/:\s*\n?\s*["'`]((?:[a-z][\w:-]*\s+)+[a-z][\w:[\]().,%/-]*)["'`]/g)) out.push(m[1]);
  return out;
}

const dead = new Map();
for (const f of files) {
  for (const list of classStrings(readFileSync(f, "utf8"))) {
    for (const cls of list.split(/\s+/).filter(Boolean)) {
      if (!/^[a-z][a-z0-9]*[-:[]/.test(cls)) continue;   // needs a Tailwind shape
      if (cls.includes("${")) continue;                   // interpolated, not literal
      if (emitted.has(cls)) continue;
      dead.set(cls, (dead.get(cls) ?? new Set()).add(f));
    }
  }
}

if (!dead.size) {
  console.log(`dead-utilities: every utility in ${files.length} files produces CSS.`);
  process.exit(0);
}

console.error(`\nUtilities that compile to NOTHING (${dead.size}):\n`);
for (const [cls, where] of [...dead].sort()) {
  const token = cls.split(":").pop().replace(/^(bg|text|border|ring|fill|stroke|shadow)-/, "");
  const hint = runtimeProps.has(token)
    ? `  --${token} exists at runtime but is not exposed to Tailwind (composite/alias tier is deliberately excluded)`
    : "";
  console.error(`  ${cls}`);
  console.error(`    ${[...where].join(", ")}${hint ? "\n   " + hint : ""}`);
}
console.error(`\nFAIL — ${dead.size} dead utility reference(s).`);
process.exit(1);
