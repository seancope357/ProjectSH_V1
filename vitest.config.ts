import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // Avoid loading PostCSS config during tests
  css: {
    postcss: {},
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
