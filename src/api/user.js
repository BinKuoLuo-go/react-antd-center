import { get, post, put, del } from '@/utils/request'

// 用户管理接口示例（后期按后端实际路径替换 url）
export const getUserList = (params) => get('/user/list', params)
export const createUser = (data) => post('/user/add', data)
export const updateUser = (data) => put('/user/edit', data)
export const deleteUser = (id) => del(`/user/${id}`)
