/* Gate 3, rendered half. Loaded only when Playwright is present.
 *
 * Renders the REAL preview surface — apps/web/app/preview/page.tsx, prerendered
 * by `next build` — under each token set, at 320 and 1440, light and dark, en
 * and bn. Not a mock of it. So a component added to that page is verified across
 * all sixteen combinations without anyone writing a test for it, and a component
 * that only works under one theme fails CI the moment it lands.
 *
 * Asserts what only a layout engine can see:
 *   · no inline-axis overflow at either width (UI-INV-4's 400%-zoom sibling)
 *   · no clipped text in a fixed box (UI-INV-6, 40% expansion)
 *   · no console error or unhandled rejection — no component throw
 *   · every interactive element meets the 44px effective target (UI-INV-3)
 *   · Bengali conjuncts shape in the real face, not a fallback — the half of
 *     rule V6 that reading font tables cannot honestly claim
 *
 * Scheme and locale are applied the way the product applies them: `.dark` on the
 * root element, `lang` on <html>. Nothing is injected that the product does not
 * itself do.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const VIEWPORTS = [
  { name: "320", width: 320, height: 720 },
  { name: "1440", width: 1440, height: 900 },
];
const SCHEMES = ["light", "dark"];
const LOCALES = ["en", "bn"];

const APP = "apps/web";
const PRERENDERED = join(process.cwd(), APP, process.env.VOID_DIST_DIR || ".next", "server/app/preview.html");

/* Surfaces where the 36px step is never admissible. The dense allowlist in
   readme.md covers pointer-only admin, vendor and Studio chrome; the preview
   page marks an allowlisted control with .void-touch-safe, which expands the hit
   area without changing visual size. */
const TOUCH_MIN = 44;

export function preflight() {
  if (!existsSync(PRERENDERED)) {
    return `theme-swap: ${APP}/.next/server/app/preview.html not found — run \`npx next build ${APP}\` first.`;
  }
  return null;
}

