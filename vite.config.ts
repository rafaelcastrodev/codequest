import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    // TypeScript compiler chunk is intentionally large (~3.5MB) and lazy-loaded
    chunkSizeWarningLimit: 4000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
