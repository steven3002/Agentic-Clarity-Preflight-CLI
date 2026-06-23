import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only the CLI's own test suite; example preflight tests are not part of this project's
    // tests and require the Clarinet toolchain to run.
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**", "examples/**"],
  },
});
