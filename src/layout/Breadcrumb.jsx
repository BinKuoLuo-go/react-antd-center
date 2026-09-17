import { Link, useLocation } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { getRouteTrail } from '../utils/publicFunc'
import styles from './Breadcrumb.module.less'

const Breadcrumbs = () => {
  const { pathname } = useLocation()
  const trail = getRouteTrail(pathname)

  const items = [{ title: <Link to="/">首页</Link> }]

  trail
    .filter((item) => item.path !== '/')
    .forEach((item, index, arr) => {
      const isLast = index === arr.length - 1
      const linkable =
        !isLast && item.type !== 'subMenu' && item.path !== pathname
      items.push({
        title: linkable ? <Link to={item.path}>{item.name}</Link> : item.name,
      })
    })

  return <Breadcrumb className={styles.breadcrumb} items={items} />
}

export default Breadcrumbs
