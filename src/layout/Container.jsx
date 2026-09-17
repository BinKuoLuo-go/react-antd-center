import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout, FloatButton } from 'antd'
import classNames from 'classnames'
import MenuView from './MenuView'
import Header from './Header'
import TabPanes from './TabPanes'
import { getKeyName } from '../utils/publicFunc'
import styles from './Container.module.less'

const Container = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [panesItem, setPanesItem] = useState({
    title: '',
    component: null,
    key: '',
    path: '',
    closable: false,
  })
  const pathRef = useRef('')
  const { pathname, search } = useLocation()

  // 监听路由变化，向页签组件派发新的 tab
  useEffect(() => {
    const { title, tabKey, component } = getKeyName(pathname)
    if (!component) return

    const newPath = search ? pathname + search : pathname
    if (newPath === pathRef.current) return

    pathRef.current = newPath
    setPanesItem({
      title,
      component,
      key: tabKey,
      path: newPath,
      closable: tabKey !== 'home',
    })
  }, [pathname, search])

  return (
    <Layout className={styles.container}>
      <MenuView collapsed={collapsed} />
      <Layout
        className={classNames(styles.content, {
          [styles.collapsed]: collapsed,
        })}
      >
        <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Layout.Content className={styles.main}>
          <TabPanes panesItem={panesItem} />
        </Layout.Content>
      </Layout>
      <FloatButton.BackTop visibilityHeight={1080} />
    </Layout>
  )
}

export default Container
