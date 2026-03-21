import { useState, useEffect } from 'react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Truck,
  Store,
  BadgePercent,
  ArrowRight,
  Star,
} from 'lucide-react'

const CATEGORIES = [
  'All',
  'TV Boards',
  'Power Supplies',
  'Washing Machine Boards',
  'Laptop Boards',
  'Mobile Boards',
  'Refrigerator Boards',
  'Other',
]

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Verified sellers', text: 'Buy with more confidence from approved marketplace accounts.' },
  { icon: Truck, title: 'Islandwide delivery', text: 'Fast sourcing for urgent replacements and repeat shop orders.' },
  { icon: BadgePercent, title: 'Clearer deals', text: 'Strong pricing hierarchy and easier product comparison on first view.' },
]

const HIGHLIGHTS = [
  'Top-rated circuit boards',
  'Same-day inquiry flow',
  'Bulk-friendly sourcing',
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [searchInput, setSearchInput] = useState('')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category !== 'All') params.category = category
      const { data } = await productsAPI.list(params)
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-brand-100/80 via-brand-50/40 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-12 h-96 w-96 rounded-full bg-[#ffd9c5] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 lg:py-14">
        <section className="grid items-start gap-8 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="retail-panel mesh-card overflow-hidden p-7 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">
              <Sparkles size={14} className="text-brand-500" />
              New marketplace look
            </div>

            <div className="mt-6 max-w-3xl">
              <h1 className="text-4xl font-bold leading-none text-trust-900 md:text-6xl lg:text-7xl">
                Find hot-selling
                <span className="block gradient-text">electronics spares fast.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-trust-600 md:text-lg">
                SpareGrid now feels more like a modern retail marketplace: clearer deals, stronger product focus,
                and a faster route from search to purchase.
              </p>
            </div>

            <form onSubmit={handleSearch} className="mt-8 rounded-[2rem] border border-[#f0dfd0] bg-white p-3 shadow-[0_20px_40px_rgba(18,21,33,0.08)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-[1.3rem] bg-[#fff8f2] px-4 py-4">
                  <Search size={22} className="text-brand-500" />
                  <input
                    className="w-full bg-transparent text-base font-medium text-trust-900 placeholder:text-trust-300 focus:outline-none"
                    placeholder="Search boards, modules, ICs, power supplies..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary px-8 py-4">
                  <span>Search Deals</span>
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-semibold text-trust-700 shadow-sm"
                >
                  <Star size={14} className="fill-brand-400 text-brand-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="retail-panel bg-trust-900 p-7 text-white">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-300">
                Marketplace pulse
              </div>
              <div className="mt-4 text-4xl font-bold font-display">24/7</div>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
                Built to feel active, promotional, and easy to scan, inspired by large-scale retail marketplaces.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Buyer Protection
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-2xl font-bold text-white">Bold</div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Retail hierarchy
                  </div>
                </div>
              </div>
            </div>

            <div className="retail-panel p-7">
              <div className="mb-4 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">
                <Store size={14} />
                Why it works
              </div>
              <div className="space-y-4">
                {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-4 rounded-2xl bg-[#fff8f2] p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-trust-900">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-trust-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 retail-panel p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">Quick categories</div>
              <h2 className="mt-2 text-2xl font-bold text-trust-900">Browse like a real marketplace</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] transition-all ${
                    category === cat
                      ? 'bg-brand-500 text-white shadow-[0_16px_28px_rgba(242,85,31,0.22)]'
                      : 'bg-[#fff7f0] text-trust-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">Live listings</div>
              <h2 className="mt-2 text-3xl font-bold text-trust-900">Today&apos;s storefront picks</h2>
              <p className="mt-2 text-sm text-trust-500">
                {loading ? 'Refreshing product feed...' : `${products.length} items ready to browse`}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-trust-600 shadow-sm">
              <ArrowRight size={16} className="text-brand-500" />
              Scroll the hottest spare-part listings
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[320px] animate-pulse rounded-[2rem] bg-white shadow-sm" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="retail-panel py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff2e9] text-brand-500">
                <SlidersHorizontal size={30} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-trust-900">No matching spares right now</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-trust-500">
                Try a broader search or switch categories to uncover more active listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
