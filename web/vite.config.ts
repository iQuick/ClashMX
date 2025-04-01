import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '127.0.0.1',
    port: 8010,
    proxy: {
      '/api': {
        target: 'http://localhost:3100',
        changeOrigin: true
      }
    },    
    // ÔÚÕâÀïÌí¼Ó allowedHosts ÅäÖÃ
    allowedHosts: [
    ]
  }
})
