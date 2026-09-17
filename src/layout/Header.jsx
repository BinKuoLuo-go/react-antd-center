import { Layout, Dropdown, Modal } from 'antd'
import {
  ExportOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from './Breadcrumb'
import { getUserInfo } from '../utils/auth'
import { logout } from '@/api/auth'
import styles from './Header.module.less'

const Header = ({ collapsed, onToggle }) => {
  const navigate = useNavigate()
  const { username = 'Admin' } = getUserInfo()

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出登录吗？',
      okText: '退出',
      cancelText: '取消',
      onOk: () => {
        logout()
        navigate('/login', { replace: true })
      },
    })
  }

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout.Header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.toggleMenu} onClick={onToggle}>
          {collapsed ? (
            <MenuUnfoldOutlined className={styles.trigger} />
          ) : (
            <MenuFoldOutlined className={styles.trigger} />
          )}
        </div>
        <Breadcrumb />
      </div>
      <div className={styles.right}>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <span className={styles.user}>
            <span className={styles.avart}>{username.slice(0, 1)}</span>
            <span>{username}</span>
          </span>
        </Dropdown>
        <a
          className={styles.github}
          href="http://10.254.1.5:8812/"
          target="_blank"
          rel="noopener noreferrer"
          title="访问大屏"
        >
          <ExportOutlined />
        </a>
      </div>
    </Layout.Header>
  )
}

export default Header
