import { get } from '@/utils/request'
import settings from '@/settings'

// 快照列表：按设备 + 日期文件夹分页查询
// GET /snapshot/snapshots?deviceId=edge-01&date=20260916&company=&page=1&pageSize=20
export const getSnapshots = (params) => get('/snapshot/snapshots', params)

// 图片流式代理地址：GET /snapshot/file/{objectKey}
// 后端返回的列表项含 storagePath，这里直接拼接代理接口路径
export const getSnapshotImageUrl = (storagePath) => {
  if (!storagePath) return ''
  const key = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath
  return `${settings.baseURL}/snapshot/file/${key}`
}
