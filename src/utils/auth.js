// 登录态管理
const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)

export const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || {}
  } catch {
    return {}
  }
}

export const setUserInfo = (info) =>
  localStorage.setItem(USER_KEY, JSON.stringify(info))

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isLogin = () => !!getToken()
