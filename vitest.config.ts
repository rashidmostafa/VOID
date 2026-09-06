import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

const root = import.meta.dirname;

export default defineConfig({
  test: {
    include: ["packages/**/*.test.ts", "tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@void/market": resolve(root, "packages/market/src"),
      "@void/ui": resolve(root, "packages/ui/src"),
      "@void/tokens": resolve(root, "packages/tokens/dist"),
    },
  },
});
