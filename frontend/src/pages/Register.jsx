import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Store, BadgePercent, ShieldCheck, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'user',
    phone: '', address: ''
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Password and confirm password must match.')
      return
    }
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms & Conditions to create an account.')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      await register(payload)
      toast.success('Your account is ready. Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  })

  return (
    <div className="min-h-[85vh] px-4 py-10">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="retail-panel bg-trust-900 p-8 text-white lg:sticky lg:top-32">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-300">
            <ShieldCheck size={14} />
            Launch your seller journey
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-white">
            Join the marketplace with a stronger, more <span className="text-brand-300">retail-first</span> storefront.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            The refreshed UI is designed to help listings pop, improve trust at a glance, and make discovery feel faster.
          </p>

          <div className="mt-8 space-y-4">
            {[
              'Cleaner product cards for better first impressions',
              'Stronger calls to action for buyers and sellers',
              'Premium marketplace styling across the main journey',
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/8 p-4 text-sm font-semibold text-white/85">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_16px_36px_rgba(242,85,31,0.28)]">
              <Store size={26} />
            </div>
            <h2 className="text-3xl font-bold text-trust-900">Create account</h2>
            <p className="mt-2 text-sm text-trust-500">Set up your profile and start listing parts on LankaParts.</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5 p-8">
            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Full name</label>
              <input type="text" className="input" placeholder="Your name" required {...field('name')} />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Email</label>
              <input type="email" className="input" placeholder="you@example.com" required {...field('email')} />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Phone</label>
              <input type="tel" className="input" placeholder="+94 7..." required {...field('phone')} />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Address</label>
              <textarea className="input resize-none" rows={3} placeholder="No 123, Galle Road..." required {...field('address')} />
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
                <BadgePercent size={14} />
                Seller setup note
              </div>
              <p className="mt-2 text-sm leading-6 text-trust-600">
                Bank payout details are collected later so we can keep onboarding fast.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  {...field('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-trust-400 hover:text-trust-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-trust-400">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Retype your password"
                  required
                  minLength={8}
                  {...field('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-trust-400 hover:text-trust-700"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-trust-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="terms" className="text-sm leading-6 text-trust-500">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="font-bold text-brand-600 underline underline-offset-2 hover:text-brand-700">
                  Terms &amp; Conditions
                </Link>
                {' '}for using LankaParts.
              </label>
            </div>

            <button type="submit" disabled={loading || !agreedToTerms} className="btn-primary w-full py-3.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-trust-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
