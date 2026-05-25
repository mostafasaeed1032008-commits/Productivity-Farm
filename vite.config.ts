import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pixi.js')) return 'pixi'
          if (id.includes('matter-js')) return 'matter'
          if (
            id.includes('node_modules/react') ||
            id.includes('react-router') ||
            id.includes('zustand') ||
            id.includes('framer-motion')
          ) {
            return 'vendor'
          }
        },
      },
    },
  },
})
