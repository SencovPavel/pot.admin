import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@pages':  path.resolve(__dirname, 'src/pages'),
      '@app':    path.resolve(__dirname, 'src/app'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/admin': 'http://localhost:3000',
      '/auth':  'http://localhost:3000',
    },
  },
})
