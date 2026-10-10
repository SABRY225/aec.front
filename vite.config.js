import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.BACKURL || env.VITE_BACKURL || 'http://localhost:5002',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
