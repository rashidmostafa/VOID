/* Brace-depth-aware reader for CSS custom-property declarations.
   Deliberately small: the gates only need `--name: value` pairs and their scope. */
export function parseDeclarations(text) {
  const src = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Map();
  const sel = [];
  let buf = "";
  for (const c of src) {
    if (c === "{") { sel.push(buf.trim().replace(/\s+/g, " ")); buf = ""; }
    else if (c === "}") { sel.pop(); buf = ""; }
    else if (c === ";") {
      const m = /^\s*(--[a-z0-9-]+)\s*:\s*([\s\S]+)$/i.exec(buf);
      if (m && sel.length) out.set(`${scopeOf(sel[sel.length - 1])}|${m[1]}`, m[2].replace(/\s+/g, " ").trim());
      buf = "";
    } else buf += c;
  }
  return out;
}

export const scopeOf = (s) =>
  /dark/.test(s) ? "dark" : /lang|\[lang/.test(s) ? "bn" : /:root/.test(s) ? "root" : s;

/** The real cascade — styles.css @import order, which is NOT alphabetical. */
export const CASCADE = [
  "primitives", "fonts", "colors", "feedback", "commerce", "accent",
  "typography", "spacing", "layout", "radius", "elevation", "motion",
];
