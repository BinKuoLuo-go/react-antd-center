// 全局配置
const settings = {
  // 后端服务地址前缀（开发环境由 vite server.proxy 代理，可留空）
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
}

export default settings
