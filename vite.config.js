import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 监听所有网卡（0.0.0.0），方便 easytier 等组网下其他机器访问
    host: true,
    proxy: {
      // 开发环境把 /api 代理到后端服务，避免跨域（改成你的后端地址）
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // 快照接口（节点告警页）
      '/snapshot': {
        target: 'http://localhost:8812',
        changeOrigin: true,
      },
      // 对象存储配置接口（存储配置页）
      '/server': {
        target: 'http://localhost:8812',
        changeOrigin: true,
      },
      // 设备节点状态接口（设备状态页）
      '/device': {
        target: 'http://localhost:8812',
        changeOrigin: true,
      },
      '/device-status': {
        target: 'http://localhost:8812',
        changeOrigin: true,
      },
    },
  },
})
