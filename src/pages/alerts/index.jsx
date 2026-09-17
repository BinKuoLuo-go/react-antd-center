import { useEffect, useState } from 'react'
import {
  Button,
  DatePicker,
  Empty,
  Modal,
  Pagination,
  Select,
  Spin,
  Tooltip,
} from 'antd'
import {
  CloseOutlined,
  LeftOutlined,
  ReloadOutlined,
  RightOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { getSnapshots, getSnapshotImageUrl } from '@/api/snapshot'
import { getDeviceList } from '@/api/deviceStatus'
import styles from './Alerts.module.less'

const PAGE_SIZE = 20

const FALLBACK_IMG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-size="14" fill="#bbb" text-anchor="middle" dominant-baseline="middle">暂无图片</text></svg>',
  )

// 文件大小格式化
const formatSize = (bytes) => {
  if (bytes == null || bytes === '') return '-'
  const n = Number(bytes)
  if (Number.isNaN(n)) return '-'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function Alerts() {
  const [deviceId, setDeviceId] = useState('')
  const [deviceOptions, setDeviceOptions] = useState([])
  const [date, setDate] = useState(() => dayjs()) // 默认当天
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const dateFolder = date ? date.format('YYYYMMDD') : ''

  // 加载设备列表（自动发现设备），默认选中第一个
  useEffect(() => {
    let cancelled = false
    getDeviceList()
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res?.list) ? res.list : []
        setDeviceOptions(list)
        if (list.length > 0) {
          setDeviceId((prev) => (prev && list.includes(prev) ? prev : list[0]))
        }
      })
      .catch(() => {
        if (!cancelled) setDeviceOptions([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 查询：deviceId + date 均必填；分页写死 pageSize=20
  useEffect(() => {
    if (!deviceId || !dateFolder) return
    let cancelled = false
    setLoading(true)
    getSnapshots({ deviceId, date: dateFolder, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setList(res?.list || [])
        setTotal(res?.total || 0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [deviceId, dateFolder, page, refreshKey])

  const handleDeviceChange = (val) => {
    setDeviceId(val || '')
    if (page !== 1) setPage(1)
  }

  const handleDateChange = (val) => {
    setDate(val)
    if (page !== 1) setPage(1)
  }

  const handleRefresh = () => setRefreshKey((k) => k + 1)

  const handleCardClick = (index) => {
    setPreviewIndex(index)
    setPreviewVisible(true)
  }

  const handlePrev = () => {
    if (previewIndex > 0) setPreviewIndex(previewIndex - 1)
  }

  const handleNext = () => {
    if (previewIndex < list.length - 1) setPreviewIndex(previewIndex + 1)
  }

  const current = list[previewIndex]

  return (
    <div className={styles.alerts}>
      {/* 筛选栏 */}
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>设备</span>
        <Select
          showSearch
          allowClear
          placeholder="选择设备ID"
          style={{ width: 200 }}
          value={deviceId || undefined}
          onChange={handleDeviceChange}
          options={deviceOptions.map((d) => ({ label: d, value: d }))}
        />
        <span className={styles.toolbarLabel}>日期</span>
        <DatePicker
          value={date}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          allowClear={false}
          disabledDate={(d) => d && d.isAfter(dayjs(), 'day')}
          placeholder="选择日期"
        />
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          刷新
        </Button>
        <span className={styles.toolbarTotal}>共 {total} 张</span>
      </div>

      {/* 图片列表 */}
      <div className={styles.body}>
        {loading ? (
          <div className={styles.state}>
            <Spin size="large" />
          </div>
        ) : list.length === 0 ? (
          <div className={styles.state}>
            <Empty description="暂无快照数据" />
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {list.map((item, index) => (
                <div
                  key={item.id || `${item.storagePath}-${index}`}
                  className={styles.card}
                  onClick={() => handleCardClick(index)}
                >
                  <div className={styles.cardImg}>
                    <img
                      src={getSnapshotImageUrl(item.storagePath)}
                      alt={item.parkName || '快照'}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = FALLBACK_IMG
                      }}
                    />
                    <span className={styles.cardBadge}>{item.deviceId || deviceId}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitle}>
                      {item.parkName || '未知园区'}
                    </div>
                    <div className={styles.cardTime}>
                      {item.captureTime || '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.pagination}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(t) => `共 ${t} 张`}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      {/* 预览弹窗 */}
      <Modal
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="90vw"
        style={{ maxWidth: 1400, top: '5%' }}
        closeIcon={null}
      >
        {current && (
          <div className={styles.preview}>
            <button
              className={styles.previewClose}
              onClick={() => setPreviewVisible(false)}
            >
              <CloseOutlined />
            </button>
            <div className={styles.previewStage}>
              <img
                src={getSnapshotImageUrl(current.storagePath)}
                alt={current.parkName || '快照'}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = FALLBACK_IMG
                }}
              />
              {previewIndex > 0 && (
                <button className={styles.previewNavLeft} onClick={handlePrev}>
                  <LeftOutlined />
                </button>
              )}
              {previewIndex < list.length - 1 && (
                <button className={styles.previewNavRight} onClick={handleNext}>
                  <RightOutlined />
                </button>
              )}
              <div className={styles.previewCount}>
                {previewIndex + 1} / {list.length}
              </div>
            </div>
            <div className={styles.previewPanel}>
              <h3 className={styles.previewTitle}>快照详情</h3>
              <InfoRow label="设备ID" value={current.deviceId || '-'} />
              <InfoRow label="园区/公司" value={current.parkName || '未知'} />
              <InfoRow label="抓拍时间" value={current.captureTime || '-'} />
              <InfoRow label="文件大小" value={formatSize(current.size)} />
              <InfoRow
                label="存储路径"
                value={current.storagePath || '-'}
                mono
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <Tooltip title={value}>
        <span className={mono ? styles.infoValueMono : styles.infoValue}>
          {value}
        </span>
      </Tooltip>
    </div>
  )
}
