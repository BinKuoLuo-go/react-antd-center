import { setToken, setUserInfo, clearAuth } from '@/utils/auth'

// 登录接口
// 后端就绪后，把下面的 mock 分支替换为真实请求即可，登录页无需改动：
//   import { post } from '@/utils/request'
//   export const login = (params) =>
//     post('/auth/login', params).then((data) => {
//       setToken(data.token)
//       setUserInfo(data.userInfo || { username: params.username })
//       return data
//     })
export const login = (params) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const { username, password } = params
      if (username === 'admin' && password === '123456') {
        setToken('mock-token')
        setUserInfo({ username })
        resolve({ username })
      } else {
        reject(new Error('用户名或密码错误'))
      }
    }, 500)
  })

// 退出登录：清空本地登录态（后端就绪后可在此追加调用退出接口，如 post('/auth/logout')）
export const logout = () => {
  clearAuth()
  return Promise.resolve()
}
