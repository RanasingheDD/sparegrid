import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Package, LayoutDashboard, LogOut, ChevronRight, ShieldCheck, Flame } from 'lucide-react'

const DASHBOARD_ROUTES = {
  buyer: '/buyer',
  seller: '/seller',
  user: '/buyer',
  admin: '/admin',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/90 backdrop-blur-xl">
      <div className="bg-trust-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-brand-300" />
            Trusted electronics marketplace
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Flame size={12} className="text-brand-300" />
            Hot deals updated daily
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-3 group min-w-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_14px_32px_rgba(242,85,31,0.28)] transition-transform duration-300 group-hover:scale-105">
            <Package size={22} />
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl font-bold text-trust-900">SpareGrid</div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand-600">
              Parts. Boards. Modules.
            </div>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-trust-600">
          <Link to="/" className="transition-colors hover:text-brand-600">Home</Link>
          <Link to="/" className="transition-colors hover:text-brand-600">Best Sellers</Link>
          <Link to="/" className="transition-colors hover:text-brand-600">Fast Movers</Link>
          <Link to="/terms" className="transition-colors hover:text-brand-600">Buyer Protection</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand-700">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                {user.role}
              </div>

              <Link
                to={DASHBOARD_ROUTES[user.role] || '/'}
                className="hidden sm:flex items-center gap-2 rounded-2xl border border-surface-300 bg-white px-4 py-2.5 text-sm font-semibold text-trust-700 shadow-[0_10px_24px_rgba(18,21,33,0.06)] transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-trust-500 transition-colors hover:text-brand-600"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline px-3 py-2 text-sm font-semibold text-trust-600 transition-colors hover:text-brand-600"
              >
                Sign In
              </Link>
              <Link to="/register" className="btn-primary flex items-center gap-2 px-5 py-3">
                <span>Start Selling</span>
                <ChevronRight size={15} className="relative z-10" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
