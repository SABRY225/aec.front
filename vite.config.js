import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // target: 'https://server.aectraining.com.sa/',
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
