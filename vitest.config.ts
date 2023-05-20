import react from '@vitejs/plugin-react';

import { configDefaults, defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'c8',
      reporter: ['html'],
      all: true,
      exclude: ['.next/', '.yarn/', 'data/'],
    },
    setupFiles: ['./tests/setupVitest.ts'],
    exclude: [
      ...configDefaults.exclude,
      '.next',
    ],
  },
});
