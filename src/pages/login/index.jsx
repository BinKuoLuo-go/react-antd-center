import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { login } from '@/api/auth'
import logo from '../../assets/logo.png'
import styles from './login.module.less'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await login(values)
      message.success('登录成功')
      navigate('/', { replace: true })
    } catch (err) {
      message.error(err?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginLayout}>
      <div className={styles.logoBox}>
        <img className={styles.logo} alt="logo" src={logo} />
        <span className={styles.logoName}>Center Server</span>
      </div>

      <Form
        className={styles.loginForm}
        name="login"
        initialValues={{ username: 'admin', password: '123456' }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="用户名"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="密码"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className={styles.loginButton}
          >
            登录
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.tips}>演示账号：admin　密码：123456</div>
    </div>
  )
}

export default Login
