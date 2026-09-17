import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'antd/dist/reset.css'
import './styles/global.less'
import App from './App.jsx'
import TopLoadingBar from './components/LoadingBar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <TopLoadingBar />
      <App />
    </ConfigProvider>
  </StrictMode>,
)
