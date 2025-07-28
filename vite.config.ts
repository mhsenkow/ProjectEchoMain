import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'fs/promises']
  },
  define: {
    global: 'globalThis',
  }
}) 