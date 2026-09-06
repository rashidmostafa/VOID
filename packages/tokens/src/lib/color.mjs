/* Void token pipeline — colour parsing and WCAG contrast.
   The token set is authored in OKLCH, so the validator has to convert to sRGB
   itself rather than trusting the contrast report (UI-SRC-11: re-derive, do not
   trust the self-reported status). */

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** sRGB transfer function, linear -> gamma-encoded. */
const encode = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
/** sRGB transfer function, gamma-encoded -> linear. */
const decode = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** OKLCH -> gamma-encoded sRGB in [0,1], gamut-clamped. */
export function oklchToSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Clamp in display space: an out-of-gamut token still renders as something.
  return [clamp01(encode(lr)), clamp01(encode(lg)), clamp01(encode(lb))];
}

const NAMED = { white: [1, 1, 1], black: [0, 0, 0], transparent: [0, 0, 0] };

/**
 * Parse a CSS colour the token set may contain.
 * Returns { rgb: [r,g,b] in [0,1] gamma-encoded, alpha } or null if not a colour.
 */
export function parseColor(input) {
  if (typeof input !== "string") return null;
  const v = input.trim();

  if (NAMED[v]) return { rgb: NAMED[v], alpha: v === "transparent" ? 0 : 1 };

  let m = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (m) {
    let hex = m[1];
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join("");
    const n = (i) => parseInt(hex.slice(i, i + 2), 16) / 255;
    return { rgb: [n(0), n(2), n(4)], alpha: hex.length === 8 ? n(6) : 1 };
  }

  m = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i.exec(v);
  if (m) {
    const pct = (s, scale) => (s.endsWith("%") ? parseFloat(s) / 100 * scale : parseFloat(s));
    const L = pct(m[1], 1);
    const C = pct(m[2], 0.4);
    const H = parseFloat(m[3]);
    const alpha = m[4] === undefined ? 1 : pct(m[4], 1);
    return { rgb: oklchToSrgb(L, C, H), alpha };
  }

  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?)\s*)?\)$/i.exec(v);
  if (m) {
    const alpha = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { rgb: [+m[1] / 255, +m[2] / 255, +m[3] / 255], alpha };
  }

  return null;
}

/** WCAG 2.x relative luminance from gamma-encoded sRGB. */
export function luminance([r, g, b]) {
  return 0.2126 * decode(r) + 0.7152 * decode(g) + 0.0722 * decode(b);
}

/** Composite a translucent colour over an opaque backdrop. */
export function over(fg, bg) {
  if (fg.alpha >= 1) return fg.rgb;
  return fg.rgb.map((c, i) => c * fg.alpha + bg[i] * (1 - fg.alpha));
}

/** WCAG 2.x contrast ratio. Both arguments are parseColor results. */
export function contrast(fg, bg) {
  const bgRgb = bg.alpha >= 1 ? bg.rgb : over(bg, [1, 1, 1]);
  const fgRgb = over(fg, bgRgb);
  const l1 = luminance(fgRgb);
  const l2 = luminance(bgRgb);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

export const round2 = (n) => Math.round(n * 100) / 100;
