import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
// import HomePage from './pages/HomePage'
import { useAuthStore } from './store/auth'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App() {
  const user = useAuthStore(state => state.user)

  return (
    <>
      <Routes>
        {/* <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} /> */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
