import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    setupFiles: ["./vitest.setup.ts"],
    environment: "jsdom",
    include: ["**/*.spec.ts"],
    clearMocks: true,
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["html", "json-summary", "json"],
      all: true,
      exclude: (configDefaults.coverage.exclude ?? []).concat("apps/nextjs/.next/"),
      reportOnFailure: true,
    },

    exclude: [...configDefaults.exclude, "apps/nextjs/.next"],
  },
});
