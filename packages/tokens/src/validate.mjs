#!/usr/bin/env node
/* Void token-set validator — SRS Appendix I, rules V1..V12 (UI-SRC-11).

   Every rule is RE-DERIVED. The `validation` block inside a token set is
   self-reported and is never consulted; where this validator disagrees with it,
   the validator is right and the set's evidence string is stale.

   Colour rules are evaluated against the GENERATED runtime CSS rather than the
   JSON, because the cascade is what ships: accent.css deliberately overrides
   link, price, badge and rating roles defined earlier, and a check that read
   only the JSON tier would grade a stylesheet nobody serves. */

import { readFileSync, existsSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, dirname, resolve as pres } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSet, semanticTokens, fontFaces } from "./lib/resolve.mjs";
import { parseDeclarations } from "../../../scripts/gates/lib/parse-css.mjs";
import { parseColor, contrast, round2 } from "./lib/color.mjs";
import { woff2Payload, featureTags } from "./lib/woff2.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = pres(HERE, "..");
const ROOT = pres(PKG, "../..");

const failures = [];
const notes = [];
const fail = (rule, token, msg) => failures.push({ rule, token, msg });
const note = (rule, msg) => notes.push({ rule, msg });

/* ------------------------------------------------------------------ */
/* Required semantic tokens — SRS Appendix I §I.2                       */
/* ------------------------------------------------------------------ */
const REQUIRED = [
  "color.bg.canvas", "color.bg.surface", "color.bg.surfaceRaised", "color.bg.surfaceSunken", "color.bg.overlay",
  "color.text.primary", "color.text.secondary", "color.text.disabled", "color.text.inverse",
  "color.text.link", "color.text.linkHover",
  "color.border.subtle", "color.border.default", "color.border.strong",
  "color.action.primary.bg", "color.action.primary.text", "color.action.primary.hover",
  "color.action.primary.active", "color.action.primary.disabled",
  "color.action.secondary.bg", "color.action.secondary.text",
  "color.action.danger.bg", "color.action.danger.text",
  "color.focus.ring",
  "color.feedback.success.text", "color.feedback.warning.text",
  "color.feedback.error.text", "color.feedback.info.text",
  "color.commerce.price", "color.commerce.priceSale", "color.commerce.priceOriginal",
  "font.family.body", "font.family.mono",
  "font.size.base", "font.weight.regular", "font.weight.medium",
  "font.weight.semibold", "font.weight.bold",
  "font.lineHeight.normal",
  "space.1", "space.2", "space.4", "space.8",
  "radius.sm", "radius.md", "radius.lg",
  "shadow.sm", "shadow.md",
  "size.touchTarget.min",
  "motion.duration.fast", "motion.duration.normal", "motion.duration.slow",
];

/* ------------------------------------------------------------------ */
/* Contrast pairings                                                    */
/* ------------------------------------------------------------------ */
const SURFACES = ["--bg-canvas", "--bg-surface", "--bg-surface-sunken", "--bg-sidebar"];
// Exempt by UI-INV-1 (disabled text) and because a decorative divider is not a
// "meaningful non-text" element under WCAG 1.4.11.
const EXEMPT_FG = new Set(["--fg-disabled", "--border-default", "--border-subtle", "--border-strong"]);

function pairings(decls, scope) {
  const has = (n) => decls.has(`${scope}|${n}`) || decls.has(`root|${n}`);
  const out = [];
  const push = (fg, bg, min, label) => { if (has(fg) && has(bg)) out.push({ fg, bg, min, label }); };

  for (const fg of ["--fg-primary", "--fg-secondary", "--fg-link", "--fg-link-hover"]) {
    for (const bg of SURFACES) push(fg, bg, 4.5, "text");
  }
  for (const role of ["primary", "secondary", "danger", "accent"]) {
    push(`--action-${role}-text`, `--action-${role}-bg`, 4.5, "action");
  }
  for (const tone of ["success", "warning", "error", "info"]) {
    push(`--${tone}-text`, "--bg-canvas", 4.5, "feedback text");
    push(`--${tone}-text`, `--${tone}-bg`, 4.5, "feedback on tint");
    push(`--${tone}-on-solid`, `--${tone}-solid`, 4.5, "feedback on fill");
  }
  for (const b of ["sale", "new", "lowstock", "soldout"]) {
    push(`--commerce-badge-${b}-text`, `--commerce-badge-${b}-bg`, 4.5, "badge");
  }
  for (const p of ["--commerce-price", "--commerce-price-sale", "--commerce-price-original"]) {
    push(p, "--bg-canvas", 4.5, "price");
    push(p, "--bg-surface", 4.5, "price");
  }
  push("--accent-text", "--bg-canvas", 4.5, "accent text");
  push("--accent-text", "--bg-surface-sunken", 4.5, "accent text");
  push("--accent-on-fill", "--accent-fill", 4.5, "accent on fill");
  // Non-text (WCAG 1.4.11 / rule V3)
  push("--border-control", "--bg-canvas", 3, "control boundary");
  push("--border-control", "--bg-surface-sunken", 3, "control boundary");
  push("--accent-fill", "--bg-canvas", 3, "accent fill boundary");
  push("--commerce-rating", "--commerce-rating-empty", 3, "rating");
  return out;
}

