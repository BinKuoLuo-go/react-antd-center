import { createRef } from 'react'

// 模块级单例 ref，供组件外部（如 axios 拦截器、懒加载占位）全局触发进度条
export const loadingBarRef = createRef()

// 进行中的加载计数，用于处理并发请求：首个请求开始，最后一个结束才 complete
let pending = 0

export const startLoading = () => {
  pending += 1
  if (pending === 1) loadingBarRef.current?.start()
}

export const stopLoading = () => {
  pending = Math.max(0, pending - 1)
  if (pending === 0) loadingBarRef.current?.complete()
}
