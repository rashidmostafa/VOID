/**
 * UI-SRC-9 — no style literals.
 *
 * "No colour, font, size, weight, line height, spacing, radius, shadow, border
 * width, z-index, breakpoint, duration or easing as a literal in component code,
 * inline style, or a utility class that hard-codes it. Every such value resolves
 * through a token."
 *
 * Three surfaces carry literals in a Tailwind v4 + React codebase, and the rule
 * covers all three:
 *   1. style objects, and the constant objects that feed them (`{ height: 44 }`)
 *   2. Tailwind arbitrary values in className (`w-[13px]`, `bg-[#fff]`)
 *   3. raw CSS in tagged template literals
 *
 * The design-system reference tree is out of scope: it is read-only source the
 * product rebuilds from, not code that ships.
 */

const COLOUR_PROPS = new Set([
  "color", "background", "backgroundColor", "borderColor", "borderTopColor",
  "borderRightColor", "borderBottomColor", "borderLeftColor", "borderInlineColor",
  "borderBlockColor", "outlineColor", "fill", "stroke", "caretColor",
  "textDecorationColor", "columnRuleColor", "accentColor",
]);

const LENGTH_PROPS = new Set([
  "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
  "inlineSize", "blockSize", "minInlineSize", "minBlockSize", "maxInlineSize", "maxBlockSize",
  "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock",
  "paddingBlockStart", "paddingBlockEnd",
  "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
  "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock",
  "marginBlockStart", "marginBlockEnd",
  "top", "right", "bottom", "left", "inset", "insetInline", "insetBlock",
  "insetInlineStart", "insetInlineEnd", "insetBlockStart", "insetBlockEnd",
  "gap", "rowGap", "columnGap", "borderRadius", "borderWidth",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "fontSize", "lineHeight", "letterSpacing", "wordSpacing", "textIndent",
  "textUnderlineOffset", "textDecorationThickness", "outlineWidth", "outlineOffset",
  "strokeWidth", "flexBasis", "backgroundSize",
]);

const SHORTHAND_PROPS = new Set([
  "border", "borderTop", "borderRight", "borderBottom", "borderLeft",
  "borderInline", "borderBlock", "outline", "boxShadow", "textShadow",
  "font", "transition", "animation", "flex",
  "gridTemplateColumns", "gridTemplateRows", "transform", "filter", "backdropFilter",
]);

const OTHER_PROPS = new Set(["zIndex", "fontWeight", "aspectRatio"]);

/* React does not append px to these; a bare number here is still a design value
   that must be named, but the diagnostic should not claim it becomes px. */
const UNITLESS_PROPS = new Set(["lineHeight", "fontWeight", "zIndex", "aspectRatio", "flexBasis"]);

const STYLE_PROPS = new Set([...COLOUR_PROPS, ...LENGTH_PROPS, ...SHORTHAND_PROPS, ...OTHER_PROPS]);

/* Values carrying no design decision, so nothing can drift. */
const KEYWORDS = new Set([
  "auto", "none", "inherit", "initial", "unset", "revert", "currentColor",
  "transparent", "normal", "0", "100%", "fit-content", "max-content", "min-content",
  "solid", "dashed", "dotted", "hidden", "visible", "center", "flex", "block",
  "inline-flex", "inline-block", "grid", "relative", "absolute", "fixed", "sticky",
  "nowrap", "wrap", "pointer", "not-allowed", "border-box", "content-box",
]);

const HEX = /#[0-9a-f]{3,8}\b/i;
const COLOUR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/i;
const NAMED = /\b(?:red|blue|green|black|white|grey|gray|orange|yellow|purple|pink|brown|cyan|magenta|silver|gold|navy|teal|olive|maroon|lime|aqua|fuchsia)\b/i;
const LENGTH = /(?<![\w-])-?\d*\.?\d+(?:px|rem|em|ch|ex|vh|vw|vmin|vmax|pt|pc|cm|mm|in)\b/i;
const DURATION = /(?<![\w-])-?\d*\.?\d+m?s\b/i;
const EASING = /\b(?:cubic-bezier|steps)\s*\(|(?<![\w-])(?:ease-in-out|ease-in|ease-out|ease)(?![\w-])/i;

/* Tailwind arbitrary values: bg-[#fff], w-[13px], duration-[700ms]. */
const TW_ARBITRARY = /(?:^|\s|:)(?:[a-z-]+-)?\[([^\]]+)\]/gi;

