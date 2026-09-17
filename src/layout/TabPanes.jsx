import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Dropdown, Spin, Tabs } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { startLoading, stopLoading } from '../utils/loadingBar.js'
import styles from './TabPanes.module.less'

const Home = lazy(() => import('../pages/home'))

// 页面懒加载时的占位：挂载时启动顶部进度条，加载完成卸载时结束
const TabLoading = () => {
  useEffect(() => {
    startLoading()
    return () => stopLoading()
  }, [])

  return (
    <div className={styles.loading}>
      <Spin />
    </div>
  )
}

// 页面切换动画容器：激活时通过 class 触发淡入 + 上移动画，不重新挂载子组件以保留页签状态
const PageTransition = ({ active, children }) => (
  <div className={active ? styles.pageEnter : undefined}>{children}</div>
)

const initPane = [
  {
    title: '首页',
    key: 'home',
    component: Home,
    closable: false,
    path: '/',
  },
]

const TabPanes = ({ panesItem }) => {
  const [activeKey, setActiveKey] = useState('home')
  const [panes, setPanes] = useState(initPane)
  const [isReload, setIsReload] = useState(false)
  const [reloadPath, setReloadPath] = useState('')
  const [selectedPanel, setSelectedPanel] = useState({})
  const pathRef = useRef('')
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const fullPath = pathname + search

  // 接收 Container 派发的新的 tab，进行新增/更新
  useEffect(() => {
    if (!panesItem.path || panesItem.path === pathRef.current) return
    pathRef.current = panesItem.path

    setPanes((prev) => {
      const index = prev.findIndex((item) => item.key === panesItem.key)
      if (index > -1) {
        const next = [...prev]
        next[index] = { ...next[index], path: panesItem.path }
        return next
      }
      return [...prev, panesItem]
    })
    setActiveKey(panesItem.key)
  }, [panesItem])

  const onChange = (key) => setActiveKey(key)

  const onTabClick = (key) => {
    const pane = panes.find((item) => item.key === key)
    if (pane) navigate(pane.path)
  }

  const remove = (targetKey) => {
    const delIndex = panes.findIndex((item) => item.key === targetKey)
    if (delIndex < 0) return
    const newPanes = panes.filter((item) => item.key !== targetKey)
    setPanes(newPanes)

    if (targetKey !== activeKey) return
    const next = newPanes[Math.max(0, delIndex - 1)] || newPanes[0]
    setActiveKey(next.key)
    navigate(next.path)
  }

  const removeAll = (isCloseAll) => {
    const homePanel = initPane
    const nowPanes =
      isCloseAll || selectedPanel.key === 'home'
        ? homePanel
        : [homePanel[0], selectedPanel]
    setPanes(nowPanes)
    setActiveKey(isCloseAll ? 'home' : selectedPanel.key)
    navigate(isCloseAll ? '/' : selectedPanel.path)
  }

  const refreshTab = () => {
    setIsReload(true)
    setReloadPath(pathname + search)
    setTimeout(() => {
      setIsReload(false)
      setReloadPath('')
    }, 1000)
  }

  const onContextMenu = (e, pane) => {
    e.preventDefault()
    setSelectedPanel(pane)
  }

  const menuItems = [
    {
      key: 'refresh',
      label: '刷新',
      disabled: selectedPanel.path !== fullPath,
      onClick: refreshTab,
    },
    {
      key: 'close',
      label: '关闭',
      disabled: selectedPanel.key === 'home',
      onClick: () => remove(selectedPanel.key),
    },
    {
      key: 'close-others',
      label: '关闭其他',
      onClick: () => removeAll(false),
    },
    {
      key: 'close-all',
      label: '全部关闭',
      disabled: selectedPanel.key === 'home',
      onClick: () => removeAll(true),
    },
  ]

  const items = panes.map((pane) => ({
    key: pane.key,
    closable: pane.closable,
    label: (
      <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
        <span onContextMenu={(e) => onContextMenu(e, pane)}>
          {isReload && pane.path === fullPath && (
            <SyncOutlined spin className={styles.reloadIcon} />
          )}
          {pane.title}
        </span>
      </Dropdown>
    ),
    children: (
      <PageTransition active={pane.key === activeKey}>
        {reloadPath === pane.path ? (
          <div className={styles.reloading}>
            <Alert message="刷新中..." type="info" />
          </div>
        ) : (
          <Suspense fallback={<TabLoading />}>
            <pane.component path={pane.path} />
          </Suspense>
        )}
      </PageTransition>
    ),
  }))

  return (
    <div className={styles.wrapper}>
      <Tabs
        activeKey={activeKey}
        className={styles.tabs}
        hideAdd
        type="editable-card"
        size="small"
        onChange={onChange}
        onEdit={(targetKey, action) => action === 'remove' && remove(targetKey)}
        onTabClick={onTabClick}
        items={items}
      />
    </div>
  )
}

export default TabPanes
