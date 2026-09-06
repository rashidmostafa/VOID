import React from "react";

/* Icon renders a glyph from Void's own self-hosted SVG sprite — no third-party
   origin, no icon CDN, no icon font (UI-INV-13 / NFR-SEC-20).

   The sprite ships 57 symbols drawn from lucide-static (ISC, see
   assets/icons/LICENSE-lucide.txt). `name` must match a symbol id in that file;
   an unknown name renders an empty box of the right size rather than throwing.

   The sprite is fetched once, parsed into a name → path-markup map, and each
   instance inlines its own paths. Two <use>-based approaches were tried first and
   both failed: referencing the file across documents
   (<use href="sprite.svg#name">) does not render in Chromium at all, and
   referencing an injected copy same-document leaves the shadow tree unable to
   inherit fill or stroke from the instance — glyphs came out as solid black blobs,
   or vanished, or ignored currentColor on a dark button. Inlining sidesteps the
   shadow tree entirely, so stroke weight and currentColor behave like any other
   attribute.

   Pages that sit at a depth other than the project root set the path once,
   before render:
     window.VOID_ICON_SPRITE = "../../assets/icons/void-icons.svg"; */

const SPRITE_URL = () =>
  (typeof window !== "undefined" && window.VOID_ICON_SPRITE) || "assets/icons/void-icons.svg";

let symbols = null;
let loading = null;

function loadSprite() {
  if (symbols) return Promise.resolve(symbols);
  if (loading) return loading;
  loading = fetch(SPRITE_URL())
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
    .then((text) => {
      const map = {};
      const re = /<symbol id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g;
      let m;
      while ((m = re.exec(text))) map[m[1]] = m[2];
      symbols = map;
      return map;
    })
    .catch(() => {
      symbols = {};
      return symbols;
    });
  return loading;
}

export function Icon({ name, size = 16, strokeWidth = 1.5, color = "currentColor", label, style, ...rest }) {
  const [glyphs, setGlyphs] = React.useState(symbols);

  React.useEffect(() => {
    if (glyphs) return;
    let live = true;
    loadSprite().then((map) => { if (live) setGlyphs(map); });
    return () => { live = false; };
  }, [glyphs]);

  const markup = glyphs && glyphs[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
      focusable="false"
      style={{ display: "block", flex: "none", color, ...style }}
      dangerouslySetInnerHTML={markup ? { __html: (label ? `<title>${label}</title>` : "") + markup } : undefined}
      {...rest}
    />
  );
}
