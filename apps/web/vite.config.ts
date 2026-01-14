import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ai-worker': {
        target: 'https://apolloacademyaiteacher.revanaglobal.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-worker/, ''),
        secure: false
      }
    }
  }
})
