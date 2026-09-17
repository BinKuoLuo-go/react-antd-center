import { useCallback, useEffect, useState } from 'react'
import { Button, Empty, Progress, Spin, Tooltip } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import {
  getDeviceList,
  getDeviceOnline,
  getDeviceStatus,
} from '@/api/deviceStatus'
import styles from './Nodes.module.less'

// 自动刷新间隔
const REFRESH_INTERVAL = 10000

// 运行时长格式化
const formatUptime = (seconds) => {
  if (seconds == null || seconds === '') return '-'
  const s = Number(seconds)
  if (Number.isNaN(s) || s < 0) return '-'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}天${h}小时`
  if (h > 0) return `${h}小时${m}分`
  return `${m}分`
}

// 字节 → GB
const formatGB = (bytes) => {
  if (bytes == null || bytes === '') return '-'
  const n = Number(bytes)
  if (Number.isNaN(n)) return '-'
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}

// 使用率颜色：>=80 红、>=60 橙、其余绿
const progressColor = (val) => {
  if (val >= 80) return '#ff4d4f'
  if (val >= 60) return '#faad14'
  return '#52c41a'
}

export default function Nodes() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDeviceList()
      const devices = Array.isArray(res?.list) ? res.list : []
      if (devices.length === 0) {
        setNodes([])
        return
      }

      const results = await Promise.all(
        devices.map(async (deviceId) => {
          try {
            const [onlineRes, statusRes] = await Promise.all([
              getDeviceOnline(deviceId),
              getDeviceStatus(deviceId),
            ])
            return {
              deviceId,
              online: onlineRes?.online ?? false,
              info: onlineRes?.info || null,
              status: statusRes?.status || null,
            }
          } catch {
            // 单个设备请求失败不影响其他设备展示
            return { deviceId, online: false, info: null, status: null }
          }
        }),
      )
      setNodes(results)
    } catch {
      // 设备列表获取失败（如 Redis 不可用），由拦截器提示
      setNodes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  // 自动轮询刷新
  useEffect(() => {
    const timer = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [load])

  const onlineCount = nodes.filter((n) => n.online).length

  return (
    <div className={styles.nodes}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>边缘设备节点</span>
        <span className={styles.toolbarTotal}>
          在线 {onlineCount} / {nodes.length}
        </span>
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          刷新
        </Button>
      </div>

      <div className={styles.body}>
        {loading && nodes.length === 0 ? (
          <div className={styles.state}>
            <Spin size="large" />
          </div>
        ) : nodes.length === 0 ? (
          <div className={styles.state}>
            <Empty description="暂无设备节点" />
          </div>
        ) : (
          <div className={styles.grid}>
            {nodes.map((node) => (
              <NodeCard key={node.deviceId} node={node} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NodeCard({ node }) {
  const { deviceId, online, info, status } = node
  const deviceName = status?.deviceName || info?.companyName || deviceId

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span
          className={`${styles.dot} ${online ? styles.dotOnline : styles.dotOffline}`}
        />
        <span className={styles.deviceId}>{deviceId}</span>
        <span className={online ? styles.onlineText : styles.offlineText}>
          {online ? '在线' : '离线'}
        </span>
      </div>

      <Tooltip title={deviceName}>
        <div className={styles.deviceName}>{deviceName}</div>
      </Tooltip>

      <div className={styles.metrics}>
        <Metric
          label="CPU"
          value={status?.cpuPercent}
          tip={null}
        />
        <Metric
          label="内存"
          value={status?.memPercent}
          tip={
            status
              ? `${formatGB(status.memUsed)} / ${formatGB(status.memTotal)}`
              : null
          }
        />
        <Metric
          label="磁盘"
          value={status?.diskPercent}
          tip={
            status
              ? `${formatGB(status.diskUsed)} / ${formatGB(status.diskTotal)}`
              : null
          }
        />
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.footerItem}>
          运行时长 {formatUptime(status?.uptime)}
        </span>
        <span className={styles.footerItem}>
          {status?.os || info?.companyCode || '-'}
        </span>
        <span className={styles.footerItem}>
          最后上报 {status?.reportTime || info?.lastHeartbeatTime || '-'}
        </span>
      </div>
    </div>
  )
}

function Metric({ label, value, tip }) {
  const hasValue = value != null && value !== ''
  const v = hasValue ? Number(value) : 0
  const text = hasValue ? `${v.toFixed(1)}%` : '-'

  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>
        <span>{label}</span>
        <Tooltip title={tip}>
          <span className={styles.metricValue}>{text}</span>
        </Tooltip>
      </div>
      <Progress
        percent={hasValue ? v : 0}
        showInfo={false}
        strokeColor={progressColor(v)}
        size="small"
      />
    </div>
  )
}
