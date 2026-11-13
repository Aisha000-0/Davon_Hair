import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  root: 'client',
  publicDir: './public',
  plugins: [react()],
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: path.resolve('client/src/main.tsx'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
})