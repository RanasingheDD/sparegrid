import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Store, ShieldCheck, ArrowRight } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const DASHBOARD = { buyer: '/dashboard', seller: '/dashboard', admin: '/admin', user: '/dashboard' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(DASHBOARD[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[82vh] px-4 py-10">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="retail-panel mesh-card hidden min-h-[540px] overflow-hidden p-10 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">
            <ShieldCheck size={14} />
            Secure sign in
          </div>
          <h1 className="mt-8 max-w-lg text-5xl font-bold leading-tight text-trust-900">
            Return to your <span className="gradient-text">seller-ready storefront.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-trust-600">
            Access your listings, respond to buyers, and manage parts with a more polished marketplace experience.
          </p>
          <div className="mt-10 grid gap-4">
            {['Track fast-moving listings', 'Respond to buyers quickly', 'Manage your dashboard from one place'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/90 px-5 py-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <ArrowRight size={16} />
                </div>
                <span className="font-semibold text-trust-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_16px_36px_rgba(242,85,31,0.28)]">
              <Store size={26} />
            </div>
            <h1 className="text-3xl font-bold text-trust-900">Welcome back</h1>
            <p className="mt-2 text-sm text-trust-500">Sign in to continue buying and selling on LankaParts.</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-trust-500">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
