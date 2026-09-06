#!/usr/bin/env node
/* Void token pipeline — generator.
   Emits every styling artefact from the token set so the contract and the CSS
   cannot drift (HANDOFF open item 5; the drift it prevents is real — the
   hand-maintained contract.css referenced --weight-semibold after typography.css
   had removed it).

   Outputs
     apps/web/public/theme/tokens.css     runtime custom properties + @font-face + base
     packages/tokens/dist/tailwind.css    Tailwind v4 @theme inline block
     packages/tokens/dist/contract.css    Appendix I dotted-path binding
     packages/tokens/dist/tokens.d.ts     token-name union for TypeScript
     packages/tokens/dist/manifest.json   what the gates measure
*/

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { basename, dirname, join, resolve as pres } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadSet, semanticTokens, fontFaces, primitiveColorTokens, compositeTokens, refIndex,
} from "./lib/resolve.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = pres(HERE, "..");
const ROOT = pres(PKG, "../..");

const BANNER = (setName, version) => `/* GENERATED — do not edit.
   Source: packages/tokens/sets/${setName}.json (v${version})
   Regenerate: npm run tokens:generate
   Editing this file by hand reintroduces the drift the generator exists to prevent. */\n\n`;

/* ---------- Tailwind v4 namespace mapping ----------
   `@theme inline` makes each utility emit var(--<cssVar>) rather than the
   resolved value, so a runtime theme swap flows through compiled utilities
   (UI-SRC-10). Without `inline` the value would be frozen at build time.

   The theme key is derived from the token's cssVar, NOT its dotted path. That
   matters: the cssVar is what component code already writes inside var(), so
   `--fg-primary` becomes `text-fg-primary` and `--success-bg` becomes
   `bg-success-bg`. Deriving from the path instead produced `text-text-primary`
   and `bg-feedback-success-bg` — names nobody guesses, so utilities were being
   written against the cssVar and silently compiling to nothing. Tailwind emits
   no error for an unknown theme key, which is why scripts/gates/dead-utilities.mjs
   now checks for it. */

const NAMESPACE = [
  ["color.", "--color-", null],
  ["space.", "--spacing-", /^space-/],
  ["radius.", "--radius-", /^radius-/],
  ["shadow.", "--shadow-", /^shadow-/],
  ["font.family.", "--font-", /^font-/],
  ["font.size.", "--text-", /^text-/],
  ["font.weight.", "--font-weight-", /^weight-/],
  ["font.lineHeight.", "--leading-", /^leading-/],
  ["font.letterSpacing.", "--tracking-", /^tracking-/],
  ["breakpoint.", "--breakpoint-", /^breakpoint-/],
  ["motion.easing.", "--ease-", /^motion-easing-/],
  // NOTE: Tailwind v4 has no --duration-* theme namespace, so a `duration-fast`
  // utility compiles to nothing. Durations are referenced as
  // duration-[var(--duration-fast)] instead, which is still a token reference.
  ["blur.", "--blur-", /^blur-/],
];

const kebab = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/\./g, "-").toLowerCase();

function twName(path, cssVar) {
  const bare = cssVar.replace(/^--/, "");
  for (const [prefix, ns, strip] of NAMESPACE) {
    if (!path.startsWith(prefix)) continue;
    return ns + (strip ? bare.replace(strip, "") : bare);
  }
  return null;
}

function decl(tokens, pick) {
  const lines = [];
  for (const t of tokens) {
    const v = pick(t);
    if (v === undefined || v === null) continue;
    if (typeof v === "object" && v.__unresolved) continue;
    lines.push(`  ${t.cssVar}: ${v};`);
  }
  return lines.join("\n");
}

const REF = /^\{([^}]+)\}$/;

const EMBEDDED = /\{([^}]+)\}/g;

/** Keep the reference as `var(--x)` where the set referenced another token.
    Flattening to a literal would break scheme inheritance: a token defined as
    `var(--fg-primary)` follows .dark on its own, an inlined oklch() does not.
    `own` guards the self-reference a primitive/semantic name collision would
    otherwise produce (`--space-4: var(--space-4)`). */
function emitWith(idx) {
  return (raw, resolved, own) => {
    if (typeof raw !== "string") return resolved;
    const whole = REF.exec(raw.trim());
    if (whole) {
      const v = idx.get(whole[1]);
      return v && v !== own ? `var(${v})` : resolved;
    }
    EMBEDDED.lastIndex = 0;
    if (EMBEDDED.test(raw)) {
      EMBEDDED.lastIndex = 0;
      const refs = [...raw.matchAll(EMBEDDED)].map((m) => m[1]);
      // Only keep the indirection when EVERY embedded reference can be named.
      // A partially substituted expression would mix a var() with a literal and
      // silently lose the scheme inheritance the substitution exists to keep.
      if (refs.every((r) => idx.has(r) && idx.get(r) !== own)) {
        return raw.replace(EMBEDDED, (_all, target) => `var(${idx.get(target)})`);
      }
      return resolved;
    }
    return resolved;
  };
}

