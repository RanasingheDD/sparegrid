import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'

import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import Home          from './pages/Home'
import Login         from './pages/Login'
import Register      from './pages/Register'
import ProductDetail from './pages/ProductDetail'
import UserDashboard  from './pages/UserDashboard'
import AdminDashboard  from './pages/AdminDashboard'
import TermsAndConditions from './pages/TermsAndConditions'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-trust-100 border-t-brand-600 rounded-full animate-spin mb-4" />
      <span className="text-trust-400 font-display text-[10px] font-bold uppercase tracking-[0.2em]">Authenticating...</span>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function MarketplaceDashboardRoute() {
  const { user, loading } = useAuth()
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()
  const activeUser = user || storedUser

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-trust-100 border-t-brand-600 rounded-full animate-spin mb-4" />
      <span className="text-trust-400 font-display text-[10px] font-bold uppercase tracking-[0.2em]">Authenticating...</span>
    </div>
  )

  if (!activeUser) return <Navigate to="/login" replace />
  if (activeUser.role === 'admin') return <Navigate to="/admin" replace />

  return <UserDashboard />
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/terms"         element={<TermsAndConditions />} />

          <Route path="/dashboard" element={<MarketplaceDashboardRoute />} />
          <Route path="/user" element={<Navigate to="/dashboard" replace />} />
          <Route path="/buyer" element={<Navigate to="/dashboard" replace />} />
          <Route path="/seller" element={<Navigate to="/dashboard" replace />} />

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" toastOptions={{ className: 'font-body text-sm', style: { maxWidth: '420px' } }} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