const hasVar = (s) => /var\(\s*--/.test(s);

function describe(value) {
  if (HEX.test(value) || COLOUR_FN.test(value)) return "a colour literal";
  if (NAMED.test(value)) return "a named colour";
  if (LENGTH.test(value)) return "a size literal";
  if (DURATION.test(value)) return "a duration literal";
  if (EASING.test(value)) return "an easing literal";
  return null;
}

function offender(value) {
  const m = value.match(HEX) || value.match(COLOUR_FN) || value.match(NAMED)
    || value.match(LENGTH) || value.match(DURATION) || value.match(EASING);
  return m ? m[0] : value;
}

export default {
  meta: {
    type: "problem",
    docs: { description: "Every style value must resolve through a design token (UI-SRC-9)." },
    schema: [{
      type: "object",
      properties: { allow: { type: "array", items: { type: "string" } } },
      additionalProperties: false,
    }],
    messages: {
      literal: "UI-SRC-9: `{{prop}}` uses {{kind}} ({{value}}). Resolve it through a token.",
      bareNumber: "UI-SRC-9: `{{prop}}` is the bare number {{value}}, which React renders as px. Use var(--token).",
      bareUnitless: "UI-SRC-9: `{{prop}}` is the bare number {{value}}. It is still a design value and must be named. Use var(--token).",
      tailwind: "UI-SRC-9: the Tailwind arbitrary value [{{value}}] hard-codes {{kind}}. Use a utility bound to a token.",
      css: "UI-SRC-9: raw CSS contains {{kind}} ({{value}}). Resolve it through a token.",
    },
  },

  create(context) {
    const allow = new Set(context.options?.[0]?.allow ?? []);
    const ok = (v) => KEYWORDS.has(String(v).trim()) || allow.has(String(v).trim());

    function checkValue(node, prop, raw) {
      const value = String(raw);
      if (ok(value)) return;
      // A shorthand may mix a token with a literal: `1px solid var(--x)` still
      // hard-codes the 1px, so scan the whole string even when a var() is present.
      const kind = describe(value);
      if (!kind) return;
      if (hasVar(value) && !LENGTH.test(value) && !DURATION.test(value) && !HEX.test(value)) return;
      context.report({ node, messageId: "literal", data: { prop, kind, value: offender(value) } });
    }

    function checkProperty(prop) {
      if (prop.type !== "Property" || prop.computed) return;
      const name = prop.key.name ?? prop.key.value;
      if (typeof name !== "string" || !STYLE_PROPS.has(name)) return;
      const v = prop.value;

      if (v.type === "Literal" && typeof v.value === "string") {
        checkValue(v, name, v.value);
      } else if (v.type === "Literal" && typeof v.value === "number") {
        if (v.value === 0 || allow.has(String(v.value))) return;
        if (LENGTH_PROPS.has(name) || name === "zIndex" || name === "fontWeight") {
          context.report({
            node: v,
            messageId: UNITLESS_PROPS.has(name) ? "bareUnitless" : "bareNumber",
            data: { prop: name, value: v.value },
          });
        }
      } else if (v.type === "TemplateLiteral") {
        const text = v.quasis.map((q) => q.value.raw).join(" ");
        if (text.trim()) checkValue(v, name, text);
      }
    }

    function checkClassName(node, text) {
      TW_ARBITRARY.lastIndex = 0;
      let m;
      while ((m = TW_ARBITRARY.exec(text))) {
        const inner = m[1];
        if (hasVar(inner)) continue;
        const kind = describe(inner);
        if (kind) context.report({ node, messageId: "tailwind", data: { value: inner, kind } });
      }
    }

    return {
      Property: checkProperty,

      JSXAttribute(node) {
        const name = node.name?.name;
        if (name !== "className" && name !== "class") return;
        const v = node.value;
        if (!v) return;
        if (v.type === "Literal" && typeof v.value === "string") checkClassName(v, v.value);
        if (v.type === "JSXExpressionContainer") {
          checkClassName(v.expression, context.sourceCode.getText(v.expression));
        }
      },

      TaggedTemplateExpression(node) {
        const text = node.quasi.quasis.map((q) => q.value.raw).join(" ");
        const kind = describe(text);
        if (!kind) return;
        context.report({ node, messageId: "css", data: { kind, value: offender(text) } });
      },
    };
  },
};
