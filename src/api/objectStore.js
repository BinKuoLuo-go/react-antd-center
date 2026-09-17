import { get, post } from '@/utils/request'

// 获取对象存储配置
export const getObjectStoreConfig = () => get('/server/object_store_config')

// 保存对象存储配置
export const saveObjectStoreConfig = (data) =>
  post('/server/object_store_config/save', data)

// 对象存储连通性检测
export const checkObjectStoreHealth = () =>
  get('/server/object_store_config/health')
