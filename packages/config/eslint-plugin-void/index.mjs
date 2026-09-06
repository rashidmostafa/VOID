import noStyleLiterals from "./rules/no-style-literals.mjs";
import noNextFont from "./rules/no-next-font.mjs";

export default {
  meta: { name: "eslint-plugin-void", version: "1.0.0" },
  rules: {
    "no-style-literals": noStyleLiterals,
    "no-next-font": noNextFont,
  },
};