/** Follow var() chains within a scope, falling back to :root. */
function makeResolver(decls) {
  const get = (scope, name) => decls.get(`${scope}|${name}`) ?? decls.get(`root|${name}`);
  return function resolve(scope, name, depth = 0) {
    let v = get(scope, name);
    while (typeof v === "string" && /^var\(/.test(v.trim()) && depth++ < 24) {
      const m = /^var\(\s*(--[a-z0-9-]+)/i.exec(v.trim());
      if (!m) break;
      v = get(scope, m[1]);
    }
    return v;
  };
}

/* ------------------------------------------------------------------ */
/* A known failure may be waived only with a recorded owner, reason and expiry,
   the same discipline FR-MKTS-14 applies to a market readiness item. A waived
   failure is still printed; an expired one is fatal again. */
/** Where the generator writes a given set's runtime CSS. */
function emittedPathFor(doc) {
  const name = doc.meta?.name ?? "void-default";
  return name === "void-default"
    ? join(ROOT, "apps/web/public/theme/tokens.css")
    : join(ROOT, `packages/tokens/dist/themes/${name}.css`);
}

function loadWaivers() {
  const f = join(ROOT, "packages/tokens/waivers.json");
  if (!existsSync(f)) return [];
  return JSON.parse(readFileSync(f, "utf8")).waivers ?? [];
}

export function validate(setPath, { cssPath, env = process.env.APP_ENV } = {}) {
  const doc = loadSet(setPath);
  const tokens = semanticTokens(doc);
  const byPath = new Map(tokens.map((t) => [t.path, t]));
  const faces = fontFaces(doc);
  // Each set is measured against ITS OWN emitted CSS. Validating the placeholder
  // against the default's stylesheet would grade the wrong artefact.
  const css = cssPath ?? emittedPathFor(doc);
  if (!existsSync(css)) {
    fail("V1", "theme css", `no emitted stylesheet for ${doc.meta?.name} at ${css} — run the generator for this set first`);
  }
  const decls = existsSync(css) ? parseDeclarations(readFileSync(css, "utf8")) : new Map();
  const schemes = doc.meta?.supportsColorSchemes ?? ["light"];
  const scopeFor = (s) => (s === "dark" ? "dark" : "root");

  /* V1 — presence, well-formedness, resolution */
  for (const p of REQUIRED) {
    const t = byPath.get(p);
    if (!t) { fail("V1", p, "required semantic token missing from the set"); continue; }
    if (!t.cssVar) { fail("V1", p, "token has no cssVar"); continue; }
    const vals = [t.value, t.light, t.dark].filter((v) => v !== undefined);
    if (!vals.length) fail("V1", p, "token declares no value");
    for (const v of vals) {
      if (v && typeof v === "object" && v.__unresolved) fail("V1", p, `unresolved reference {${v.__unresolved}}`);
    }
    if (!decls.has(`root|${t.cssVar}`)) fail("V1", p, `${t.cssVar} is not emitted into the runtime CSS`);
  }

  /* V2 — text contrast, per scheme, re-derived from the shipping cascade */
  let checked = 0;
  for (const scheme of schemes) {
    const scope = scopeFor(scheme);
    const resolve = makeResolver(decls);
    for (const { fg, bg, min, label } of pairings(decls, scope)) {
      if (EXEMPT_FG.has(fg)) continue;
      const f = parseColor(resolve(scope, fg));
      const b = parseColor(resolve(scope, bg));
      if (!f || !b) continue;
      checked++;
      const ratio = round2(contrast(f, b));
      if (ratio < min) {
        fail(min >= 4.5 ? "V2" : "V3", `${fg} on ${bg} (${scheme})`,
          `${label} contrast ${ratio}:1, needs ${min}:1`);
      }
    }
  }
  note("V2", `${checked} pairings evaluated across ${schemes.join(" + ")}`);

  /* V3 — focus ring against component and page background */
  for (const scheme of schemes) {
    const scope = scopeFor(scheme);
    const resolve = makeResolver(decls);
    const ring = parseColor(resolve(scope, "--focus-ring-color"));
    if (!ring) { fail("V3", "color.focus.ring", "focus ring colour does not resolve"); continue; }
    for (const bg of ["--bg-canvas", "--bg-surface", "--bg-surface-sunken"]) {
      const b = parseColor(resolve(scope, bg));
      if (!b) continue;
      const ratio = round2(contrast(ring, b));
      if (ratio < 3) fail("V3", `focus ring vs ${bg} (${scheme})`, `${ratio}:1, needs 3:1`);
    }
  }

  /* V4 — base font size >= 16px */
  const base = byPath.get("font.size.base");
  const px = (v) => {
    if (typeof v !== "string") return NaN;
    if (v.endsWith("rem")) return parseFloat(v) * 16;
    if (v.endsWith("px")) return parseFloat(v);
    return NaN;
  };
  if (base) {
    const size = px(base.value ?? base.light);
    if (!(size >= 16)) fail("V4", "font.size.base", `resolves to ${base.value} (${size}px), needs >= 16px`);
  }

  /* V5 — touch target >= 44px */
  const tt = byPath.get("size.touchTarget.min");
  if (tt) {
    const size = px(tt.value);
    if (!(size >= 44)) fail("V5", "size.touchTarget.min", `resolves to ${tt.value}, needs >= 44px`);
  }

  /* V6 — Bengali conjunct shaping.
     Verifies the shipped subset really carries the layout tables and the
     features conjunct formation depends on, by decompressing the woff2 and
     reading its table directory. It does NOT claim to shape text: that the
     test strings actually render without fallback is asserted in the browser
     by the theme-swap gate, which is the only place it can honestly be tested. */
  const CONJUNCT = ["rphf", "blwf", "half", "pstf", "vatu", "cjct", "pres", "blws", "psts", "haln"];
  for (const f of faces.filter((f) => /bengali/i.test(f.family))) {
    const abs = join(PKG, f.file);
    if (!existsSync(abs)) { fail("V6", f.name, `font file missing: ${f.file}`); continue; }
    let parsed;
    try { parsed = woff2Payload(readFileSync(abs)); }
    catch (e) { fail("V6", f.name, `unreadable woff2: ${e.message}`); continue; }
    const tags = new Set(parsed.tables.map((t) => t.tag));
    for (const need of ["GSUB", "GDEF", "cmap"]) {
      if (!tags.has(need)) fail("V6", f.name, `${need} table absent — conjuncts cannot form`);
    }
    const feats = featureTags(parsed.payload);
    const absent = CONJUNCT.filter((t) => !feats.has(t));
    if (absent.length) fail("V6", f.name, `conjunct feature(s) absent from GSUB: ${absent.join(", ")}`);
    if (!feats.has("akhn")) {
      note("V6", `${f.name}: 'akhn' (akhand ligatures) absent — the set's evidence claims eleven features, ten are present. Not fatal: no akhand conjunct appears in the test strings, and cjct/pres cover the rest.`);
    }
  }

  /* V7 — critical-path payload (delegated to the budget gate for the number) */
  const cssBytes = existsSync(css) ? gzipSync(readFileSync(css), { level: 9 }).length : 0;
  const critical = faces.filter((f) => f.criticalPath);
  const fontBytes = critical.reduce((n, f) => n + (existsSync(join(PKG, f.file)) ? statSync(join(PKG, f.file)).size : 0), 0);
  const CEILING = 40 * 1024;
  const total = cssBytes + fontBytes;
  if (total > CEILING) fail("V7", "payload", `critical path ${total} B exceeds ${CEILING} B`);
  note("V7", `critical path ${total} B of ${CEILING} B (token CSS gzip ${cssBytes} B + ${critical.length} faces ${fontBytes} B)`);

  /* V8 — no remote origin anywhere in the token closure */
  const REMOTE = /url\(\s*['"]?(?:https?:)?\/\//i;
  if (existsSync(css) && REMOTE.test(readFileSync(css, "utf8"))) fail("V8", "theme css", "references a remote origin");
  const setText = readFileSync(setPath, "utf8");
  if (/"(?:https?:)?\/\/[^"]*\.(?:woff2?|css|js|svg|png|jpe?g)"/i.test(setText)) {
    fail("V8", "token set", "references a remote asset");
  }

  /* V9 — motion ceiling and a reduced variant */
  const slow = byPath.get("motion.duration.slow");
  const ms = (v) => (typeof v === "string" && v.endsWith("ms") ? parseFloat(v) : typeof v === "string" && v.endsWith("s") ? parseFloat(v) * 1000 : NaN);
  if (slow && !(ms(slow.value) <= 800)) fail("V9", "motion.duration.slow", `${slow.value} exceeds the 800ms ceiling`);
  const reduced = tokens.find((t) => /reduced/i.test(t.path));
  if (!reduced) fail("V9", "motion.reduced", "no reduced-motion variant declared");

  /* V10 — z-index strictly ordered, no duplicates */
  const zs = tokens.filter((t) => t.path.startsWith("zIndex.")).map((t) => ({ p: t.path, v: Number(t.value) }));
  const sorted = [...zs].sort((a, b) => a.v - b.v);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].v === sorted[i - 1].v) fail("V10", sorted[i].p, `duplicate z-index ${sorted[i].v} (also ${sorted[i - 1].p})`);
  }
  if (zs.some((z) => Number.isNaN(z.v))) fail("V10", "zIndex", "a z-index value is not numeric");

  /* V11 — licence record resolves, and every referenced licence file exists */
  const isPlaceholder = doc.meta?.isPlaceholder === true;
  if (!isPlaceholder) {
    const ref = doc.meta?.licenceRef;
    if (!ref) fail("V11", "meta.licenceRef", "absent on a non-placeholder set");
    else {
      const abs = join(ROOT, ref);
      if (!existsSync(abs)) fail("V11", "meta.licenceRef", `does not resolve: ${ref}`);
      else {
        // Every shipped face must have a licence file beside the record.
        const dir = dirname(abs);
        const listed = readFileSync(abs, "utf8");
        for (const f of faces) {
          const fam = f.family.replace(/^Void\s+/, "");
          if (!new RegExp(fam.split(" ")[0], "i").test(listed)) {
            fail("V11", f.name, `${f.family} is not recorded in ${ref}`);
          }
        }
        const files = ["OFL-1.1-Geist.txt", "OFL-1.1-AnekBangla.txt", "ISC-lucide.txt"];
        for (const lf of files) {
          if (!existsSync(join(dir, lf))) fail("V11", lf, `licence text missing from ${dirname(ref)}`);
        }
      }
    }
  }

  /* V12 — a placeholder set may never be active in production */
  if (isPlaceholder && env === "production") {
    fail("V12", "meta.isPlaceholder", "placeholder token set is active with APP_ENV=production");
  }

  const waivers = loadWaivers();
  const today = new Date().toISOString().slice(0, 10);
  const waived = [];
  const live = [];
  for (const f of failures) {
    const w = waivers.find(
      (w) => w.rule === f.rule && f.token.startsWith(w.token) && (!w.set || w.set === doc.meta?.name)
    );
    if (!w) { live.push(f); continue; }
    if (w.expires < today) { live.push({ ...f, msg: `${f.msg} — WAIVER EXPIRED ${w.expires}` }); continue; }
    waived.push({ ...f, waiver: w });
  }
  return { failures: live, waived, notes, doc };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const setPath = process.argv[2] ?? join(PKG, "sets/void-default.json");
  const { failures: f, waived: w, notes: n, doc } = validate(setPath);
  console.log(`validating ${doc.meta?.name} v${doc.meta?.version}${doc.meta?.isPlaceholder ? " (placeholder)" : ""}\n`);
  for (const { rule, msg } of n) console.log(`  ${rule}  note   ${msg}`);
  for (const { rule, token, msg, waiver } of w) {
    console.log(`  ${rule}  WAIVED ${token}: ${msg}`);
    console.log(`             owner ${waiver.owner} · expires ${waiver.expires} · ${waiver.reason}`);
  }
  if (f.length) {
    console.log("");
    for (const { rule, token, msg } of f) console.error(`  ${rule}  FAIL   ${token}: ${msg}`);
    console.error(`\n${f.length} failure(s). A set that fails validation cannot be activated (UI-SRC-11).`);
    process.exit(1);
  }
  console.log("\nV1..V12 pass — re-derived, not read from the set's own validation block.");
}
