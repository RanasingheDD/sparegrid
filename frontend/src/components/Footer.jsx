import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck, Truck } from 'lucide-react'

const LINKS = {
  Discover: [
    { label: 'Browse Parts', to: '/' },
    { label: 'Top Picks', to: '/' },
    { label: 'Fast Deals', to: '/' },
  ],
  Sell: [
    { label: 'Open Store', to: '/register' },
    { label: 'Sign In', to: '/login' },
    { label: 'Seller Dashboard', to: '/seller' },
  ],
  Support: [
    { label: 'Terms & Conditions', to: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="mt-auto bg-trust-900 text-white">
      <div className="h-1 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700" />

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_16px_36px_rgba(242,85,31,0.18)] sm:h-20 sm:w-20">
                <img src="/logo.png" alt="LankaParts logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">LankaParts</div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand-300">
                  Marketplace Energy
                </div>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-7 text-white/70">
              A brighter way to buy and sell electronics spare parts across Sri Lanka, with fast discovery,
              clear pricing, and trusted seller access in one place.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldCheck size={16} className="text-brand-300" />
                  Trusted listings
                </div>
                <p className="text-xs leading-6 text-white/65">Cleaner buying signals and easier seller discovery.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                  <Truck size={16} className="text-brand-300" />
                  Fast delivery
                </div>
                <p className="text-xs leading-6 text-white/65">Built for quick parts sourcing and repeat orders.</p>
              </div>
            </div>

            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-brand-300" />
                <span>support.lankaparts.@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-brand-300" />
                <span>+94 76 326 1558</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={15} className="text-brand-300" />
                <span>Sri Lanka</span>
              </li>
            </ul>
          </div>

          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h3 className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-300">
                {section}
              </h3>
              <ul className="space-y-3">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="group flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
                    >
                      <span>{label}</span>
                      <ArrowUpRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} LankaParts. Built for faster spare-part commerce.</p>
          <p className="font-semibold uppercase tracking-[0.18em] text-brand-300">Always on marketplace</p>
        </div>
      </div>
    </footer>
  )
}
