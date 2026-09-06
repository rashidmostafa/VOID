#!/usr/bin/env node
/* Derive the placeholder token set (UI-SRC-7) from the contract.
 *
 * The SRS requires a provisional set that ships with seed data, is visibly
 * marked provisional outside production, and fails the release gate if active
 * in production (V12). Two things follow from deriving it rather than authoring
 * it by hand:
 *
 *   1. It cannot fall behind the contract. Add a required token to the default
 *      set and the placeholder grows it too, so V1 stays honest for both.
 *   2. It is materially different where the theme-swap gate needs difference —
 *      colour, radius and type family — while keeping the structure identical,
 *      which is exactly the axis UI-SRC-10 tests: a component that only works
 *      under one theme is defective.
 *
 * It is deliberately unbranded: greyscale, square, system-font. It is not a
 * design proposal, and it must never reach production.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve as pres } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = pres(HERE, "..");

const SRC = join(PKG, "sets/void-default.json");
const OUT = join(PKG, "sets/void-placeholder.json");

/** Strip chroma: keep the lightness, drop the hue. Contrast is preserved, identity is not. */
function achromatic(value) {
  if (typeof value !== "string") return value;
  return value.replace(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:deg)?\s*(\/\s*[\d.]+%?\s*)?\)/gi,
    (_all, L, _C, _H, alpha) => `oklch(${L} 0 0${alpha ? ` / ${alpha.replace(/^\/\s*/, "").trim()}` : ""})`
  );
}

const SYSTEM_SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SYSTEM_MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
const SYSTEM_BENGALI = "'Noto Sans Bengali', 'Hind Siliguri', sans-serif";

function transform(node, path = []) {
  if (Array.isArray(node)) return node.map((n) => transform(n, path));
  if (node === null || typeof node !== "object") return node;

  const out = {};
  for (const [k, v] of Object.entries(node)) {
    const p = [...path, k];
    const dotted = p.join(".");

    // Primitive ramps hold their colour as a bare string under the step name
    // ("500": "oklch(...)"), not under a `value` key, so chroma has to be
    // stripped wherever an oklch() appears rather than only at known keys.
    if (typeof v === "string" && /oklch\(/i.test(v) && !/^semantic\.font\.family\./.test(dotted)) {
      out[k] = achromatic(v);
      continue;
    }

    if (k === "value" || k === "light" || k === "dark" || k === "bnScope") {
      let next = v;
      // Colour: drop the hue.
      if (typeof next === "string" && /oklch\(/i.test(next)) next = achromatic(next);
      // Radius: square, so a component that assumed a curve is exposed.
      if (/^semantic\.radius\./.test(dotted) && !/\.full$/.test(dotted.replace(/\.(value|light|dark)$/, ""))) {
        next = typeof next === "string" && next.includes("full") ? next : "0";
      }
      // Type: system stacks only — no webfont, so the set needs no font files.
      if (/^semantic\.font\.family\./.test(dotted)) {
        next = /mono/i.test(dotted) ? SYSTEM_MONO : /bengali/i.test(dotted) ? SYSTEM_BENGALI : SYSTEM_SANS;
      }
      out[k] = next;
      continue;
    }
    out[k] = transform(v, p);
  }
  return out;
}

const src = JSON.parse(readFileSync(SRC, "utf8"));

const placeholder = {
  $schema: src.$schema,
  meta: {
    ...src.meta,
    name: "void-placeholder",
    version: `${src.meta.version}-placeholder`,
    sourceMode: "placeholder",
    sourceRef: null,
    licenceRef: null,
    isPlaceholder: true,
    $comment:
      "GENERATED from void-default by packages/tokens/src/make-placeholder.mjs. " +
      "DELIBERATELY UNBRANDED: greyscale, square corners, system fonts. It exists so structural " +
      "work can proceed and so the theme-swap gate (UI-SRC-10) has a second, materially different " +
      "set to render against. It is not a design proposal. Deployment must refuse to activate it " +
      "in production (UI-SRC-7, rule V12).",
    sourceProvenance: undefined,
    adaptations: [],
  },
  primitive: {
    ...transform(src.primitive, ["primitive"]),
    font: {
      stack: { voidSans: SYSTEM_SANS, voidMono: SYSTEM_MONO, voidBengali: SYSTEM_BENGALI },
      // No webfonts: the placeholder must not depend on binaries it does not own.
      face: { $comment: "No faces. The placeholder uses system stacks only." },
    },
  },
  semantic: transform(src.semantic, ["semantic"]),
  composite: transform(src.composite, ["composite"]),
};

// `radius` is the shadcn anchor the whole chain calc()s off; square it at source.
if (placeholder.composite?.radius) placeholder.composite.radius.value = "0";
if (placeholder.primitive?.size) placeholder.primitive.size.radiusBase = "0";

writeFileSync(OUT, JSON.stringify(placeholder, null, 2) + "\n");
console.log(
  `placeholder: derived from ${src.meta.name} v${src.meta.version} — greyscale, square, system fonts`
);
