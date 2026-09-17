import axios from 'axios'
import { message } from 'antd'
import { getToken, clearAuth } from './auth.js'
import { startLoading, stopLoading } from './loadingBar.js'

// 业务成功码
const SUCCESS_CODE = [0, 200, '0', '200']

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 跳转登录页
const redirectToLogin = () => {
  if (window.location.hash !== '#/login') {
    window.location.hash = '#/login'
  }
}

// 请求拦截器 注入token 启动顶部进度条
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      // Authorization: Bearer
      config.headers.Authorization = `Bearer ${token}`
    }
    startLoading()
    return config
  },
  (error) => {
    stopLoading()
    return Promise.reject(error)
  },
)

// 响应拦截器：统一处理返回格式 + 结束进度条 + 错误提示 + 401/403 跳登录
request.interceptors.response.use(
  (response) => {
    stopLoading()

    // 文件流等二进制响应直接返回
    if (response.config.responseType === 'blob') return response

    const body = response.data
    const code = body?.code

    // 无 code 字段说明后端直接返回了数据，原样返回
    if (code === undefined || SUCCESS_CODE.includes(code)) {
      return body?.data ?? body
    }

    message.error(body?.msg || body?.message || '请求失败')
    return Promise.reject(new Error(body?.msg || body?.message || '请求失败'))
  },
  (error) => {
    stopLoading()

    const status = error?.response?.status
    if (status === 401 || status === 403) {
      message.error('登录已过期，请重新登录')
      clearAuth()
      redirectToLogin()
    } else {
      message.error(
        error?.response?.data?.msg ||
          error?.response?.data?.message ||
          error?.message ||
          '网络异常，请稍后重试',
      )
    }
    return Promise.reject(error)
  },
)

// 方法
export const get = (url, params, config) =>
  request.get(url, { params, ...config })

export const post = (url, data, config) => request.post(url, data, config)

export const put = (url, data, config) => request.put(url, data, config)

export const del = (url, config) => request.delete(url, config)

export default request
