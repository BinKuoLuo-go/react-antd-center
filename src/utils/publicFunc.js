import routes from '../config/routes'

// 以递归方式展平路由数组
export const flattenRoutes = (arr = []) =>
  arr.reduce((prev, item) => {
    if (Array.isArray(item.routes)) prev.push(item)
    return prev.concat(
      Array.isArray(item.routes) ? flattenRoutes(item.routes) : item,
    )
  }, [])

// 根据路径获取路由的 name、key 和 component
export const getKeyName = (path = '/') => {
  const truePath = (path || '/').split('?')[0]
  const curRoute = flattenRoutes(routes).find((item) => item.path === truePath)
  if (!curRoute) return { title: '', tabKey: '', component: null }
  const { name, key, component } = curRoute
  return { title: name, tabKey: key, component }
}

// 根据路径获取从根到当前路由的轨迹（用于面包屑）
export const getRouteTrail = (pathname = '/') => {
  const trail = []
  const walk = (list) => {
    for (const item of list) {
      if (item.path === pathname) {
        trail.push(item)
        return true
      }
      if (Array.isArray(item.routes) && walk(item.routes)) {
        trail.unshift(item)
        return true
      }
    }
    return false
  }
  walk(routes)
  return trail
}
