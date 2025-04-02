import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const API = JSON.parse(process.env.API || '{}');
  const CONFIG = JSON.parse(process.env.CONFIG || '{}');

  const df: { [key: string]: any } = {}
  for (const key in CONFIG) {
    if (key === 'host' || key === 'port') {
      continue;
    }
    df[`import.meta.env.${key}`] = CONFIG[key]
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: df,
    server: {
      host: CONFIG.host,
      port: CONFIG.port,
      proxy: {
        '/api': {
          target: `http://${API.host}:${API.port}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path // 保持路径不变
        }
      }
    }
  }
})
