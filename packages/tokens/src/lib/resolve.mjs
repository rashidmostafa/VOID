/* Void token pipeline — set loading and reference resolution.
   The token set is the contract (SRS Appendix I). Everything downstream —
   the emitted CSS, the Tailwind theme, the validator, the budget gate —
   derives from it, so the two cannot drift (HANDOFF open item 5). */

import { readFileSync } from "node:fs";

/** A leaf is any object carrying an explicit `cssVar`. */
export const isLeaf = (n) =>
  n !== null && typeof n === "object" && !Array.isArray(n) && typeof n.cssVar === "string";

export function loadSet(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Look up a dotted path such as `primitive.color.neutral.0`. */
export function lookup(doc, dotted) {
  let node = doc;
  for (const seg of dotted.split(".")) {
    if (node === undefined || node === null) return undefined;
    node = node[seg];
  }
  return node;
}

const REF = /^\{([^}]+)\}$/;
const EMBEDDED = /\{([^}]+)\}/g;

/** Resolve `{a.b.c}` references, following chains. Returns the literal value. */
export function resolveValue(doc, value, trail = []) {
  if (typeof value !== "string") return value;
  const m = REF.exec(value.trim());
  if (!m) {
    // A reference may be embedded in an expression: calc({primitive.size.radiusBase} * 0.8).
    if (EMBEDDED.test(value)) {
      EMBEDDED.lastIndex = 0;
      return value.replace(EMBEDDED, (whole, target) => {
        const r = resolveValue(doc, `{${target}}`, trail);
        return typeof r === "object" && r && r.__unresolved ? whole : String(r);
      });
    }
    return value;
  }
  const target = m[1];
  if (trail.includes(target)) {
    throw new Error(`Circular token reference: ${[...trail, target].join(" -> ")}`);
  }
  let next = lookup(doc, target);
  // A reference may point at another leaf rather than a raw primitive.
  if (isLeaf(next)) next = next.value !== undefined ? next.value : next.light;
  if (next === undefined) {
    return { __unresolved: target };
  }
  return resolveValue(doc, next, [...trail, target]);
}

/**
 * Walk the semantic tier and yield one record per token.
 * Each record carries every scheme/locale variant the set declares.
 */
export function semanticTokens(doc) {
  const out = [];
  const walk = (node, path) => {
    if (isLeaf(node)) {
      const rec = {
        path: path.join("."),
        cssVar: node.cssVar,
        meta: {},
      };
      for (const k of ["use", "note", "disclosedDefault", "behaviour"]) {
        if (node[k] !== undefined) rec.meta[k] = node[k];
      }
      if (node.value !== undefined) {
        rec.value = resolveValue(doc, node.value);
        rec.raw = node.value;
      }
      if (node.light !== undefined) {
        rec.light = resolveValue(doc, node.light);
        rec.rawLight = node.light;
      }
      if (node.dark !== undefined) {
        rec.dark = resolveValue(doc, node.dark);
        rec.rawDark = node.dark;
      }
      if (node.bnScope !== undefined) {
        rec.bnScope = resolveValue(doc, node.bnScope);
        rec.rawBnScope = node.bnScope;
      }
      out.push(rec);
      return;
    }
    if (node === null || typeof node !== "object" || Array.isArray(node)) return;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      walk(v, [...path, k]);
    }
  };
  walk(doc.semantic ?? {}, []);
  return out;
}

/** The five shipped font faces, with references resolved. */
export function fontFaces(doc) {
  const faces = doc.primitive?.font?.face ?? {};
  return Object.entries(faces)
    .filter(([k]) => !k.startsWith("$"))
    .map(([name, f]) => ({ name, ...f }));
}

/* ---- primitive colour tier ----
   Emitted as custom properties because the semantic tier references them
   (`--bg-canvas: var(--neutral-0)`), which keeps the runtime layer small and
   makes a theme swap legible in devtools. The chart ramp is the only primitive
   with per-scheme values. */

/** `primitive.color.neutral.0` -> `--neutral-0` */
export const primitiveVarName = (dotted) =>
  "--" + dotted.replace(/^primitive\.color\./, "").replace(/\./g, "-");

export function primitiveColorTokens(doc) {
  const out = [];
  const walk = (node, path) => {
    if (node === null || typeof node !== "object" || Array.isArray(node)) {
      out.push({ path: path.join("."), cssVar: primitiveVarName(path.join(".")), value: node });
      return;
    }
    if (node.light !== undefined || node.dark !== undefined) {
      out.push({
        path: path.join("."),
        cssVar: primitiveVarName(path.join(".")),
        light: node.light,
        dark: node.dark,
      });
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      walk(v, [...path, k]);
    }
  };
  walk(doc.primitive?.color ?? {}, ["primitive", "color"]);
  return out;
}

/** Composite / alias tier: values assembled from semantic tokens. */
export function compositeTokens(doc) {
  return Object.entries(doc.composite ?? {})
    .filter(([k]) => !k.startsWith("$"))
    .map(([name, n]) => ({ path: `composite.${name}`, cssVar: n.cssVar, ...n }));
}

/**
 * Map every referencable dotted path to the CSS variable that holds it, so the
 * generator can emit `var(--fg-primary)` instead of flattening a reference to a
 * literal. Flattening breaks scheme inheritance: a token defined as
 * `var(--fg-primary)` follows .dark automatically, an inlined `oklch(0.145 0 0)`
 * does not.
 */
export function refIndex(doc) {
  const idx = new Map();
  for (const t of primitiveColorTokens(doc)) idx.set(t.path, t.cssVar);
  // The spacing scale is referenced by control padding; keep it as var(--space-n)
  // so the emitted CSS reads the way the hand-authored system did.
  for (const k of Object.keys(doc.primitive?.size?.space ?? {})) {
    if (!k.startsWith("$")) idx.set(`primitive.size.space.${k}`, `--space-${k}`);
  }
  // The shadcn radius anchor: the whole radius chain is calc()'d off it.
  if (doc.primitive?.size?.radiusBase !== undefined) idx.set("primitive.size.radiusBase", "--radius");
  for (const [k] of Object.entries(doc.primitive?.font?.stack ?? {})) {
    idx.set(`primitive.font.stack.${k}`, "--font-" + k.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase());
  }
  const walk = (node, path) => {
    if (isLeaf(node)) { idx.set(path.join("."), node.cssVar); return; }
    if (node === null || typeof node !== "object" || Array.isArray(node)) return;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$")) continue;
      walk(v, [...path, k]);
    }
  };
  walk(doc.semantic ?? {}, ["semantic"]);
  return idx;
}
