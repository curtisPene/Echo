import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    setupFiles: [
      "./src/test/setupFakeIndexedDb.ts",
      "./src/tests/e2e/setupCookieJar.ts",
    ],
    include: ["src/tests/e2e/**/*.e2e.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
  },
});