function fontFaceBlock(doc, faces) {
  return faces
    .map((f) => {
      const src = `./fonts/${basename(f.file)}`;
      return [
        "@font-face {",
        `  font-family: "${f.family}";`,
        `  src: url("${src}") format("woff2");`,
        `  font-weight: ${f.weight};`,
        "  font-style: normal;",
        `  font-display: ${f.display ?? "swap"};`,
        f.unicodeRange ? `  unicode-range: ${f.unicodeRange};` : null,
        "}",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

export function generate(setPath, { write = true } = {}) {
  const doc = loadSet(setPath);
  const setName = doc.meta?.name ?? basename(setPath, ".json");
  const version = doc.meta?.version ?? "0.0.0";
  const tokens = semanticTokens(doc);
  const faces = fontFaces(doc);

  const schemeSel = doc.meta?.schemeSelector ?? { light: ":root", dark: ".dark" };
  const localeSel = doc.meta?.localeSelector ?? {};

  /* ---- 1. runtime layer ---- */
  const idx = refIndex(doc);
  const emit = emitWith(idx);
  const prims = primitiveColorTokens(doc);
  const comps = compositeTokens(doc);
  const lightDecls = decl(tokens, (t) =>
    t.light !== undefined ? emit(t.rawLight, t.light, t.cssVar) : emit(t.raw, t.value, t.cssVar)
  );
  const darkTokens = tokens.filter((t) => t.dark !== undefined);
  const bnTokens = tokens.filter((t) => t.bnScope !== undefined);

  let runtime = BANNER(setName, version);
  runtime += `/* Self-hosted only. No third-party origin appears in this file (UI-INV-13, V8). */\n`;
  runtime += fontFaceBlock(doc, faces) + "\n\n";
  runtime += `/* --- primitive tier. The semantic tier points at these; component code\n   must not (enforced by the token-literal lint rule). --- */\n`;
  runtime += `${schemeSel.light} {\n${decl(prims, (t) => (t.light !== undefined ? t.light : t.value))}\n}\n`;
  const darkPrims = prims.filter((t) => t.dark !== undefined);
  if (darkPrims.length) {
    runtime += `\n${schemeSel.dark} {\n${decl(darkPrims, (t) => t.dark)}\n}\n`;
  }

  runtime += `\n/* --- semantic tier. The only tier component code may reference. --- */\n`;
  runtime += `${schemeSel.light} {\n${lightDecls}\n}\n`;
  if (darkTokens.length) {
    runtime += `\n${schemeSel.dark} {\n${decl(darkTokens, (t) => emit(t.rawDark, t.dark, t.cssVar))}\n}\n`;
  }

  runtime += `\n/* --- composite tier: shorthands and the v1.0 aliases, assembled from the\n   semantic tier so they follow a scheme swap without redefinition. --- */\n`;
  runtime += `${schemeSel.light} {\n${decl(comps, (t) => t.value)}\n}\n`;
  const darkComps = comps.filter((t) => t.dark !== undefined);
  if (darkComps.length) {
    runtime += `\n${schemeSel.dark} {\n${decl(darkComps, (t) => t.dark)}\n}\n`;
  }
  if (bnTokens.length && localeSel.bn) {
    runtime += `\n/* Bengali needs more leading for matras and conjuncts (UI-INV-5). */\n`;
    let bnBlock = decl(bnTokens, (t) => emit(t.rawBnScope, t.bnScope, t.cssVar));

    /* Composite shorthands must be REDECLARED here, not merely inherited.
       A custom property resolves its var() references at computed-value time on
       the element where it is DECLARED, and then inherits already resolved. So
       `--type-body`, declared on :root, bakes in the Latin --font-sans, and an
       element matching :lang(bn) that redefines --font-sans never reaches it —
       a Bengali run inside an English page would render in the Latin face.
       Redeclaring every dependent here forces it to re-resolve on the matching
       element. Verified in a browser; the theme-swap gate asserts it. */
    const bnVars = new Set(bnTokens.map((t) => t.cssVar));
    const values = new Map();
    for (const t of tokens) {
      const v = t.light !== undefined ? emit(t.rawLight, t.light, t.cssVar) : emit(t.raw, t.value, t.cssVar);
      if (v !== undefined && v !== null) values.set(t.cssVar, String(v));
    }
    for (const c of comps) if (c.value !== undefined) values.set(c.cssVar, String(c.value));

    const refsOf = (v) => [...String(v).matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]);
    const dependsOnBn = (name, seen = new Set()) => {
      if (seen.has(name)) return false;
      seen.add(name);
      for (const r of refsOf(values.get(name) ?? "")) {
        if (bnVars.has(r) || dependsOnBn(r, seen)) return true;
      }
      return false;
    };

    const dependents = [...values.keys()].filter((n) => !bnVars.has(n) && dependsOnBn(n));
    if (dependents.length) {
      bnBlock += "\n" + dependents.map((n) => `  ${n}: ${values.get(n)};`).join("\n");
    }
    runtime += `${localeSel.bn} {\n${bnBlock}\n}\n`;
  }
  runtime += "\n" + readFileSync(join(PKG, "src/static/base.css"), "utf8");

  /* ---- 2. Tailwind theme ---- */
  let tw = BANNER(setName, version);
  tw += `/* @theme inline: utilities emit var(--token), not the resolved value, so a\n   runtime theme swap reaches compiled utilities (UI-SRC-10). */\n@theme inline {\n`;
  const seen = new Set();
  for (const t of tokens) {
    const n = twName(t.path, t.cssVar);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    // Breakpoints become @media conditions, and a custom property does not
    // resolve inside a media query — `@media (width >= var(--breakpoint-md))`
    // is invalid CSS. They are emitted as literals, which is also correct by
    // the contract: the set records that the behaviour at each tier is fixed by
    // SRS §9.4 and does not change with the theme.
    const literal = t.path.startsWith("breakpoint.");
    tw += `  ${n}: ${literal ? (t.value ?? t.light) : `var(${t.cssVar})`};\n`;
  }
  tw += "}\n";

  /* ---- 3. Appendix I contract binding ---- */
  let contract = BANNER(setName, version);
  contract += `/* Appendix I specifies dotted paths (color.text.primary); this binds them to\n   the semantic tier. Consumed by the admin token editor (UI-SRC-14) and the\n   design_token_set JSON export — NOT the lint target. Component code references\n   the semantic tier, per tokens.json -> meta.notes. */\n:root {\n`;
  for (const t of tokens) contract += `  --${kebab(t.path)}: var(${t.cssVar});\n`;
  contract += "}\n";

  /* ---- 4. TypeScript token names ---- */
  const names = [...new Set(tokens.map((t) => t.cssVar))].sort();
  let dts = BANNER(setName, version).replace(/^\/\* /, "/* ");
  dts += `export type VoidTokenName =\n${names.map((n) => `  | "${n}"`).join("\n")};\n\n`;
  dts += `export type VoidTokenPath =\n${tokens.map((t) => `  | "${t.path}"`).sort().join("\n")};\n\n`;
  dts += `export declare const VOID_TOKENS: readonly VoidTokenName[];\n`;

  const namesJs =
    BANNER(setName, version) +
    `export const VOID_TOKENS = Object.freeze([\n${names.map((n) => `  "${n}",`).join("\n")}\n]);\n`;

  /* ---- 5. manifest the gates measure ---- */
  const manifest = {
    set: setName,
    version,
    isPlaceholder: doc.meta?.isPlaceholder ?? false,
    tokenCount: tokens.length,
    schemes: doc.meta?.supportsColorSchemes ?? [],
    criticalPathFonts: faces.filter((f) => f.criticalPath).map((f) => basename(f.file)),
    allFonts: faces.map((f) => ({ file: basename(f.file), bytes: f.bytes, criticalPath: !!f.criticalPath })),
  };

  // The default set is what the app serves; any other set is emitted beside the
  // package so the theme-swap gate can render against it without touching
  // the app's public tree.
  const isDefault = setName === "void-default";
  const out = isDefault ? {
    "apps/web/public/theme/tokens.css": runtime,
    "packages/tokens/dist/tailwind.css": tw,
    "packages/tokens/dist/contract.css": contract,
    "packages/tokens/dist/tokens.d.ts": dts,
    "packages/tokens/dist/tokens.mjs": namesJs,
    "packages/tokens/dist/manifest.json": JSON.stringify(manifest, null, 2) + "\n",
  } : {
    [`packages/tokens/dist/themes/${setName}.css`]: runtime,
    [`packages/tokens/dist/themes/${setName}.manifest.json`]: JSON.stringify(manifest, null, 2) + "\n",
  };

  if (write) {
    for (const [rel, content] of Object.entries(out)) {
      const abs = join(ROOT, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, content);
    }
    // Fonts ship beside the CSS so url("./fonts/…") stays origin-relative.
    if (isDefault && faces.length) {
      const fontDir = join(ROOT, "apps/web/public/theme/fonts");
      mkdirSync(fontDir, { recursive: true });
      for (const f of faces) copyFileSync(join(PKG, f.file), join(fontDir, basename(f.file)));
    }
  }
  return { out, manifest, tokens, faces };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const setPath = process.argv[2] ?? join(PKG, "sets/void-default.json");
  const { manifest } = generate(setPath);
  console.log(
    `tokens: generated ${manifest.tokenCount} tokens from ${manifest.set} v${manifest.version} ` +
      `(${manifest.schemes.join(", ")}); ${manifest.allFonts.length} faces copied`
  );
}
