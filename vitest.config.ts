import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@void/market": resolve(root, "packages/market/src"),
      "@void/trade": resolve(root, "packages/trade/src"),
      "@void/order": resolve(root, "packages/order/src"),
      "@void/ui": resolve(root, "packages/ui/src"),
      "@void/tokens": resolve(root, "packages/tokens/dist"),
    },
  },
});
