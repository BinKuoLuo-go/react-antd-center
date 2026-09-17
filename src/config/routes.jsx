/* eslint-disable react/only-export-components -- 路由配置非组件文件，lazy 声明的组件无需 fast refresh */
import { lazy } from 'react'
import {
  HomeOutlined,
  AlertOutlined,
  DatabaseOutlined,
  ClusterOutlined,
} from '@ant-design/icons'

// 页面按需加载，配合 TabPanes 中的 Suspense 做代码分割
const Home = lazy(() => import('../pages/home'))
const Alerts = lazy(() => import('../pages/alerts'))
const Storage = lazy(() => import('../pages/storage'))
const Nodes = lazy(() => import('../pages/nodes'))

const routes = [
  {
    path: '/',
    name: '首页',
    exact: true,
    key: 'home',
    icon: HomeOutlined,
    component: Home,
  },
  {
    path: '/nodes',
    name: '设备节点',
    exact: true,
    key: 'nodes',
    icon: ClusterOutlined,
    component: Nodes,
  },
  {
    path: '/alerts',
    name: '节点告警',
    exact: true,
    key: 'alerts',
    icon: AlertOutlined,
    component: Alerts,
  },
  {
    path: '/storage',
    name: '存储配置',
    exact: true,
    key: 'storage',
    icon: DatabaseOutlined,
    component: Storage,
  },
]

export default routes
