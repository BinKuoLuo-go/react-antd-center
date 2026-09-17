import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Container from './layout/Container'
import Login from './pages/login'
import { isLogin } from './utils/auth'

// 未登录时重定向到登录页，实现路由守卫
const RequireAuth = ({ children }) =>
  isLogin() ? children : <Navigate to="/login" replace />

const App = () => (
  <HashRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Container />
          </RequireAuth>
        }
      />
    </Routes>
  </HashRouter>
)

export default App
