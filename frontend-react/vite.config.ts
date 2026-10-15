import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// 与旧前端一致：/api、/static 代理到本地 Hono 后端（5679），保持同源请求语义。
// 新前端开发端口 3014，与旧 Vue（3013）并行；后端 CORS 白名单无需变更（代理后同源）。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5679', changeOrigin: true },
      '/static': { target: 'http://localhost:5679', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
  css: {
    modules: {
      // 允许 styles['kebab-class'] 与 styles.camelClass 两种访问方式
      localsConvention: 'camelCase',
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
