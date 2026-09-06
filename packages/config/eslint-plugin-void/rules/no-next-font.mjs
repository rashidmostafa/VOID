/**
 * UI-INV-13 — self-hosted assets only.
 *
 * `next/font` rewrites font delivery: it re-hosts and fingerprints the files,
 * which makes the ADR-0001 critical-path budget unmeasurable and moves font
 * serving outside the token pipeline the theme-swap gate depends on. The
 * subsetting is already done and the byte counts are recorded in the contract.
 * Fonts are declared by the generated @font-face block and nowhere else.
 */
export default {
  meta: {
    type: "problem",
    docs: { description: "Do not use next/font; fonts come from the generated theme (UI-INV-13, ADR-0001)." },
    schema: [],
    messages: {
      banned:
        "UI-INV-13: `{{source}}` is banned. Fonts are declared by the generated @font-face block in apps/web/public/theme/tokens.css, which is what the ADR-0001 budget gate measures.",
    },
  },
  create(context) {
    const check = (node, source) => {
      if (typeof source === "string" && /^next\/font(\/|$)/.test(source)) {
        context.report({ node, messageId: "banned", data: { source } });
      }
    };
    return {
      ImportDeclaration: (n) => check(n, n.source.value),
      ImportExpression: (n) => n.source.type === "Literal" && check(n, n.source.value),
      CallExpression(n) {
        if (n.callee.name === "require" && n.arguments[0]?.type === "Literal") {
          check(n, n.arguments[0].value);
        }
      },
    };
  },
};
