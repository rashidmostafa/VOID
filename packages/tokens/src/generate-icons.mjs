#!/usr/bin/env node
/* Icon codegen — sprite in, typed React data out.
 *
 * The design-system Icon fetches the sprite at runtime and injects it with
 * dangerouslySetInnerHTML. Its own comment records why: two <use>-based
 * approaches were tried and both failed, cross-document outright and
 * same-document because the shadow tree would not inherit stroke or
 * currentColor.
 *
 * Neither of those problems, nor the fetch, survives into this stack. Reading
 * the sprite at BUILD time and emitting the geometry as React element data
 * means:
 *   · Icon is a Server Component — no fetch, no waterfall, no empty boxes on
 *     first paint, and no icon JS shipped to the client at all
 *   · no shadow tree exists, so stroke and currentColor behave like any other
 *     inherited attribute — which is the whole reason the sprite carries
 *     geometry only and Icon supplies the rest
 *   · icon names are a TypeScript union, so a typo is a compile error rather
 *     than a silently empty box, and "does Lucide have this glyph?" is answered
 *     before the build finishes (readme.md: if it does not, use a text label and
 *     raise it — do not hand-draw one)
 *
 * The sprite file itself is no longer served, so its embedded C2PA manifest —
 * about two thirds of its 21KB — never reaches a browser.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve as pres } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = pres(HERE, "..");
const ROOT = pres(PKG, "../..");

const SPRITE = join(PKG, "assets/icons/void-icons.svg");
const OUT = join(ROOT, "packages/tokens/dist/icons.ts");

/* Geometry elements a Lucide symbol may contain. Anything else is a signal that
   the sprite changed shape and the codegen should be looked at, not widened. */
const ALLOWED = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse"]);

/* Presentation attributes are deliberately NOT carried through: Icon supplies
   stroke, width, linecap and linejoin so one sprite serves every size and
   colour. A symbol that tried to set its own would defeat that. */
const DROP = new Set(["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "class", "style"]);

const svg = readFileSync(SPRITE, "utf8");

const symbols = [];
const symbolRe = /<symbol\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g;
let m;
while ((m = symbolRe.exec(svg))) {
  const [, id, body] = m;
  const nodes = [];
  const elRe = /<([a-z]+)\s*([^>]*?)\s*\/?>/gi;
  let e;
  while ((e = elRe.exec(body))) {
    const tag = e[1].toLowerCase();
    if (!ALLOWED.has(tag)) continue;
    const attrs = {};
    const attrRe = /([a-z-]+)="([^"]*)"/gi;
    let a;
    while ((a = attrRe.exec(e[2]))) {
      if (DROP.has(a[1])) continue;
      attrs[a[1]] = a[2];
    }
    nodes.push([tag, attrs]);
  }
  if (!nodes.length) {
    console.error(`icons: symbol "${id}" produced no geometry — check the sprite`);
    process.exit(1);
  }
  symbols.push([id, nodes]);
}

if (!symbols.length) {
  console.error("icons: no symbols found in the sprite");
  process.exit(1);
}

symbols.sort((a, b) => a[0].localeCompare(b[0]));

/* SVG attribute names are hyphenated; React wants camelCase for most of them.
   Converting here keeps the component free of a runtime mapping step. */
const reactAttr = (name) =>
  name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const body = symbols
  .map(([id, nodes]) => {
    const els = nodes
      .map(([tag, attrs]) => {
        const pairs = Object.entries(attrs)
          .map(([k, v]) => `${JSON.stringify(reactAttr(k))}: ${JSON.stringify(v)}`)
          .join(", ");
        return `[${JSON.stringify(tag)}, { ${pairs} }]`;
      })
      .join(", ");
    return `  ${JSON.stringify(id)}: [${els}],`;
  })
  .join("\n");

const out = `/* GENERATED — do not edit.
   Source: packages/tokens/assets/icons/void-icons.svg (${symbols.length} symbols, Lucide, ISC)
   Regenerate: npm run tokens:generate

   Geometry only. Icon supplies stroke, width, linecap and linejoin, which is
   what lets one set of paths serve every size and colour (UI-INV-13: the sprite
   is self-hosted and nothing here reaches a third-party origin). */

export type IconNode = readonly [string, Readonly<Record<string, string>>];

export type VoidIconName =
${symbols.map(([id]) => `  | ${JSON.stringify(id)}`).join("\n")};

export const ICON_NAMES = [
${symbols.map(([id]) => `  ${JSON.stringify(id)},`).join("\n")}
] as const;

export const ICONS: Readonly<Record<VoidIconName, readonly IconNode[]>> = {
${body}
};
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out);
console.log(`icons: generated ${symbols.length} symbols -> packages/tokens/dist/icons.ts`);
