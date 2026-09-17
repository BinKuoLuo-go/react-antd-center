import { get } from '@/utils/request'

// 设备列表：GET /device/list
export const getDeviceList = () => get('/device/list')

// 设备在线状态：GET /device/online?deviceId=edge-01
export const getDeviceOnline = (deviceId) => get('/device/online', { deviceId })

// 设备最新资源状态：GET /device-status/latest?deviceId=edge-01
export const getDeviceStatus = (deviceId) =>
  get('/device-status/latest', { deviceId })
