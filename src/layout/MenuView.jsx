import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import routes from '../config/routes'
import { flattenRoutes, getKeyName } from '../utils/publicFunc'
import logo from '../assets/logo.png'
import styles from './MenuView.module.less'

const MenuView = ({ collapsed }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const flatMenu = useMemo(() => flattenRoutes(routes), [])
  const selectedKey = getKeyName(pathname).tabKey || 'home'
  const openKeys = useMemo(
    () =>
      routes
        .filter((item) => item.type === 'subMenu')
        .map((item) => item.key),
    [],
  )

  const handleClick = ({ key }) => {
    const target = flatMenu.find((item) => item.key === key)
    if (target && target.path && target.type !== 'subMenu') {
      navigate(target.path)
    }
  }

  const renderMenuItems = (list) =>
    list
      .filter((item) => !item.hideInMenu)
      .map((item) => {
        if (item.type === 'subMenu') {
          return {
            key: item.key,
            icon: item.icon ? <item.icon /> : null,
            label: item.name,
            children: renderMenuItems(item.routes),
          }
        }
        return {
          key: item.key,
          icon: item.icon ? <item.icon /> : null,
          label: item.name,
        }
      })

  const menuItems = renderMenuItems(routes)

  const logLink = (
    <div className={styles.logo} onClick={() => navigate('/')}>
      <img alt="logo" src={logo} />
      {!collapsed && <h1>Center Server</h1>}
    </div>
  )

  return (
    <Layout.Sider
      collapsed={collapsed}
      width={220}
      theme="light"
      className={styles.sider}
    >
      {logLink}
      <Menu
        className={styles.menu}
        mode="inline"
        theme="light"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        onClick={handleClick}
        items={menuItems}
      />
    </Layout.Sider>
  )
}

export default MenuView