function prepare(html, { locale, scheme }) {
  let out = html;
  // Locale drives the Bengali face and leading through :lang(bn).
  out = out.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${locale}"`);
  if (!/<html[^>]*\slang=/i.test(out)) out = out.replace(/<html/i, `<html lang="${locale}"`);
  // Scheme is `.dark` on the root, exactly as the product sets it.
  if (scheme === "dark") {
    out = /<html[^>]*\sclass="/i.test(out)
      ? out.replace(/<html([^>]*)\sclass="/i, '<html$1 class="dark ')
      : out.replace(/<html/i, '<html class="dark"');
  }
  return out;
}

export async function runRendered(themes, playwright) {
  const missing = preflight();
  if (missing) {
    console.error(`  FAIL  ${missing}`);
    return 1;
  }

  const html = readFileSync(PRERENDERED, "utf8");
  const browser = await playwright.chromium.launch();
  let problems = 0;

  for (const theme of themes) {
    const themeCss =
      theme.name === "void-default"
        ? join(process.cwd(), APP, "public/theme/tokens.css")
        : join(process.cwd(), `packages/tokens/dist/themes/${theme.name}.css`);

    for (const vp of VIEWPORTS) {
      for (const scheme of SCHEMES) {
        for (const locale of LOCALES) {
          const label = `${theme.name} · ${vp.name} · ${scheme} · ${locale}`;
          const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
          const page = await ctx.newPage();

          const errors = [];
          page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
          page.on("pageerror", (e) => errors.push(String(e)));

          await page.route("**/*", async (route) => {
            const url = new URL(route.request().url());
            const p = url.pathname;

            // The runtime token layer — swapped per set. This is the swap.
            if (p === "/theme/tokens.css") {
              return route.fulfill({ contentType: "text/css", body: readFileSync(themeCss, "utf8") });
            }
            if (p.startsWith("/theme/fonts/")) {
              const f = join(process.cwd(), APP, "public", p);
              return existsSync(f)
                ? route.fulfill({ contentType: "font/woff2", body: readFileSync(f) })
                : route.fulfill({ status: 404, body: "" });
            }
            // Compiled Tailwind utilities and chunks, straight from the build.
            if (p.startsWith("/_next/")) {
              const f = join(process.cwd(), APP, process.env.VOID_DIST_DIR || ".next", p.replace("/_next/", ""));
              if (existsSync(f)) {
                const type = p.endsWith(".css") ? "text/css" : p.endsWith(".js") ? "text/javascript" : "application/octet-stream";
                return route.fulfill({ contentType: type, body: readFileSync(f) });
              }
              return route.fulfill({ status: 404, body: "" });
            }
            return route.fulfill({
              status: 200,
              contentType: "text/html",
              body: prepare(html, { locale, scheme }),
            });
          });

          await page.goto("http://void.test/preview", { waitUntil: "networkidle" });

          const result = await page.evaluate((touchMin) => {
            const doc = document.documentElement;

            // Only TEXT clipping is a UI-INV-6 defect. A skeleton block clips its
            // own shimmer sweep on purpose, and flagging that would train everyone
            // to ignore this check.
            const clipped = [];
            for (const el of document.querySelectorAll("*")) {
              const s = getComputedStyle(el);
              if (s.overflow !== "hidden" && s.overflowX !== "hidden") continue;
              if (!(el.textContent || "").trim()) continue;
              // Visually-hidden text is clipped on purpose — that IS the
              // technique. Detected by the clip-path that defines it rather than
              // by class name, so a differently-named helper is covered too.
              if (s.clipPath && s.clipPath !== "none") continue;
              if (el.scrollWidth > el.clientWidth + 1) {
                clipped.push(
                  el.tagName.toLowerCase() +
                    (el.className && typeof el.className === "string" ? `.${el.className.split(/\s+/).join(".")}` : "") +
                    ` "${(el.textContent || "").trim().slice(0, 30)}"`
                );
              }
            }

            // UI-INV-3. A control shorter than 44px is a defect unless it carries
            // .void-touch-safe, which expands the hit area without resizing it.
            /* The EFFECTIVE target, which is often not the element's own box:
                 · a visually-hidden native input is not the target — the label
                   wrapping it is (checkbox, radio, switch)
                 · a covering ::after enlarges the target without changing the
                   visual size (.void-touch-safe, and a product tile whose link
                   covers the whole card)
               Measuring the box alone reports false failures for both, and
               skipping them by class name would miss any new pattern. */
            const px = (v) => (v && v.endsWith("px") ? parseFloat(v) : 0);
            const small = [];
            for (const el of document.querySelectorAll("button, a[href], input, select, [role=button]")) {
              const cs = getComputedStyle(el);
              const hidden = cs.clipPath && cs.clipPath !== "none";
              const target = hidden ? el.closest("label") : el;
              if (!target) continue;

              const r = target.getBoundingClientRect();
              if (r.width === 0 && r.height === 0) continue;

              const after = getComputedStyle(target, "::after");
              const hasAfter = after.content && after.content !== "none" && after.position === "absolute";
              const effective = Math.max(r.height, hasAfter ? px(after.blockSize || after.height) : 0);

              if (effective + 0.5 < touchMin) {
                const what = target.tagName.toLowerCase();
                small.push(`${what}"${(target.textContent || "").trim().slice(0, 18)}" ${Math.round(effective)}px`);
              }
            }

            const bengali = document.querySelector('[lang="bn"]');
            const bengaliFace = bengali ? getComputedStyle(bengali).fontFamily : "";

            // Name the widest offender: "the page overflows" is not actionable.
            const overflowing = [];
            if (doc.scrollWidth > doc.clientWidth + 1) {
              for (const el of document.querySelectorAll("*")) {
                const r = el.getBoundingClientRect();
                if (r.right > doc.clientWidth + 1 || r.width > doc.clientWidth + 1) {
                  overflowing.push(
                    `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : ""}` +
                      ` w=${Math.round(r.width)} right=${Math.round(r.right)} "${(el.textContent || "").trim().slice(0, 24)}"`
                  );
                }
              }
            }

            return {
              overflowing: overflowing.slice(0, 4),
              overflow: doc.scrollWidth > doc.clientWidth + 1,
              scrollWidth: doc.scrollWidth,
              clientWidth: doc.clientWidth,
              clipped: [...new Set(clipped)],
              small: [...new Set(small)],
              bengaliFace,
              loadedFaces: document.fonts ? [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family) : [],
              iconCount: document.querySelectorAll("svg").length,
            };
          }, TOUCH_MIN);

          const issues = [];
          if (result.overflow) {
            issues.push(
              `inline-axis overflow (${result.scrollWidth} > ${result.clientWidth}) — ${result.overflowing.join(" | ")}`
            );
          }
          if (result.clipped.length) issues.push(`clipped text in ${result.clipped.join(", ")}`);
          if (result.small.length) issues.push(`UI-INV-3: target under ${TOUCH_MIN}px — ${result.small.join("; ")}`);
          if (errors.length) issues.push(`console error: ${errors[0]}`);
          if (result.iconCount === 0) issues.push("no icons rendered — Icon produced nothing");

          // The Bengali specimen must shape in the real face. Only meaningful for
          // the default set: the placeholder deliberately ships no webfonts.
          if (theme.name === "void-default") {
            if (!/Void Bengali/.test(result.bengaliFace)) {
              issues.push(`Bengali specimen did not select the Bengali face (computed: ${result.bengaliFace})`);
            } else if (!result.loadedFaces.some((f) => /Void Bengali/.test(f))) {
              issues.push("Void Bengali declared but never loaded (V6)");
            }
          }

          if (issues.length) {
            problems += issues.length;
            console.error(`  FAIL  ${label}: ${issues.join("; ")}`);
          } else {
            console.log(`  pass  ${label} — ${result.iconCount} svg`);
          }

          await ctx.close();
        }
      }
    }
  }

  await browser.close();
  return problems;
}
