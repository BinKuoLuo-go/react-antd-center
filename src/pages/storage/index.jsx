import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Space,
  Spin,
  Switch,
  message,
} from 'antd'
import {
  CheckCircleOutlined,
  CloudSyncOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import {
  checkObjectStoreHealth,
  getObjectStoreConfig,
  saveObjectStoreConfig,
} from '@/api/objectStore'
import styles from './Storage.module.less'

export default function Storage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [health, setHealth] = useState(null)

  const provider = Form.useWatch('provider', form)

  const loadConfig = async () => {
    setLoading(true)
    try {
      const data = await getObjectStoreConfig()
      if (data) form.setFieldsValue(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSave = async () => {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return // 校验失败，antd 已就地提示
    }
    setSaving(true)
    try {
      const res = await saveObjectStoreConfig(values)
      message.success(res?.message || '保存成功')
      setHealth(null)
    } finally {
      setSaving(false)
    }
  }

  const onTest = async () => {
    setTesting(true)
    setHealth(null)
    try {
      const res = await checkObjectStoreHealth()
      setHealth(res || {})
      if (res?.ok) message.success('连接正常')
      else message.error(res?.error || '连接失败')
    } finally {
      setTesting(false)
    }
  }

  const isNoop = provider === 'noop'

  return (
    <div className={styles.storage}>
      <Spin spinning={loading}>
        <Card title="对象存储配置" className={styles.card}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              enabled: false,
              provider: 'minio',
              endpoint: '',
              bucket: '',
              accessKey: '',
              secretKey: '',
              useSSL: false,
              pathStyle: true,
              publicBase: '',
            }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="enabled"
                  label="获取对象存储"
                  valuePropName="checked"
                  extra="关闭后中心平台将不会向对象存储数据库获取数据"
                >
                  <Switch checkedChildren="开" unCheckedChildren="关" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="provider" label="存储类型">
                  <Radio.Group>
                    <Radio value="minio">MinIO</Radio>
                    <Radio value="noop">不使用（noop）</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="endpoint"
                  label="服务地址 Endpoint"
                  rules={[{ required: !isNoop, message: '请输入服务地址' }]}
                >
                  <Input
                    disabled={isNoop}
                    placeholder="如 http://127.0.0.1:9000"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="bucket"
                  label="存储桶 Bucket"
                  rules={[{ required: !isNoop, message: '请输入存储桶名称' }]}
                >
                  <Input disabled={isNoop} placeholder="如 emergency-center" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="accessKey"
                  label="Access Key"
                  rules={[{ required: !isNoop, message: '请输入 Access Key' }]}
                >
                  <Input disabled={isNoop} placeholder="MinIO 访问密钥" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="secretKey"
                  label="Secret Key"
                  rules={[{ required: !isNoop, message: '请输入 Secret Key' }]}
                >
                  <Input.Password disabled={isNoop} placeholder="MinIO 私钥" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="useSSL" label="使用 SSL" valuePropName="checked">
                  <Switch
                    disabled={isNoop}
                    checkedChildren="是"
                    unCheckedChildren="否"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="pathStyle"
                  label="Path 风格访问"
                  valuePropName="checked"
                  extra="MinIO 通常使用 path-style"
                >
                  <Switch
                    disabled={isNoop}
                    checkedChildren="是"
                    unCheckedChildren="否"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="publicBase"
                  label="对外访问前缀（可选）"
                >
                  <Input
                    disabled={isNoop}
                    placeholder="如 https://cdn.example.com"
                  />
                </Form.Item>
              </Col>
            </Row>

            {health && (
              <Alert
                className={styles.healthAlert}
                type={health.ok ? 'success' : 'error'}
                showIcon
                icon={health.ok ? <CheckCircleOutlined /> : undefined}
                message={
                  health.ok
                    ? `连接正常（provider: ${health.provider || '-'}）`
                    : `连接失败（provider: ${health.provider || '-'}）`
                }
                description={health.ok ? undefined : health.error}
              />
            )}

            <div className={styles.actions}>
              <Space>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={onSave}
                >
                  保存配置
                </Button>
                <Button
                  icon={<CloudSyncOutlined />}
                  loading={testing}
                  onClick={onTest}
                >
                  测试连接
                </Button>
              </Space>
              <span className={styles.hint}>
                测试连接基于当前已保存的配置，修改后请先保存再测试
              </span>
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
  )
}
