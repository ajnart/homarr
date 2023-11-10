import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json-summary', 'json'],
      all: true,
      exclude: ['.next/', '.yarn/', 'data/'],
    },
    setupFiles: ['./tests/setupVitest.ts'],
    exclude: [...configDefaults.exclude, '.next'],
  },
});
